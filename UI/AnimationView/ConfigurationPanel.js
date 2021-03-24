var PanelConfig={
    name:'PanelConfig',
    events:{
        OnDimensionsChanged:'OnDimensionsChanged'
    },
    HTMLElement:null,

    settings:{
        projectWidth:1920,
        projectHeight:1080,
        aspectRatio:"16:9",
    },
    mapAspectRatios:{
        "16:9":[1920,1080],
        "4:3":[1600,1200],
        "3:4":[1200,1600],
        "9:16":[1080,1920],
        "Custom":[0,0]
    },
    init:function(){
        this.HTMLElement=document.querySelector(".panel-config__filter");

        this.HTMLcloseBtn=document.querySelector(".panel-config__header__btn-close");
        this.HTMLAcceptBtn=document.querySelector(".panel-config__footer .btn-accept")
        this.HTMLCancelBtn=document.querySelector(".panel-config__footer .btn-cancel")

        this.htmlAspectSelect=this.HTMLElement.querySelector("#select-aspect-ratios");
        this.htmlAspectInputWidth=this.HTMLElement.querySelector("#project-width");
        this.htmlAspectInputHeight=this.HTMLElement.querySelector("#project-height");

        this.fieldWidth=new NumericField(this.htmlAspectInputWidth,"px",0,3000);
        this.fieldHeight=new NumericField(this.htmlAspectInputHeight,"px",0,3000);

        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.OnProjectCollectionsLoaded,this);

        this.initElements();
        this.initEvents();

    },
    initElements:function(){
        for(let aspect in this.mapAspectRatios){
            let option=document.createElement("option");
            option.setAttribute("value",aspect);
            option.value=aspect;
            option.textContent=aspect;
            this.htmlAspectSelect.appendChild(option);
        }
        this.htmlAspectSelect.value=this.htmlAspectSelect.children[0].value;
    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLCancelBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLAcceptBtn.addEventListener("click",this.OnBtnAcceptClicked.bind(this))

        this.htmlAspectSelect.addEventListener("change",this.OnAspectSelectChange.bind(this))

        //INIT WIDGETS
    },
    /*settings getters*/
    getSettingProjectWidth:function(){
        return this.settings.projectWidth;
    },
    getSettingProjectHeight:function(){
        return this.settings.projectHeight;
    },
    getSettingAspect:function(){/*solo para mostrar el aspect correcto en el dropdown tras cargar un project*/
        return this.settings.aspectRatio;
    },
    OnAspectSelectChange:function(e){
        if(this.htmlAspectSelect.value==="Custom"){
            this.fieldWidth.enable();
            this.fieldHeight.enable();
        }else{
            let width=this.mapAspectRatios[this.htmlAspectSelect.value][0];
            let height=this.mapAspectRatios[this.htmlAspectSelect.value][1];
            this.fieldWidth.setValue(width);
            this.fieldHeight.setValue(height);

            this.fieldWidth.disable();
            this.fieldHeight.disable();
        }
    },
    showModal:function(){
        this.htmlAspectSelect.value=this.settings.aspectRatio;
        this.fieldWidth.setValue(this.settings.projectWidth);
        this.fieldHeight.setValue(this.settings.projectHeight);

        if(this.htmlAspectSelect.value==="Custom"){
            this.fieldWidth.enable();
            this.fieldHeight.enable();
        }else{
            this.fieldWidth.disable();
            this.fieldHeight.disable();
        }

        this.HTMLElement.style.display="block";
    },
    hiddeModel:function(){
        this.HTMLElement.style.display="none";
    },

    OnBtnCloseClicked:function(){
        this.hiddeModel();
    },
    /*SE PROCESA LA INFORMACION EDITADA*/
    OnBtnAcceptClicked:function(){
        this.settings.projectWidth=this.fieldWidth.getValue();
        this.settings.projectHeight=this.fieldHeight.getValue();
        this.settings.aspectRatio=this.htmlAspectSelect.value;
        this.notifyOnDimensionsChanged();
        this.hiddeModel();
        CanvasManager.canvas.renderAll();
    },
    notifyOnDimensionsChanged:function(){
        MainMediator.notify(this.name,this.events.OnDimensionsChanged,[this.settings.projectWidth,this.settings.projectHeight]);
    },

    notificationScenesManagerOnProjectCollectionsLoaded:function(args){
        let loadPendingData=args[0];
        this.settings.projectWidth=loadPendingData.projectWidth;
        this.settings.projectHeight=loadPendingData.projectHeight;
        this.settings.aspectRatio=loadPendingData.aspectRatio;
    },

};