let SectionToolBox={
    HTMLElement:null,

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-inspector__toolbox");
        let me=this;
        this.MODELTools=[
            {
                icon:"icon-floppy-disk",
                label:"Save",
                action:function(){

                }
            },
            {
                icon:"icon-preview",
                label:"Preview",
                action:function(){
                    me.parentClass.childNotificationOnToolPreviewClicked();
                }
            },
            {
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
            this.createHTMLTool(this.MODELTools[i].icon,this.MODELTools[i].label, i);
        }
    },
    createHTMLTool:function(iconClassName,labelName,index){
        let container=document.createElement("div");
        let icon=document.createElement("span");
        let label=document.createElement("span");
        icon.className=iconClassName;
        label.textContent=labelName;
        container.className="panel-inspector__toolbox__tool-item";
        icon.classList.add("icon");
        label.className="label";
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
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;


        this.SectionToolBox.init(this);
        this.SectionMenuAreas.init(this);
        this.AreaObjectProperties.init(this);
        this.AreaSceneObjects.init(this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjModified,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjAddedToListWithEntrance,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjDeletedFromListWidthEntraces,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnAnimableObjectAdded,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnAnimableObjectDeleted,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnShapeAnimableAdded,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnShapeAnimableDeleted,this);

        WindowManager.unregisterOnKeyEnterPressed()
        WindowManager.registerOnMouseDown(this);
        },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.HTMLElement.style.display="none";
    },
    notificationPanelDesignerOptionsOnActionClicked:function(data){
        this.HTMLElement.style.display="block"
    },
    notificationCanvasManagerOnObjAddedToListWithEntrance:function(args){
        let animObjWithEntrance=args[0];
        this.AreaSceneObjects.notificationOnObjAddedToListObjectsWithEntrance(animObjWithEntrance);
    },
    notificationCanvasManagerOnObjDeletedFromListWidthEntraces:function(args){
        let indexObjsWithEntranceList=args[0];
        this.AreaSceneObjects.notificationOnObjDeletedFromListWithEntrance(indexObjsWithEntranceList)
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.AreaSceneObjects.notificationCanvasManagerOnSelectionUpdated();
        this.AreaObjectProperties.notificationCanvasManagerOnSelectionUpdated();
    },
    notificationCanvasManagerOnAnimableObjectAdded:function(args){
        let animableObject=args[0];
        this.AreaSceneObjects.notificationOnAnimableObjectAdded(animableObject);
    },
    notificationCanvasManagerOnAnimableObjectDeleted:function(args){
        let indexInAnimableObjsList=args[0];
        this.AreaSceneObjects.notificationOnAnimableObjectDeleted(indexInAnimableObjsList);
    },
    notificationCanvasManagerOnShapeAnimableAdded:function(args){
        let animableObject=args[0]
        this.AreaSceneObjects.notificationCanvasManagerOnShapeAnimableAdded(animableObject);
    },
    notificationCanvasManagerOnShapeAnimableDeleted:function(args){
        let indexInShapeObjectsList=args[0];
        this.AreaSceneObjects.notificationCanvasManagerOnShapeAnimableDeleted(indexInShapeObjectsList);
    },

    notificationCanvasManagerOnObjModified:function(args){
        this.AreaObjectProperties.notificationCanvasManagerOnObjModified();
    },
    notificationOnKeyEnterUp:function(){

    },
    notificationOnMouseDown:function(e){
        this.AreaSceneObjects.notificationOnMouseDown(e);
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
