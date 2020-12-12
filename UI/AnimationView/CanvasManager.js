var CanvasManager={
    name:'CanvasManager',
    events:{
        OnSelectionUpdated:'OnSelectionUpdated',// cuando se crea, oculta o cambia a otro objeto
        OnObjDeletedFromListWidthEntraces:'OnObjDeletedFromListWidthEntraces', // cuando se elimina un objeto del canvas (entonces de las dos listas)
        OnObjAddedToListWithEntrance:'OnObjAddedToListWithEntrance',//cuando se agrego o elimina un elemento de la lista listAnimableObjectsWithEntraces
        OnObjModified:'OnObjModified',
        OnAnimableObjectAdded:'OnAnimableObjectAdded',
        OnAnimableObjectDeleted:'OnAnimableObjectDeleted',

        OnDesignPathOptionClicked:'OnDesignPathOptionClicked',
    },
    HTMLElement:null,
    canvas:null,
    listAnimableObjects:[],//NO TIENE UNA RAZON DE SER CLARA PERO SE ESPERA QUE CUANDO DENGAMOS QUE HACER ALGO EN LOS ELEMENTOS ANIMABLES, NO TENGMOS QUE RECORRER TODOS LOS ELEMENTOS DEL CANVAS, sino solo lso animables, ademas son los que se muestran en el objects editor
    listAnimableObjectsWithEntrance:[],// este es un subconjunto de la lista de arriba
    camera:null,

    SectionFloatingMenu:null,


    init:function(){
        this.SectionFloatingMenu=SectionFloatingMenu;
        this.SectionConfigureObject=SectionConfigureObject;
        this.SectionFloatingMenu.init();
        this.SectionConfigureObject.init();

        this.HTMLElement=document.querySelector(".canvas-animator");
        this.boundingClientRect=this.HTMLElement.getBoundingClientRect();
        this.initCanvas();

        this.initCamera();

        this.panningAndZoomBehaviour();

        this.initEvents();
    },
    initCanvas:function(resolutionWidth,resolutionHeight){
        let aspectRatio=0.6;
        let windowWidth=window.innerWidth;
        let trueWidth=windowWidth*0.65;
        let trueHeight=trueWidth*aspectRatio;
        this.canvas=new fabric.Canvas('c',{ width: trueWidth, height:trueHeight,backgroundColor: 'rgb(240,240,240)'});
        document.querySelector(".canvas-outterContainer").style.width=trueWidth + "px";
        this.canvas.preserveObjectStacking=true;


    },
    initEvents:function(){
        this.canvas.on('selection:updated',this.notifyOnObjSelectionUpdated.bind(this));
        this.canvas.on('selection:created',this.notifyOnObjSelectionUpdated.bind(this));
        this.canvas.on('selection:cleared',this.notifyOnObjSelectionUpdated.bind(this));
        //this.canvas.on('object:removed',this.notifyOnObjDeleted)
        this.canvas.on('object:modified',this.notifyOnObjModified.bind(this));

        //PanelInspector.SectionPropertiesEditor.registerOnFieldInput(this);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this)
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnFieldPropertyInput,this);
        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnTextOptionClicked,this);

        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDummyDraggingEnded,this);
        WindowManager.registerOnKeyDeletePressed(this);
        },
    initCamera:function(){
        fabric.Image.fromURLCustom("https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599380/icons/camera_kykhid.svg",function(animCamera){
            this.camera=animCamera;
            this.listAnimableObjects.push(animCamera);
            this.canvas.add(animCamera);
            this.notifyOnAnimableObjectAdded.bind(this)(animCamera);
        }.bind(this),{
            left:0,
            top:0,
            width:1400,
            height:800,
            imageDrawingData:{'url':'http...',id:"",userid:"",imgHTML:""}
        });

    },
    panningAndZoomBehaviour:function(){
        let isDragging=false;
        let selection=false;
        let lastPosX=false;
        let lastPosY=false;
        this.canvas.on('mouse:down', function(opt) {
            var evt = opt.e;
            if (evt.altKey === true) {
                this.isDragging = true;
                this.selection = false;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
            }
        });
        this.canvas.on('mouse:move', function(opt) {
            if (isDragging) {
                var e = opt.e;
                var vpt = this.viewportTransform;
                vpt[4] += e.clientX - this.lastPosX;
                vpt[5] += e.clientY - this.lastPosY;
                this.requestRenderAll();
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
            }
        });
        this.canvas.on('mouse:up', function(opt) {
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
            this.selection = true;
        });
        this.canvas.on('mouse:wheel', function(opt) {
            var delta = opt.e.deltaY;
            var zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            var vpt = this.canvas.viewportTransform;
            if (zoom < 400 / 1000) {
                vpt[4] = 200 - 1000 * zoom / 2;
                vpt[5] = 200 - 1000 * zoom / 2;
            } else {
                if (vpt[4] >= 0) {
                    vpt[4] = 0;
                } else if (vpt[4] < this.canvas.getWidth() - 1000 * zoom) {
                    vpt[4] = this.canvas.getWidth() - 1000 * zoom;
                }
                if (vpt[5] >= 0) {
                    vpt[5] = 0;
                } else if (vpt[5] < this.canvas.getHeight() - 1000 * zoom) {
                    vpt[5] = this.canvas.getHeight() - 1000 * zoom;
                }
            }
        }.bind(this))
    },
    /*METODOS RELACIONADOS A LA LISTA DE OBJETOS CON EFECTOS DE ENTRADA (DRAWN Y DRAGGED)*/
    getListIndexObjectWithEntrance:function(obj){
        return this.listAnimableObjectsWithEntrance.indexOf(obj);
    },
    getListIndexAnimableObjects:function(obj){
        return this.listAnimableObjects.indexOf(obj);
    },
    addItemToListObjectsWithEntrance:function(obj){
        this.listAnimableObjectsWithEntrance.push(obj);
        this.notifyOnObjAddedToListObjectsWithEntrance.bind(this)(obj)
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

        //console.log(model);
        let animObj=null;
        if(type==="ImageAnimable"){
            animObj=new ImageAnimable(model.imgHTML,{

                "left":WindowManager.mouse.x-this.canvas._offset.left,
                "top":WindowManager.mouse.y-this.canvas._offset.top,
                "imageDrawingData":model,
            })
             // por defecto las imagenes tendran entrada siendo dibujadas, por eso tambien lo agregamos al arreglo del a siguiente linea
        }else{ //(type==="TextAnimable")
            animObj=new TextAnimable("asdfasdfasdf",{
                "left":100,
                "top":100,
                "imageDrawingData":model,
            })
            animObj.setEntranceMode(EntranceModes.text_drawn); //textos tambien tendran entrada siendo dibujados
        }
        animObj.setCoords();
        self.listAnimableObjects.push(animObj);
        self.listAnimableObjectsWithEntrance.push(animObj);
        self.canvas.add(animObj);

        self.notifyOnObjAddedToListObjectsWithEntrance.bind(this)(animObj);
        self.notifyOnAnimableObjectAdded.bind(self)(animObj);

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
            this.notifyOnAnimableObjectDeleted(indexInMainList);
        }
    },
    setCanvasOnAnimableObjects:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i]._set('canvas', this.canvas);
            this.listAnimableObjects[i].setCoords();
        }
        this.canvas.renderAll();
    },
    notifyOnObjAddedToListObjectsWithEntrance:function(animObj){
        MainMediator.notify(this.name,this.events.OnObjAddedToListWithEntrance,[animObj]);
    },
    notifyOnAnimableObjectAdded:function(animObj){
        MainMediator.notify(this.name,this.events.OnAnimableObjectAdded,[animObj]);
    },
    notifyOnAnimableObjectDeleted:function(indexInAnimableObjectsList){
        MainMediator.notify(this.name,this.events.OnAnimableObjectDeleted,[indexInAnimableObjectsList]);
    },
    notifyOnObjSelectionUpdated:function(opt){
        MainMediator.notify(this.name,this.events.OnSelectionUpdated,[opt.target]);
    },
    /*Object deleted from every where*/
    notifyOnObjDeletedFromListWithEntrance:function(indexInObjsWithEntrance){
        MainMediator.notify(this.name,this.events.OnObjDeletedFromListWidthEntraces,[indexInObjsWithEntrance]);
    },
    notifyOnObjModified:function(opt){
        MainMediator.notify(this.name,this.events.OnObjModified,[opt.target]);
    },
    notificationOnKeyDeleteUp:function(){
        this.removeActiveAnimableObject()
    },
    childNotificationOnDesignPathOptionClicked:function(currentSelectedObject){
        MainMediator.notify(this.name,this.events.OnDesignPathOptionClicked,[currentSelectedObject.imageDrawingData,currentSelectedObject])
    },
    notificationPanelInspectorOnTextOptionClicked:function(args){
        let action=args[0];

        this.createAnimableObject({url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603741009/text_xzcmse.png"},"TextAnimable")
    },
    notificationPanelActionEditorOnFieldPropertyInput:function(args){
        let propName=args[0];let propNewValue=args[1];
        let activeAnimObj=this.getSelectedAnimableObj();
        if(activeAnimObj){
            activeAnimObj.set(propName,parseFloat(propNewValue));
            activeAnimObj.setCoords();
            this.canvas.renderAll();
        }
    },
    notificationPanelAssetsOnImageAssetDummyDraggingEnded:function(args){
        let model=args[0];
        this.createAnimableObject(model);
    },
    notificationPanelActionEditorOnMarkerDragEnded:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i].setCoords();
        }
    },
    notificationPanelActionEditorOnDurationInput:function(args){
        let durationBefore=args[0];let durationAfter=args[1];
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i].animator.onDurationChange(durationBefore,durationAfter);
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
                CanvasManager.removeActiveAnimableObject();
            }
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/settings-icon_jsw4qf.png",
            description:"Configure Object",
            action:function (animableObject){
                CanvasManager.SectionConfigureObject.showModal(animableObject);
            }
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/settings-icon_jsw4qf.png",
            description:"design path for this object",
            action:function(animableObject){
                CanvasManager.childNotificationOnDesignPathOptionClicked(animableObject);
            }
        }
    ],
    init:function(){
        this.HTMLElement=document.querySelector(".canvas-animator__object__menu-options");
        this.lastAnimableObjectActive=null;
        this.generateHTMLOptions();

        this.initEvents();
    },
    initEvents:function(){
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjModified,this);

        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnPreviewClicked,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
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
    notificationCanvasManagerOnSelectionUpdated:function(){// and on canvas active Object deleted
        let activeAnimableObject=CanvasManager.getSelectedAnimableObj();
        if(activeAnimableObject && activeAnimableObject.type!=="AnimableCamera"){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.showMenu(
                positionInViewportCoords.x,
                positionInViewportCoords.y
            );
        }else{
            this.hiddeMenu();
        }
    },
    notificationCanvasManagerOnObjModified:function(obj){
        if(this.lastAnimableObjectActive){
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.showMenu(
                positionInViewportCoords.x,
                positionInViewportCoords.y
            );
        }else{
            this.hiddeMenu();
        }
    },
    /*notificaiones solo para desativar el menu*/
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){this.hiddeMenu();CanvasManager.canvas.discardActiveObject().renderAll();},
    notificationPanelInspectorOnBtnPreviewClicked:function(){this.hiddeMenu();CanvasManager.canvas.discardActiveObject().renderAll();}
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



























