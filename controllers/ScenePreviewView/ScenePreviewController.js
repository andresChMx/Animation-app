var EntranceEffectManagerMap={
    NoneEntranceMode:null,
    DrawnEntranceMode:null,
}
var ScenePreviewController=fabric.util.createClass({
    name:'ScenePreviewController',
    events:{
        OnAnimatorTick:'OnAnimatorTick'
    },
    initialize:function(){
        this.drawingHand=new DrawingHand();
        this.drawingCacheManager=new DrawingCacheManager(this.drawingHand);
        this.UIPanelPreviewerCanvas=null;

        EntranceEffectManagerMap.DrawnEntranceMode=this.drawingCacheManager;

        this.imageAnimDataGenerator=new ImageDrawingDataGenerator();
        this.textAnimDataGenerator=new TextDrawingDataGenerator();
        this.svgAnimDataGenerator=new SVGAnimableDataGenerator();

        this.animator=new ControllerAnimator(null); // el UIPanelPreviewerCanvas en este punto aun vale null, cuando carga el UI de este controller se popula con la refernecia al canvas (setPreviewerCanvas)
        this.animator.onTick(this.callBackOnAnimatorTick.bind(this));
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this)

        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnPreviewClicked,this);

        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnClose,this);
        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnPlay,this);

        this.counterCallbacksOnSVGAnimableLoading=0;
        this.listSVGAnimablesWithNoPath=[];

        this.counterCallbacksOnImageTextLoading=0;
        this.counterObjectsWithEntranceForWaiting=0;
    },
    callBackOnAnimatorTick:function(progress){
        MainMediator.notify(this.name,this.events.OnAnimatorTick,[progress])
    },
    setPreviewerCanvas:function(previewerCanvas){
        this.UIPanelPreviewerCanvas=previewerCanvas;
        this.animator.canvasToDisplay=this.UIPanelPreviewerCanvas;
    },
    loadObjectsForAnimation:function(listForAnimator,listAnimableObjectDrawnEntrance){
        let startTimeCounter=0;
        for(let i=0;i<CanvasManager.listAnimableObjectsWithEntrance.length;i++){
            let animableObjWithEntrance=CanvasManager.listAnimableObjectsWithEntrance[i];

            animableObjWithEntrance.animator.entranceTimes.startTime=startTimeCounter;
            startTimeCounter+=animableObjWithEntrance.animator.entranceTimes.delay + animableObjWithEntrance.animator.entranceTimes.duration;

            this.counterObjectsWithEntranceForWaiting++;
            animableObjWithEntrance.entranceBehaviour.wakeup(function(){//on data ready (util para textos y svgs)
                listAnimableObjectDrawnEntrance[i]=animableObjWithEntrance;
                this.counterObjectsWithEntranceForWaiting--;
            }.bind(this));
        }
        let canvasObjects=CanvasManager.canvas.getObjects();
        for(let i=0;i<canvasObjects.length;i++){

            let object=canvasObjects[i];

            if(object.type!=="CameraAnimable"){
                this.UIPanelPreviewerCanvas.add(object);
            }
            listForAnimator.push(object);
        }
    },
    clearEntranceDataFromAnimableObjects:function(){
        for(let i=0;i<CanvasManager.listAnimableObjects.length;i++) {//omitiendo el primer porque es la camara
            let animableObj = CanvasManager.listAnimableObjects[i];
            animableObj.entranceBehaviour.sleep();
        }
    },

    notificationPanelInspectorOnBtnPreviewClicked:function(){
        let listForAnimator=[];//list that contains objects with no entrace (none) and objects in listDrawableObjects list. List for the animator
        //listas para el DrawingCacheManager (dibujador)
        let listAnimableWithDrawnEntrance=[]; // lista de objectos con tipo de entrada Drawn , son usados como DTOs para el DrawingCacheManager
        /*
        * animable: objeto de la escena  que es animado con linea de timpo
        * */
        CanvasManager.camera.animator.start(this.UIPanelPreviewerCanvas);
        this.loadObjectsForAnimation(listForAnimator,listAnimableWithDrawnEntrance);

        (function WaitForObjectsWithEntrance(){
            if(this.counterObjectsWithEntranceForWaiting!==0){setTimeout(WaitForObjectsWithEntrance.bind(this),20);return;}
            this.drawingCacheManager.wakeUp(listAnimableWithDrawnEntrance);
            this.drawingCacheManager.addDrawingHandToCanvas(this.UIPanelPreviewerCanvas);
            listForAnimator.push(this.drawingCacheManager);
            this.animator.setListObjectsToAnimate(listForAnimator);

            this.animator.setTotalProgress(0);
            this.animator.playAnimation();
        }.bind(this)())
    },
    notificationPanelPreviewerOnBtnClose:function(){
        CanvasManager.camera.animator.stop();
        this.animator.stopAnimation();
        this.UIPanelPreviewerCanvas.clear();
        this.drawingCacheManager.sleep();
        CanvasManager.setCanvasOnAnimableObjects();
        this.clearEntranceDataFromAnimableObjects();
        CanvasManager.canvas.renderAll();
    },
    notificationPanelPreviewerOnBtnPlay:function(args){
        let playOrPause=args[0]
        if(this.animator.totalProgress===this.animator.totalDuration && this.animator.state===ControllerAnimatorState.paused){
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

