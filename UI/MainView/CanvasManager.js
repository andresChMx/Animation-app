var CanvasManager={
    canvas:null,
    listAnimableObjects:[],
    listAnimableObjectsWithEntrance:[],

    listObserversOnObjSelectionUpdated:[],// cuando se crea, oculta o cambia a otro objeto
    listObserversOnObjModified:[],
    listObserversOnObjDeletedFromListWithEntrance:[], // cuando se elimina un objeto del canvas (entonces de las dos listas)

    listObserversOnObjAddedToListWithEntrace:[], //

    SectionFloatingMenu:null,
    init:function(){
        this.SectionFloatingMenu=SectionFloatingMenu;
        this.SectionConfigureObject=SectionConfigureObject;
        this.SectionFloatingMenu.init();
        this.SectionConfigureObject.init();

        this.canvas=new fabric.Canvas('c',{ width: window.innerWidth, height: window.innerHeight ,backgroundColor: 'rgb(0,0,0)'});
        this.canvas.preserveObjectStacking=true;
        this.canvas.on('selection:updated',this.notifyOnObjSelectionUpdated)
        this.canvas.on('selection:created',this.notifyOnObjSelectionUpdated)
        this.canvas.on('selection:cleared',this.notifyOnObjSelectionUpdated)
        //this.canvas.on('object:removed',this.notifyOnObjDeleted)
        this.canvas.on('object:modified',this.notifyOnObjModified)
        PanelInspector.SectionPropertiesEditor.registerOnFieldInput(this);
        PanelAssets.SectionImageAssets.registerOnDummyDraggingEnded(this);
        PanelActionEditor.registerOnMarkerDragEnded(this);

        WindowManager.registerOnKeyDeletePressed(this);
        /*
        let self=this;
        window.addEventListener("keydown",function(e){
            if(e.keyCode==32){
                self.canvas.remove(self.canvas.getActiveObject());
            }
        });
        */
    },
    /*METODOS RELACIONADOS A LA LISTA DE OBJETOS CON EFECTOS DE ENTRADA (DRAWN Y DRAGGED)*/
    getListIndexObjectWithEntrance:function(obj){
        return this.listAnimableObjectsWithEntrance.indexOf(obj);
    },
    addItemToListObjectsWithEntrance:function(obj){
        this.listAnimableObjectsWithEntrance.push(obj);
        this.notifyOnObjAddedToListObjectsWithEntrance(obj)
    },
    removeFromListObjectsWithEntrance:function(object){
        let indexInListObjectsWithEntrance=this.listAnimableObjectsWithEntrance.indexOf(object);
        if(indexInListObjectsWithEntrance!==-1){
            this.listAnimableObjectsWithEntrance.splice(indexInListObjectsWithEntrance,1);
            this.notifyOnObjDeletedFromListWithEntrance(indexInListObjectsWithEntrance);
        }
    },
    /*FIN-METODOS RELACIONADOS A LA LISTA DE OBJETOS CON EFECTSO DE ENTRADA (DRAWN Y DRAGGED)*/
    getSelectedAnimableObj:function(){
        let activeObj=this.canvas.getActiveObject()
        if(activeObj && activeObj.type==="ImageAnimable"){
            return activeObj
        }else{
            return null;
        }
        //switch(case obj.)

    },
    createAnimableObject:function(model){
        let self=CanvasManager;

        /*
                fabric.loadSVGFromURL('http://localhost:3000/svg.svg', function(objects, options) {
                console.log(objects);
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.set({left:WindowManager.mouse.x});
                    obj.set({top:WindowManager.mouse.y});
                    self.canvas.add(obj).renderAll();
                  });
                */
        let oImg=new ImageAnimable(model.imgHTML,{
            "originX":"center",
            "originY":"center",
            "left":WindowManager.mouse.x,
            "top":WindowManager.mouse.y
        })
        oImg.imageModel=model;
        oImg.entraceMode=EntranceModes.drawn;
        oImg.setCoords();
        self.canvas.add(oImg);
        self.listAnimableObjects.push(oImg);
        self.listAnimableObjectsWithEntrance.push(oImg);

        self.notifyOnObjAddedToListObjectsWithEntrance(oImg);

    },
    removeActiveObject:function(){
        let activeAnimableObject=this.getSelectedAnimableObj();
        if(activeAnimableObject){
            let indexInMainList=this.listAnimableObjects.indexOf(activeAnimableObject);
            let indexInObjsWithEntrance=this.listAnimableObjectsWithEntrance.indexOf(activeAnimableObject);
            if(indexInMainList!=-1){
                this.listAnimableObjects.splice(indexInMainList,1);
            }
            if(indexInObjsWithEntrance!=-1){
                this.listAnimableObjectsWithEntrance.splice(indexInObjsWithEntrance,1);
                this.notifyOnObjDeletedFromListWithEntrance(indexInObjsWithEntrance);
            }
            this.canvas.remove(this.canvas.getActiveObject());
        }
    },
    setCanvasOnAnimableObjects:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i]._set('canvas', this.canvas);
            this.listAnimableObjects[i].setCoords();
        }
        this.canvas.renderAll();
    },
    registerOnSelectionUpdated:function(obj){
        this.listObserversOnObjSelectionUpdated.push(obj);
    },
    registerOnObjDeletedFromListWidthEntraces:function(obj){
        this.listObserversOnObjDeletedFromListWithEntrance.push(obj);
    },
    registerOnObjModified:function(obj){
        this.listObserversOnObjModified.push(obj);
    },
    registerOnObjAddedToListWithEntrance:function(obj){
        this.listObserversOnObjAddedToListWithEntrace.push(obj);
    },
    notifyOnObjAddedToListObjectsWithEntrance:function(animObj){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjAddedToListWithEntrace.length;i++){
            self.listObserversOnObjAddedToListWithEntrace[i].notificationOnObjAddedToListObjectsWithEntrance(animObj);
        }
    },
    notifyOnObjSelectionUpdated:function(opt){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjSelectionUpdated.length;i++){
            self.listObserversOnObjSelectionUpdated[i].notificationOnSelectionUpdated(opt.target);
        }
    },
    /*Object deleted from every where*/
    notifyOnObjDeletedFromListWithEntrance:function(indexInObjsWithEntrance){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjDeletedFromListWithEntrance.length;i++){
            self.listObserversOnObjDeletedFromListWithEntrance[i].notificationOnObjDeletedFromListWithEntrance(indexInObjsWithEntrance);
        }
    },
    notifyOnObjModified:function(opt){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjModified.length;i++){
            self.listObserversOnObjModified[i].notificationOnObjModified(opt.target);
        }
    },
    notificationOnFieldInput:function(target){
        console.log(target.getAttribute("name") + " + " + target.value);
        let self=CanvasManager;
        let activeAnimObj=self.getSelectedAnimableObj();
        if(activeAnimObj){
            activeAnimObj.set(target.getAttribute("name"),parseFloat(target.value));
            activeAnimObj.setCoords();
            self.canvas.renderAll();
        }
    },
    notificationOnKeyDeleteUp:function(){
        this.removeActiveObject()
    },
    notificationOnDummyDraggingEnded:function(model){
        let self=CanvasManager;
        self.createAnimableObject(model);
    },
    notificationOnMarkerDragEnded:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i].setCoords();
        }
    }
}

var SectionFloatingMenu={
    HTMLElement:null,
    MODELOptions:[
        {
            icon:"/general/moveForward.png",
            description:"Move forward",
            action:function(){
                alert("move forward");
            }
        },
        {
            icon:"/general/moveBackward.png",
            description:"Move backward",
            action:function (){
                alert("Move backward");
            }
        },
        {
            icon:"/general/removeObject.png",
            description:"Remove",
            action:function (){
                if(this.lastAnimableObjectActive){
                    CanvasManager.removeActiveObject();
                }
            }
        },
        {
            icon:"/general/configuration.png",
            description:"Configurate Object",
            action:function (animableObject){
                CanvasManager.SectionConfigureObject.showModal(animableObject);
            }
        }
    ],
    init:function(){
        this.HTMLElement=document.querySelector(".canvas-animator__object__menu-options");
        this.lastAnimableObjectActive=null;
        this.generateHTMLOptions();
        CanvasManager.registerOnSelectionUpdated(this);
        CanvasManager.registerOnObjModified(this)
    },
    generateHTMLOptions:function(){
        for(let i=0;i<this.MODELOptions.length;i++){
            this.generateHTMLOption(this.MODELOptions[i],i);
        }
    },
    generateHTMLOption:function(model,id){
        let newOpt=document.createElement("div");
        newOpt.style.backgroundImage=model.icon;
        newOpt.style.width=20 +"px";
        newOpt.style.height=20 +"px";
        newOpt.style.border="3px solid white";
        newOpt.addEventListener("click",this.OnOptionClicked.bind(this))
        newOpt.setAttribute("index",id)
        this.HTMLElement.appendChild(newOpt);

    },
    showMenu:function(posx,posy){
        this.HTMLElement.style.display="flex";
        this.HTMLElement.style.left=posx + "px";
        this.HTMLElement.style.top=posy+ "px";

    },
    hiddeMenu:function(){
        this.HTMLElement.style.display="none";
        this.HTMLElement.style.left=-200 + "px";
        this.HTMLElement.style.top=-200 + "px";

    },
    OnOptionClicked:function(e){
        let index=parseInt(e.target.getAttribute("index"));
        this.MODELOptions[index].action.bind(this)(this.lastAnimableObjectActive);
    },
    notificationOnSelectionUpdated:function(){// and on canvas active Object deleted
        let activeAnimableObject=CanvasManager.getSelectedAnimableObj();
        this.lastAnimableObjectActive=activeAnimableObject;
        if(activeAnimableObject){
            this.showMenu(activeAnimableObject.get("left"),activeAnimableObject.get("top"));
        }else{
            this.hiddeMenu();
        }
    },
    notificationOnObjModified:function(obj){
        if(this.lastAnimableObjectActive){
            this.showMenu(this.lastAnimableObjectActive.get("left"),this.lastAnimableObjectActive.get("top"));
        }else{
            this.hiddeMenu();
        }
    }
}
var SectionConfigureObject={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".canvas-animator__object-configuration__filter");
        this.HTMLAreaEntranceSettings=document.querySelector(".canvas-animator__object-configuration__entrance-settings")
        this.HTMLCollectionRadioButtons=document.querySelectorAll(".entrance-settings__box-radio-buttons__radio-button")
        this.HTMLCollectionModesOptions=document.querySelectorAll(".canvas-animator__object-configuration__entrance-settings__box-options__mode-options")
        this.HTMLcloseBtn=document.querySelector(".canvas-animator__object-configuration__btn-close");
        this.HTMLAcceptBtn=document.querySelector(".canvas-animator__object-configuration__entrance-settings__box-buttons .btn-accept")
        this.currentAnimableObject=null;
        this.currentSelectedOptions={};
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        for(let i=0;i<this.HTMLCollectionRadioButtons.length;i++){
            this.HTMLCollectionRadioButtons[i].addEventListener("change",this.OnRadioButtonModePressed.bind(this))
        }
        this.HTMLAcceptBtn.addEventListener("click",this.OnBtnAcceptClicked.bind(this))
    },
    showModal:function(animableObject){
        if(animableObject){
            this.currentAnimableObject=animableObject;
            this.currentSelectedOptions={
                entranceMode:animableObject.getEntranceMode()
            };
            this.HTMLAreaEntranceSettings.querySelector("#" + animableObject.getEntranceMode()).checked=true;
            this.HTMLElement.style.display="block";
        }
    },
    hiddeModel:function(){
        this.currentAnimableObject=null;
        this.currentSelectedOptions=null;
        this.HTMLElement.style.display="none";
    },
    activateEntranceModeOptions:function(index){
        this.HTMLCollectionModesOptions[index].style.display="block";
    },
    desactivateEntraceModeOptions:function(index){
        this.HTMLCollectionModesOptions[index].style.display="none";
    },
    OnBtnCloseClicked:function(){
        this.hiddeModel();
    },
    OnRadioButtonModePressed:function(e){
        for(let i=0;i<this.HTMLCollectionRadioButtons.length;i++){
            if(this.HTMLCollectionRadioButtons[i].value===e.target.value){
                this.activateEntranceModeOptions(i);
                this.currentSelectedOptions.entranceMode=e.target.value;
            }else{
                this.desactivateEntraceModeOptions(i);
            }
        }
    },
    /*SE PROCESA LA INFORMACION EDITADA*/
    OnBtnAcceptClicked:function(){
        if(this.currentAnimableObject){
            if(this.currentSelectedOptions.entranceMode===EntranceModes.none && this.currentAnimableObject.getEntranceMode()!==EntranceModes.none){
                CanvasManager.removeFromListObjectsWithEntrance(this.currentAnimableObject);
            }
            else if((this.currentSelectedOptions.entranceMode===EntranceModes.drawn ||
                this.currentSelectedOptions.entranceMode===EntranceModes.dragged) &&
                this.currentAnimableObject.entranceMode===EntranceModes.none){
                CanvasManager.addItemToListObjectsWithEntrance(this.currentAnimableObject);
            }
            this.currentAnimableObject.setEntranceMode(this.currentSelectedOptions.entranceMode);
        }
        this.hiddeModel();
    }
};



























