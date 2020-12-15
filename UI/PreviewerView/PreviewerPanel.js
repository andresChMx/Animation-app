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
        this.canvas=new CustomStaticCanvas('panel-previewer__canvas');
        this.scenePreviewerController.setPreviewerCanvas(this.canvas);
    },
    setController:function(controller){
        this.scenePreviewerController=controller;
    },
    initEvents:function(){
        this.HTMLBtnClose.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLControls_playBtn.addEventListener("click",this.OnBtnPlayClicked.bind(this));
        //this.HTMLControls_progressBar.addEventListener("click",this.On.bind(this));
    },
    notificationPanelInspectorOnBtnPreviewClicked:function(){
        this.setupDimentions(1400,800,15,30,10);
        this.HTMLControls_playBtn.classList.remove("pause");
        this.HTMLParent.style.display="block";
    },
    notificationScenePreviewControllerOnAnimatorTick:function(args){
        let normalizedProgress=args[0];
        this.HTMLControls_progressBar.style.width=this.progressBarCompleteWidth*normalizedProgress + "px";
        if(normalizedProgress===1){ //termino la animacion
            this.HTMLControls_playBtn.classList.add("pause");
        }
    },
    setupDimentions:function(resolutionWidth,resolutionHeight,padding,controlsContentHeight,controlsPadding){
        let controlsHeight=controlsContentHeight+controlsPadding*2;

        let aspectRatio=resolutionHeight/resolutionWidth;
        let actualWidth=1400;
        //let actualWidth=(window.innerWidth*0.7);
        let actualHeight=actualWidth*aspectRatio;

        this.canvas.setWidth(actualWidth);
        this.canvas.setHeight(actualHeight);
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
            this.notifyBtnPlayClicked(1);
        }else{
            this.HTMLControls_playBtn.classList.add("pause");
            this.notifyBtnPlayClicked(0);
        }
    },
    notifyBtnPlayClicked:function(action){
        MainMediator.notify(this.name,this.events.OnBtnPlay,[action])
    },
    notifyBtnClose:function(){
        MainMediator.notify(this.name,this.events.OnBtnClose,[]);
    },
}