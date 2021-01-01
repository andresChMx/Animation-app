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
        this.HTMLElement=document.querySelector(".area-scene-objects__listing-objects-entrance__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.lastActiveHTMLItem=null;

        this.iconTextAnimable=new Image();
        this.iconTextAnimable.src="https://res.cloudinary.com/daqft8zr2/image/upload/v1608394852/icons/tyyt12ejtdymwgj28owt.png"

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
        let icon=newItem.querySelector(".icon img");
        icon.replaceWith(this._getAnimableObjectIcon(animObjWithEntrance));
        let inputDelay=newItem.querySelector(".input-field-box__delay");
        let inputDuration=newItem.querySelector(".input-field-box__duration");
        inputDelay.value=animObjWithEntrance.animator.entranceDelay;
        inputDuration.value=animObjWithEntrance.animator.entranceDuration;
        newItem.style.display="block";
        newItem.setAttribute("index",this.HTMLElement.children.length-1);
        inputDuration.addEventListener("input",this.onInputDuration.bind(this));
        inputDelay.addEventListener("input",this.onInputDelay.bind(this));
        newItem.addEventListener("click",this.onHTMLItemClicked.bind(this))
        this.HTMLElement.appendChild(newItem)
    },
    _getAnimableObjectIcon:function(animObjWithEntrance){
        if(animObjWithEntrance.type==="ImageAnimable"){
            return animObjWithEntrance.imageDrawingData.imgLow.cloneNode();
        }else if(animObjWithEntrance.type==="TextAnimable"){
            return this.iconTextAnimable.cloneNode();
        }
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
        while(HTMLElem.className!=="area-scene-objects__listing-objects-entrance__box-items__item clearfix"){
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
        this.HTMLElement=document.querySelector(".area-scene-objects__listing-objects-all__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.lastActiveHTMLItem=null;

        this.notificationOnAnimableObjectAdded(CanvasManager.camera); //ya que cuando se creo la camara este aun no se habia suscrito al CanvasManager, por eso lo haremos manualmente
    },
    createItem:function(animObject){
      let newItem=this.HTMLBoxItem.cloneNode(this);
      newItem.style.display="block";
      let label=newItem.querySelector(".group-object-name__text-name");
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
        while(HTMLElem.className!=="area-scene-objects__listing-objects-all__box-items__item clearfix"){
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
var AreaSceneObjects={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__area-scene-objects");
    }
}
/*El manejo de el envio de la informacion de los inputs, al hacer enter, lo hace el Objecto mayor (AreaObjectPropperties), en caso de focusout lo hace cada widged en widgetsObjectProperties*/
var AreaObjectProperties={
    HTMLElement:null,
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.currentSelectedAnimableObjects=null;
        this.HTMLElement=document.querySelector(".panel-inspector__area-object-properties")
        let me=this;
        this.widgetsObjectProperties={
            left:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-left .property-input"),
                val:0,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[2].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[1].addEventListener("focusout",this.OnFieldInput.bind(this));
                },
                OnButtonClicked:function(e){
                    if(e.target.className==="btn-decrease"){this.val-=5.0;
                    }else if(e.target.className==="btn-increase"){this.val+=5.0;}
                    this.setVal(this.val);
                    me.OnWidgetChanged(this.val,"left");
                },
                OnFieldInput:function(e){
                    if(e.target.value===""){e.target.value=0;}
                    else if(isNaN(e.target.value)){e.target.value=this.val;return;}
                    this.setVal(e.target.value);
                    me.OnWidgetChanged(this.val,"left");
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.val=val;this.htmlElem.children[1].value=val;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");}, enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            top:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-top .property-input"),
                val:0,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[2].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[1].addEventListener("focusout",this.OnFieldInput.bind(this));
                },
                OnButtonClicked:function(e){
                    if(e.target.className==="btn-decrease"){this.val-=5.0;
                    }else if(e.target.className==="btn-increase"){this.val+=5.0;}
                    this.setVal(this.val);
                    me.OnWidgetChanged(this.val,"top");
                },
                OnFieldInput:function(e){
                    if(e.target.value===""){e.target.value=0;}
                    else if(isNaN(e.target.value)){e.target.value=this.val;return;}
                    this.setVal(e.target.value);
                    me.OnWidgetChanged(this.val,"top");
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.val=val;this.htmlElem.children[1].value=val;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");}, enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            scaleX:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-scaleX .property-input"),
                val:0,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[2].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[1].addEventListener("focusout",this.OnFieldInput.bind(this));
                },
                OnButtonClicked:function(e){
                    if(e.target.className==="btn-decrease"){this.val-=0.1;
                    }else if(e.target.className==="btn-increase"){this.val+=0.1;}
                    this.setVal(this.val);
                    me.OnWidgetChanged(this.val,"scaleX");
                },
                OnFieldInput:function(e){
                    if(e.target.value===""){e.target.value=0;}
                    else if(isNaN(e.target.value)){e.target.value=this.val;return;}
                    this.setVal(e.target.value);
                    me.OnWidgetChanged(this.val,"scaleX");
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.val=val; this.htmlElem.children[1].value=val;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");}, enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            scaleY:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-scaleY .property-input"),
                val:0,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[2].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[1].addEventListener("focusout",this.OnFieldInput.bind(this));
                },
                OnButtonClicked:function(e){
                    if(e.target.className==="btn-decrease"){this.val-=0.1;}
                    else if(e.target.className==="btn-increase"){this.val+=0.1;}
                    this.setVal(this.val);
                    me.OnWidgetChanged(this.val,"scaleY");
                },
                OnFieldInput:function(e){
                    if(e.target.value===""){e.target.value=0;}
                    else if(isNaN(e.target.value)){e.target.value=this.val;return;}
                    this.setVal(e.target.value);
                    me.OnWidgetChanged(this.val,"scaleY");
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.val=val;this.htmlElem.children[1].value=val;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");}, enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            angle:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-angle .property-input"),
                val:0,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[2].addEventListener("click",this.OnButtonClicked.bind(this));
                    this.htmlElem.children[1].addEventListener("focusout",this.OnFieldInput.bind(this));
                },
                OnButtonClicked:function(e){
                    if(e.target.className==="btn-decrease"){this.val-=5.0;
                    }else if(e.target.className==="btn-increase"){this.val+=5.0;}
                    this.setVal(this.val)
                    me.OnWidgetChanged(this.val,"angle");
                },
                OnFieldInput:function(e){
                    if(e.target.value===""){e.target.value=0;}
                    else if(isNaN(e.target.value)){e.target.value=this.val;return;}
                    this.setVal(e.target.value);
                    me.OnWidgetChanged(this.val,"angle");
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.val=parseFloat(val);this.htmlElem.children[1].value=this.val;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");}, enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            opacity:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-opacity .property-input"),
                val:0,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("change",this.OnRangeChanged.bind(this));
                    this.htmlElem.children[1].addEventListener("focusout",this.OnFieldInput.bind(this));
                },
                OnRangeChanged:function(e){
                    this.setVal(parseInt(e.target.value)/100.0);
                    me.OnWidgetChanged(this.val/100.0,"opacity");
                },
                OnFieldInput:function(e){
                    if(e.target.value===""){e.target.value=0;}
                    else if(isNaN(e.target.value)){e.target.value=this.val;return;}
                    this.setVal(parseInt(e.target.value)/100.0);
                    me.OnWidgetChanged(this.val/100.0,"opacity");
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.val=parseFloat(val)*100.0;this.htmlElem.children[0].value=this.val;this.htmlElem.children[1].value=this.val;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");}, enable:function(){this.htmlElem.parentElement.classList.remove("disable");}
            }
        }
        this.initEvents();
    },
    initEvents:function(){
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjModified,this);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this);
        for(let i in this.widgetsObjectProperties){
            this.widgetsObjectProperties[i].initEvents();
        }
        WindowManager.registerOnKeyEnterPressed(this);
    },
    OnWidgetChanged:function(val,property){
        console.log("ON WIDGED CHANEEd");
        if(this.currentSelectedAnimableObjects!==null){
            let tmpDict={};tmpDict[property]=val;
            for(let i in this.currentSelectedAnimableObjects){
                this.currentSelectedAnimableObjects[i].setBatch(tmpDict);
                this.currentSelectedAnimableObjects[i].setCoords();
            }
            CanvasManager.canvas.renderAll();
            this.parentClass.childNotificationOnObjectPropertyWidgetChanged();
        }
    },
    populateWidgetsWithObjectProperties:function(){

        for(let key in this.widgetsObjectProperties){
            this.widgetsObjectProperties[key].setVal(this.currentSelectedAnimableObjects[0].getCustom(key));
        }
    },
    disableWidgets:function(){
        for(let key in this.widgetsObjectProperties){
            this.widgetsObjectProperties[key].disable();
        }
    },
    enableWidgets:function(){
        for(let key in this.widgetsObjectProperties){
            this.widgetsObjectProperties[key].enable();
        }
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        if(this.currentSelectedAnimableObjects){this.notificationOnKeyEnterUp();} // HACK FOR WHEN THE SELECITION IS UPDATED WHITE ONE FIELD IS BEEN EDITED
        let currentAnimableObject=CanvasManager.getSelectedAnimableObj();
        console.log(currentAnimableObject);
        if(currentAnimableObject!==undefined){
            if(currentAnimableObject.type==="activeSelection"){
                this.currentSelectedAnimableObjects=currentAnimableObject.getObjects();
            }else{
                this.currentSelectedAnimableObjects=[currentAnimableObject];
            }
            this.enableWidgets();
            this.populateWidgetsWithObjectProperties();
        }else{
            this.disableWidgets();
        }
    },
    notificationCanvasManagerOnObjModified:function(){
        this.populateWidgetsWithObjectProperties();
    },
    notificationPanelActionEditorOnMarkerDragEnded:function(){
        if(this.currentSelectedAnimableObjects!==null && this.currentSelectedAnimableObjects!==undefined){
            this.populateWidgetsWithObjectProperties();
        }
    },
    notificationOnKeyEnterUp:function(){
        let documentActiveElement=document.activeElement;
        for(let i in this.widgetsObjectProperties){
            if(documentActiveElement===this.widgetsObjectProperties[i].getInputFieldElem()){
                documentActiveElement.blur();
                this.widgetsObjectProperties[i].OnFieldInput({target:documentActiveElement})
            }
        }
    },
}

var PanelInspector={
    name:'PanelInspector',
    events:{
        OnBtnPreviewClicked:'OnBtnPreviewClicked',
        OnTextOptionClicked:'OnTextOptionClicked',
        OnObjectPropertyWidgedChanged:'OnObjectPropertyWidgedChanged'
    },
    HTMLElement:null,
    htmlElementNormalHeight:0,

    SectionToolBox:SectionToolBox,
    SectionMenuAreas:SectionMenuAreas,

    AreaSceneObjects:AreaSceneObjects,
    SectionObjectsEntraceEditor:SectionObjectsEntraceEditor,
    SectionAnimableObjectsEditor:SectionAnimableObjectsEditor,

    AreaObjectProperties:AreaObjectProperties,

    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector");
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;


        this.SectionToolBox.init(this);
        this.SectionMenuAreas.init(this);
        this.SectionObjectsEntraceEditor.init();
        this.SectionAnimableObjectsEditor.init();

        this.AreaObjectProperties.init(this);

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
    },
    childNotificationOnObjectPropertyWidgetChanged:function(){
        MainMediator.notify(this.name,this.events.OnObjectPropertyWidgedChanged,[]);
    },
}
