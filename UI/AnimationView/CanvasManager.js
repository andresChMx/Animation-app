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
        if(activeObj && (activeObj.type==="ImageAnimable" || activeObj.type==="CameraAnimable" || activeObj.type==="TextAnimable")){
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
                "originX":'center',
                "originY":'center',
                "imageDrawingData":model,
            })
             // por defecto las imagenes tendran entrada siendo dibujadas, por eso tambien lo agregamos al arreglo del a siguiente linea
        }else{ //(type==="TextAnimable")
            animObj=new TextAnimable("asdfasdfasdf",{
                "left":100,
                "top":100,
                "originX":"center",
                "originY":"center",
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
            },
            HTMLElement:null
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/send-back-icon_acfzvo.png",
            description:"Move backward",
            action:function (animableObject){
                CanvasManager.canvas.sendBackwards(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/delete-icon_logtrc.png",
            description:"Remove",
            action:function (){
                CanvasManager.removeActiveAnimableObject();
            },
            HTMLElement:null
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/settings-icon_jsw4qf.png",
            description:"Configure Object",
            action:function (animableObject){
                CanvasManager.SectionConfigureObject.showModal(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603599363/icons/settings-icon_jsw4qf.png",
            description:"design path for this object",
            action:function(animableObject){
                CanvasManager.childNotificationOnDesignPathOptionClicked(animableObject);
            },
            HTMLElement:null
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

        model.HTMLElement=newOpt;

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
    desableOptions:function(optionsToDisable){
        for(let i=0;i<optionsToDisable.length;i++){
            if(optionsToDisable[i]===0){
                this.MODELOptions[i].HTMLElement.style.display="none";
            }else{
                this.MODELOptions[i].HTMLElement.style.display="block";
            }
        }
    },
    notificationCanvasManagerOnSelectionUpdated:function(){// and on canvas active Object deleted
        let activeAnimableObject=CanvasManager.getSelectedAnimableObj();
        if(!activeAnimableObject){this.hiddeMenu();return;}
        if(activeAnimableObject.type==='ImageAnimable'){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,1,1]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);
        }else if(activeAnimableObject.type==="TextAnimable"){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,1,0]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);

        }else if(activeAnimableObject.type==="CameraAnimable"){
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
        this.HTMLCollectionModesAreas=document.querySelectorAll(".canvas-animator__object-configuration__entrance-settings__box-options__mode-options")
        this.HTMLCollectionObjectAppearanceAreas=document.querySelectorAll(".canvas-animator__object-configuration__appearance-settings__box-options__object-type-options");
        this.widgetsEntraceMode={
            modeSelector:{
                value:"",
                htmlElem:document.querySelector(".canvas-animator__object-configuration__entrance-settings__box-radio-buttons"),
                initEvent:function(){
                    console.log(this.htmlElem);
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].children[1].addEventListener("change",this.OnTriggered.bind(this));}
                },
                removeEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].children[1].removeEventListener("change",this.OnTriggered.bind(this));}
                },
                OnTriggered:function(e){this.setVal(e.target.value);},
                setVal:function(normalizedEntranceModeName){
                    let HTMLCollectionEntraceModesAreas=document.querySelectorAll(".canvas-animator__object-configuration__entrance-settings__box-options__mode-options");
                    for(let i=0;i<this.htmlElem.children.length;i++){
                        if(this.htmlElem.children[i].children[1].value===normalizedEntranceModeName){
                            HTMLCollectionEntraceModesAreas[i].style.display="block";
                            this.value=normalizedEntranceModeName;
                        }else{HTMLCollectionEntraceModesAreas[i].style.display="none";}
                    }
                    this.htmlElem.querySelector("#" + normalizedEntranceModeName).checked=true;
                },
                getVal:function(){return this.value;},
            }
        }

        this.widgetsTextAnimableObjectAppareance={
            fontFamily:{
                htmlElem:document.querySelector(".ImageAnimable-widged__font-family select"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.removeEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(val){this.htmlElem.value=val},
                getVal:function(){return this.htmlElem.value},
                },
            textAlign:{
                value:"",
                htmlElem:document.querySelector(".ImageAnimable-widged__text-alignment .text-alignment__options"),
                initEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].addEventListener("click",this.OnTriggered.bind(this))}
                },
                removeEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].removeEventListener("click",this.OnTriggered.bind(this))}
                },
                OnTriggered:function(e){
                    this.setVal(e.target.id);
                },
                setVal:function(val){
                    this.value=val;
                    for(let i=0;i< this.htmlElem.children.length;i++){this.htmlElem.children[i].classList.remove("active")};
                    this.htmlElem.querySelector("#" + val).classList.add("active");
                },
                getVal:function(){return this.value},
                },
            fontSize:{
                htmlElem:document.querySelector(".ImageAnimable-widged__font-size input"),
                initEvent:function(){this.htmlElem.addEventListener("input",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.removeEventListener("input",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(val){this.htmlElem.value=val},
                getVal:function(){return this.htmlElem.value},
                },
            lineHeight:{
                htmlElem:document.querySelector(".ImageAnimable-widged__line-height input"),
                initEvent:function(){this.htmlElem.addEventListener("input",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.removeEventListener("input",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(val){this.htmlElem.value=val},
                getVal:function(){return this.htmlElem.value},
            },
            fillColor:{htmlElem:document.querySelector(".ImageAnimable-widged__fill-color input"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.removeEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(val){this.htmlElem.value=val},
                getVal:function(){return this.htmlElem.value},
                },
        }

        this.HTMLcloseBtn=document.querySelector(".canvas-animator__object-configuration__btn-close");
        this.HTMLAcceptBtn=document.querySelector(".canvas-animator__object-configuration__box-buttons .btn-accept")
        this.currentAnimableObject=null;
        this.currentSelectedOptions={};
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));

        this.HTMLAcceptBtn.addEventListener("click",this.OnBtnAcceptClicked.bind(this))

        //INIT WIDGETS
    },
    initEventsWidgetsEntranceModes:function(){
        this.widgetsEntraceMode.modeSelector.initEvent();
    },
    removeEventsWidgetsEntranceModes:function (){
        this.widgetsEntraceMode.modeSelector.removeEvent();
    },
    initEventsWidgetsTextAnimable:function(){
        for(let i in this.widgetsTextAnimableObjectAppareance){
            this.widgetsTextAnimableObjectAppareance[i].initEvent();
        }
    },
    removeEventsWidgetsTextAnimable:function(){
        for(let i in this.widgetsTextAnimableObjectAppareance){
            this.widgetsTextAnimableObjectAppareance[i].removeEvent();
        }
    },
    showModal:function(animableObject){
        if(animableObject){
            this.currentAnimableObject=animableObject;
            this.activateEntraceModeRadios(animableObject);
            this.activateObjectAppareanceArea(animableObject.type);

            this.initEventsWidgetsEntranceModes();
            this.fillWidgetsEntranceMode(animableObject);

            if(animableObject.type==="ImageAnimable"){

            }else if(animableObject.type==="TextAnimable"){
                this.initEventsWidgetsTextAnimable()
                this.fillWidgetsObjectAppareanceTextAnimable(animableObject);
            }else if(animableObject.type==="CameraAnimable"){

            }
            this.HTMLElement.style.display="block";
        }
    },
    hiddeModel:function(){
        this.currentAnimableObject=null;
        this.currentSelectedOptions=null;
        this.HTMLElement.style.display="none";
    },
    fillWidgetsEntranceMode:function(animableObject){
        this.widgetsEntraceMode.modeSelector.setVal(this.normalizeObjectEntraceMode(animableObject.getEntranceMode()));
        //todo fill widgets by entrance mode
    },
    fillWidgetsObjectAppareanceTextAnimable:function(animableObject){
        this.widgetsTextAnimableObjectAppareance.fontFamily.setVal(animableObject.fontFamily);
        this.widgetsTextAnimableObjectAppareance.textAlign.setVal(animableObject.textAlign);
        this.widgetsTextAnimableObjectAppareance.fontSize.setVal(animableObject.fontSize);
        this.widgetsTextAnimableObjectAppareance.lineHeight.setVal(animableObject.lineHeight);
        this.widgetsTextAnimableObjectAppareance.fillColor.setVal(animableObject.fill);
    },
    activateEntraceModeRadios:function(animableObject){
        for(let i=0;i<this.HTMLCollectionRadioButtons.length;i++) {
            this.HTMLCollectionRadioButtons[i].parentNode.style.display="none";
        }
        for(let i=0;i<animableObject.applicableEntrenceModes.length;i++){
            let applicableEntraceMode=this.normalizeObjectEntraceMode(animableObject.applicableEntrenceModes[i]);
            this.HTMLAreaEntranceSettings.querySelector("#" + applicableEntraceMode).parentNode.style.display="inline";
        }
    },
    activateObjectAppareanceArea:function(animableObjectType){
        for(let i=0;i<this.HTMLCollectionObjectAppearanceAreas.length;i++){
            if(this.HTMLCollectionObjectAppearanceAreas[i].classList.contains(animableObjectType)){
                this.HTMLCollectionObjectAppearanceAreas[i].style.display="block";
            }else{
                this.HTMLCollectionObjectAppearanceAreas[i].style.display="none";
            }
        }
    },
    OnBtnCloseClicked:function(){
        this.hiddeModel();
    },
    /*SE PROCESA LA INFORMACION EDITADA*/
    OnBtnAcceptClicked:function(){
        if(this.currentAnimableObject){
            // entrace mode widgets processing
            let entranceModeChoosen= this.unnormalizeUIEntraceMode(this.widgetsEntraceMode.modeSelector.getVal());
            if(this.currentAnimableObject.getEntranceMode() !==entranceModeChoosen){
                if(entranceModeChoosen===EntranceModes.none && this.currentAnimableObject.getEntranceMode()!==EntranceModes.none){
                    CanvasManager.removeFromListObjectsWithEntrance(this.currentAnimableObject);
                }
                else if(this.currentAnimableObject.entranceMode===EntranceModes.none && entranceModeChoosen!==EntranceModes.none){
                    CanvasManager.addItemToListObjectsWithEntrance(this.currentAnimableObject);
                }
                this.currentAnimableObject.setEntranceMode(entranceModeChoosen);
            }
            console.log(entranceModeChoosen);
            // appareance options
            if(this.currentAnimableObject.type==="ImageAnimable"){

            }
            else if(this.currentAnimableObject.type==="TextAnimable"){
                this.currentAnimableObject.setFontFamily(this.widgetsTextAnimableObjectAppareance.fontFamily.getVal());
                this.currentAnimableObject.fontSize=this.widgetsTextAnimableObjectAppareance.fontSize.getVal();
                this.currentAnimableObject.lineHeight=this.widgetsTextAnimableObjectAppareance.lineHeight.getVal();
                this.currentAnimableObject.textAlign=this.widgetsTextAnimableObjectAppareance.textAlign.getVal();
                this.currentAnimableObject.set({"fill":this.widgetsTextAnimableObjectAppareance.fillColor.getVal()});

                this.currentAnimableObject.exitEditing();
                CanvasManager.canvas.renderAll();
                this.removeEventsWidgetsTextAnimable();

            }

        }
        this.removeEventsWidgetsEntranceModes();

        this.hiddeModel();
    },
    normalizeObjectEntraceMode:function(objectEntraceModeName){
        if(objectEntraceModeName===EntranceModes.text_drawn){return EntranceModes.drawn}
        else if(objectEntraceModeName===EntranceModes.text_typed){return 'typed'}
        else{return objectEntraceModeName;}
    },
    unnormalizeUIEntraceMode:function(UIentraceModeName){
        if(UIentraceModeName===EntranceModes.drawn){
            if(this.currentAnimableObject.type==="TextAnimable"){return EntranceModes.text_drawn}
        }else if(UIentraceModeName==='typed'){
            return EntranceModes.text_typed;
        }
        return UIentraceModeName;

    }
};

























