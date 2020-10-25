var PanelPreviewer={
    HTMLElement:null,
    HTMLParent:null,
    scenePreviewerController:null,

    resolutionWidth:1400,
    resolutionHeight:800,

    canvas:null,

    listObserversOnBtnClose:[],
    init:function(){
        this.HTMLElement=document.querySelector(".panel-previewer");
        this.HTMLParent=this.HTMLElement.parentNode;

        this.HTMLCanvas=document.querySelector("#panel-previewer__canvas");
        this.HTMLControls=document.querySelector(".panel-previewer__controls");

        let btnClose=document.querySelector(".panel-previewer__btn-close");
        btnClose.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        PanelInspector.SectionToolBox.registerOnBtnPreview(this);

        this.canvas=new CustomStaticCanvas('panel-previewer__canvas');
        this.scenePreviewerController.setPreviewerCanvas(this.canvas);
    },
    setScenePreviewerController:function(controller){
        this.scenePreviewerController=controller;
    },
    notificationOnBtnPreview:function(){
        this.setupDimentions(1400,800,15,20,10);

        this.HTMLParent.style.display="block";
    },
    setupDimentions:function(resolutionWidth,resolutionHeight,padding,progressBarHeight,controlsPadding){
        let controlsHeight=progressBarHeight+controlsPadding*2;

        let aspectRatio=resolutionHeight/resolutionWidth;
        let actualWidth=(window.innerWidth*0.7);
        let actualHeight=actualWidth*aspectRatio;

        this.canvas.setWidth(actualWidth);
        this.canvas.setHeight(actualHeight);
        this.HTMLElement.style.width=actualWidth+padding*2 + "px";
        this.HTMLElement.style.height=actualHeight+padding+controlsHeight + "px";
        this.HTMLElement.style.padding=padding + "px";
        this.HTMLControls.style.height=controlsHeight+ "px";
    },
    OnBtnCloseClicked:function(){
        this.HTMLParent.style.display="none";
        this.notifyBtnClose();
    },
    notifyBtnClose:function(){
        for(let i=0;i<this.listObserversOnBtnClose.length;i++){
            this.listObserversOnBtnClose[i].notificationOnBtnClose();
        }
    },
    registerOnBtnClose:function(obj){
        this.listObserversOnBtnClose.push(obj);
    }
}