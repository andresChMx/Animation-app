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
    // notifyOnTextToolsPressed:function(action){
    //     this.parentClass.childNotificationOnTextOptionClicked(action);
    // },
}
var BoxText=function(parentNode){
    this.init=function(parentNode){
        this.cbOnNewValue=function(){};
        this.htmlInput=null;
        this.htmlLabel=null;
        this.htmlContainer=null;
        this.clickCount=0;
        this.text="Name";

        this.refFuncOnInputFocusOut=this.OnInputFocusOut.bind(this)
        this.refFuncOnLabelClicked=this.OnLabelClicked.bind(this);
        this.refFuncOnInputInput=this.OnInputInput.bind(this);

        WindowManager.registerOnKeyEnterPressed(this);
        this.initHTML(parentNode);
    };
    this.initHTML=function(parentNode){
        this.htmlContainer=document.createElement("div");
        this.htmlContainer.className="box-text";

        this.htmlInput=document.createElement("input");
        this.htmlInput.setAttribute("type","text");
        this.htmlInput.addEventListener("focusout",this.refFuncOnInputFocusOut);
        this.htmlInput.addEventListener("input",this.refFuncOnInputInput)
        this.htmlInput.style.display="none";

        this.htmlLabel=document.createElement("p");
        this.htmlLabel.addEventListener("click",this.refFuncOnLabelClicked);
        this.htmlContainer.appendChild(this.htmlLabel);
        this.htmlContainer.appendChild(this.htmlInput);
        parentNode.appendChild(this.htmlContainer);
    };
    this.OnLabelClicked=function(){
        if(this.clickCount===0){
            this.clickCount++;
            setTimeout(function(){this.clickCount=0;}.bind(this),300);
        }else if(this.clickCount===1){
            this.activateEditMode();
        }
    };
    this.OnInputFocusOut=function(){
        this.deactivateEditMode();
    };
    this.OnInputInput=function(e){
        if(e.target.value.length>23){
            this.text=e.target.value.slice(0,23);
            e.target.value=this.text;
        }else{
            this.text=e.target.value;
        }

    }
    this.activateEditMode=function(){
        this.htmlInput.value=this.text;
        this.htmlLabel.style.display="none";
        this.htmlInput.style.display="block";
        this.htmlInput.select();
    };
    this.deactivateEditMode=function(){
        this.htmlInput.blur();
        this.htmlLabel.textContent=this.text;

        this.htmlInput.style.display="none";
        this.htmlLabel.style.display="block";
        this.cbOnNewValue(this.text,this.htmlInput);
    };

    this.notificationOnKeyEnterUp=function(){
        let documentActiveElement=document.activeElement;
            if(documentActiveElement===this.htmlInput){
                this.deactivateEditMode();
            }
    };
    this.setText=function(text){
        this.text=text;
        this.htmlLabel.textContent=text;
    };
    this.remove=function(){
        this.htmlLabel.removeEventListener("click",this.refFuncOnLabelClicked);
        this.htmlInput.removeEventListener("focusout",this.refFuncOnInputFocusOut);
        this.htmlInput.removeEventListener("input",this.refFuncOnInputInput);
        this.htmlContainer.remove();
        WindowManager.unregisterOnKeyEnterPressed(this);
    };
    this.onNewValue=function(callback){
        this.cbOnNewValue=callback;
    };
    this.init(parentNode);
}

var SectionObjectsEntraceEditor={
    HTMLElement:null,
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".area-scene-objects__listing-objects-entrance__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.lastActiveHTMLItems=[];
        this.listPropertyInputsByItem=[{}]; //it contains a first dummy element, because in the items collection there is a first dummy element as well that serves to clone
        this.iconTextAnimable=new Image();
        this.iconTextAnimable.src="https://res.cloudinary.com/daqft8zr2/image/upload/v1608394852/icons/tyyt12ejtdymwgj28owt.png"

    },

    activeBoxObjectsHTMLItem:function(index){
        let trueIndex=index+1;
        this.HTMLElement.children[trueIndex].id="active-item";
        this.lastActiveHTMLItems.push(this.HTMLElement.children[trueIndex]);
    },
    clearActivenessHTMLLastItem:function (){
        for(let i in this.lastActiveHTMLItems){
            this.lastActiveHTMLItems[i].id="";
        }
        this.lastActiveHTMLItems=[];
    },
    createHTMLItem:function(animObjWithEntrance){
        let newItem=this.HTMLBoxItem.cloneNode(true);
        let icon=newItem.querySelector(".icon img");
        icon.replaceWith(this._getAnimableObjectIcon(animObjWithEntrance));

        let moveUp=newItem.querySelector(".btn-move-up");
        let moveDown=newItem.querySelector(".btn-move-down");
        moveUp.addEventListener("click",this.OnBtnMoveUpPressed.bind(this));
        moveDown.addEventListener("click",this.OnBtnMoveDownPressed.bind(this));

        let propInputDelay=new TimeButtonedField(newItem.querySelector(".input-field-box.delay .property-input"), "s",0,600, 0.5);
        let propInputDuration=new TimeButtonedField(newItem.querySelector(".input-field-box.duration .property-input"), "s",0,600, 0.5);
        propInputDelay.setValue(animObjWithEntrance.animator.entranceTimes.delay);
        propInputDuration.setValue(animObjWithEntrance.animator.entranceTimes.duration);
        propInputDelay.addListenerOnNewValue(this.childNotificationOnDelayNewValue.bind(this));
        propInputDuration.addListenerOnNewValue(this.childNotificationOnDurationNewValue.bind(this));
        this.listPropertyInputsByItem.push({duration:propInputDuration,delay:propInputDelay});

        newItem.style.display="flex";
        newItem.addEventListener("click",this.onHTMLItemClicked.bind(this))
        this.HTMLElement.appendChild(newItem);
    },
    _getAnimableObjectIcon:function(animObjWithEntrance){
        if(animObjWithEntrance.type==="ImageAnimable" || animObjWithEntrance.type==="SVGAnimable"){
            return animObjWithEntrance.imageDrawingData.imgLow.cloneNode();
        }else if(animObjWithEntrance.type==="TextAnimable"){
            return this.iconTextAnimable.cloneNode();
        }
    },
    deleteHTMLItemAt:function(index){
        this.listPropertyInputsByItem[index+1].duration.remove();
        this.listPropertyInputsByItem[index+1].delay.remove();
        this.listPropertyInputsByItem.splice(index+1,1);

        this.HTMLElement.children[index+1].remove();// index-1 porque siempre hay un item oculto en el box items
    },
    /*EVENTOS INTERNOS*/
    OnBtnMoveUpPressed:function(e){
        let index=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        if((index)>0){
            let indexInCollection=index+1;
            let item=this.HTMLElement.children[indexInCollection];
            let prevItem=this.HTMLElement.children[indexInCollection-1];

            this.HTMLElement.removeChild(item)
            this.HTMLElement.insertBefore(item,prevItem);


            let prevInputs=this.listPropertyInputsByItem[indexInCollection];
            this.listPropertyInputsByItem[indexInCollection]=this.listPropertyInputsByItem[indexInCollection-1];
            this.listPropertyInputsByItem[indexInCollection-1]=prevInputs;

            //ReplaceWith: elimina el elemento que se va a remplazar (target) y extrae el elemento que sera el sustituto de donde se encuentre (lo elimina de su pre posicion) y lo pone en la posicion del target que recordemos ya fue eliminado
        }
        this.parentClass.childNotificationOnBtnMoveUpEntranceOrderPressed(index);
    },
    OnBtnMoveDownPressed:function(e){
        let index=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        if((index)<this.HTMLElement.children.length-2){
            let indexInCollection=index+1;
            let item=this.HTMLElement.children[indexInCollection];
            let nextItem=this.HTMLElement.children[indexInCollection+1];

            this.HTMLElement.removeChild(nextItem)
            this.HTMLElement.insertBefore(nextItem,item);

            let prevInputs=this.listPropertyInputsByItem[indexInCollection];
            this.listPropertyInputsByItem[indexInCollection]=this.listPropertyInputsByItem[indexInCollection+1];
            this.listPropertyInputsByItem[indexInCollection+1]=prevInputs;
        }
        this.parentClass.childNotificationOnBtnMoveDownEntranceOrderPressed(index);
    },
    childNotificationOnDurationNewValue:function(value,target){
        let index=[].slice.call(this.HTMLElement.children).indexOf(target.parentNode.parentNode.parentNode.parentNode)-1;
        CanvasManager.listAnimableObjectsWithEntrance[index].animator.entranceTimes.duration=value;

    },
    childNotificationOnDelayNewValue:function(value,target){
        let index=[].slice.call(this.HTMLElement.children).indexOf(target.parentNode.parentNode.parentNode.parentNode)-1;
        CanvasManager.listAnimableObjectsWithEntrance[index].animator.entranceTimes.delay=value;

    },
    onHTMLItemClicked:function(e){
        console.log("CLICKEADKLFJASDJFAKDSJFLK");
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
        this.clearActivenessHTMLLastItem();
        let animbleActiveObject=CanvasManager.getSelectedAnimableObj();
        let listObjects;
        if(animbleActiveObject!=null){
            if(animbleActiveObject.type==="activeSelection"){listObjects=animbleActiveObject.getObjects();}
            else{listObjects=[animbleActiveObject]}

            for(let i in listObjects){
                let indexInEntrancedObjectsList=CanvasManager.getListIndexObjectWithEntrance(listObjects[i]);
                if(indexInEntrancedObjectsList!==-1){
                    this.activeBoxObjectsHTMLItem(indexInEntrancedObjectsList);
                }
            }
        }
    }
}
var SectionAnimableObjectsEditor={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".area-scene-objects__listing-objects-all__box-items");
        this.HTMLBoxItem=this.HTMLElement.children[0].cloneNode(true);

        this.listBoxTexts=[{name:"dummy element(read comment)"}]; //will have the same length as items

        this.lastActiveHTMLItems=[]; //performance matters, when selection updated, whe know that elements are stylized, so we know what to clean

        this.notificationOnAnimableObjectAdded(CanvasManager.camera); //ya que cuando se creo la camara este aun no se habia suscrito al CanvasManager, por eso lo haremos manualmente
    },
    createItem:function(animObject){
      let newItem=this.HTMLBoxItem.cloneNode(this);
      newItem.style.display="flex";
      let containerLabel=newItem.querySelector(".group-object-name");
      this.HTMLElement.appendChild(newItem);
      newItem.addEventListener("click",this.OnItemClicked.bind(this));

      //Boxtext initialization
      let boxText=new BoxText(containerLabel);
      boxText.setText(animObject.name);
      this.listBoxTexts.push(boxText);
      //Boxtext events initialization
      boxText.onNewValue(this.childNotificationOnItemNewName.bind(this))
    },
    deleteItemAt:function(index){
        this.listBoxTexts[index+1].remove();
        this.listBoxTexts.splice(index+1,1);

        this.HTMLElement.children[index+1].remove();
    },
    activeBoxObjectsHTMLItem:function(index){
        let trueIndex=index+1;
        this.HTMLElement.children[trueIndex].id="active-item";
        this.lastActiveHTMLItems.push(this.HTMLElement.children[trueIndex]);
    },
    clearActivenessHTMLLastItem:function(){
        for(let i in this.lastActiveHTMLItems){
            this.lastActiveHTMLItems[i].id="";
        }
        this.lastActiveHTMLItems=[];
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
    childNotificationOnItemNewName:function(newName,target){
        let HTMLElem=target;
        while(HTMLElem.className!=="area-scene-objects__listing-objects-all__box-items__item clearfix"){
            HTMLElem=HTMLElem.parentNode;
        }
        let trueIndex=[].slice.call(this.HTMLElement.children).indexOf(HTMLElem)-1;
        CanvasManager.listAnimableObjects[trueIndex].name=newName;
    },
    notificationOnAnimableObjectAdded:function(animableObject){
        this.createItem(animableObject);
    },
    notificationOnAnimableObjectDeleted:function(indexInAnimableObjectsList){
        this.deleteItemAt(indexInAnimableObjectsList)
    },
    notificationOnSelectionUpdated:function(){
        this.clearActivenessHTMLLastItem();
        let animbleActiveObject=CanvasManager.getSelectedAnimableObj();
        let listObjects=null;
        if(animbleActiveObject!=null){
            if(animbleActiveObject.type==="activeSelection"){listObjects=animbleActiveObject.getObjects();
            }else{listObjects=[animbleActiveObject]}

            for(let i=0;i<listObjects.length;i++){
                let activeObjectIndex=CanvasManager.getListIndexAnimableObjects(listObjects[i]);
                if(activeObjectIndex!==-1){
                    this.activeBoxObjectsHTMLItem(activeObjectIndex);
                }
            }
        }
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
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,5);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"left");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            top:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-top .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,5);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"top");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            scaleX:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-scaleX .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,0.1);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"scaleX");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}
            },
            scaleY:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-scaleY .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,0.1);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"scaleY");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            angle:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-angle .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,5);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"angle");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            opacity:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-opacity .property-input"),
                field:null,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("change",this.OnRangeChanged.bind(this));
                    this.field=new NumericField(this.htmlElem.children[1],"",0,100)
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this))
                },
                OnFieldNewValue:function(value,e){
                    me.OnWidgetChanged(value/100.0,"opacity");
                    this.htmlElem.children[0].value=value;
                },
                OnRangeChanged:function(e){
                    this.field.setValue(e.target.value);
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.field.setValue(val*100,false);this.htmlElem.children[0].value=val*100;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}
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
        OnObjectPropertyWidgedChanged:'OnObjectPropertyWidgedChanged',

        OnBtnMoveUpObjectEntranceOrder:'OnBtnMoveUpObjectEntranceOrder',
        OnBtnMoveDownObjectEntranceOrder:'OnBtnMoveDownObjectEntranceOrder',

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
        this.SectionObjectsEntraceEditor.init(this);
        this.SectionAnimableObjectsEditor.init();

        this.AreaObjectProperties.init(this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjAddedToListWithEntrance,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjDeletedFromListWidthEntraces,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnAnimableObjectAdded,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnAnimableObjectDeleted,this);
        },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.HTMLElement.style.display="none";
    },
    notificationPanelDesignerOptionsOnActionClicked:function(data){
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
    childNotificationOnBtnMoveUpEntranceOrderPressed:function(index){
        MainMediator.notify(this.name,this.events.OnBtnMoveUpObjectEntranceOrder,[index]);
    },
    childNotificationOnBtnMoveDownEntranceOrderPressed:function(index){
        MainMediator.notify(this.name,this.events.OnBtnMoveDownObjectEntranceOrder,[index]);
    },
    childNotificationOnTextOptionClicked:function(action){
        MainMediator.notify(this.name,this.events.OnTextOptionClicked,[action]);
    },
    childNotificationOnToolPreviewClicked:function(){
        MainMediator.notify(this.name,this.events.OnBtnPreviewClicked,[]);
    },
    childNotificationOnObjectPropertyWidgetChanged:function(){
        MainMediator.notify(this.name,this.events.OnObjectPropertyWidgedChanged,[]);
    },
}
