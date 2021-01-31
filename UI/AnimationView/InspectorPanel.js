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
/*
* As a component of elements that are removable e.g list all objects, list objects with entrance effects
* */
var PropertyInput=function(containerElem){
    this.init=function(containerElem){
        this.cbOnNewValue=function(){};
        this.htmlBtnDicrease=containerElem.children[0];
        this.htmlInput=containerElem.children[1];
        this.htmlBtnIncrease=containerElem.children[2];

        this.value="";

        this.refFuncOnBtnClicked=this.OnBtnClicked.bind(this);
        this.refFuncOnInputFocusOut=this.OnInputFocusOut.bind(this);
        this.refFuncOnInputFocusIn=this.OnInputFocusIn.bind(this);

        this.htmlBtnDicrease.addEventListener("click",this.refFuncOnBtnClicked);
        this.htmlBtnIncrease.addEventListener("click",this.refFuncOnBtnClicked);
        this.htmlInput.addEventListener("focusin",this.refFuncOnInputFocusIn);
        this.htmlInput.addEventListener("focusout",this.refFuncOnInputFocusOut);
        WindowManager.registerOnKeyEnterPressed(this);
    };
    this.OnBtnClicked=function(e){
        if(e.target.className==="btn-decrease"){
            this.setValue(this.value-1);
        }else if(e.target.className==="btn-increase"){
            this.setValue(this.value+1);}
        this.htmlInput.value=this.value+"s";
        this.cbOnNewValue(this._convertValueToMiliSec(this.value),this.htmlInput);
    };
    this.OnInputFocusIn=function(e){
        this.htmlInput.value=this.value;
        this.htmlInput.select();
    };
    this.OnInputFocusOut=function(e){
        this.setValue(e.target.value)
        this.htmlInput.value=this.value + "s";
        this.cbOnNewValue(this._convertValueToMiliSec(this.value),this.htmlInput);
    };
    this.setValue=function(value){
        let tmpValue=parseFloat(value);
        if(!isNaN(tmpValue)){
            if(tmpValue<0){this.value=0}
            else{this.value=tmpValue}
        }
        else if(value===""){this.value=0;}
    }
    this.setValueWithUpdate=function(value){
        this.setValue(value/1000);
        this.htmlInput.value=this.value + "s";
    };
    this.remove=function(){
        this.htmlBtnDicrease.removeEventListener("click",this.refFuncOnBtnClicked);
        this.htmlBtnIncrease.removeEventListener("click",this.refFuncOnBtnClicked);
        this.htmlInput.removeEventListener("focusin",this.refFuncOnInputFocusIn);
        this.htmlInput.removeEventListener("focusout",this.refFuncOnInputFocusOut);
        WindowManager.unregisterOnKeyEnterPressed(this);
    }
    this.notificationOnKeyEnterUp=function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement===this.htmlInput){
            this.htmlInput.blur();
            this.htmlInput.value=this.value + "s";
            this.cbOnNewValue(this._convertValueToMiliSec(this.value),this.htmlInput);
        }
    }
    this._convertValueToMiliSec=function(val){
        return val*1000;
    };
    this.onNewValue=function(callback){
        this.cbOnNewValue=callback;
    };
    this.init(containerElem);
}
var SectionObjectsEntraceEditor={
    HTMLElement:null,
    init:function(){
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

        let propInputDelay=new PropertyInput(newItem.querySelector(".input-field-box.delay .property-input"));
        let propInputDuration=new PropertyInput(newItem.querySelector(".input-field-box.duration .property-input"));
        propInputDelay.setValueWithUpdate(animObjWithEntrance.animator.entranceDelay);
        propInputDuration.setValueWithUpdate(animObjWithEntrance.animator.entranceDuration);
        propInputDelay.onNewValue(this.childNotificationOnDelayNewValue.bind(this));
        propInputDuration.onNewValue(this.childNotificationOnDurationNewValue.bind(this));
        this.listPropertyInputsByItem.push({duration:propInputDuration,delay:propInputDelay});

        newItem.style.display="flex";
        newItem.addEventListener("click",this.onHTMLItemClicked.bind(this))
        this.HTMLElement.appendChild(newItem);
    },
    _getAnimableObjectIcon:function(animObjWithEntrance){
        if(animObjWithEntrance.type==="ImageAnimable"){
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
    childNotificationOnDurationNewValue:function(value,target){
        let index=[].slice.call(this.HTMLElement.children).indexOf(target.parentNode.parentNode.parentNode.parentNode)-1;
        CanvasManager.listAnimableObjectsWithEntrance[index].animator.entranceDuration=value;

    },
    childNotificationOnDelayNewValue:function(value,target){
        let index=[].slice.call(this.HTMLElement.children).indexOf(target.parentNode.parentNode.parentNode.parentNode)-1;
        CanvasManager.listAnimableObjectsWithEntrance[index].animator.entranceDelay=value;

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
    childNotificationOnToolPreviewClicked:function(){
        MainMediator.notify(this.name,this.events.OnBtnPreviewClicked,[]);
    },
    childNotificationOnObjectPropertyWidgetChanged:function(){
        MainMediator.notify(this.name,this.events.OnObjectPropertyWidgedChanged,[]);
    },
}
