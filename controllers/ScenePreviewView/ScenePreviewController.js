
var ScenePreviewController=fabric.util.createClass({
    initialize:function(scenesManager){
        this.scenesManager=scenesManager;
        //Entrance effect Managers (drawn,dragged,text_typed,etc)
        this.drawingCacheManager=new DrawingCacheManager();
        //Making entrance effect Managers global
        global.EntranceEffectManagerMap.DrawnEntranceMode=this.drawingCacheManager;

        this.UIPanelPreviewerCanvas=null;

        this.animator=new ControllerAnimator(null); // el UIPanelPreviewerCanvas en este punto aun vale null, cuando carga el UI de este controller se popula con la refernecia al canvas (setPreviewerCanvas)
        this.animator.onTick(this.callBackOnAnimatorTick.bind(this));

        this.counterObjectsWithEntranceForWaiting=0;
    },
    callBackOnAnimatorTick:function(progress){

    },
    setPreviewerCanvas:function(previewerCanvas){
        this.UIPanelPreviewerCanvas=previewerCanvas;
        this.animator.canvasToDisplay=this.UIPanelPreviewerCanvas;
    },
    loadObjectsForAnimation:function(listForAnimator,listAnimableObjectDrawnEntrance){
        let startTimeCounter=0;


        let listAnimObjsWithEntrance=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjsWithEntrance);
        for(let i=0;i<listAnimObjsWithEntrance.length;i++){
            let animableObjWithEntrance=listAnimObjsWithEntrance[i];

            animableObjWithEntrance.animator.entranceTimes.startTime=startTimeCounter;
            startTimeCounter+=animableObjWithEntrance.animator.entranceTimes.delay + animableObjWithEntrance.animator.entranceTimes.duration;

            this.counterObjectsWithEntranceForWaiting++;
            animableObjWithEntrance.entranceBehaviour.wakeup(function(){//on data ready (util para textos y svgs)
                listAnimableObjectDrawnEntrance[i]=animableObjWithEntrance;
                this.counterObjectsWithEntranceForWaiting--;
            }.bind(this));
        }
        let listAnimObjs=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjs);/*temporary, we should use the listAnimableObjects, but first we should update that list when objects are been moved back and forward
        . We are using this solution because until this moment there is not no-animable objects in canvas, that is to say, all objects in canvas are animable, so there is no problem*/
        // let canvasObjects=CanvasManager.listAnimableObjects;
        for(let i=0;i<listAnimObjs.length;i++){

            let object=listAnimObjs[i];

            if(object.type!=="CameraAnimable"){
                this.UIPanelPreviewerCanvas._objects.push(object);
                // this.UIPanelPreviewerCanvas.add(object);
            }
            listForAnimator.push(object);
        }
    },
    clearEntranceDataFromAnimableObjects:function(){
        let listAnimObjs=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjs);
        for(let i=0;i<listAnimObjs.length;i++) {//omitiendo el primer porque es la camara
            let animableObj = listAnimObjs[i];
            animableObj.entranceBehaviour.sleep();
        }
    },
    startPreview:function(callback){
        let listForAnimator=[];//list that contains objects with no entrace (none) and objects in listDrawableObjects list. List for the animator
        //listas para el DrawingCacheManager (dibujador)
        let listAnimableWithDrawnEntrance=[]; // lista de objectos con tipo de entrada Drawn , son usados como DTOs para el DrawingCacheManager
        /*
        * animable: objeto de la escena  que es animado con linea de timpo
        * */
        this.scenesManager.getCamera().animator.start(this.UIPanelPreviewerCanvas);
        this.loadObjectsForAnimation(listForAnimator,listAnimableWithDrawnEntrance);

        (function WaitForObjectsWithEntrance(){
            if(this.counterObjectsWithEntranceForWaiting!==0){setTimeout(WaitForObjectsWithEntrance.bind(this),20);return;}
            this.drawingCacheManager.wakeUp(listAnimableWithDrawnEntrance);
            this.drawingCacheManager.addDrawingHandToCanvas(this.UIPanelPreviewerCanvas);
            listForAnimator.push(this.drawingCacheManager);
            this.animator.setListObjectsToAnimate(listForAnimator);

            this.animator.setTotalProgress(0);
            this.animator.playAnimation();

            callback && callback();

        }.bind(this)())
    },
    stopPreview:function(){
        this.scenesManager.getCamera().animator.stop();
        this.animator.stopAnimation();
        this.UIPanelPreviewerCanvas.clear();
        this.drawingCacheManager.sleep();
        this.clearEntranceDataFromAnimableObjects();
    },
    setDuration:function(duration){
        this.animator.setTotalDuration(duration);
    },
})
var EnlivedScenePreviewController=fabric.util.createClass(ScenePreviewController,{
    name:'EnlivedScenePreviewController',
    events:{
        OnAnimatorTick:'OnAnimatorTick'
    },
    initialize:function(scenesManager){
        this.callSuper("initialize",scenesManager);
        this.registerEvents();
    },
    registerEvents:function(){
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this)

        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnPreviewClicked,this);

        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnClose,this);
        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnPlay,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.OnProjectCollectionsLoaded,this);
        WindowManager.registerObserverOnResize(this);
    },
    callBackOnAnimatorTick:function(progress){
        MainMediator.notify(this.name,this.events.OnAnimatorTick,[progress])
    },
    notificationPanelInspectorOnBtnPreviewClicked:function(){// in case windows resizing event was not been notified correctly(i noticed some resizing notificaion from windows are not up to date)
        this.scenesManager.getCamera().animator.setCanvasCameraScalerDims(PanelPreviewer.getCanvasScalerFactorX(),PanelPreviewer.getCanvasScalerFactorY());
        this.drawingCacheManager.drawingHand.setCanvasCameraScalerDims(PanelPreviewer.getCanvasScalerFactorX(),PanelPreviewer.getCanvasScalerFactorY())
        this.startPreview();
    },
    notificationOnResize:function(){// in case window is resized while previewer is open
        this.scenesManager.getCamera().animator.setCanvasCameraScalerDims(PanelPreviewer.getCanvasScalerFactorX(),PanelPreviewer.getCanvasScalerFactorY());
        this.drawingCacheManager.drawingHand.setCanvasCameraScalerDims(PanelPreviewer.getCanvasScalerFactorX(),PanelPreviewer.getCanvasScalerFactorY())
    },
    notificationPanelPreviewerOnBtnClose:function(){
        this.stopPreview();
    },
    notificationPanelPreviewerOnBtnPlay:function(args){
        let playOrPause=args[0]
        if(this.animator.totalProgress===this.animator.totalDuration && this.animator.state===global.ControllerAnimatorState.paused){
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
        this.setDuration(durationAfter);
    },
    notificationScenesManagerOnProjectCollectionsLoaded:function(args){
        let loadPendingData=args[0];
        this.setDuration(loadPendingData.animatorDuration);
    },

});
