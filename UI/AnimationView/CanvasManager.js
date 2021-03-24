var CanvasManager={
    name:'CanvasManager',
    events:{
        OnSelectionUpdated:'OnSelectionUpdated',// cuando se crea, oculta o cambia a otro objeto
        OnObjModified:'OnObjModified',

        OnBtnMoveBackwards:'OnBtnMoveBackwards',
        OnBtnMoveForward:'OnBtnMoveForward',
        OnDesignPathOptionClicked:'OnDesignPathOptionClicked',
    },
    HTMLElement:null,
    canvas:null,
    camera:null,

    SectionFloatingMenu:null,

    init:function(){
        let me=this;
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsItemAdded,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsItemRemoved,this);
        MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.OnProjectCollectionsLoaded,this);

        MainMediator.registerObserver(PanelPreviewer.name,PanelPreviewer.events.OnBtnClose,this);

        this.SectionFloatingMenu=SectionFloatingMenu;
        this.SectionEntranceObjectConfiguration=SectionEntranceObjectConfiguration;
        this.SectionSelectHand=SectionSelectHand;
        this.SectionFloatingMenu.init();
        this.SectionEntranceObjectConfiguration.init();
        this.SectionSelectHand.init();

        this.HTMLElement=document.querySelector(".canvas-animator");
        this.boundingClientRect=this.HTMLElement.getBoundingClientRect();

        this.initCanvas();

        this.panningAndZoomBehaviour();

        this.initEvents();
    },
    initCanvas:function(resolutionWidth,resolutionHeight){
        this.canvas=new fabric.Canvas('c',{backgroundColor: 'rgb(240,240,240)'});
        this.canvas.preserveObjectStacking=true;
        this._setCanvasDimensions();

    },
    _setCanvasDimensions:function(){
        let aspectRatio=0.6;
        let windowWidth=window.innerWidth;
        let trueWidth=windowWidth*0.7;
        let trueHeight=trueWidth*aspectRatio;
        this.canvas.setWidth(trueWidth);
        this.canvas.setHeight(trueHeight);
        document.querySelector(".canvas-outterContainer").style.width=trueWidth + "px";
        document.querySelector(".canvas-outterContainer").style.height=trueHeight + "px";
    },
    initEvents:function(){
        this.canvas.on('selection:updated',this.notifyOnObjSelectionUpdated.bind(this));
        this.canvas.on('selection:created',this.notifyOnObjSelectionUpdated.bind(this));
        this.canvas.on('selection:cleared',this.notifyOnObjSelectionUpdated.bind(this));
        //this.canvas.on('object:removed',this.notifyOnObjDeleted)
        this.canvas.on('object:modified',this.notifyOnObjModified.bind(this));

        //PanelInspector.SectionLanesEditor.registerOnFieldInput(this);

        WindowManager.registerObserverOnResize(this);
        },
    panningAndZoomBehaviour:function(){
        let isDragging=false;
        let lastPosX=false;
        let lastPosY=false;
        this.canvas.on('mouse:down', function(opt) {
            var evt = opt.e;
            if (evt.altKey === true) {
                isDragging = true;
                this.canvas.selection = false;
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        }.bind(this));
        this.canvas.on('mouse:move', function(opt) {
            if (isDragging) {
                var e = opt.e;
                var vpt = this.canvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                this.canvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
            }
        }.bind(this));
        this.canvas.on('mouse:up', function(opt) {
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            this.canvas.setViewportTransform(this.canvas.viewportTransform);
            isDragging = false;
            this.canvas.selection = true;
        }.bind(this));

        if(Utils.mobileAndTabletCheck()){
            UserEventsHandler.addListener("scroll",function(e){
                let canvasLocalCoordX=WindowManager.mouse.x;
                let canvasLocalCoordY=WindowManager.mouse.y;
                this._zoomCanvas(e.deltaY,canvasLocalCoordX,canvasLocalCoordY);
            }.bind(this))
        }else{
            this.canvas.on('mouse:wheel', function(opt) {
                opt.e.preventDefault();
                opt.e.stopPropagation();
                this._zoomCanvas(opt.e.deltaY,opt.e.offsetX,opt.e.offsetY);
            }.bind(this))
        }
    },
    _zoomCanvas:function(delta,canvasMouseCoordX,canvasMouseCoordY){
        var zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: canvasMouseCoordX, y:canvasMouseCoordY }, zoom);
        // var vpt = this.canvas.viewportTransform;
        // if (zoom < 400 / 1000) {
        //     vpt[4] = 200 - 1000 * zoom / 2;
        //     vpt[5] = 200 - 1000 * zoom / 2;
        // } else {
        //     if (vpt[4] >= 0) {
        //         vpt[4] = 0;
        //     } else if (vpt[4] < this.canvas.getWidth() - 1000 * zoom) {
        //         vpt[4] = this.canvas.getWidth() - 1000 * zoom;
        //     }
        //     if (vpt[5] >= 0) {
        //         vpt[5] = 0;
        //     } else if (vpt[5] < this.canvas.getHeight() - 1000 * zoom) {
        //         vpt[5] = this.canvas.getHeight() - 1000 * zoom;
        //     }
        // }
    },
    /*FIN-METODOS RELACIONADOS A LA LISTA DE OBJETOS CON EFECTSO DE ENTRADA (DRAWN Y DRAGGED)*/
    getSelectedAnimableObj:function(){
        let activeObj=this.canvas.getActiveObject();
        if(activeObj){
            return activeObj;
        }
    },
    /*objects creating and deleting*/
    /*
    * Creates and setup a completely new object
    * */

    getMousePositionInCanvas:function(){
        let self=this;
        let canvasRelativePosition={
            x:WindowManager.mouse.x-self.canvas._offset.left,
            y:WindowManager.mouse.y-self.canvas._offset.top
        }
        let invertMat=fabric.util.invertTransform(self.canvas.viewportTransform);

        return fabric.util.transformPoint(canvasRelativePosition,invertMat);
    },

    setCanvasOnAnimableObjects:function(){
        let listAnimObjs=ScenesManager.getCollection(global.EnumCollectionsNames.animObjs);
        for(let i=0;i<listAnimObjs.length;i++){
            listAnimObjs[i]._set('canvas', this.canvas);
            listAnimObjs[i].setCoords();
        }
        this.canvas.renderAll();
    },

    notifyOnObjSelectionUpdated:function(opt){
        MainMediator.notify(this.name,this.events.OnSelectionUpdated,[opt.target]);
    },
    notifyOnObjModified:function(opt){
        MainMediator.notify(this.name,this.events.OnObjModified,[opt.target]);
    },
    notificationOnResize:function(){//window resize
        this._setCanvasDimensions();
    },

    notificationScenesManageranimObjsItemAdded:function(args){
        let object=args[0];
        this.canvas.add(object);

    },
    notificationScenesManageranimObjsItemRemoved:function(args){
        let index=args[0];
        let object=args[1];
        this.canvas.remove(object);

    },
    notificationScenesManagerOnProjectCollectionsLoaded:function(args){
        let loadPendingData=args[0];
        this.setCanvasOnAnimableObjects();
    },

    notificationPanelPreviewerOnBtnClose:function(){
        this.setCanvasOnAnimableObjects();
    },

    childNotificationOnBringForward:function(animableObject){
        let index=ScenesManager.getObjectIndexInCollection(global.EnumCollectionsNames.animObjs,animableObject);
        this.canvas.bringForward(animableObject);
        MainMediator.notify(this.name,this.events.OnBtnMoveForward,[index]);

    },
    childNotificationOnBringBackward:function(animableObject){
        let index=ScenesManager.getObjectIndexInCollection(global.EnumCollectionsNames.animObjs,animableObject);
        this.canvas.sendBackwards(animableObject);
        MainMediator.notify(this.name,this.events.OnBtnMoveBackwards,[index]);

    },
    childNotificationOnDesignPathOptionClicked:function(currentSelectedObject){
        MainMediator.notify(this.name,this.events.OnDesignPathOptionClicked,[currentSelectedObject])
    },
}

var SectionFloatingMenu={
    HTMLElement:null,
    MODELOptions:[
        {
            icon:"icon-front",
            description:"Move forward",
            action:function(animableObject){
                CanvasManager.childNotificationOnBringForward(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-back",
            description:"Move backward",
            action:function (animableObject){
                CanvasManager.childNotificationOnBringBackward(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-bin",
            description:"Remove",
            action:function (){
                ScenesManager.removeActiveAnimableObject();
            },
            HTMLElement:null
        },
        {
            icon:"icon-settings",
            description:"Configure Object",
            action:function (animableObject){
                CanvasManager.SectionEntranceObjectConfiguration.showModal(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-edit",
            description:"design path for this object",
            action:function(animableObject){
                if(ScenesManager.AreAllAssetsReady()){
                    CanvasManager.childNotificationOnDesignPathOptionClicked(animableObject);
                }else{
                    alert("cannot perform this action while there are not ready images, please delete those images");
                    //TODO Show notification "cannot preview while images are not ready, please delete those images"
                }
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
        newOpt.className="canvas-animator__object__menu-options__option";
        newOpt.classList.add(model.icon);
        newOpt.style.width=40 +"px";
        newOpt.style.height=40 +"px";
        newOpt.addEventListener("click",this.OnOptionClicked.bind(this))
        newOpt.setAttribute("index",id);
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
                this.MODELOptions[i].HTMLElement.style.display="flex";
            }
        }
    },
    notificationCanvasManagerOnSelectionUpdated:function(){// and on canvas active Object deleted
        let activeAnimableObject=CanvasManager.getSelectedAnimableObj();
        if(!activeAnimableObject){this.hiddeMenu();return;}
        if(activeAnimableObject.type==="activeSelection"){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,0,0]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);
        }
        else if(activeAnimableObject.type==='ImageAnimable'){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,1,1]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);
        }else if(activeAnimableObject.type==="TextAnimable"){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,1,0]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);

        }else if(activeAnimableObject.type==="SVGAnimable"){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,1,1]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);
        }else if(activeAnimableObject.type==="ShapeAnimable"){
            this.lastAnimableObjectActive=activeAnimableObject;
            let positionInViewportCoords=this.lastAnimableObjectActive.getGlobalPosition();
            this.desableOptions([1,1,1,0,0]);
            this.showMenu(positionInViewportCoords.x, positionInViewportCoords.y);

        }
        else if(activeAnimableObject.type==="CameraAnimable"){
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
var SectionEntranceObjectConfiguration={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".canvas-animator__object-entrance-configuration__filter");
        this.HTMLAreaEntranceSettings=document.querySelector(".canvas-animator__object-entrance-configuration__entrance-settings")
        this.HTMLCollectionEntranceButtons=document.querySelectorAll(".canvas-animator__object-entrance-configuration__entrance-settings__box-buttons .entrance-button")
        this.HTMLCollectionModesAreas=document.querySelectorAll(".canvas-animator__object-entrance-configuration__entrance-settings__box-mode-settings__mode-options")

        let me=this;
        this.widgetsEntraceMode={
            modeSelector:{
                value:"",
                htmlElem:document.querySelector(".canvas-animator__object-entrance-configuration__entrance-settings__box-buttons"),
                initEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].addEventListener("click",this.OnTriggered.bind(this));}
                },
                removeEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].removeEventListener("click",this.OnTriggered.bind(this));}
                },
                OnTriggered:function(e){this.setVal(e.target.id);},
                setVal:function(normalizedEntranceModeName){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].classList.remove("active");}
                    let HTMLCollectionEntraceModesAreas=document.querySelectorAll(".canvas-animator__object-entrance-configuration__entrance-settings__box-mode-settings .mode-settings");
                    for(let i=0;i<this.htmlElem.children.length;i++){
                        if(this.htmlElem.children[i].id===normalizedEntranceModeName){
                            HTMLCollectionEntraceModesAreas[i].style.display="block";
                            this.value=normalizedEntranceModeName;
                        }else{HTMLCollectionEntraceModesAreas[i].style.display="none";}
                    }
                    this.htmlElem.querySelector("#" + normalizedEntranceModeName).classList.add("active");
                },
                getVal:function(){return this.value;},
            },
            drawn_showHand:{
                htmlElem:document.querySelector(".drawn-mode-widget__hand"),
                initEvent:function(){
                    this.htmlElem.style.display="flex";
                    this.htmlElem.querySelector("#checkbox-show-hand").addEventListener("change",this.OnTriggered.bind(this))},
                removeEvent:function(){
                    this.htmlElem.style.display="none";
                    this.htmlElem.querySelector("#checkbox-show-hand").removeEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(showBool){this.htmlElem.querySelector("#checkbox-show-hand").checked=showBool;},
                getVal:function(){return this.htmlElem.querySelector("#checkbox-show-hand").checked;}
            },
            drawn_finalDrawingAppearance:{
                value:"",
                htmlElem:document.querySelector(".drawn-mode-widget__resulting-drawing"),
                htmlOptions:document.querySelectorAll(".drawn-mode-widget__resulting-drawing .resulting-drawing-button"),
                initEvent:function(){
                    this.htmlElem.style.display="flex";
                    for(let i=0;i<this.htmlOptions.length;i++){this.htmlOptions[i].addEventListener("click",this.OnTriggered.bind(this));}
                },
                removeEvent:function(){
                    this.htmlElem.style.display="none";
                    for(let i=0;i<this.htmlOptions.length;i++){this.htmlOptions[i].removeEventListener("click",this.OnTriggered.bind(this));}
                },
                OnTriggered:function(e){
                    if(e.target.className==="tooltip"){return;}
                    this.setVal(e.target.id);
                },
                setVal:function(appearance){
                    this.value=appearance;
                    for(let i=0;i<this.htmlOptions.length;i++){
                        if(this.htmlOptions[i].id===appearance){
                            this.htmlOptions[i].classList.add("active");
                        }else{
                            this.htmlOptions[i].classList.remove("active");
                        }
                    }
                },
                getVal:function(){return this.value;}
            },
            drawn_fillRevealMode:{
                value:"",
                htmlElem:document.querySelector(".drawn-mode-widget__fill-reveal"),
                htmlOptions:document.querySelectorAll(".drawn-mode-widget__fill-reveal .fill-reveal-button"),
                initEvent:function(){
                    this.htmlElem.style.display="flex";
                    for(let i=0;i<this.htmlOptions.length;i++){this.htmlOptions[i].addEventListener("click",this.OnTriggered.bind(this));}
                },
                removeEvent:function(){
                    this.htmlElem.style.display="none";
                    for(let i=0;i<this.htmlOptions.length;i++){this.htmlOptions[i].removeEventListener("click",this.OnTriggered.bind(this));}
                },
                OnTriggered:function(e){
                    if(e.target.className==="tooltip"){return;}
                    this.setVal(e.target.id);
                },
                setVal:function(fillMode){
                    console.log(fillMode);
                    this.value=fillMode;
                    for(let i=0;i<this.htmlOptions.length;i++){
                        if(this.htmlOptions[i].id===fillMode){
                            this.htmlOptions[i].classList.add("active");
                        }else{
                            this.htmlOptions[i].classList.remove("active");
                        }
                    }
                },
                getVal:function(){return this.value;}
            },
            drawn_forceStrokeDrawing:{
                htmlElem:document.querySelector(".drawn-mode-widget__force-stroke-drawing"),
                initEvent:function(){
                    this.htmlElem.style.display="flex";
                    this.htmlElem.querySelector("#checkbox-force-stroke-drawing").addEventListener("change",this.OnTriggered.bind(this))},
                removeEvent:function(){
                    this.htmlElem.style.display="none";
                    this.htmlElem.querySelector("#checkbox-force-stroke-drawing").removeEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(showBool){this.htmlElem.querySelector("#checkbox-force-stroke-drawing").checked=showBool;},
                getVal:function(){return this.htmlElem.querySelector("#checkbox-force-stroke-drawing").checked;}
            },
            drawn_drawingHandName:{
                htmlElem:document.querySelector(".drawn-mode-widget__drawing-hand-name"),
                value:"",
                initEvent:function(){
                    this.htmlElem.style.display="flex";
                    this.htmlElem.querySelector(".current-drawing-hand-name").addEventListener("click",this.OnTriggered.bind(this))
                },
                removeEvent:function(){
                    this.htmlElem.style.display="flex";
                    this.htmlElem.querySelector(".current-drawing-hand-name").removeEventListener("click",this.OnTriggered.bind(this))
                },
                OnTriggered:function(e){
                    SectionSelectHand.showModal(this.value,this);
                },
                setVal:function(drawingHandName){
                    this.value=drawingHandName;
                    let currentDrawingHandElem=this.htmlElem.querySelector(".current-drawing-hand-name");
                    let newIcon=StaticResource.images.drawing_hands[drawingHandName].elem.cloneNode();
                    currentDrawingHandElem.replaceChild(newIcon,currentDrawingHandElem.children[0]);
                    },
                getVal:function(){return this.value},
                invokedModalConfirmed:function(modalName,value){
                    if(modalName==="SectionSelectHand"){
                        this.setVal(value);
                    }
                }
            }
        }



        this.HTMLcloseBtn=document.querySelector(".canvas-animator__object-entrance-configuration__btn-close");
        this.HTMLAcceptBtn=document.querySelector(".canvas-animator__object-entrance-configuration__footer .btn-accept")
        this.HTMLCancelBtn=document.querySelector(".canvas-animator__object-entrance-configuration__footer .btn-cancel")

        this.currentAnimableObject=null;
        this.currentSelectedOptions={};

        this.initEvents();

    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLCancelBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLAcceptBtn.addEventListener("click",this.OnBtnAcceptClicked.bind(this))

        //INIT WIDGETS
    },

    initEventsWidgetsEntranceModes:function(animableObject){
        this.widgetsEntraceMode["modeSelector"].initEvent();
        for(let i=0;i<animableObject.applicableEntranceModes.length;i++){
            let unnormalizedMode=animableObject.applicableEntranceModes[i]
            let normalizedMode=this.normalizeObjectEntraceMode(animableObject.applicableEntranceModes[i]);
            let entranceModeConfig=animableObject.entranceBehaviour.getEntranceModeConfigByName(unnormalizedMode);
            for(let key in entranceModeConfig){
                this.widgetsEntraceMode[normalizedMode + "_"+ key].initEvent();
            }
        }
    },
    removeEventsWidgetsEntranceModes:function (){
        for(let i in this.widgetsEntraceMode){
            this.widgetsEntraceMode[i].removeEvent();
        }
    },
    showModal:function(animableObject){
        if(animableObject){
            this.currentAnimableObject=animableObject;
            this.activateEntraceModeRadios(animableObject);

            this.initEventsWidgetsEntranceModes(animableObject);
            this.fillWidgetsEntranceMode(animableObject);

            this.HTMLElement.style.display="block";
        }
    },
    hiddeModel:function(){
        this.currentAnimableObject=null;
        this.currentSelectedOptions=null;
        this.HTMLElement.style.display="none";
    },
    fillWidgetsEntranceMode:function(animableObject){
        this.widgetsEntraceMode.modeSelector.setVal(this.normalizeObjectEntraceMode(animableObject.entranceBehaviour.getCurrentEntranceModeName()));
        //todo fill widgets by entrance mode
        for(let i=0;i<animableObject.applicableEntranceModes.length;i++){
            let unnormalizedMode=animableObject.applicableEntranceModes[i]
            let normalizedMode=this.normalizeObjectEntraceMode(animableObject.applicableEntranceModes[i]);
            let entranceModeConfig=animableObject.entranceBehaviour.getEntranceModeConfigByName(unnormalizedMode);
            for(let key in entranceModeConfig){
                let val=entranceModeConfig[key];
                this.widgetsEntraceMode[normalizedMode + "_"+ key].setVal(val);
            }
        }
    },
    activateEntraceModeRadios:function(animableObject){
        for(let i=0;i<this.HTMLCollectionEntranceButtons.length;i++) {
            this.HTMLCollectionEntranceButtons[i].style.display="none";
        }
        for(let i=0;i<animableObject.applicableEntranceModes.length;i++){
            let applicableEntraceMode=this.normalizeObjectEntraceMode(animableObject.applicableEntranceModes[i]);
            this.HTMLAreaEntranceSettings.querySelector("#" + applicableEntraceMode ).style.display="inline";
        }
    },

    OnBtnCloseClicked:function(){
        this.removeEventsWidgetsEntranceModes();
        this.hiddeModel();
    },
    /*SE PROCESA LA INFORMACION EDITADA*/
    OnBtnAcceptClicked:function(){
        if(this.currentAnimableObject){
            // entrace mode widgets processing
            let entranceModeChoosen= this.unnormalizeUIEntraceMode(this.widgetsEntraceMode.modeSelector.getVal());
            let entranceModeBefore=this.currentAnimableObject.entranceBehaviour.getCurrentEntranceModeName();
            if(entranceModeBefore !==entranceModeChoosen){
                this.currentAnimableObject.entranceBehaviour.setEntranceModeName(entranceModeChoosen);
                if(entranceModeChoosen===global.EntranceName.none && entranceModeBefore!==global.EntranceName.none){
                    ScenesManager.removeInstanceFromCollection(this.currentAnimableObject,global.EnumCollectionsNames.animObjsWithEntrance);
                }
                else if(entranceModeBefore===global.EntranceName.none && entranceModeChoosen!==global.EntranceName.none){
                    ScenesManager.addInstanceToCollection(this.currentAnimableObject,global.EnumCollectionsNames.animObjsWithEntrance);
                }
            }

            for(let i=0;i<this.currentAnimableObject.applicableEntranceModes.length;i++){
                let unnormalizedApplicapleMode=this.currentAnimableObject.applicableEntranceModes[i]
                let normalizedApplicableMode=this.normalizeObjectEntraceMode(this.currentAnimableObject.applicableEntranceModes[i]);
                let entranceModeConfig=this.currentAnimableObject.entranceBehaviour.getEntranceModeConfigByName(unnormalizedApplicapleMode);

                for(let key in entranceModeConfig){
                    let val=this.widgetsEntraceMode[normalizedApplicableMode + "_"+ key].getVal();
                    entranceModeConfig[key]=val;
                }
            }

        }

        this.removeEventsWidgetsEntranceModes();

        this.hiddeModel();
    },
    normalizeObjectEntraceMode:function(objectEntraceModeName){
        if(objectEntraceModeName===global.EntranceName.text_drawn ||
            objectEntraceModeName===global.EntranceName.image_drawn ||
            objectEntraceModeName===global.EntranceName.svg_drawn){return "drawn"}

        else if(objectEntraceModeName===global.EntranceName.text_typed){return 'typed'}
        else{return objectEntraceModeName.toLowerCase();}
    },
    unnormalizeUIEntraceMode:function(UIentraceModeName){
        if(UIentraceModeName==="drawn"){
            if(this.currentAnimableObject.type==="TextAnimable"){return global.EntranceName.text_drawn}
            else if(this.currentAnimableObject.type==="ImageAnimable"){return global.EntranceName.image_drawn}
            else if(this.currentAnimableObject.type==="SVGAnimable"){return global.EntranceName.svg_drawn}

        }else if(UIentraceModeName==='typed'){
            return global.EntranceName.text_typed;
        }
        return Utils.capitalize(UIentraceModeName);

    },

};

let SectionSelectHand={
    name:'SectionSelectHand',
    init:function(){
        this.HTMLElement=document.querySelector(".canvas-animator__object-drawing-hand__filter");
        this.HTMLcloseBtn=document.querySelector(".canvas-animator__object-drawing-hand__btn-close");
        this.HTMLAcceptBtn=document.querySelector(".canvas-animator__object-drawing-hand__footer .btn-accept")
        this.HTMLCancelBtn=document.querySelector(".canvas-animator__object-drawing-hand__footer .btn-cancel")

        this.invoker=null;
        this.currentSelectedOption="";

        this.initEvents();

    },
    initHTML:function(){
        let boxContainer=this.HTMLElement.querySelector(".box-drawing-hands")
        for(let image in StaticResource.images.drawing_hands){
            console.log("adsfasdfasd");
            let div=document.createElement("div");
            let icon=StaticResource.images.drawing_hands[image].elem.cloneNode();
            icon.className="drawing-hand-item__icon";

            div.classList.add("drawing-hand-item");
            div.classList.add("button-solid-behaviour");
            div.setAttribute("data",StaticResource.images.drawing_hands[image].name);

            div.addEventListener("click",this.OnDrawingHandItemClicked.bind(this))

            div.appendChild(icon);
            boxContainer.appendChild(div);
        }
    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLCancelBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLAcceptBtn.addEventListener("click",this.OnBtnAcceptClicked.bind(this))

        MainMediator.registerObserver(WindowManager.name,WindowManager.events.OnUILoaded,this);
        //INIT WIDGETS
    },
    clearActivenessHTMLAllItems:function(){
        let boxContainer=this.HTMLElement.querySelector(".box-drawing-hands")
        for(let i=0;i<boxContainer.children.length;i++){
            boxContainer.children[i].classList.remove("active");
        }
    },
    activateHTMLItem:function(drawingHandName){
        this.HTMLElement.querySelectorAll('[data=' + drawingHandName + "]")[0].classList.add("active");
    },
    OnDrawingHandItemClicked:function(e){
        this.clearActivenessHTMLAllItems();
        this.currentSelectedOption=e.target.getAttribute("data");
        this.activateHTMLItem(this.currentSelectedOption);
    },
    OnBtnCloseClicked:function(){
        this.hiddeModel();
    },
    /*SE PROCESA LA INFORMACION EDITADA*/
    OnBtnAcceptClicked:function(){
        this.invoker.invokedModalConfirmed(this.name,this.currentSelectedOption);
        this.hiddeModel();
    },
    hiddeModel:function(){
        this.currentAnimableObject=null;
        this.currentSelectedOptions="";
        this.HTMLElement.style.display="none";
    },
    showModal:function(animableDrawingHandName,invoker){
        if(CanvasManager.getSelectedAnimableObj()){
            this.invoker=invoker;
            this.currentSelectedOption=animableDrawingHandName;
            this.clearActivenessHTMLAllItems();
            this.activateHTMLItem(this.currentSelectedOption);

            this.HTMLElement.style.display="block";
        }
    },
    notificationWindowManagerOnUILoaded:function(){
        this.initHTML();
    }
}

























