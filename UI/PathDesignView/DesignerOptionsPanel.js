var SectionActions={
    HTMLElement:null,
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-designer-options__section-actions");
        this.HTMLButtons=this.HTMLElement.children;
        for(let i=0;i<this.HTMLButtons.length;i++){
            this.HTMLButtons[i].addEventListener("click",this.OnActionTriggered.bind(this));
        }
    },
    OnActionTriggered:function(e){
        this.notifyOnActionClicked(e.target.id);
    },
    notifyOnActionClicked:function(actionId){
        this.parentClass.childNotificationOnActionClicked(actionId);
    }

}

var SectionSettings={
    HTMLElement:null,

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-designer-options__section-settings");

        this.numericFieldLineWidth=null;
        this.numericFieldDuration=null;

        this.htmlBtnToolSelection=null;
        this.htmlBtnToolAdd=null;
        this.setupHTMLSettingZoom();
        this.setupHTMLSettingTool();
        this.setupHTMLSettingLineWidth();
        this.setupHTMLSettingDuration();
    },

    setupHTMLSettingZoom:function(){
        let btnZoomOut=document.querySelector(".setting-zoom__btn-zoom-out");
        let btnZoomIn=document.querySelector(".setting-zoom__btn-zoom-in");
        btnZoomOut.addEventListener("click",this.notifyOnZoomOut.bind(this));
        btnZoomIn.addEventListener("click",this.notifyOnZoomIn.bind(this));
    },
    setupHTMLSettingTool:function(){
        this.htmlBtnToolSelection=document.querySelector(".setting-tool__btn-tool-selection");
        this.htmlBtnToolAdd=document.querySelector(".setting-tool__btn-tool-add");
        let btnToolRemove=document.querySelector(".setting-tool__btn-tool-remove");
        this.htmlBtnToolSelection.addEventListener("click",this.notifyOnToolClicked.bind(this));
        this.htmlBtnToolAdd.addEventListener("click",this.notifyOnToolClicked.bind(this));
        btnToolRemove.addEventListener("click",this.notifyOnToolClicked.bind(this));
    },
    setupHTMLSettingLineWidth:function(){
        let self=this;
        let slider=document.querySelector(".setting-line-width__slider");
        let input=document.querySelector(".setting-line-width__field");
        this.numericFieldLineWidth=new NumericField(input,"",1,100,ObserverType.temp);

        slider.addEventListener("change",function(e){
            this.numericFieldLineWidth.setValue(e.target.value);// this will make call the callback which will notify the new value (lines below)
        }.bind(this));

        this.numericFieldLineWidth.addListenerOnNewValue(function(value,e){
            slider.value=value;
            self.notifyOnLineWidthChanged(value);
        })
    },
    setupHTMLSettingDuration:function(){
        let self=this;
        let slider=document.querySelector(".setting-duration__slider");
        let input=document.querySelector(".setting-duration__field");
        this.numericFieldDuration=new NumericField(input,"s",2,10,ObserverType.temp);

        slider.addEventListener("change",function(e){
            this.numericFieldDuration.setValue(e.target.value);// this will make call the callback which will notify the new value (lines below)
        }.bind(this));

        this.numericFieldDuration.addListenerOnNewValue(function(value,e){
            slider.value=value;
            self.notifyOnDurationChanged(value);
        })
    },
    notifyOnZoomOut:function(){

        this.parentClass.childNotificationOnZoomOut();
    },
    notifyOnZoomIn:function(){
        this.parentClass.childNotificationOnZoomIn();
    },
    notifyOnToolClicked:function(e){
        this.parentClass.childNotificationOnToolClicked(e.target.id);

    },
    notifyOnLineWidthChanged:function(value){
        this.parentClass.childNotificationOnLineWidthChanged(value);
    },
    notifyOnDurationChanged:function(value){
        this.parentClass.childNotificationOnDurationChanged(value*1000);
    },

    notificationOnToolChanged:function(currentTool){
        console.log(currentTool);
        this.htmlBtnToolAdd.classList.remove("active");
        this.htmlBtnToolSelection.classList.remove("active");
        if(this.htmlBtnToolAdd.id===currentTool){this.htmlBtnToolAdd.classList.add("active")}
        else if(this.htmlBtnToolSelection.id===currentTool){this.htmlBtnToolSelection.classList.add("active")};
    },
    notificationOnControllerSetupCompleted:function(controllerIllustratorDuration){
        this.numericFieldDuration.setValue(controllerIllustratorDuration/1000);
    },
    notificationOnPathIndexChanged:function(lineWidth){
        console.log(lineWidth);
        this.numericFieldLineWidth.setValue(lineWidth);
    }

}
let SectionPaths={
    HTMLElement:null,

    designerController:null,
    currentActiveHTMLPath:-1,
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
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
    OnBtnLoadSVGClicked:function (e){
        this.notifyOnBtnLoadSVGClicked()
    },

    notifyOnBtnAddPathClicked:function(){
        this.parentClass.childNotificationOnBtnAddPathClicked();
    },
    notifyOnPathClicked:function(e){
        let indexPath=e.target.getAttribute("name");
        indexPath=parseInt(indexPath);
        this.parentClass.childNotificationOnPathClicked(indexPath);
    },
    notifyOnBtnDeletePathClicked:function(e){
        let indexPath=e.target.getAttribute("name");
        indexPath=parseInt(indexPath);
        this.parentClass.childNotificationOnBtnDeletePathClicked(indexPath)
    },
    notifyOnBtnLoadSVGClicked:function(){
        this.parentClass.childNotificationOnBtnLoadSVGClicked();
    },
    notificationOnActionClicked:function(action){
        this.sleep();
    }
}
var SectionPathDesignerPopup={
    HTMLElement:null,
    modelCurrentOptions:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-paths__popup");
        this.HTMLparent=document.querySelector(".panel-paths__popup__filter");
        this.HTMLTitle=document.querySelector(".panel-paths__popup__title");
        this.HTMLMessage=document.querySelector(".panel-paths__popup__message");
        this.HTMLOptionsBox=document.querySelector(".panel-paths__popup__box-options");
        this.HTMLOption=this.HTMLOptionsBox.children[0].cloneNode(true)
    },
    showMessage:function(title,message,options){ //[{name:"",action:function(){}}]
        this.HTMLparent.style.display="flex"
        this.modelCurrentOptions=options;
        this.HTMLTitle.innerHTML=title;
        this.HTMLMessage.innerHTML=message;
        this.HTMLOptionsBox.innerHTML="";
        for(let i=0;i<options.length;i++){
            let htmlOpt=this.HTMLOption.cloneNode(true);
            htmlOpt.innerHTML=options[i].name;
            htmlOpt.setAttribute("index",i)
            htmlOpt.addEventListener("click",this.optionClicked.bind(this))
            htmlOpt.style.display="block";
            this.HTMLOptionsBox.appendChild(htmlOpt);
        }
    },
    optionClicked:function(e){
        let index=parseInt(e.target.getAttribute("index"));
        this.modelCurrentOptions[index].action();

        this.HTMLparent.style.display="none";
    }
}
var PanelDesignerOptions={
    name:'PanelDesignerOptions',
    events:{
        OnBtnAddPathClicked:'OnBtnAddPathClicked',
        OnPathClicked:'OnPathClicked',
        OnBtnDeletePathClicked:'OnBtnDeletePathClicked',
        OnBtnLoadSVGClicked:'OnBtnLoadSVGClicked',
        OnActionClicked:'OnActionClicked',

        OnSettingZoomOut:'OnSettingZoomOut',
        OnSettingZoomIn:'OnSettingZoomIn',
        OnSettingToolClicked:'OnSettingToolClicked',
        OnSettingLineWidthChanged:'OnSettingLineWidthChanged',
        OnSettingDurationChanged:'OnSettingDurationChanged'
    },
    HTMLElement:null,
    SectionActions:SectionActions,
    SectionSettings:SectionSettings,
    SectionPaths:SectionPaths,
    SectionPathDesignerPopup:SectionPathDesignerPopup,
    designerController:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-designer-options");
        this.SectionActions.init(this);
        this.SectionSettings.init(this);
        this.SectionPathDesignerPopup.init(this);
        this.SectionPaths.init(this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
    },
    setController:function(obj){
        this.designerController=obj;
        this.SectionPaths.designerController=obj;
        this.designerController.registerOnSetupCompleted(this);
        this.designerController.registerOnLayerIndexChanged(this);
        this.designerController.registerOnToolChanged(this);
    },
    wakeUp:function(){
        this.HTMLElement.style.display="block";
    },
    sleep:function(){
        this.HTMLElement.style.display="none";
    },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.wakeUp();
    },
    /*controller notifications*/
    notificationOnToolChanged:function(){
        let tool=this.designerController.drawingManager.currentTool;
        this.SectionSettings.notificationOnToolChanged(tool);
    },
    notificationOnPathIndexChanged:function(){
        let lineWidth=this.designerController.drawingManager.getCurrentPathLineWidth();
        this.SectionSettings.notificationOnPathIndexChanged(lineWidth);
    },
    notificationOnSetupCompleted:function(){
        let duration=this.designerController.previewManager.getIllustrationDuration();
        this.SectionSettings.notificationOnControllerSetupCompleted(duration);
        this.SectionPaths.wakeUp();
    },
    childNotificationOnBtnAddPathClicked:function(){
        MainMediator.notify(this.name,this.events.OnBtnAddPathClicked,[])
    },
    childNotificationOnPathClicked:function(indexPath){
        MainMediator.notify(this.name,this.events.OnPathClicked,[indexPath]);
    },
    childNotificationOnBtnDeletePathClicked:function(indexPath){
        MainMediator.notify(this.name,this.events.OnBtnDeletePathClicked,[indexPath]);
    },
    childNotificationOnBtnLoadSVGClicked:function(){
        MainMediator.notify(this.name,this.events.OnBtnLoadSVGClicked,[])
    },
    childNotificationOnActionClicked:function(actionId){
        this.sleep();
        this.SectionPaths.notificationOnActionClicked(actionId);
        MainMediator.notify(this.name,this.events.OnActionClicked,[actionId])
    },
    childNotificationOnZoomOut:function(){
        MainMediator.notify(this.name,this.events.OnSettingZoomOut,[])
    },
    childNotificationOnZoomIn:function(){
        MainMediator.notify(this.name,this.events.OnSettingZoomIn,[])
    },
    childNotificationOnToolClicked:function(targetId){
        MainMediator.notify(this.name,this.events.OnSettingToolClicked,[targetId])
    },
    childNotificationOnLineWidthChanged:function(targetValue){
        MainMediator.notify(this.name,this.events.OnSettingLineWidthChanged,[targetValue])
    },
    childNotificationOnDurationChanged:function(targetValue){
        MainMediator.notify(this.name,this.events.OnSettingDurationChanged,[targetValue])
    },
}