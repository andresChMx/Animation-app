var ScenePreviewController=fabric.util.createClass({
    
    initialize:function(){
        this.drawingCacheManager=new DrawingCacheManager();
        this.UIPanelPreviewerCanvas=null;
        this.ctrlPointsGenerator=new GeneratorCtrlPointsForImageModel();
        this.animator=null;
        PanelInspector.SectionToolBox.registerOnBtnPreview(this);
        PanelPreviewer.registerOnBtnClose(this);
    },
    setPreviewerCanvas:function(previewerCanvas){
        this.UIPanelPreviewerCanvas=previewerCanvas;
        this.animator=new ControllerAnimator(previewerCanvas,CanvasManager.listAnimableObjects);
    },
    loadAnimableObjects:function(){
        let listObjectsToDraw=[];
        let listScalerFactors=[];
        let listDrawableObjects=[];
        for(let i=0;i<CanvasManager.listAnimableObjects.length;i++){
            let animableObj=CanvasManager.listAnimableObjects[i];
            if(animableObj.getEntranceMode()==EntranceModes.drawn){
                this.ctrlPointsGenerator.generate(animableObj.imageModel);
                let drawableImage=new DrawableImage({cacheCanvas:this.drawingCacheManager.canvas,left:animableObj.get("left"),top:animableObj.get("top"),width:animableObj.get("width"),height:animableObj.get("height"),angle:animableObj.get("angle"),scaleX:animableObj.get("scaleX"),scaleY:animableObj.get("scaleY"),originX: 'center',originY: 'center'});
                this.UIPanelPreviewerCanvas.add(drawableImage);
                listDrawableObjects.push(drawableImage);
                listObjectsToDraw.push(animableObj.imageModel);
                listScalerFactors.push({x:animableObj.imageModel.imgHTML.naturalWidth,y:animableObj.imageModel.imgHTML.naturalHeight});
            }else if(animableObj.getEntranceMode()==EntranceModes.dragged){

            }else if(animableObj.getEntranceMode()==EntranceModes.none){
                this.UIPanelPreviewerCanvas.add(CanvasManager.listAnimableObjects[i]);
            }

       }
       this.drawingCacheManager.wakeUp(listObjectsToDraw,listScalerFactors,listDrawableObjects);
    },
    notificationOnBtnPreview:function(){

        this.loadAnimableObjects();
        this.animator.setTotalProgress(0);
        this.animator.playAnimation(0);
    },
    notificationOnBtnClose:function(){
        this.UIPanelPreviewerCanvas.clear();
        this.drawingCacheManager.sleep();
    }
});

var GeneratorCtrlPointsForImageModel=fabric.util.createClass({
    initialize:function(){
    },
    generate:function(imageModel){
        imageModel.paths.ctrlPoints=this.generateCrtlPointsFromPointsMatrix(imageModel.paths.points);
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
            let newCrtlPoints=[]; 
            if(matPts[i].length>=3){
                for(var j=0;j<(matPts[i].length/2)-2;j++){
                    newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(matPts[i][j*2], matPts[i][j*2+1], matPts[i][j*2+2], matPts[i][j*2+3], matPts[i][j*2+4], matPts[i][j*2+5]));
                }
            }
            list.push(newCrtlPoints);
        }
        return list;
    },
});
