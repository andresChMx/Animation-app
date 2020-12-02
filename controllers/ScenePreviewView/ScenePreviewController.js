var ScenePreviewController=fabric.util.createClass({
    
    initialize:function(){
        this.drawingCacheManager=new DrawingCacheManager();
        this.UIPanelPreviewerCanvas=null;
        this.pointsGenerator=new GeneratorDrawingDataImageModel();
        this.animator=null;
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this)

        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnPreviewClicked,this);

        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnClose,this);

        this.counterCallBacksDrawableTexts=0;
        this.indexDrawableTexts=0;
        this.listDelayedObjects=[];
    },

    setPreviewerCanvas:function(previewerCanvas){
        this.UIPanelPreviewerCanvas=previewerCanvas;
        this.animator=new ControllerAnimator(this.UIPanelPreviewerCanvas);
    },
    loadObjectsForAnimation:function(listForAnimator,listDrawableObjects,listAnimableObjectDrawnEntrance){
        /*
        * Tenemos 3 tipos de objetos (ImageAnimable, TextAnimable, AnimableCamera ) que reciden en el canvas principal
        *   * Llevan la palabra Animable porque son animables por el ControllerAnimator, es decir por la linea de tiempo
        * Tenemos 1 objeto especial DrawableImage, que reemplaza a los objetos ImageAnimable en el canvas de previsualizacion, que tienen un modo de entrada drawn
        * es decir se creara un DrawableImage por cada ImageAnimable que tenga activo un modo de entrada drawn, es decir que entrara dibujandose
        * Los modos de entrdada en total son (none,drawn,dragged,text_drawn, text_typed)
        * Los ImageAnimables que tienen de modo de entrada none, simplemente son agregados directamente al canvas de previsualizacion
        *
        * Los ImageAnimable estan asociados a un imageModel que tambien pertenecen a categorias o tipos, que son : PROVIDED, CREATED_NOPATH, CREATED_PATHDESIGNED, CREATED_PATHSVGLOADED
        * las ImageModel que nosotros daremos a los usuarios son PROVIDED, y sus dados de dibujado seran objetidos de la nube de su data svg
        * Las ImageModel que son creadas por los usuarios cuaya data de dibujado  no han diseñado un paht son CREATED_NOPATH
        * Las ImageModel que son creadas por los usuarios cuya data de dibujado han sido diseñados son CREATED_PATHDESIGNED
        * las ImageModel que son cradas por los usuarios  cuya data de dibujado  han sido cargados de su data svg son CREATED_PATHSVGLOADED
        *    Estos tipos nos ayudan a la hora de saber de donde sacamos la data de dibujado de los objetos: los creamos nosotros todo (pintado default), solo calculamos los ctrlpoints, o no calculamos nada
        *       En cualquiera de los casos puede ser que los imageModel no tienen ninguna data, pero ya sabremos que pedir del servidor y que no
        *
        * Todos los objetos son agregados al Canvas de previsualizacion a excepcion de la AnimableCamara
        * Con un caso particular, y es que los objetos que tengan un efecto de entrada tendran que ser reemplazados por otros objetos que nos permitan aplicar jsutamente el efecto, estos nuevos objetos seran compuestos por un animator para que el ControllerAnimator los pueda animar.
        * Todos los objetos son agregamos a la lista del animator del canvas de previsualizacion, ya que todos son animables (por la linea de tiempo)(incluido la Animable Camera)
        * */

        /*
        * recorremos todos los objetos del canvas, porque queremos el orden el que estan
        * */
        listForAnimator.push(CanvasManager.camera);                  //Primero agregamos la camara
        let allCanvasObjects=CanvasManager.canvas.getObjects();
        for(let i=0;i<allCanvasObjects.length;i++){
            let canvasObject=allCanvasObjects[i];
            if((canvasObject.type!=="AnimableCamera" )&& canvasObject.getEntranceMode()===EntranceModes.none){
                this.UIPanelPreviewerCanvas.add(canvasObject);      //Agremos al canvas de previsualizacion tdos los objetos animables (no el restangulo camara [AnimableCamara])
                listForAnimator.push(canvasObject);                  // Agregamos todos los abjetos (incluido al AnimableCamara)
            }
        }
        /*Se recorren los objetos en estos dos bucles por separado ya que nos interesa el orden en elque estan en estos arreglos*/
        for(let i=0;i<CanvasManager.listAnimableObjectsWithEntrance.length;i++){
            let animableObjWithEntrance=CanvasManager.listAnimableObjectsWithEntrance[i];
            let tmpObject=null;
            if(animableObjWithEntrance.getEntranceMode()===EntranceModes.drawn){
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
                    originX: 'left',
                    originY: 'top',
                    animations:animableObjWithEntrance.animator.dictAnimations});
                listDrawableObjects[i]=tmpObject;
                listAnimableObjectDrawnEntrance[i]=animableObjWithEntrance;
                // listImageModels[i]=animableObjWithEntrance.imageModel;
                // listTiming[i]={duration:animableObjWithEntrance.duration,delay:animableObjWithEntrance.delay}
                // listScalerFactors[i]={x:animableObjWithEntrance.imageModel.imgHTML.naturalWidth,y:animableObjWithEntrance.imageModel.imgHTML.naturalHeight};
            }else if(animableObjWithEntrance.getEntranceMode()===EntranceModes.dragged){
                //TODO Manager para objetos que entran arrastrados
            }else if(animableObjWithEntrance.getEntranceMode()===EntranceModes.text_drawn){
                /*Loading drawing data of text*/
                //console.log(animableObjWithEntrance.multi);
                this.counterCallBacksDrawableTexts++;
                let self=this;
                let index=i;
                this.pointsGenerator.generateTextDrawingDataNoForcing(animableObjWithEntrance,animableObjWithEntrance.getWidthInDrawingCache(),animableObjWithEntrance.getHeightInDrawingCache(),function(result) {
                    console.log("dentro del callback: " +index );
                    animableObjWithEntrance.imageModel.paths = result;
                    animableObjWithEntrance.imageModel.paths.duration=animableObjWithEntrance.animator.entranceDuration;
                    animableObjWithEntrance.imageModel.paths.delay=animableObjWithEntrance.animator.entranceDelay;
                    animableObjWithEntrance.imageModel.paths.type=TextType.PROVIDED;
                    animableObjWithEntrance.imageModel.imgHTML=self.pointsGenerator.generateTextBaseImage(animableObjWithEntrance);
                    let textDrawable=new DrawableImage({
                        cacheCanvas:self.drawingCacheManager.canvas,
                        left:animableObjWithEntrance.get("left"),
                        top:animableObjWithEntrance.get("top"),
                        width:animableObjWithEntrance.get("width"),
                        height:animableObjWithEntrance.get("height"),
                        angle:animableObjWithEntrance.get("angle"),
                        scaleX:animableObjWithEntrance.get("scaleX"),
                        scaleY:animableObjWithEntrance.get("scaleY"),
                        originX: 'left',
                        originY: 'top',
                        animations:animableObjWithEntrance.animator.dictAnimations});
                    listDrawableObjects[index]=textDrawable;
                    listAnimableObjectDrawnEntrance[index]=animableObjWithEntrance
                    // listImageModels[index]=animableObjWithEntrance.imageModel;
                    // listTiming[i]={duration:animableObjWithEntrance.duration,delay:animableObjWithEntrance.delay}
                    // listScalerFactors[index]={x:animableObjWithEntrance.calcTextWidth(),y:animableObjWithEntrance.calcTextHeight()};
                    // self.listDelayedObjects[index]=textDrawable;
                    self.counterCallBacksDrawableTexts--;
                })
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
        for(let i=1;i<CanvasManager.listAnimableObjects.length;i++) {//omitiendo el primer porque es la camara
            let animableObj = CanvasManager.listAnimableObjects[i];
            if(animableObj.imageModel.paths.type===ImageType.CREATED_NOPATH || animableObj.imageModel.paths.type===TextType.PROVIDED){
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
    notificationPanelInspectorOnBtnPreviewClicked:function(){
        let listForAnimator=[];// lista para el animator (contiene los elementos de listDrawableObjects)

        //listas para el DrawingCacheManager (dibujador)
        let listDrawableObjects=[]; //lista para objetos con efecto de dibujado, para el DrawingCacheManager, que orquestara el dibujado en orden de estos objetos
        let listAnimableWithDrawnEntrance=[];
        /*
        * animable: objeto de la escena  que es animado con linea de timpo
        * drawable : objeto para la previsualizacion, al que se le asigna las animaciones de una naimable object que tiene modo de entrada dibujado
        * */
        CanvasManager.camera.animator.start(this.UIPanelPreviewerCanvas);
        this.loadObjectsForAnimation(listForAnimator,listDrawableObjects,listAnimableWithDrawnEntrance);
        (function Wait(){
            if(this.counterCallBacksDrawableTexts!==0){setTimeout(Wait.bind(this),5);return;}
            //TODO: ORDERlistDelayerObjects
            for(let i=0;i<listDrawableObjects.length;i++){
                this.UIPanelPreviewerCanvas.add(listDrawableObjects[i]);
                listForAnimator.push(listDrawableObjects[i]);
            }
            this.drawingCacheManager.wakeUp(listDrawableObjects,listAnimableWithDrawnEntrance);
            this.animator.setListObjectsToAnimate(listForAnimator);

            this.animator.setTotalProgress(0);
            this.animator.playAnimation();
        }.bind(this)())

    },
    notificationPanelPreviewerOnBtnClose:function(){
        this.listDelayedObjects=[];
        CanvasManager.camera.animator.stop();
        this.animator.stopAnimation();
        this.UIPanelPreviewerCanvas.clear();
        this.drawingCacheManager.sleep();
        CanvasManager.setCanvasOnAnimableObjects();
        this.clearDrawingDataOnDrawableObjects()
    },
    notificationPanelActionEditorOnDurationInput:function(args){
        let durationBefore=args[0];let durationAfter=args[1];
        this.animator.setTotalDuration(durationAfter);
    }
});

var GeneratorDrawingDataImageModel=fabric.util.createClass({
    initialize:function(){
        this.canvasElem=document.createElement("canvas");
        this.canvasElem.id="auxCanvas"
        this.auxCanvasForTexts=new fabric.StaticCanvas("auxCanvas");
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
    },

    // generateTextDrawingDataNoForcing:function(animableText,textWidth,textHeight,callback){
    //     let text=animableText.text;
    //     let svgCache=document.createElement("div");
    //     svgCache.id="container";
    //     document.body.appendChild(svgCache)
    //     new Vara("#container","http://localhost:3000/font.json",[{
    //         text:text,
    //         letterSpacing:-10
    //     }],{
    //         fontSize:46
    //     });
    //
    //     flatten(svgCache);
    //
    //     let s = new XMLSerializer();
    //     let str = s.serializeToString(svgCache);
    //     svgCache.remove();
    //     new SVGManager().loadSVGFromString(str,textWidth,textHeight,'no-force',callback)
    //
    // }
    generateTextDrawingDataNoForcing:function(animableText,textWidth,textHeight,callback){
        let svgManager=new SVGManager;
        svgManager.fetchTextSVGData(animableText,function(responseSVG){
            svgManager.calcDrawingDataFromString_forcePaths(responseSVG,textWidth,textHeight,0,callback);
        })

    },
    generateTextBaseImage:function(animableText){
        let dimX=animableText.getWidthInDrawingCache();
        let dimY=animableText.getHeightInDrawingCache();
        this.auxCanvasForTexts.setWidth(dimX);
        this.auxCanvasForTexts.setHeight(dimY);
        let tmpText=new fabric.Text(animableText.text,{
            left:0,
            top:5,
            fontFamily:animableText.fontFamily,
            fontSize:animableText.fontSize
        });
        this.auxCanvasForTexts.add(tmpText);
        let image=new Image();
        image.src=this.auxCanvasForTexts.toDataURL({
            format: 'png',
        });
        this.auxCanvasForTexts.clear();
        return image;
    }
});
