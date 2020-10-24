var ScenePreviewController=fabric.util.createClass({
    
    initialize:function(){
        this.drawingCacheManager=new DrawingCacheManager();
        this.UIPanelPreviewerCanvas=null;
        this.pointsGenerator=new GeneratorDrawingDataImageModel();
        this.animator=null;
        PanelInspector.SectionToolBox.registerOnBtnPreview(this);
        PanelPreviewer.registerOnBtnClose(this);
        PanelActionEditor.registerOnDurationForm(this);
    },
    setPreviewerCanvas:function(previewerCanvas){
        this.UIPanelPreviewerCanvas=previewerCanvas;
        this.animator=new ControllerAnimator(this.UIPanelPreviewerCanvas);
    },
    loadObjectsForAnimation:function(listAllObjects,listDrawableObjects,listImageModels,listScalerFactors){
        for(let i=0;i<CanvasManager.listAnimableObjectsWithEntrance.length;i++){
            let animableObjWithEntrance=CanvasManager.listAnimableObjectsWithEntrance[i];
            let tmpObject=null;
            if(animableObjWithEntrance.getEntranceMode()===EntranceModes.drawn){
                animableObjWithEntrance.imageModel.paths.duration=animableObjWithEntrance.entranceDuration;
                animableObjWithEntrance.imageModel.paths.delay=animableObjWithEntrance.entranceDelay;

                this.loadDrawingDataOnDrawableObject(animableObjWithEntrance);
                tmpObject=new DrawableImage({
                    cacheCanvas:this.drawingCacheManager.canvas,
                    left:animableObjWithEntrance.get("left"),
                    top:animableObjWithEntrance.get("top"),
                    width:animableObjWithEntrance.get("width"),
                    height:animableObjWithEntrance.get("height"),
                    angle:animableObjWithEntrance.get("angle"),
                    scaleX:animableObjWithEntrance.get("scaleX"),
                    scaleY:animableObjWithEntrance.get("scaleY"),
                    originX: 'center',
                    originY: 'center',
                    animations:animableObjWithEntrance.dictAnimations});
                listDrawableObjects.push(tmpObject);
                listImageModels.push(animableObjWithEntrance.imageModel);
                listScalerFactors.push({x:animableObjWithEntrance.imageModel.imgHTML.naturalWidth,y:animableObjWithEntrance.imageModel.imgHTML.naturalHeight});
            }else if(animableObjWithEntrance.getEntranceMode()===EntranceModes.dragged){
                //TODO Manager para objetos que entran arrastrados
            }
            if(tmpObject){
                this.UIPanelPreviewerCanvas.add(tmpObject);
                listAllObjects.push(tmpObject);
            }
        }
        for(let i=0;i<CanvasManager.listAnimableObjects.length;i++){
            let animableObj=CanvasManager.listAnimableObjects[i];
            if(animableObj.getEntranceMode()===EntranceModes.none){
                this.UIPanelPreviewerCanvas.add(animableObj);
                listAllObjects.push(animableObj);
            }
       }
    },
    loadDrawingDataOnDrawableObject:function(animableObj){
        if(animableObj.imageModel.paths.type===ImageType.CREATED_NOPATH){
            //calculate points and ctrlPoints and strokestyes (para el pathillustrator)
            this.pointsGenerator.generateDefaultDrawingPointsAndLineWidth(animableObj.imageModel, 35)
            animableObj.imageModel.paths.ctrlPoints=this.pointsGenerator.generateCrtlPointsFromPointsMatrix(animableObj.imageModel.paths.points);
            animableObj.imageModel.paths.strokesTypes=this.pointsGenerator.generateStrokesTypesFromPoints(animableObj.imageModel.paths.points);
            animableObj.imageModel.paths.pathsNames=this.pointsGenerator.generateLayerNames(animableObj.imageModel.paths.points)
        }else if(animableObj.imageModel.paths.type===ImageType.CREATED_PATHDESIGNED){
            // solo cargamos ctrlpoints porque los strokestypes y points estan guardados en el objeto
            animableObj.imageModel.paths.ctrlPoints=this.pointsGenerator.generateCrtlPointsFromPointsMatrix(animableObj.imageModel.paths.points);
        }
        else if(animableObj.imageModel.paths.type===ImageType.CREATED_PATHLOADED){
            //NOTHING BECAUSE POINTS AND CTRLPOINTS ARE ALREADY CALCULATED
        }
    },
    clearDrawingDataOnDrawableObjects:function(){
        for(let i=0;i<CanvasManager.listAnimableObjects.length;i++) {
            let animableObj = CanvasManager.listAnimableObjects[i];
            if(animableObj.imageModel.paths.type===ImageType.CREATED_NOPATH){
                animableObj.imageModel.paths.points=[];
                animableObj.imageModel.paths.linesWidths=[];
                animableObj.imageModel.paths.ctrlPoints=[];
                animableObj.imageModel.paths.strokesTypes=[];
                animableObj.imageModel.paths.pathsNames=[];
            }else if(animableObj.imageModel.paths.type===ImageType.CREATED_PATHDESIGNED){
                animableObj.imageModel.paths.ctrlPoints=[];
            }
            else if(animableObj.imageModel.paths.type===ImageType.CREATED_PATHLOADED){
                //NOTHING
            }
        }
    },
    notificationOnBtnPreview:function(){
        let listAllObjects=[];
        //listas para el DrawingCacheManager (dibujador)
        let listDrawableObjects=[];
        let listImageModels=[];
        let listScalerFactors=[];
        this.loadObjectsForAnimation(listAllObjects,listDrawableObjects,listImageModels,listScalerFactors);
        this.drawingCacheManager.wakeUp(listImageModels,listScalerFactors,listDrawableObjects);
        this.animator.setListObjectsToAnimate(listAllObjects);

        this.animator.setTotalProgress(0);
        this.animator.playAnimation();
    },
    notificationOnBtnClose:function(){
        this.UIPanelPreviewerCanvas.clear();
        this.drawingCacheManager.sleep();
        CanvasManager.setCanvasOnAnimableObjects();
        this.clearDrawingDataOnDrawableObjects()
    },
    notificationOnDurationForm:function(duration){
        this.animator.setTotalDuration(duration);
    }
});

var GeneratorDrawingDataImageModel=fabric.util.createClass({
    initialize:function(){
    },
    generateCtrlPoints:function(imageModel){
        imageModel.paths.ctrlPoints=this.generateCrtlPointsFromPointsMatrix(imageModel.paths.points);
    },
    generatePoints:function(){

    },
    delete:function(imageModel){
        imageModel.paths.ctrlPoints=[];
    },
    _triangleWidthHeight:function(arr, i, j){
        return [arr[2*j]-arr[2*i], arr[2*j+1]-arr[2*i+1]]
    },
    _distace:function(arr, i, j) {
        return Math.sqrt(Math.pow(arr[2*i]-arr[2*j], 2) + Math.pow(arr[2*i+1]-arr[2*j+1], 2));
    },
    _calcCrtlPointsSinglePoint:function(x1,y1,x2,y2,x3,y3){
        var t = 0.5;
        var v = this._triangleWidthHeight(arguments, 0, 2);
        var d01 = this._distace(arguments, 0, 1);
        var d12 = this._distace(arguments, 1, 2);
        var d012 = d01 + d12;
        return [x2 - v[0] * t * d01 / d012, y2 - v[1] * t * d01 / d012,
                    x2 + v[0] * t * d12 / d012, y2 + v[1] * t * d12 / d012 ];
    },
    
    generateCrtlPointsFromPointsMatrix:function(matPts){
        if(matPts.length==0){
            return;
        }
        let list=[];
        for (var i = 0; i <matPts.length; i += 1) {
            let newCrtlPoints=[-1,-1];
            if(matPts[i].length>=3){
                for(var j=0;j<(matPts[i].length/2)-2;j++){
                    newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(matPts[i][j*2], matPts[i][j*2+1], matPts[i][j*2+2], matPts[i][j*2+3], matPts[i][j*2+4], matPts[i][j*2+5]));
                }
            }
            newCrtlPoints.push(-1);
            newCrtlPoints.push(-1);
            list.push(newCrtlPoints);
        }
        return list;
    },
    generateDefaultDrawingPointsAndLineWidth:function (imageModel,lineWidthWanted){
        let imageWidth=imageModel.imgHTML.naturalWidth;
        let imageHeight=imageModel.imgHTML.naturalHeight;

        let matPoints=[]
        let listLinesWidths=[lineWidthWanted/imageWidth];
        matPoints.push([]);
        let p1x,p1y,p2x,p2y;

        let layerIndex=0;
        let contPointsLayer=0;
        for(let i=0;i<imageHeight+imageWidth;i+=(lineWidthWanted-lineWidthWanted/4)){
            if(contPointsLayer>50){
                layerIndex++;
                contPointsLayer=0;
                matPoints.push([])
                listLinesWidths.push(lineWidthWanted/imageWidth);
            }//new layer

            if(i<imageWidth){
                p1x=i;
                p1y=0;
            }else{
                p1x=imageWidth;
                p1y=i-imageWidth;
            }
            if(i<imageHeight){
                p2x=0;
                p2y=i;
            }else{
                p2x=i-imageHeight;
                p2y=imageHeight;
            }
            contPointsLayer+=2;

            matPoints[layerIndex].push(
                p1x/imageWidth,
                p1y/imageHeight,
                p2x/imageWidth,
                p2y/imageHeight
            );
        }
        imageModel.paths.points=matPoints;
        imageModel.paths.linesWidths=listLinesWidths;
    },
    generateStrokesTypesFromPoints:function(matPoints){
        let matStrokes=[];

        for(let i=0;i<matPoints.length;i++){
            matStrokes.push([]);
            let len=matPoints[i].length;
            if(len<2){continue}
            if(len==2){
                matStrokes[i].push("l");
            }else{
                for(let j=0;j<matPoints[i].length;j++){
                    matStrokes[i].push("l");
                }
            }
        }
        return matStrokes;
    },

    generateLayerNames:function(matPoints){
        let layers=[];
        for(let i=0;i<matPoints.length;i++){
            layers.push("Patha" + i);
        }
        return layers;
    }
});
