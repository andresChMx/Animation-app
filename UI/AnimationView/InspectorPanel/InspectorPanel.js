let SectionToolBox={
    HTMLElement:null,

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-inspector__toolbox");
        let me=this;
        this.MODELTools=[
            {
                available:true,/*temporary*/
                icon:"icon-save",
                label:"Home",
                action:function(){
                    PanelHome.showModal();
                }
            },
            {
                available:true,/*temporary*/
                icon:"icon-save",
                label:"Save",
                action:function(){
                    ScenesManager.projectPersistance.save();
                }
            },
            {
                available:true,/*temporary*/
                icon:"icon-settings",
                label:"Config",
                action:function(){
                    PanelConfig.showModal();
                }
            },
            {
                available:true,/*temporary*/
                icon:"icon-preview",
                label:"Preview",
                action:function(){
                    if(ScenesManager.AreAllAssetsReady()){
                        me.parentClass.childNotificationOnToolPreviewClicked();
                    }else{
                        alert("cannot preview while images are not ready, please delete those images");
                        //TODO Show notification "cannot preview while images are not ready, please delete those images"
                    }
                }
            },
            {
                available:false,/*temporary*/
                icon:"icon-publish",
                label:"Publish",
                action:function(){

                }
            },
        ],
        this.initHTML();
    },
    initHTML:function(){
        for(let i in this.MODELTools){
            this.createHTMLTool(this.MODELTools[i].icon,this.MODELTools[i].label, i,this.MODELTools[i].available);
        }
    },
    createHTMLTool:function(iconClassName,labelName,index,available){
        let container=document.createElement("div");
        let icon=document.createElement("span");
        let label=document.createElement("span");
        icon.className=iconClassName;
        label.textContent=labelName;
        container.className="panel-inspector__toolbox__tool-item";
        icon.classList.add("icon");
        label.className="label";

        if(!available){
            container.classList.add("available-soon");
        }

        container.setAttribute("index",index)
        container.appendChild(icon);
        container.appendChild(label);
        this.HTMLElement.appendChild(container);

        container.addEventListener("click",this.OnToolPressed.bind(this));
    },
    OnToolPressed:function(e){
        let toolIndex=parseInt(e.target.getAttribute("index"));
        this.MODELTools[toolIndex].action();
    },
}

var SectionMenuAreas={
    HTMLElement:null,
    parentClass:null,
    HTMLContainerAreas:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-inspector__manu-areas");
        this.HTMLLinks=this.HTMLElement.querySelectorAll("li");

        this.HTMLContainerAreas=document.querySelector(".panel-inspector__container-areas");
        this.initEvents();
    },
    initEvents:function(){
        for(let i=0;i<this.HTMLLinks.length;i++){
            this.HTMLLinks[i].addEventListener("click",this.OnOptionClicked.bind(this))
        }
    },
    OnOptionClicked:function(e){
        let indexOption=-1;
        for(let i=0;i<this.HTMLLinks.length;i++){
            this.HTMLLinks[i].classList.remove("active");
            if(this.HTMLLinks[i]===e.target){
                indexOption=i;
            }
        }
        e.target.classList.add("active");
        this.HTMLContainerAreas.style.left=-(this.HTMLContainerAreas.clientWidth/this.HTMLLinks.length)*indexOption + "px";
    }

}
var PanelInspector={
    name:'PanelInspector',
    events:{
        OnBtnPreviewClicked:'OnBtnPreviewClicked',
        OnObjectPropertyWidgedChanged:'OnObjectPropertyWidgedChanged',

        OnBtnMoveUpObjectEntranceOrder:'OnBtnMoveUpObjectEntranceOrder',
        OnBtnMoveDownObjectEntranceOrder:'OnBtnMoveDownObjectEntranceOrder',

    },
    HTMLElement:null,
    htmlElementNormalHeight:0,

    SectionToolBox:SectionToolBox,
    SectionMenuAreas:SectionMenuAreas,

    AreaSceneObjects:AreaSceneObjects,
    AreaObjectProperties:AreaObjectProperties,

    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector");
        this.HTMLBtnToggle=this.HTMLElement.querySelector(".btn-toggle-panel-right");

        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;


        this.SectionToolBox.init(this);
        this.SectionMenuAreas.init(this);
        this.AreaObjectProperties.init(this);
        this.AreaSceneObjects.init(this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjModified,this);

        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsWithEntranceItemAdded,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsWithEntranceItemRemoved,this);

        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsItemAdded,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsItemRemoved,this);

        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsClippersItemAdded,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsClippersItemRemoved,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnBtnMoveForward,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnBtnMoveBackwards,this);

        MainMediator.registerObserver(PanelAnimation.name,PanelAnimation.events.OnPanelToggle,this);

        WindowManager.unregisterOnKeyEnterPressed()
        WindowManager.registerOnMouseDown(this);
        WindowManager.registerObserverOnResize(this);
        this.initEvents();
        },
    initEvents:function(){
        this.HTMLBtnToggle.addEventListener("click",this.toggle.bind(this))
    },
    toggle:function(){
        if(this.HTMLElement.classList.contains("closed")){
            //this.HTMLBtnToggle.children[0].className=""
            this.HTMLElement.classList.remove("closed");
            this.HTMLElement.style.right=0;
        }else{
            //this.HTMLBtnToggle.children[0].className=""
            this.HTMLElement.classList.add("closed");
            this.HTMLElement.style.right=-this.HTMLElement.offsetWidth + "px";
        }
    },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.HTMLElement.style.display="none";
    },
    notificationPanelDesignerOptionsOnActionClicked:function(data){
        this.HTMLElement.style.display="block"
    },

    notificationScenesManageranimObjsWithEntranceItemAdded:function(args){
        let animObjWithEntrance=args[0];
        this.AreaSceneObjects.notificationScenesManageranimObjsWithEntranceItemAdded(animObjWithEntrance);
    },
    notificationScenesManageranimObjsWithEntranceItemRemoved:function(args){
        let indexObjsWithEntranceList=args[0];
        this.AreaSceneObjects.notificationScenesManageranimObjsWithEntranceItemRemoved(indexObjsWithEntranceList)
    },
    notificationScenesManageranimObjsItemAdded:function(args){
        let animableObject=args[0];
        this.AreaSceneObjects.notificationScenesManageranimObjsItemAdded(animableObject);
    },
    notificationScenesManageranimObjsItemRemoved:function(args){
        let indexInAnimableObjsList=args[0];
        this.AreaSceneObjects.notificationScenesManageranimObjsItemRemoved(indexInAnimableObjsList);
    },
    notificationScenesManageranimObjsClippersItemAdded:function(args){
        let animableObject=args[0]
        this.AreaSceneObjects.notificationScenesManageranimObjsClippersItemAdded(animableObject);
    },
    notificationScenesManageranimObjsClippersItemRemoved:function(args){
        let indexInShapeObjectsList=args[0];
        this.AreaSceneObjects.notificationScenesManageranimObjsClippersItemRemoved(indexInShapeObjectsList);
    },

    notificationCanvasManagerOnBtnMoveForward:function(args){
        let index=args[0];
        this.AreaSceneObjects.notificationCanvasManagerOnObjectMovedForward(index);
    },
    notificationCanvasManagerOnBtnMoveBackwards:function(args){
        let index=args[0];
        this.AreaSceneObjects.notificationCanvasManagerOnObjectMovedBackward(index);
    },

    notificationCanvasManagerOnSelectionUpdated:function(){
        this.AreaSceneObjects.notificationCanvasManagerOnSelectionUpdated();
        this.AreaObjectProperties.notificationCanvasManagerOnSelectionUpdated();
    },
    notificationCanvasManagerOnObjModified:function(args){
        this.AreaObjectProperties.notificationCanvasManagerOnObjModified();
    },
    notificationPanelAnimationOnPanelToggle:function(args){
        let opened=args[0];
        if(opened){
            this.HTMLElement.style.height=this.htmlElementNormalHeight + "px";
        }else{
            this.HTMLElement.style.height=100 + "vh";
        }
    },
    notificationOnKeyEnterUp:function(){

    },
    notificationOnMouseDown:function(e){
        this.AreaSceneObjects.notificationOnMouseDown(e);
    },
    notificationOnResize:function(){
        this.htmlElementNormalHeight=window.innerHeight- CSS_VARIABLE.PanelAnimationHeight;
    },
    childNotificationOnBtnMoveUpEntranceOrderPressed:function(index){
        MainMediator.notify(this.name,this.events.OnBtnMoveUpObjectEntranceOrder,[index]);
    },
    childNotificationOnBtnMoveDownEntranceOrderPressed:function(index){
        MainMediator.notify(this.name,this.events.OnBtnMoveDownObjectEntranceOrder,[index]);
    },
    childNotificationOnToolPreviewClicked:function(){
        MainMediator.notify(this.name,this.events.OnBtnPreviewClicked,[]);
    },
    childNotificationOnObjectTransformPropertyWidgetChanged:function(){
        MainMediator.notify(this.name,this.events.OnObjectPropertyWidgedChanged,[]);
    },
}
