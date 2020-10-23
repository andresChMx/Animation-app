
let SectionPropertiesEditor={
    HTMLElement:null,
    HTMLFields:null,
    listObserversOnFieldInput:[],
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__properties-editor");
        this.HTMLFields=document.querySelectorAll(".properties-editor__properties-container input");
        for(let i=0;i<this.HTMLFields.length;i++){
            this.HTMLFields[i].addEventListener("input",this.OnFieldsInput)
        }
        CanvasManager.registerOnSelectionUpdated(this);
        CanvasManager.registerOnObjModified(this);
    },
    _desableFields:function(){
        for(let i=0;i<this.HTMLFields.length;i++){
            this.HTMLFields[i].setAttribute("disabled","");
        }
    },
    _enableFields:function(){
        for(let i=0;i<this.HTMLFields.length;i++){
            this.HTMLFields[i].removeAttribute("disabled");
        }
    },
    _populateFields:function(selectedAnimObj){
        this.HTMLFields[0].value=selectedAnimObj.get("left");
        this.HTMLFields[1].value=selectedAnimObj.get("top");
        this.HTMLFields[2].value=selectedAnimObj.get("scaleX");
        this.HTMLFields[3].value=selectedAnimObj.get("scaleY");
        this.HTMLFields[4].value=selectedAnimObj.get("angle");
        this.HTMLFields[5].value=selectedAnimObj.get("opacity");
    },
    registerOnFieldInput:function(obj){
        let self=SectionPropertiesEditor;

        self.listObserversOnFieldInput.push(obj);

    },
    notificationOnSelectionUpdated:function(){
        let self=SectionPropertiesEditor;
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(!selectedAnimObj){
            self._desableFields();
        }else{
            self._enableFields();
            self._populateFields(selectedAnimObj);
        }
    },
    notificationOnObjModified:function(){
        let self=SectionPropertiesEditor;
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(!selectedAnimObj){
            self._desableFields();
        }else{
            self._enableFields();
            self._populateFields(selectedAnimObj);
        }

    },
    notifyOnFieldInput:function(target){
        let self=SectionPropertiesEditor;
        for(let i=0;i<self.listObserversOnFieldInput.length;i++){
            self.listObserversOnFieldInput[i].notificationOnFieldInput(target);
        }
    },
    OnFieldsInput:function(e){
        let self=SectionPropertiesEditor;
        self.notifyOnFieldInput(e.target);
    },
}
let SectionMenuAddKey={
    HTMLElement:null,
    HTMLButton:null,
    HTMLOptions:null,

    listObserversOnOptionClicked:[],
    init:function(){
        this.HTMLElement=document.querySelector(".menu-add-keyframe__inner-container");
        this.HTMLButton=document.querySelector(".menu-add-keyframe__label");
        this.HTMLOptions=document.querySelector(".menu-add-keyframe__options-list");
        for(let i=0;i<this.HTMLOptions.children.length;i++){
            this.HTMLOptions.children[i].addEventListener("click",this.OnOptionClicked)
        }

    },
    registerOnOptionClicked:function(obj){
        this.listObserversOnOptionClicked.push(obj);
    },
    OnOptionClicked:function(e){
        let self=SectionMenuAddKey;
        self.notifyOnOptionClicked(e.target.getAttribute("name"));
    },
    notifyOnOptionClicked:function(property){
        let self=SectionMenuAddKey;
        for(let i=0;i<self.listObserversOnOptionClicked.length;i++){
            self.listObserversOnOptionClicked[i].notificationOnOptionClicked(property);
        }
    }

}
let SectionToolBox={
    HTMLElement:null,
    listObserversOnBtnPreview:[],
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__toolbox");
        let btnPreview=document.querySelector(".toolbox__tool-item__button-preview");
        btnPreview.addEventListener("click",this.notifyOnBtnPreview.bind(this));
    },
    notifyOnBtnPreview:function(){
        for(let i=0;i<this.listObserversOnBtnPreview.length;i++){
            this.listObserversOnBtnPreview[i].notificationOnBtnPreview();
        }
    },
    registerOnBtnPreview:function(obj){

        this.listObserversOnBtnPreview.push(obj);
    }
}
var SectionObjectsEditor={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__objects-editor__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.lastActiveHTMLItem=null;
        CanvasManager.registerOnObjCreated(this);
        CanvasManager.registerOnObjDeleted(this);
        CanvasManager.registerOnSelectionUpdated(this);
    },
    notificationOnObjCreated:function (animObjWithEntrance){

        this.createHTMLItem(animObjWithEntrance)

    },
    notificationOnObjDeleted:function(indexObjsWithEntranceList,indexMainList){
        this.deleteHTMLItemAt(indexObjsWithEntranceList);
    },
    notificationOnSelectionUpdated:function(obj){
        let animbleActiveObject=CanvasManager.getSelectedAnimableObj();
        if(animbleActiveObject!=null){
            let indexInEntrancedObjectsList=CanvasManager.getListIndexObjectWithEntrance(animbleActiveObject);
            if(indexInEntrancedObjectsList!==-1){
                this.activeBoxObjectsHTMLItem(indexInEntrancedObjectsList);
                return;
            }
        }
        this.clearActivenessHTMLLastItem();
    },
    activeBoxObjectsHTMLItem:function(index){
        this.clearActivenessHTMLLastItem();
        let trueIndex=index+1;
        this.HTMLElement.children[trueIndex].id="active-item";
        this.lastActiveHTMLItem=this.HTMLElement.children[trueIndex];
    },
    clearActivenessHTMLLastItem:function (){
        if(this.lastActiveHTMLItem!=null){
            this.lastActiveHTMLItem.id="";
            this.lastActiveHTMLItem=null;
        }
    },
    createHTMLItem:function(animObjWithEntrance){
        let newItem=this.HTMLBoxItem.cloneNode(true);
        let icon=newItem.querySelector(".panel-inspector__objects-editor__box-items__item__icon img");
        let inputDelay=newItem.querySelector(".box-items__item__input-field__input-element-delay");
        let inputDuration=newItem.querySelector(".box-items__item__input-field__input-element-duration");
        icon.setAttribute("src",animObjWithEntrance.imageModel.url);
        inputDelay.value=animObjWithEntrance.entranceDelay;
        inputDuration.value=animObjWithEntrance.entranceDuration;
        newItem.style.display="block";
        newItem.setAttribute("index",this.HTMLElement.children.length-1);
        inputDuration.addEventListener("input",this.onInputDuration.bind(this));
        inputDelay.addEventListener("input",this.onInputDelay.bind(this));
        newItem.addEventListener("click",this.onHTMLItemClicked.bind(this))
        this.HTMLElement.appendChild(newItem)
    },
    deleteHTMLItemAt:function(index){
        this.HTMLElement.children[index+1].remove();// index-1 porque siempre hay un item oculto en el box items
    },
    onInputDelay:function(e){
        let index=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        //let index=parseInt(e.target.parentNode.parentNode.getAttribute("index"));
        CanvasManager.listAnimableObjectsWithEntrance[index].entranceDelay=parseInt(e.target.value);
    },
    onInputDuration:function(e){
        let index=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        //let index=parseInt(e.target.parentNode.parentNode.getAttribute("index"));
        CanvasManager.listAnimableObjectsWithEntrance[index].entranceDuration=parseInt(e.target.value);
    },
    onHTMLItemClicked:function(e){
        let HTMLElem=e.target;
        while(HTMLElem.className!=="panel-inspector__objects-editor__box-items__item clearfix"){
            HTMLElem=HTMLElem.parentNode;
        };
        let trueIndex=[].slice.call(this.HTMLElement.children).indexOf(HTMLElem)-1;
        CanvasManager.canvas.setActiveObject(CanvasManager.listAnimableObjectsWithEntrance[trueIndex])
        CanvasManager.canvas.renderAll();
    }
}
var PanelInspector={
    HTMLElement:null,
    htmlElementNormalHeight:0,
    SectionObjectsEditor:SectionObjectsEditor,
    SectionToolBox:SectionToolBox,
    SectionMenuAddKey:SectionMenuAddKey,
    SectionPropertiesEditor:SectionPropertiesEditor,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector");
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;

        this.SectionToolBox.init();
        this.SectionMenuAddKey.init();
        this.SectionPropertiesEditor.init();
        this.SectionObjectsEditor.init();

        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnItemsMenu_designPaths:function(data){
        this.HTMLElement.style.display="none";
    },
    notificationOnSettingActionClicked:function(data){
        this.HTMLElement.style.display="block"
    }
}
