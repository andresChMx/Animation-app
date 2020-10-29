var CanvasManager={
    HTMLElement:null,
    canvas:null,
    listAnimableObjects:[],//NO TIENE UNA RAZON DE SER CLARA PERO SE ESPERA QUE CUANDO DENGAMOS QUE HACER ALGO EN LOS ELEMENTOS ANIMABLES, NO TENGMOS QUE RECORRER TODOS LOS ELEMENTOS DEL CANVAS, sino solo lso animables
    listAnimableObjectsWithEntrance:[],
    camera:null,

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

        this.HTMLElement=document.querySelector(".canvas-animator");
        this.boundingClientRect=this.HTMLElement.getBoundingClientRect();
        this.initCanvas();
        this.initEvents();
        this.initCamera();
    },
    initCanvas:function(resolutionWidth,resolutionHeight){
        let aspectRatio=0.7;
        let windowWidth=window.innerWidth;
        let trueWidth=windowWidth*0.6;
        let trueHeight=trueWidth*aspectRatio;
        this.canvas=new fabric.Canvas('c',{ width: trueWidth, height:trueHeight,backgroundColor: 'rgb(240,240,240)'});
        document.querySelector(".canvas-outterContainer").style.width=trueWidth + "px";
        this.canvas.preserveObjectStacking=true;
    },
    initEvents:function(){
        this.canvas.on('selection:updated',this.notifyOnObjSelectionUpdated)
        this.canvas.on('selection:created',this.notifyOnObjSelectionUpdated)
        this.canvas.on('selection:cleared',this.notifyOnObjSelectionUpdated)
        //this.canvas.on('object:removed',this.notifyOnObjDeleted)
        this.canvas.on('object:modified',this.notifyOnObjModified)
        //PanelInspector.SectionPropertiesEditor.registerOnFieldInput(this);
        PanelActionEditor.SectionProperties.registerOnFieldPropertyInput(this);
        PanelAssets.SectionImageAssets.registerOnDummyDraggingEnded(this);
        PanelActionEditor.registerOnMarkerDragEnded(this);
        PanelInspector.SectionToolBox.registerOnTextTools(this);

        WindowManager.registerOnKeyDeletePressed(this);
        },
    initCamera:function(){
        fabric.Image.fromURLCustom("https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599380/icons/camera_kykhid.svg",function(animCamera){
            animCamera.left=0;
            animCamera.top=0;
            animCamera.width=1400;
            animCamera.height=800;
            animCamera.isCamera=true;
            this.camera=animCamera;
            this.listAnimableObjects.push(animCamera);
            this.canvas.add(animCamera);
        }.bind(this));
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
        if(activeObj && (activeObj.type==="ImageAnimable" || activeObj.type==="AnimableCamera" || activeObj.type==="TextAnimable")){
            return activeObj
        }else{
            return null;
        }
        //switch(case obj.)

    },
    createAnimableObject:function(model,type="ImageAnimable"){
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
        let animObj=null;
        if(type==="ImageAnimable"){
            animObj=new ImageAnimable(model.imgHTML,{

                "left":WindowManager.mouse.x-this.canvas._offset.left,
                "top":WindowManager.mouse.y-this.canvas._offset.top
            })
            animObj.setEntranceMode(EntranceModes.drawn); // por defecto las imagenes tendran entrada siendo dibujadas, por eso tambien lo agregamos al arreglo del a siguiente linea
        }else{ //(type==="TextAnimable")
            animObj=new TextAnimable("asdfasdfasdf",{
                "left":100,
                "top":100,
                "width":200,
            })
            animObj.setEntranceMode(EntranceModes.text_drawn); //textos tambien tendran entrada siendo dibujados
        }
        animObj.imageModel=model;
        animObj.setCoords();
        self.listAnimableObjects.push(animObj);
        self.listAnimableObjectsWithEntrance.push(animObj);
        self.canvas.add(animObj);

        self.notifyOnObjAddedToListObjectsWithEntrance(animObj);

    },
    createAnimableText:function(){

    },
    removeActiveAnimableObject:function(){
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
    notificationOnTextToolsPressed:function(action){
      this.createAnimableObject({url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603741009/text_xzcmse.png"},"TextAnimable")
    },
    notificationOnFieldPropertyInput:function(propName,propNewValue){
        let activeAnimObj=this.getSelectedAnimableObj();
        if(activeAnimObj){
            activeAnimObj.set(propName,parseFloat(propNewValue));
            activeAnimObj.setCoords();
            this.canvas.renderAll();
        }
    },
    notificationOnKeyDeleteUp:function(){
        this.removeActiveAnimableObject()
    },
    notificationOnDummyDraggingEnded:function(model){
        let self=CanvasManager;
        self.createAnimableObject(model);
    },
    notificationOnMarkerDragEnded:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i].setCoords();
        }
    },

}

var SectionFloatingMenu={
    HTMLElement:null,
    MODELOptions:[
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/bring-forward-icon_qngr0u.png",
            description:"Move forward",
            action:function(animableObject){
                CanvasManager.canvas.bringForward(animableObject);
            }
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/send-back-icon_acfzvo.png",
            description:"Move backward",
            action:function (animableObject){
                CanvasManager.canvas.sendBackwards(animableObject);
            }
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/delete-icon_logtrc.png",
            description:"Remove",
            action:function (){
                if(this.lastAnimableObjectActive){
                    CanvasManager.removeActiveAnimableObject();
                }
            }
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/settings-icon_jsw4qf.png",
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
        this.initEvents();
    },
    initEvents:function(){
        PanelInspector.SectionToolBox.registerOnBtnPreview(this);
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
    },
    generateHTMLOptions:function(){
        for(let i=0;i<this.MODELOptions.length;i++){
            this.generateHTMLOption(this.MODELOptions[i],i);
        }
    },
    generateHTMLOption:function(model,id){
        let newOpt=document.createElement("div");
        newOpt.style.backgroundImage="url("+model.icon+")";
        newOpt.className="canvas-animator__object__menu-options__option"
        newOpt.style.width=40 +"px";
        newOpt.style.height=40 +"px";
        newOpt.addEventListener("click",this.OnOptionClicked.bind(this))
        newOpt.setAttribute("index",id)
        this.HTMLElement.appendChild(newOpt);

    },
    showMenu:function(posx,posy){
        posx=posx-this.HTMLElement.parentNode.offsetLeft-this.HTMLElement.offsetWidth;
        posy=posy-this.HTMLElement.parentNode.offsetTop;
        this.HTMLElement.style.display="inline-block";
        this.HTMLElement.style.left=posx + "px";
        this.HTMLElement.style.top=posy+ "px";

    },
    hiddeMenu:function(){

        this.lastAnimableObjectActive=null;
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
        if(activeAnimableObject && activeAnimableObject.type!=="AnimableCamera"){
            this.lastAnimableObjectActive=activeAnimableObject;
            this.showMenu(
                this.lastAnimableObjectActive.getGlobalLeft(),
                this.lastAnimableObjectActive.getGlobalTop()
            );
        }else{
            this.hiddeMenu();
        }
    },
    notificationOnObjModified:function(obj){
        if(this.lastAnimableObjectActive){
            this.showMenu(
                this.lastAnimableObjectActive.getGlobalLeft(),
                this.lastAnimableObjectActive.getGlobalTop()
            );
        }else{
            this.hiddeMenu();
        }
    },
    /*notificaiones solo para desativar el menu*/
    notificationOnItemsMenu_designPaths:function(){this.hiddeMenu();CanvasManager.canvas.discardActiveObject().renderAll();},
    notificationOnBtnPreview:function(){this.hiddeMenu();CanvasManager.canvas.discardActiveObject().renderAll();}
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
            let objEntranceMode=animableObject.getEntranceMode();
            if(animableObject.type==="TextAnimable"){
                if(animableObject.getEntranceMode()==="text_drawn"){objEntranceMode="drawn";}
                this.HTMLAreaEntranceSettings.querySelector("#label_typed").style.display="inline";
                this.HTMLAreaEntranceSettings.querySelector("#typed").style.display="inline";
            }else{
                this.HTMLAreaEntranceSettings.querySelector("#label_typed").style.display="none";
                this.HTMLAreaEntranceSettings.querySelector("#typed").style.display="none";
            }
            this.HTMLAreaEntranceSettings.querySelector("#" + objEntranceMode).checked=true;
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



























