var PanelPreviewer={
    name:'PanelPreviewer',
    events:{
        OnBtnClose:'OnBtnClose',
        OnBtnPlay:'OnBtnPlay',
    },
    HTMLElement:null,
    HTMLParent:null,
    scenePreviewerController:null,

    resolutionWidth:1400,
    resolutionHeight:800,
    scalerFactorX:0, // to support responsive canvas previwer, stores the scalar factor(elementWidth/resolution)
    scalerFactorY:0,

    canvas:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-previewer");
        this.HTMLParent=this.HTMLElement.parentNode;

        this.HTMLCanvas=document.querySelector("#panel-previewer__canvas");
        this.HTMLBtnClose=document.querySelector(".panel-previewer__btn-close");
        this.HTMLControls=document.querySelector(".panel-previewer__controls");
        this.HTMLControls_playBtn=this.HTMLControls.querySelector(".panel-previewer__controls__play-btn");
        this.HTMLControls_progressBar=this.HTMLControls.querySelector(".panel-previewer__controls__progress-bar");
        this.progressBarCompleteWidth=this.HTMLControls_progressBar.clientWidth;
        this.initEvents();
        MainMediator.registerObserver(this.scenePreviewerController.name,this.scenePreviewerController.events.OnAnimatorTick,this)
        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnPreviewClicked,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.OnProjectCollectionsLoaded,this);
        MainMediator.registerObserver(PanelConfig.name,PanelConfig.events.OnDimensionsChanged,this);
        MainMediator.registerObserver(WindowManager.name,WindowManager.events.OnResize,this);
        WindowManager.registerObserverOnResize(this);
        this.canvas=new PreviewerCanvas('panel-previewer__canvas');
        this.scenePreviewerController.setPreviewerCanvas(this.canvas);

        this.setupDimentions(PanelConfig.getSettingProjectWidth(),PanelConfig.getSettingProjectHeight(),15,30,10);

    },
    setController:function(controller){//controllers are setted before initialization (init())
        this.scenePreviewerController=controller;
    },
    initEvents:function(){
        this.HTMLBtnClose.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLControls_playBtn.addEventListener("click",this.OnBtnPlayClicked.bind(this));
        //this.HTMLControls_progressBar.addEventListener("click",this.On.bind(this));
    },
    //getters
    getCanvasScalerFactorX:function(){
        return this.scalerFactorX;
    },
    getCanvasScalerFactorY:function(){
        return this.scalerFactorY;
    },
    //incomming notifications
    notificationPanelConfigOnDimensionsChanged:function(){
        this.setupDimentions(PanelConfig.getSettingProjectWidth(),PanelConfig.getSettingProjectHeight(),15,30,10);
    },
    notificationScenesManagerOnProjectCollectionsLoaded:function(args){
        let loadPendingData=args[0]
        this.setupDimentions(loadPendingData.projectWidth,loadPendingData.projectHeight,15,30,10);
    },
    notificationOnResize:function(){
        this.setupDimentions(PanelConfig.getSettingProjectWidth(),PanelConfig.getSettingProjectHeight(),15,30,10);
    },
    notificationPanelInspectorOnBtnPreviewClicked:function(){
        this.HTMLControls_playBtn.classList.add("pause");
        this.HTMLParent.style.display="block";
    },

    notificationEnlivedScenePreviewControllerOnAnimatorTick:function(args){
        let progress=args[0];
        let totalDuration=this.scenePreviewerController.animator.totalDuration;
        let normalizedProgress=progress/totalDuration;
        this.HTMLControls_progressBar.style.width=this.progressBarCompleteWidth*normalizedProgress + "px";
        if(progress===totalDuration && this.scenePreviewerController.animator.state===global.ControllerAnimatorState.paused){ //termino la animacion
            this.HTMLControls_playBtn.classList.remove("pause");
        }
    },
    setupDimentions:function(resolutionWidth,resolutionHeight,padding,controlsContentHeight,controlsPadding){
        let controlsHeight=controlsContentHeight+controlsPadding*2;

        let aspectRatio=resolutionHeight/resolutionWidth;

        let actualWidth;
        let actualHeight;
        let deltaX=resolutionWidth-window.innerWidth;
        let deltaY=resolutionHeight-window.innerHeight;

        if(deltaY>deltaX){//el offset de la resolucion en Y sobre el alto de la pantalla es mayor que la del eje X
            actualHeight=(window.innerHeight*0.9);
            actualWidth=actualHeight/aspectRatio;
        }else{
            actualWidth=(window.innerWidth*0.7);
            actualHeight=actualWidth*aspectRatio;

        }

        this.scalerFactorX=actualWidth/resolutionWidth;
        this.scalerFactorY=actualHeight/resolutionHeight;

        //solution for bug in backend rendering, since setWith,setHeight were rendering and no meanwhileimage was still ready at that point
        this.canvas.setDimentionsWithNoRendering({width:actualWidth,height:actualHeight});

        document.querySelector(".panel-previewer__canvas-container").style.height=actualHeight + "px";
        this.HTMLElement.style.width=actualWidth+padding*2 + "px";
        this.HTMLElement.style.height=actualHeight+padding+controlsHeight + "px";
        this.HTMLElement.style.padding=padding + "px";

        this.HTMLControls.style.height=controlsHeight+ "px";
        this.HTMLControls.style.paddingTop=controlsPadding + "px";
        this.HTMLControls.style.paddingBottom=controlsPadding + "px";

        let playBtnMarginRight=5;
        let playBtnWidth=controlsContentHeight;
        this.HTMLControls_playBtn.style.height=controlsContentHeight  + "px";
        this.HTMLControls_playBtn.style.width=playBtnWidth  + "px";
        this.HTMLControls_progressBar.style.height=controlsContentHeight/1.5 + "px";
        this.HTMLControls_progressBar.style.width=actualWidth-playBtnWidth-playBtnMarginRight + "px";


        this.progressBarCompleteWidth=actualWidth-playBtnWidth-playBtnMarginRight;
    },
    OnBtnCloseClicked:function(){
        this.HTMLParent.style.display="none";
        this.notifyBtnClose();
    },
    OnBtnPlayClicked:function(e){
        if(e.target.classList.contains('pause')){
            this.HTMLControls_playBtn.classList.remove("pause");
            this.notifyBtnPlayClicked(0);
        }else{
            this.HTMLControls_playBtn.classList.add("pause");
            this.notifyBtnPlayClicked(1);
        }
    },
    notifyBtnPlayClicked:function(action){
        MainMediator.notify(this.name,this.events.OnBtnPlay,[action])
    },
    notifyBtnClose:function(){
        MainMediator.notify(this.name,this.events.OnBtnClose,[]);
    },
}