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
        let indexInList=[].slice.call(this.HTMLElement.children).indexOf(e.target.parentNode.parentNode)-1;
        if(indexInList>0){
            let indexInCollection=indexInList+1;
            let item=this.HTMLElement.children[indexInCollection];
            let prevItem=this.HTMLElement.children[indexInCollection-1];

            this.HTMLElement.removeChild(item)
            this.HTMLElement.insertBefore(item,prevItem);


            let prevInputs=this.listPropertyInputsByItem[indexInCollection];
            this.listPropertyInputsByItem[indexInCollection]=this.listPropertyInputsByItem[indexInCollection-1];
            this.listPropertyInputsByItem[indexInCollection-1]=prevInputs;

            //ReplaceWith: elimina el elemento que se va a remplazar (target) y extrae el elemento que sera el sustituto de donde se encuentre (lo elimina de su pre posicion) y lo pone en la posicion del target que recordemos ya fue eliminado
        }
        this.parentClass.childNotificationOnBtnMoveUpEntranceOrderPressed(indexInList);
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
        this.notificationCanvasManagerOnSelectionUpdated();
        //simulando seleccion, ya que se agregara un elemento a la listaObjectswithentrance
        //tambien en el panel de configuracion de objectos, y al cerrarse estara un objeto activo
        //Invocando a esta fucion ahora actualizaremos el elemento html correpondiente
        // a ese elemento fabric, como seleccionado
    },
    notificationOnObjDeletedFromListWithEntrance:function(indexObjsWithEntranceList){
        this.deleteHTMLItemAt(indexObjsWithEntranceList);
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
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

        this.HTMLObjectMenu=document.querySelector(".section-animable-object-inspector__object-menu");

        this.objectMenu={
            isActive:false,
            htmlElemt:document.querySelector(".section-animable-object-inspector__object-menu"),
            mapMenuOptionAction:{
                "duplicate":function(){

                },
                "delete":function(){

                },
                "removeMask":function(currentSelectedObject){
                    currentSelectedObject.removeClipping();
                    CanvasManager.canvas.renderAll();
                },
                "addMask":function(){
                    //DEBE QUEDAR VACIO
                }
            },
            mapSubMenusOptions:{
                "addMask":function(target,parent,currentSelectedObject){
                    let index=[].slice.call(parent.children).indexOf(target);
                    let maskingObject=CanvasManager.listShapeAnimableObjects[index];
                    currentSelectedObject.applyClipping(maskingObject);

                    CanvasManager.canvas.renderAll();
                }
            },
            enableOptions:function(listIds){
                for(let i=0;i<this.htmlElemt.children.length;i++){
                    this.htmlElemt.children[i].style.display="none";
                }
                for(let i=0;i<listIds.length;i++){
                    this.htmlElemt.querySelector("#" + listIds[i]).style.display="block";
                    if(listIds[i]===AnimObjectOptionMenu.addMask){
                        this._populateShapeObjectsName();
                    }
                }
            },
            setPosition:function(posx,posy){
                this.htmlElemt.style.left=posx-this.htmlElemt.clientWidth + "px";
                this.htmlElemt.style.top=posy + "px";
            },
            handleMenuOptionClick:function(target){
                let currentSelectedObject=CanvasManager.getSelectedAnimableObj();
                if(!currentSelectedObject){
                    return;
                }

                if(target.className==="object-menu-option"){
                    this.mapMenuOptionAction[target.id](currentSelectedObject);
                }else if(target.className==="object-menu-suboption"){
                    if(typeof(this.mapSubMenusOptions[target.parentNode.parentNode.id])==="function"){
                        this.mapSubMenusOptions[target.parentNode.parentNode.id](target,target.parentNode,currentSelectedObject);
                    }else{ //object

                    }
                }
            },
            _populateShapeObjectsName:function(){
                let addMaskOptionSubmenu=this.htmlElemt.querySelector("#addMask").children[1];
                for(let i=0;i<CanvasManager.listShapeAnimableObjects.length;i++){
                    addMaskOptionSubmenu.children[i].textContent=CanvasManager.listShapeAnimableObjects[i].name;
                }
            },
            createShapeObjectItem:function(animObj){
                let div=document.createElement("div");
                div.className="object-menu-suboption";
                this.htmlElemt.querySelector("#addMask").children[1].appendChild(div);
            },
            deleteShapeObjectItem:function(index){
                let addMaskOptionSubmenu=this.htmlElemt.querySelector("#addMask").children[1];
                addMaskOptionSubmenu.removeChild(addMaskOptionSubmenu.children[index]);
            }
        }

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

        if(e.target.className==="group-box-actions__btn-menu"){
            console.log(CanvasManager.listAnimableObjects[trueIndex].applicableMenuOptions);
            this.objectMenu.enableOptions(CanvasManager.listAnimableObjects[trueIndex].applicableMenuOptions);
            this.showObjectMenu();
        }

        CanvasManager.canvas.renderAll();
    },
    showObjectMenu:function(){
        let self=this;
        this.objectMenu.isActive=false;
        setTimeout(()=>{self.objectMenu.isActive=true},100);
        this.objectMenu.setPosition(WindowManager.mouse.x,WindowManager.mouse.y);
    },
    childNotificationOnItemNewName:function(newName,target){
        let HTMLElem=target;
        while(HTMLElem.className!=="area-scene-objects__listing-objects-all__box-items__item clearfix"){
            HTMLElem=HTMLElem.parentNode;
        }
        let trueIndex=[].slice.call(this.HTMLElement.children).indexOf(HTMLElem)-1;
        CanvasManager.listAnimableObjects[trueIndex].name=newName;
    },
    notificationOnMouseDown:function(e){
        //OBJECT MENU HANDLING
        if(e.target.className==="object-menu-option" || e.target.className==="object-menu-suboption"){
            if(this.objectMenu.isActive){
                //TODO: PERFORM ACTION

                this.objectMenu.handleMenuOptionClick(e.target);

                this.objectMenu.isActive=false;
                this.objectMenu.setPosition(-200,-200);
            }
        }else{
            if(this.objectMenu.isActive){
                this.objectMenu.isActive=false;
                this.objectMenu.setPosition(-200,-200);
            }
        }
    },
    notificationOnAnimableObjectAdded:function(animableObject){
        this.createItem(animableObject);
    },
    notificationOnAnimableObjectDeleted:function(indexInAnimableObjectsList){
        this.deleteItemAt(indexInAnimableObjectsList)
    },
    notificationCanvasManagerOnShapeAnimableAdded:function(animableObject){
        this.objectMenu.createShapeObjectItem(animableObject);
    },
    notificationCanvasManagerOnShapeAnimableDeleted:function(indexInShapeObjectsList){
        this.objectMenu.deleteShapeObjectItem(indexInShapeObjectsList);
    },

    notificationCanvasManagerOnSelectionUpdated:function(){
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

var AreaSceneObjects={
    HTMLElement:null,
    SectionAnimableObjectsEditor:SectionAnimableObjectsEditor,
    SectionObjectsEntraceEditor:SectionObjectsEntraceEditor,
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-inspector__area-scene-objects");
        this.SectionAnimableObjectsEditor.init();
        this.SectionObjectsEntraceEditor.init(this);
    },
    /*----------EVENTOS DE HIJOS*/
    /*SectionObjectsEntraceEditor*/
    childNotificationOnBtnMoveUpEntranceOrderPressed:function(indexInList){
        this.parentClass.childNotificationOnBtnMoveUpEntranceOrderPressed(indexInList);
    },
    childNotificationOnBtnMoveDownEntranceOrderPressed:function(index){
        this.parentClass.childNotificationOnBtnMoveDownEntranceOrderPressed(index);
    },

    /*------------EVENTOS ENTRANTES EXTERNOS*/
    notificationOnObjAddedToListObjectsWithEntrance:function(animObjWithEntrance){
        this.SectionObjectsEntraceEditor.notificationOnObjAddedToListObjectsWithEntrance(animObjWithEntrance)
    },
    notificationOnObjDeletedFromListWithEntrance:function(indexObjsWithEntranceList){
        this.SectionObjectsEntraceEditor.notificationOnObjDeletedFromListWithEntrance(indexObjsWithEntranceList);
    },
    notificationOnAnimableObjectAdded:function(animableObject){
        this.SectionAnimableObjectsEditor.notificationOnAnimableObjectAdded(animableObject);
    },
    notificationOnAnimableObjectDeleted:function(indexInAnimableObjectsList){
        this.SectionAnimableObjectsEditor.notificationOnAnimableObjectDeleted(indexInAnimableObjectsList);
    },
    notificationCanvasManagerOnShapeAnimableAdded:function(animableObject){
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnShapeAnimableAdded(animableObject);
    },
    notificationCanvasManagerOnShapeAnimableDeleted:function(indexInShapeObjectsList){
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnShapeAnimableDeleted(indexInShapeObjectsList);
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.SectionObjectsEntraceEditor.notificationCanvasManagerOnSelectionUpdated();
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnSelectionUpdated();
    },
    notificationOnKeyEnterUp:function(){
        //this.SectionAnimableObjectsEditor.notificationOnKeyEnterUp();
    },
    notificationOnMouseDown:function(e){
        this.SectionAnimableObjectsEditor.notificationOnMouseDown(e);
    }
}
