let SectionToolBox={
    HTMLElement:null,
    toolsActions:{
        projectTools:["preview"],
        textTools:["add-text"]
    },

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-inspector__toolbox");
        let btnPreview=document.querySelector(".toolbox__item__button-preview");
        btnPreview.addEventListener("click",this.notifyOnBtnPreview.bind(this));

        this.HTMLTextTools=document.querySelector(".panel-inspector__toolbox__item-text");
        this.initEvents();
    },
    initEvents:function(){
      for(let i=1;i<this.HTMLTextTools.children.length;i++){// 0 es el titulo
          this.HTMLTextTools.children[i].addEventListener("click",this.OnTextToolsPressed.bind(this));
      }
    },
    OnTextToolsPressed:function(e){
        let action=e.target.getAttribute("action");
      this.notifyOnTextToolsPressed(action)
    },
    notifyOnBtnPreview:function(){
        this.parentClass.childNotificationOnBtnPreviewClicked();
    },
    notifyOnTextToolsPressed:function(action){
        this.parentClass.childNotificationOnTextOptionClicked(action);
    },
}
var SectionObjectsEntraceEditor={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__objects-entrance-editor__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.lastActiveHTMLItem=null;

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
        let icon=newItem.querySelector(".panel-inspector__objects-entrance-editor__box-items__item__icon img");
        let inputDelay=newItem.querySelector(".box-items__item__input-field__input-element-delay");
        let inputDuration=newItem.querySelector(".box-items__item__input-field__input-element-duration");
        icon.setAttribute("src",animObjWithEntrance.imageDrawingData.url);
        inputDelay.value=animObjWithEntrance.animator.entranceDelay;
        inputDuration.value=animObjWithEntrance.animator.entranceDuration;
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
    /*EVENTOS INTERNOS*/
    onInputDelay:function(e){
        let index=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        //let index=parseInt(e.target.parentNode.parentNode.getAttribute("index"));
        CanvasManager.listAnimableObjectsWithEntrance[index].animator.entranceDelay=parseInt(e.target.value);
    },
    onInputDuration:function(e){
        let index=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        //let index=parseInt(e.target.parentNode.parentNode.getAttribute("index"));
        CanvasManager.listAnimableObjectsWithEntrance[index].animator.entranceDuration=parseInt(e.target.value);
    },
    onHTMLItemClicked:function(e){
        let HTMLElem=e.target;
        while(HTMLElem.className!=="panel-inspector__objects-entrance-editor__box-items__item clearfix"){
            HTMLElem=HTMLElem.parentNode;
        }
        let trueIndex=[].slice.call(this.HTMLElement.children).indexOf(HTMLElem)-1;
        CanvasManager.canvas.setActiveObject(CanvasManager.listAnimableObjectsWithEntrance[trueIndex])
        CanvasManager.canvas.renderAll();
    },
    /*NOTIFICACIONES ENTRANTES*/
    notificationOnObjAddedToListObjectsWithEntrance:function (animObjWithEntrance){

        this.createHTMLItem(animObjWithEntrance)
        this.notificationOnSelectionUpdated();
        //simulando seleccion, ya que se agregara un elemento a la listaObjectswithentrance
        //tambien en el panel de configuracion de objectos, y al cerrarse estara un objeto activo
        //Invocando a esta fucion ahora actualizaremos el elemento html correpondiente
        // a ese elemento fabric, como seleccionado
    },
    notificationOnObjDeletedFromListWithEntrance:function(indexObjsWithEntranceList){
        this.deleteHTMLItemAt(indexObjsWithEntranceList);
    },
    notificationOnSelectionUpdated:function(){
        let animbleActiveObject=CanvasManager.getSelectedAnimableObj();
        if(animbleActiveObject!=null){
            let indexInEntrancedObjectsList=CanvasManager.getListIndexObjectWithEntrance(animbleActiveObject);
            if(indexInEntrancedObjectsList!==-1){
                this.activeBoxObjectsHTMLItem(indexInEntrancedObjectsList);
                return;
            }
        }
        this.clearActivenessHTMLLastItem();
    }
}
var SectionAnimableObjectsEditor={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__animable-objects-editor__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.lastActiveHTMLItem=null;

        this.notificationOnAnimableObjectAdded(CanvasManager.camera); //ya que cuando se creo la camara este aun no se habia suscrito al CanvasManager, por eso lo haremos manualmente
    },
    createItem:function(animObject){
      let newItem=this.HTMLBoxItem.cloneNode(this);
      newItem.style.display="block";
      let label=newItem.querySelector(".panel-inspector__animable-objects-editor__box-items__item__label-group p");
      label.innerHTML=animObject.name!==""?animObject.name:"Object" + CanvasManager.listAnimableObjects.length;
      newItem.addEventListener("click",this.OnItemClicked.bind(this))
      this.HTMLElement.appendChild(newItem);
    },
    deleteItemAt:function(index){
        this.HTMLElement.children[index+1].remove();
    },
    activeBoxObjectsHTMLItem:function(index){
        this.clearActivenessHTMLLastItem();
        let trueIndex=index+1;
        console.log(trueIndex);
        this.HTMLElement.children[trueIndex].id="active-item";
        this.lastActiveHTMLItem=this.HTMLElement.children[trueIndex];
    },
    clearActivenessHTMLLastItem:function(){
        if(this.lastActiveHTMLItem!=null){
            this.lastActiveHTMLItem.id="";
            this.lastActiveHTMLItem=null;
        }
    },
    OnItemClicked:function(e){
        let HTMLElem=e.target;
        while(HTMLElem.className!=="panel-inspector__animable-objects-editor__box-items__item clearfix"){
            HTMLElem=HTMLElem.parentNode;
        }
        let trueIndex=[].slice.call(this.HTMLElement.children).indexOf(HTMLElem)-1;
        CanvasManager.canvas.setActiveObject(CanvasManager.listAnimableObjects[trueIndex]);
        CanvasManager.canvas.renderAll();
    },
    notificationOnAnimableObjectAdded:function(animableObject){
        this.createItem(animableObject);
    },
    notificationOnAnimableObjectDeleted:function(indexInAnimableObjectsList){
        this.deleteItemAt(indexInAnimableObjectsList)
    },
    notificationOnSelectionUpdated:function(){
        let animbleActiveObject=CanvasManager.getSelectedAnimableObj();
        if(animbleActiveObject!=null){
            let activeObjectIndex=CanvasManager.getListIndexAnimableObjects(animbleActiveObject);
            if(activeObjectIndex!==-1){
                this.activeBoxObjectsHTMLItem(activeObjectIndex);
                return;
            }
        }
        this.clearActivenessHTMLLastItem();
    }

}
var PanelInspector={
    name:'PanelInspector',
    events:{
        OnBtnPreviewClicked:'OnBtnPreviewClicked',
        OnTextOptionClicked:'OnTextOptionClicked'
    },
    HTMLElement:null,
    htmlElementNormalHeight:0,

    SectionObjectsEntraceEditor:SectionObjectsEntraceEditor,
    SectionToolBox:SectionToolBox,
    SectionAnimableObjectsEditor:SectionAnimableObjectsEditor,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector");
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;

        this.SectionToolBox.init(this);
        this.SectionObjectsEntraceEditor.init();
        this.SectionAnimableObjectsEditor.init();
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjAddedToListWithEntrance,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjDeletedFromListWidthEntraces,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnAnimableObjectAdded,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnAnimableObjectDeleted,this);
        },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.HTMLElement.style.display="none";
    },
    notificationPanelDesignerOptionsOnSettingActionClicked:function(data){
        this.HTMLElement.style.display="block"
    },
    notificationCanvasManagerOnObjAddedToListWithEntrance:function(args){
        let animObjWithEntrance=args[0];
        this.SectionObjectsEntraceEditor.notificationOnObjAddedToListObjectsWithEntrance(animObjWithEntrance);
    },
    notificationCanvasManagerOnObjDeletedFromListWidthEntraces:function(args){
        let indexObjsWithEntranceList=args[0];
        this.SectionObjectsEntraceEditor.notificationOnObjDeletedFromListWithEntrance(indexObjsWithEntranceList)
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.SectionObjectsEntraceEditor.notificationOnSelectionUpdated();
        this.SectionAnimableObjectsEditor.notificationOnSelectionUpdated();
    },
    notificationCanvasManagerOnAnimableObjectAdded:function(args){
        let animableObject=args[0];
        this.SectionAnimableObjectsEditor.notificationOnAnimableObjectAdded(animableObject);
    },
    notificationCanvasManagerOnAnimableObjectDeleted:function(args){
        let indexInAnimableObjsList=args[0];
        this.SectionAnimableObjectsEditor.notificationOnAnimableObjectDeleted(indexInAnimableObjsList);
    },
    childNotificationOnTextOptionClicked:function(action){
        MainMediator.notify(this.name,this.events.OnTextOptionClicked,[action]);
    },
    childNotificationOnBtnPreviewClicked:function(){
        MainMediator.notify(this.name,this.events.OnBtnPreviewClicked,[]);
    }

}
