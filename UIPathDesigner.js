var SectionSettings={
    HTMLElement:null,
    
    listObserversOnActionClicked:[],

    listObserversOnZoomOut:[],
    listObserversOnZoomIn:[],

    listObserversOnToolClicked:[],
    listObserversOnLineWidthChanged:[],
    listObserversOnDurationChanged:[],
    init:function(){
        this.HTMLElement=document.querySelector(".panel-designer-options__section-settings");
        this.setupHTMLSettingAction();
        this.setupHTMLSettingZoom();
        this.setupHTMLSettingTool();
        this.setupHTMLSettingLineWidth();
        this.setupHTMLSettingDuration();

    },
    setupHTMLSettingAction:function(){
        let btnSave=document.querySelector(".setting-action__btn-save");
        let btnCancel=document.querySelector(".setting-action__btn-cancel");
        btnSave.addEventListener("click",this.notifyOnActionClicked.bind(this));
        btnCancel.addEventListener("click",this.notifyOnActionClicked.bind(this));
       
    },
    setupHTMLSettingZoom:function(){
        let btnZoomOut=document.querySelector(".setting-zoom__btn-zoom-out");
        let btnZoomIn=document.querySelector(".setting-zoom__btn-zoom-in");
        btnZoomOut.addEventListener("click",this.notifyOnZoomOut.bind(this));
        btnZoomIn.addEventListener("click",this.notifyOnZoomIn.bind(this));
    },
    setupHTMLSettingTool:function(){
        let btnToolSelection=document.querySelector(".setting-tool__btn-tool-selection");
        let btnToolAdd=document.querySelector(".setting-tool__btn-tool-add");
        let btnToolRemove=document.querySelector(".setting-tool__btn-tool-remove");
        btnToolSelection.addEventListener("click",this.notifyOnToolClicked.bind(this));
        btnToolAdd.addEventListener("click",this.notifyOnToolClicked.bind(this));
        btnToolRemove.addEventListener("click",this.notifyOnToolClicked.bind(this));
    },
    setupHTMLSettingLineWidth:function(){
        let slider=document.querySelector(".setting-line-width__slider");
        slider.addEventListener("change",this.notifyOnLineWidthChanged.bind(this))
    },
    setupHTMLSettingDuration:function(){
        let slider=document.querySelector(".setting-duration__slider");
        slider.addEventListener("change",this.notifyOnDurationChanged.bind(this));
    },
    notifyOnActionClicked:function(e){
        for(let i=0;i<this.listObserversOnActionClicked.length;i++){
            this.listObserversOnActionClicked[i].notificationOnSettingActionClicked(e.target.id);
        }
    },
    notifyOnZoomOut:function(){
        for(let i=0;i<this.listObserversOnZoomOut.length;i++){
            this.listObserversOnZoomOut[i].notificationOnZoomOut();
        }
    },
    notifyOnZoomIn:function(){
        for(let i=0;i<this.listObserversOnZoomIn.length;i++){
            this.listObserversOnZoomIn[i].notificationOnZoomIn();
        }
    },
    notifyOnToolClicked:function(e){
        for(let i=0;i<this.listObserversOnToolClicked.length;i++){
            this.listObserversOnToolClicked[i].notificationOnToolClicked(e.target.id);
        }
    },
    notifyOnLineWidthChanged:function(e){
        for(let i=0;i<this.listObserversOnLineWidthChanged.length;i++){
            this.listObserversOnLineWidthChanged[i].notificationOnLineWidthChanged(e.target.value);
        }
    },
    notifyOnDurationChanged:function(e){
        for(let i=0;i<this.listObserversOnDurationChanged.length;i++){
            this.listObserversOnDurationChanged[i].notificationOnDurationChanged(e.target.value);
        }
    },
    registerOnSettingActionClicked:function(obj){
        this.listObserversOnActionClicked.push(obj);
    },
    registerOnSettingZoomOut:function(obj){
        this.listObserversOnZoomOut.push(obj);
    },
    registerOnSettingZoomIn:function(obj){
        this.listObserversOnZoomIn.push(obj);
    },
    registerOnSettingToolClicked:function(obj){
        this.listObserversOnToolClicked.push(obj);
    },
    registerOnSettingLineWidthChanged:function(obj){
        this.listObserversOnLineWidthChanged.push(obj);
    },
    registerOnSettingDurationChanged:function(obj){
        this.listObserversOnDurationChanged.push(obj);
    }

}
let SectionPaths={
    HTMLElement:null,

    listObserversOnBtnAddPathClicked:[],
    listObserversOnPathClicked:[],
    listObserversOnBtnDeletePathClicked:[],

    designerController:null,
    currentActiveHTMLPath:-1,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-designer-options__section-paths");
        this.HTMLButtonAddPath=document.querySelector(".panel-designer-options__section-paths__button");
        this.HTMLPathsBox=document.querySelector(".panel-designer-options__section-paths__paths-box");

        this.HTMLButtonAddPath.addEventListener("click",this.OnBtnAddPathClicked.bind(this));

    },
    wakeUp:function(){
        this._generateHTMLPathsCollection(this.designerController.drawingManager.listPathsNames);
        this._activateHTMLPath(0);
    },
    sleep:function(){
        this.HTMLPathsBox.innerHTML="";
    },
    _generateHTMLPath:function(pathModel){
        let path=document.createElement("div");
        path.classList.add("path");
        path.setAttribute("name",pathModel.index);

        let pathInnerContainer=document.createElement("div");
        pathInnerContainer.classList.add("path__inner-container");
        pathInnerContainer.setAttribute("name",pathModel.index);

        let label=document.createElement("span");
        label.textContent=pathModel.pathName;
        label.setAttribute("name",pathModel.index);

        let btnDelete=document.createElement("button");
        btnDelete.classList.add("path__inner-container__btn-delete");
        btnDelete.setAttribute("name",pathModel.index);

        let pathSpaceEffect=document.createElement("div");
        pathSpaceEffect.classList.add("path__space-effect");

        pathInnerContainer.append(label);
        pathInnerContainer.append(btnDelete);
        path.append(pathInnerContainer);
        path.append(pathSpaceEffect);
        this.HTMLPathsBox.append(path);

        path.addEventListener("click",this.OnPathClicked.bind(this));
    },
    _generateHTMLPathsCollection:function(listPathsNames){
        this.HTMLPathsBox.innerHTML="";
        for(let i=0;i<listPathsNames.length;i++){
            this._generateHTMLPath({pathName:listPathsNames[i],index:i});
        }
    },
    _deletePathAt:function(pathIndex){
        if(this.HTMLPathsBox.children.length<=1){return}
        this.HTMLPathsBox.children[pathIndex].remove();
        for(let i=pathIndex;i<this.HTMLPathsBox.children.length;i++){
            this.HTMLPathsBox.children[i].setAttribute("name",i);
            this.HTMLPathsBox.children[i].children[0].setAttribute("name",i);
            this.HTMLPathsBox.children[i].children[0].children[0].setAttribute("name",i);
            this.HTMLPathsBox.children[i].children[0].children[1].setAttribute("name",i);
        }
    },
    _activateHTMLPath:function(index){
        this.currentActiveHTMLPath=index;
        this.HTMLPathsBox.children[this.currentActiveHTMLPath].classList.add("active");
    },
    _disableCurrentActiveHTMLPath:function(){
        this.HTMLPathsBox.children[this.currentActiveHTMLPath].classList.remove("active");
    },
    _addPathAtEnd:function(){
        let listPathsNames=this.designerController.drawingManager.listPathsNames
        let pathModel={pathName:listPathsNames[listPathsNames.length-1],index:listPathsNames.length-1}
        this._generateHTMLPath(pathModel);
    },
    OnBtnAddPathClicked:function(){
        this._disableCurrentActiveHTMLPath();
        this.notifyOnBtnAddPathClicked();
        this._addPathAtEnd();
        this._activateHTMLPath(this.designerController.drawingManager.currentPathIndex);
    },
    OnPathClicked:function(e){
        this._disableCurrentActiveHTMLPath();
        if(e.target.classList.contains("path__inner-container__btn-delete")){
            this.notifyOnBtnDeletePathClicked(e);
            this._deletePathAt(e.target.getAttribute("name"));
        }else{
            this.notifyOnPathClicked(e);
        }
        this._activateHTMLPath(this.designerController.drawingManager.currentPathIndex);
    },  
    notifyOnBtnAddPathClicked:function(){
        for(let i=0;i<this.listObserversOnBtnAddPathClicked.length;i++){
            this.listObserversOnBtnAddPathClicked[i].notificationOnBtnAddPathClicked();
        }
    },
    notifyOnPathClicked:function(e){
        let indexPath=e.target.getAttribute("name");
        for(let i=0;i<this.listObserversOnPathClicked.length;i++){  
            this.listObserversOnPathClicked[i].notificationOnPathClicked(indexPath);
        }
    },
    notifyOnBtnDeletePathClicked:function(e){
        let indexPath=e.target.getAttribute("name");
        for(let i=0;i<this.listObserversOnBtnDeletePathClicked.length;i++){ 
            this.listObserversOnBtnDeletePathClicked[i].notificationOnBtnDeletePathClicked(indexPath);
        }
    },
    registerOnBtnAddPathClicked:function(obj){
        this.listObserversOnBtnAddPathClicked.push(obj);
    },
    registerOnPathClicked:function(obj){
        this.listObserversOnPathClicked.push(obj);
    },
    registerOnBtnDeletePathClicked:function(obj){
        this.listObserversOnBtnDeletePathClicked.push(obj);
    }

}
var PanelDesignerOptions={
    HTMLElement:null,

    SectionSettings:SectionSettings,
    SectionPaths:SectionPaths,
    designerController:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-designer-options");
        
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        this.SectionSettings.registerOnSettingActionClicked(this);
    },
    setDesignerController:function(obj){
        this.designerController=obj;
        this.SectionPaths.designerController=obj;
        this.designerController.registerOnSetupCompleted(this);
    },
    notificationOnItemsMenu_designPaths:function(imageModel){
        this.HTMLElement.style.display="block";
        
    },
    notificationOnSettingActionClicked:function(){
        this.HTMLElement.style.display="none";
        this.SectionPaths.sleep();
    },
    notificationOnSetupCompleted:function(){
        this.SectionPaths.wakeUp();
        
    }
}
var PanelPathsDesigner={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-paths-designer");

        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnSettingActionClicked:function(){
        this.HTMLElement.style.display="none";
    },
    notificationOnItemsMenu_designPaths:function(data){
        this.HTMLElement.style.display="flex";
        this.resizeHTMLElement();
    },
    resizeHTMLElement:function(){
        this.HTMLElement.style.width=document.body.offsetWidth-(PanelAssets.HTMLElement.offsetLeft+PanelAssets.HTMLElement.offsetWidth )-PanelDesignerOptions.HTMLElement.offsetWidth  + "px";
        this.HTMLElement.style.left=PanelAssets.HTMLElement.offsetWidth + "px";
    }
}