var SectionObjectsEntraceEditor={
    HTMLElement:null,
    parentClass:null,
    listObjects:ko.observableArray([]),
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".area-scene-objects__listing-objects-entrance__box-items");
        this.lastActiveHTMLItems=[];

    },

    activeBoxObjectsHTMLItem:function(index){
        this.listObjects()[index].select();
        this.lastActiveHTMLItems.push(this.listObjects()[index]);
    },
    clearActivenessHTMLLastItem:function (){
        for(let i in this.lastActiveHTMLItems){
            this.lastActiveHTMLItems[i].deselect();
        }
        this.lastActiveHTMLItems=[];
    },
    createHTMLItem:function(animObjWithEntrance){
        // se usa al objecto animObjWithEntrance como un transportador de datos
        this.listObjects.push(new WithEntranceItem(animObjWithEntrance,this));
    },
    deleteHTMLItemAt:function(index){
        this.listObjects()[index].remove();
        this.listObjects.splice(index,1);
    },
    /*EVENTOS INTERNOS*/
    childOnBtnMoveUpPressed:function(objectItem){
        let index=this.listObjects.indexOf(objectItem);
        if(index>0){
            let array=this.listObjects();
            this.listObjects.splice(index-1, 2, array[index], array[index-1]);
        }
        this.parentClass.childNotificationOnBtnMoveUpEntranceOrderPressed(index);
    },
    childOnBtnMoveDownPressed:function(objectItem){
        let index=this.listObjects.indexOf(objectItem);
        if((index)<this.listObjects().length-1){
            let array=this.listObjects();
            this.listObjects.splice(index,2,array[index+1],array[index]);
        }
        this.parentClass.childNotificationOnBtnMoveDownEntranceOrderPressed(index);
    },
    childOnHTMLItemClicked:function(objectItem){
        let index=this.listObjects.indexOf(objectItem);
        let objectInstance=ScenesManager.getCollection(global.EnumCollectionsNames.animObjsWithEntrance)[index];
        CanvasManager.canvas.setActiveObject(objectInstance)
        CanvasManager.canvas.renderAll();
    },
    childNotificationOnDurationNewValue:function(value,objectItem){
        let index=this.listObjects.indexOf(objectItem);
        ScenesManager.getCollection(global.EnumCollectionsNames.animObjsWithEntrance)[index].animator.entranceTimes.duration=value;

    },
    childNotificationOnDelayNewValue:function(value,objectItem){
        let index=this.listObjects.indexOf(objectItem);
        ScenesManager.getCollection(global.EnumCollectionsNames.animObjsWithEntrance)[index].animator.entranceTimes.delay=value;
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

                let indexInEntrancedObjectsList=ScenesManager.getObjectIndexInCollection(global.EnumCollectionsNames.animObjsWithEntrance,listObjects[i]);;
                if(indexInEntrancedObjectsList!==-1){
                    this.activeBoxObjectsHTMLItem(indexInEntrancedObjectsList);
                }
            }
        }
    }
}
var WithEntranceItem=function(animableObject,parentClass){
    this.HTMLElement=null;
    this.model=null;
    this.parentClass=null;
    this.constructor=function(){
        this.model=animableObject;
        this.parentClass=parentClass;
        this.propInputDelay=null;
        this.propInputDuration=null;
    }
    this.koBindingSetupHTML=function(HTMLContainer){
        this.HTMLElement=HTMLContainer;

        let icon=this.HTMLElement.querySelector(".icon img");
        icon.replaceWith(this.model.thumbnailImage.cloneNode());
        this.model.listenOnThumbnailStateChanged(function(state,img){
            this.HTMLElement.querySelector(".icon img").replaceWith(img);
        }.bind(this))
        let moveUp=this.HTMLElement.querySelector(".btn-move-up");
        let moveDown=this.HTMLElement.querySelector(".btn-move-down");
        moveUp.addEventListener("click",this.OnBtnMoveUpPressed.bind(this));
        moveDown.addEventListener("click",this.OnBtnMoveDownPressed.bind(this));

        this.propInputDelay=new TimeButtonedField(this.HTMLElement.querySelector(".input-field-box.delay .property-input"), "s",0,600, 0.5);
        this.propInputDuration=new TimeButtonedField(this.HTMLElement.querySelector(".input-field-box.duration .property-input"), "s",0,600, 0.5);
        this.propInputDelay.setValue(this.model.animator.entranceTimes.delay);
        this.propInputDuration.setValue(this.model.animator.entranceTimes.duration);
        this.propInputDelay.addListenerOnNewValue(this.childNotificationOnDelayNewValue.bind(this));
        this.propInputDuration.addListenerOnNewValue(this.childNotificationOnDurationNewValue.bind(this));
        // this.listPropertyInputsByItem.push({duration:propInputDuration,delay:propInputDelay});

        this.HTMLElement.addEventListener("click",this.OnHTMLItemClicked.bind(this))
    }
    this.select=function(){
        this.HTMLElement.id="active-item";
    };
    this.deselect=function(){
        this.HTMLElement.id="";
    };
    this.remove=function(){
        this.propInputDuration.remove();
        this.propInputDelay.remove();
    };
    this.OnHTMLItemClicked=function(e){
        this.parentClass.childOnHTMLItemClicked(this);
    };
    this.OnBtnMoveUpPressed=function(e){
        this.parentClass.childOnBtnMoveUpPressed(this);
    };
    this.OnBtnMoveDownPressed=function(e){
        this.parentClass.childOnBtnMoveDownPressed(this);
    };
    this.childNotificationOnDelayNewValue=function(value,e){
        this.parentClass.childNotificationOnDelayNewValue(value,this);
    };
    this.childNotificationOnDurationNewValue=function(value,e){
        this.parentClass.childNotificationOnDurationNewValue(value,this);
    };
    this.constructor();
}
var SectionAnimableObjectsEditor={
    HTMLElement:null,
    listObjects:ko.observableArray([]),
    init:function(){
        this.HTMLElement=document.querySelector(".area-scene-objects__listing-objects-all__box-items");

        this.HTMLObjectMenu=document.querySelector(".section-animable-object-inspector__object-menu");

        this.objectMenu={
            isActive:false,
            htmlElemt:document.querySelector(".section-animable-object-inspector__object-menu"),
            mapMenuOptionAction:{
                "duplicate":function(currentSelectedObject){
                    currentSelectedObject.clone(function (cloned){
                        cloned.set({
                            left:cloned.left+10,
                            top:cloned.top+10,
                        })
                        ScenesManager.sceneList.addInstanceToAllCollections(cloned)
                    });
                },
                "delete":function(){
                    ScenesManager.removeActiveAnimableObject();
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

                    let maskingObject=ScenesManager.getCollection(global.EnumCollectionsNames.animObjsClippers)[index];
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
                    if(listIds[i]===global.AnimObjectOptionMenu.addMask){
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

                let listAnimObjsClippers=ScenesManager.getCollection(global.EnumCollectionsNames.animObjsClippers);
                for(let i=0;i<listAnimObjsClippers.length;i++){
                    addMaskOptionSubmenu.children[i].textContent=listAnimObjsClippers[i].name;
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
        this.lastActiveHTMLItems=[]; //performance matters, when selection updated, whe know that elements are stylized, so we know what to clean
        // this.notificationOnAnimableObjectAdded(CanvasManager.camera); //ya que cuando se creo la camara este aun no se habia suscrito al CanvasManager, por eso lo haremos manualmente
    },
    createItem:function(animObject){
        this.listObjects.push(new ObjectItem(animObject,this));
    },
    deleteItemAt:function(index){
        this.listObjects()[index].remove();
        this.listObjects.splice(index,1);
    },
    activeBoxObjectsHTMLItem:function(index){
        this.listObjects()[index].select();
        this.lastActiveHTMLItems.push(this.listObjects()[index]);
    },
    clearActivenessHTMLLastItem:function(){
        for(let i in this.lastActiveHTMLItems){
            this.lastActiveHTMLItems[i].deselect();
        }
        this.lastActiveHTMLItems=[];
    },
    showObjectMenu:function(){
        let self=this;
        this.objectMenu.isActive=false;
        setTimeout(()=>{self.objectMenu.isActive=true},100);
        this.objectMenu.setPosition(WindowManager.mouse.x,WindowManager.mouse.y);
    },
    moveItemUp:function(index){
        if(index>0){
            let array=this.listObjects();
            this.listObjects.splice(index-1, 2, array[index], array[index-1]);
        }
    },
    moveItemDown:function(index){

        if((index)<this.listObjects().length-1){
            let array=this.listObjects();
            this.listObjects.splice(index,2,array[index+1],array[index]);
        }
    },
    childOnItemClicked:function(item){
        let index=this.listObjects.indexOf(item);
        CanvasManager.canvas.setActiveObject(ScenesManager.getCollection(global.EnumCollectionsNames.animObjs)[index]);
        CanvasManager.canvas.renderAll();
    },
    childNotificationOnBtnObjectMenu:function(){
        this.objectMenu.enableOptions(CanvasManager.getSelectedAnimableObj().applicableMenuOptions);
        this.showObjectMenu();
    },
    childNotificationOnLockButton:function(checked){
        CanvasManager.getSelectedAnimableObj().setLockState(checked);
        if(checked){
            CanvasManager.canvas.discardActiveObject();
        }
        CanvasManager.canvas.renderAll();
    },
    childNotificationOnVisibleButton:function(checked){
        CanvasManager.getSelectedAnimableObj().setVisibilityState(checked);
        if(!checked){
            CanvasManager.canvas.discardActiveObject();
        }
        CanvasManager.canvas.renderAll();
    },
    childNotificationOnItemNewName:function(newName,item){
        let index=this.listObjects.indexOf(item);
        ScenesManager.getCollection(global.EnumCollectionsNames.animObjs)[index].name=newName;
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
    notificationCanvasManagerOnObjectMovedForward:function(index){
        this.moveItemDown(index);
    },
    notificationCanvasManagerOnObjectMovedBackward:function(index){
        this.moveItemUp(index);
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
                let activeObjectIndex=ScenesManager.getObjectIndexInCollection(global.EnumCollectionsNames.animObjs,listObjects[i]);

                if(activeObjectIndex!==-1){
                    this.activeBoxObjectsHTMLItem(activeObjectIndex);
                }
            }
        }
    }
}
let ObjectItem=function(animableObject,parentClass){
    this.HTMLElement=null;
    this.model=null;
    this.parentClass=null;
    this.constructor=function(){
        this.model=animableObject;
        this.parentClass=parentClass;
        this.boxInput=null;
    }
    this.koBindingSetupHTML=function(HTMLContainer){
        this.HTMLElement=HTMLContainer;

        this.HTMLElement.querySelector(".group-box-actions__lock-object").checked=this.model.getLockState();
        this.HTMLElement.querySelector(".group-box-actions__visible-object").checked=this.model.getVisibilityState();
        this.HTMLElement.addEventListener("click",this.OnClick.bind(this));

        let containerLabel=this.HTMLElement.querySelector(".group-object-name");
        //Boxtext initialization
        this.boxInput=new BoxText(containerLabel);
        this.boxInput.setText(this.model.name);

        //Boxtext events initialization
        this.boxInput.onNewValue(this.childNotificationOnItemNewName.bind(this))
    }
    this.select=function(){
        this.HTMLElement.id="active-item";
    };
    this.deselect=function(){
        this.HTMLElement.id="";
    };
    this.remove=function(){
        this.boxInput.remove();
    };
    this.OnClick=function(e){
        this.parentClass.childOnItemClicked(this);
        if(e.target.className==="group-box-actions__btn-menu button-solid-behaviour"){
            this.parentClass.childNotificationOnBtnObjectMenu()
        }else if(e.target.className==="group-box-actions__lock-object"){
            this.parentClass.childNotificationOnLockButton(e.target.checked);
        }else if(e.target.className==="group-box-actions__visible-object"){
            this.parentClass.childNotificationOnVisibleButton(e.target.checked);
        }
    };
    this.childNotificationOnItemNewName=function(value,e){
        this.parentClass.childNotificationOnItemNewName(value,this);
    };
    this.constructor();
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
    notificationScenesManageranimObjsWithEntranceItemAdded:function(animObjWithEntrance){
        this.SectionObjectsEntraceEditor.notificationOnObjAddedToListObjectsWithEntrance(animObjWithEntrance)
    },
    notificationScenesManageranimObjsWithEntranceItemRemoved:function(indexObjsWithEntranceList){
        this.SectionObjectsEntraceEditor.notificationOnObjDeletedFromListWithEntrance(indexObjsWithEntranceList);
    },
    notificationScenesManageranimObjsItemAdded:function(animableObject){
        this.SectionAnimableObjectsEditor.notificationOnAnimableObjectAdded(animableObject);
    },
    notificationScenesManageranimObjsItemRemoved:function(indexInAnimableObjectsList){
        this.SectionAnimableObjectsEditor.notificationOnAnimableObjectDeleted(indexInAnimableObjectsList);
    },
    notificationScenesManageranimObjsClippersItemAdded:function(animableObject){
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnShapeAnimableAdded(animableObject);
    },
    notificationScenesManageranimObjsClippersItemRemoved:function(indexInShapeObjectsList){
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnShapeAnimableDeleted(indexInShapeObjectsList);
    },

    notificationCanvasManagerOnObjectMovedBackward:function(index){
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnObjectMovedBackward(index);
    },
    notificationCanvasManagerOnObjectMovedForward:function(index){
        this.SectionAnimableObjectsEditor.notificationCanvasManagerOnObjectMovedForward(index);
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
