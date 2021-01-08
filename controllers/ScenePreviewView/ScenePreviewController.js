var ScenePreviewController=fabric.util.createClass({
    name:'ScenePreviewController',
    events:{
        OnAnimatorTick:'OnAnimatorTick'
    },
    initialize:function(){
        this.drawingHand=new DrawingHand();
        this.drawingCacheManager=new DrawingCacheManager(this.drawingHand);
        this.UIPanelPreviewerCanvas=null;
        this.pointsGenerator=new ImageModelDrawingDataGenerator();
        this.animator=new ControllerAnimator(null); // el UIPanelPreviewerCanvas en este punto aun vale null, cuando carga el UI de este controller se popula con la refernecia al canvas (setPreviewerCanvas)
        this.animator.onTick(this.callBackOnAnimatorTick.bind(this));
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this)

        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnPreviewClicked,this);

        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnClose,this);
        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnPlay,this);

        this.counterCallBacksDrawableTexts=0;
        this.indexDrawableTexts=0;
        this.listDelayedObjects=[];
    },
    callBackOnAnimatorTick:function(progress){
        MainMediator.notify(this.name,this.events.OnAnimatorTick,[progress])
    },
    setPreviewerCanvas:function(previewerCanvas){
        this.UIPanelPreviewerCanvas=previewerCanvas;
        this.animator.canvasToDisplay=this.UIPanelPreviewerCanvas;
    },
    loadObjectsForAnimation:function(listForAnimator,listDrawableObjects,listAnimableObjectDrawnEntrance){
        /*
        * Tenemos 3 tipos de objetos (ImageAnimable, TextAnimable, CameraAnimable ) que reciden en el canvas principal
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
        for(let i=0;i<CanvasManager.listAnimableObjectsWithEntrance.length;i++){
            let animableObjWithEntrance=CanvasManager.listAnimableObjectsWithEntrance[i];
            animableObjWithEntrance.tmpIndexStartOrder=i;
        }
        let canvasObjects=CanvasManager.canvas.getObjects();
        for(let i=0;i<canvasObjects.length;i++){
            let object=canvasObjects[i];
            let objectToBeAnimated=null;
            if(object.getEntranceMode()===EntranceModes.drawn){
                this.generateDrawingDataOnDrawableObject(object);
                objectToBeAnimated=new DrawableImage({
                    cacheCanvas:this.drawingCacheManager.canvas,
                    left:object.get("left"), top:object.get("top"),
                    width:object.get("width"), height:object.get("height"), angle:object.get("angle"),
                    scaleX:object.get("scaleX"), scaleY:object.get("scaleY"),

                    pivotX:object.get("pivotX"), pivotY:object.get("pivotY"),
                    pivotCornerX:object.get("pivotCornerX"), pivotCornerY:object.get("pivotCornerY"),
                    originX: 'custom', originY: 'custom',

                    animations:object.animator.dictAnimations,
                    entraceModesSettings:object.entraceModesSettings
                });
                listDrawableObjects[object.tmpIndexStartOrder]=objectToBeAnimated;
                listAnimableObjectDrawnEntrance[object.tmpIndexStartOrder]=object;
            }else if(object.getEntranceMode()===EntranceModes.dragged){
                objectToBeAnimated=object;
            }else if(object.getEntranceMode()===EntranceModes.text_drawn){
                let result=this.pointsGenerator.generateTextDrawingData(object,object.getWidthInDrawingCache(),object.getHeightInDrawingCache());
                let tmpUrl=object.imageDrawingData.url;
                object.imageDrawingData = result;
                object.imageDrawingData.url=tmpUrl;
                object.imageDrawingData.type=TextType.PROVIDED;
                object.imageDrawingData.imgHigh=this.pointsGenerator.generateTextBaseImage(object);
                object.imageDrawingData.imgMasked=object.imageDrawingData.imgHigh;

                objectToBeAnimated=new DrawableImage({
                    cacheCanvas:this.drawingCacheManager.canvas,
                    left:object.get("left"), top:object.get("top"),
                    width:object.get("width"), height:object.get("height"), angle:object.get("angle"),
                    scaleX:object.get("scaleX"), scaleY:object.get("scaleY"),

                    pivotX:object.get("pivotX"), pivotY:object.get("pivotY"),
                    pivotCornerX:object.get("pivotCornerX"), pivotCornerY:object.get("pivotCornerY"),
                    originX: 'custom', originY: 'custom',

                    animations:object.animator.dictAnimations,
                    entraceModesSettings:object.entraceModesSettings
                });
                listDrawableObjects[object.tmpIndexStartOrder]=objectToBeAnimated;
                listAnimableObjectDrawnEntrance[object.tmpIndexStartOrder]=object;
            }else if(object.getEntranceMode()===EntranceModes.text_typed){
                objectToBeAnimated=object;
            }else if(object.getEntranceMode()===EntranceModes.none){
                objectToBeAnimated=object;
            }else{
                alert("hay objectos que tienen entrance mode diferentes a los contemplados scenePreviewController.js");
            }
            if(object.type!=="CameraAnimable"){
                this.UIPanelPreviewerCanvas.add(objectToBeAnimated);
            }
            listForAnimator.push(objectToBeAnimated);
        }
    },
    generateDrawingDataOnDrawableObject:function(animableObj){
        if(animableObj.imageDrawingData.type===ImageType.CREATED_NOPATH){
            //calculate points and ctrlPoints and strokestyes (para el pathillustrator)
            this.pointsGenerator.generateDefaultDrawingPointsAndLineWidth(animableObj.imageDrawingData, 35)
            animableObj.imageDrawingData.ctrlPoints=this.pointsGenerator.generateCrtlPointsFromPointsMatrix(animableObj.imageDrawingData.points);
            animableObj.imageDrawingData.strokesTypes=this.pointsGenerator.generateStrokesTypesFromPoints(animableObj.imageDrawingData.points);
            //animableObj.imageDrawingData.pathsNames=this.pointsGenerator.generateLayerNames(animableObj.imageDrawingData.points)
        }else if(animableObj.imageDrawingData.type===ImageType.CREATED_PATHDESIGNED){
            // solo cargamos ctrlpoints porque los strokestypes y points estan guardados en el objeto
            animableObj.imageDrawingData.ctrlPoints=this.pointsGenerator.generateCrtlPointsFromPointsMatrix(animableObj.imageDrawingData.points);
        }
        else if(animableObj.imageDrawingData.type===ImageType.CREATED_PATHLOADED){
            //NOTHING BECAUSE POINTS AND CTRLPOINTS ARE ALREADY CALCULATED
        }
    },
    clearDrawingDataOnDrawableObjects:function(){
        for(let i=1;i<CanvasManager.listAnimableObjects.length;i++) {//omitiendo el primer porque es la camara
            let animableObj = CanvasManager.listAnimableObjects[i];
            if(animableObj.imageDrawingData.type===ImageType.CREATED_NOPATH || animableObj.imageDrawingData.type===TextType.PROVIDED){
                animableObj.imageDrawingData.points=[];
                animableObj.imageDrawingData.linesWidths=[];
                animableObj.imageDrawingData.ctrlPoints=[];
                animableObj.imageDrawingData.strokesTypes=[];
                animableObj.imageDrawingData.pathsNames=[];
            }else if(animableObj.imageDrawingData.type===ImageType.CREATED_PATHDESIGNED){
                animableObj.imageDrawingData.ctrlPoints=[];
            }
            else if(animableObj.imageDrawingData.type===ImageType.CREATED_PATHLOADED){
                //NOTHING
            }
        }
    },

    notificationPanelInspectorOnBtnPreviewClicked:function(){
        let listForAnimator=[];//list that contains objects with no entrace (none) and objects in listDrawableObjects list. List for the animator
        //listas para el DrawingCacheManager (dibujador)
        let listDrawableObjects=[]; //DrawableImage. lista para objetos con efecto de dibujado (son agregados al canvas y al animator), para el DrawingCacheManager, que orquestara el dibujado en orden de estos objetos
        let listAnimableWithDrawnEntrance=[]; // lista de objectos con tipo de entrada Drawn , son usados como DTOs para el DrawingCacheManager
        /*
        * animable: objeto de la escena  que es animado con linea de timpo
        * drawable : objeto para la previsualizacion, al que se le asigna las animaciones de una naimable object que tiene modo de entrada dibujado
        * */
        CanvasManager.camera.animator.start(this.UIPanelPreviewerCanvas);
        this.loadObjectsForAnimation(listForAnimator,listDrawableObjects,listAnimableWithDrawnEntrance);

        this.drawingCacheManager.wakeUp(listDrawableObjects,listAnimableWithDrawnEntrance);
        this.drawingCacheManager.addDrawingHandToCanvas(this.UIPanelPreviewerCanvas);
        listForAnimator.push(this.drawingCacheManager);
        this.animator.setListObjectsToAnimate(listForAnimator);

        this.animator.setTotalProgress(0);
        this.animator.playAnimation();
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
    notificationPanelPreviewerOnBtnPlay:function(args){
        let playOrPause=args[0]
        if(this.animator.totalProgress===this.animator.totalDuration){
            this.drawingCacheManager.OnReplayPreview();
            this.animator.setTotalProgress(0);
            this.animator.playAnimation();
            return;
        }
        if(playOrPause===0){
            this.animator.stopAnimation();
        }else if(playOrPause===1){
            this.animator.playAnimation();
        }
    },
    notificationPanelActionEditorOnDurationInput:function(args){
        let durationBefore=args[0];let durationAfter=args[1];
        this.animator.setTotalDuration(durationAfter);
    }
});

