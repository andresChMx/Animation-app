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

        //PanelInspector.SectionLanesEditor.registerOnFieldInput(this);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this)
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnFieldPropertyInput,this);
        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnTextOptionClicked,this);

        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDummyDraggingEnded,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnTextAssetDraggableDropped,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageURLLoaded,this);
        WindowManager.registerOnKeyDeletePressed(this);
        },
    initCamera:function(){
        fabric.Image.fromURLCustom("https://res.cloudinary.com/djtqhafqe/image/upload/v1612398280/ooatfbhhb8is66s3d9i0.svg",function(animCamera){
            this.camera=animCamera;
            this.listAnimableObjects.push(animCamera);
            this.canvas.add(animCamera);
            this.notifyOnAnimableObjectAdded.bind(this)(animCamera);
        }.bind(this),{
            left:0,
            top:0,
            width:1400,
            height:800,
            imageDrawingData:{url_thumbnail:'http..',id:"",userid:"",imgHigh:""}
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
        let activeObj=this.canvas.getActiveObject();
        if(activeObj){
            return activeObj;
        }
        // if(activeObj && (activeObj.type==="ImageAnimable" || activeObj.type==="CameraAnimable" || activeObj.type==="TextAnimable")){
        //     return activeObj
        // }else{
        //     return null;
        // }

    },
    createAnimableObject:function(model,type="ImageAnimable"){
        let self=this;

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
        if(type==="ImageAnimable"){
            let lowImage=new Image();
            let highImage=new Image();
            lowImage.crossOrigin="anonymous";
            highImage.crossOrigin="anonymous";
            let tmpCount=0;
            if(model.url_thumbnail===model.url_image){
                highImage.onload=function(){lowImage=highImage;imgsReady();}
                highImage.src=model.url_image;
            }else{
                lowImage.onload=function(){tmpCount++;if(tmpCount===2){imgsReady()}}
                highImage.onload=function(){tmpCount++;if(tmpCount===2){imgsReady()}}

                lowImage.src=model.url_thumbnail;
                highImage.src=model.url_image;
            }
            function imgsReady(){
                let animObj=new ImageAnimable(highImage,{
                    "left":WindowManager.mouse.x-self.canvas._offset.left,
                    "top":WindowManager.mouse.y-self.canvas._offset.top,
                    "imageAssetModel":model,
                    "imgHighDefinition":highImage,
                    "imgLowDefinition":lowImage,
                })
                animObj.setCoords();
                self.listAnimableObjects.push(animObj);
                self.listAnimableObjectsWithEntrance.push(animObj);
                self.canvas.add(animObj);
                self.notifyOnObjAddedToListObjectsWithEntrance.bind(self)(animObj);
                self.notifyOnAnimableObjectAdded.bind(self)(animObj);
            }


             // por defecto las imagenes tendran entrada siendo dibujadas, por eso tambien lo agregamos al arreglo del a siguiente linea
        }else if(type==="SVGAnimable"){
            let animObj=new SVGAnimable({
                "left":WindowManager.mouse.x-self.canvas._offset.left,
                "top":WindowManager.mouse.y-self.canvas._offset.top,
                "imageAssetModel":model,
            },function (){
                animObj.setCoords();
                self.listAnimableObjects.push(animObj);
                self.listAnimableObjectsWithEntrance.push(animObj);
                self.canvas.add(animObj);
                self.notifyOnObjAddedToListObjectsWithEntrance.bind(self)(animObj);
                self.notifyOnAnimableObjectAdded.bind(self)(animObj);
            });

        } else{ //(type==="TextAnimable")
            let animObj=new TextAnimable("asdfasdfasdf",{
                "left":100,
                "top":100,
                "originX":"custom",
                "originY":"custom",
                //"imageDrawingData":model,
                "fontFamily":model.fontFamily,
                "name":"Object X",
            })
            animObj.setEntranceMode(EntranceModes.text_drawn); //textos tambien tendran entrada siendo dibujados

            animObj.setCoords();
            self.listAnimableObjects.push(animObj);
            self.listAnimableObjectsWithEntrance.push(animObj);
            self.canvas.add(animObj);
            self.notifyOnObjAddedToListObjectsWithEntrance.bind(this)(animObj);
            self.notifyOnAnimableObjectAdded.bind(self)(animObj);
        }
    },
    createAnimableText:function(){

    },
    removeActiveAnimableObject:function(){
        let activeAnimableObject=this.getSelectedAnimableObj();
        if(activeAnimableObject){
            let listObjects;
            if(activeAnimableObject.type==="activeSelection"){listObjects=activeAnimableObject.getObjects();}
            else{listObjects=[activeAnimableObject]}
            this.canvas.discardActiveObject();
            for(let i=0;i<listObjects.length;i++){
                let object=listObjects[i];

                let indexInMainList=this.listAnimableObjects.indexOf(object);
                let indexInObjsWithEntrance=this.listAnimableObjectsWithEntrance.indexOf(object);
                if(indexInMainList!==-1){
                    this.listAnimableObjects.splice(indexInMainList,1);
                }
                if(indexInObjsWithEntrance!==-1){
                    this.listAnimableObjectsWithEntrance.splice(indexInObjsWithEntrance,1);
                    this.notifyOnObjDeletedFromListWithEntrance(indexInObjsWithEntrance);
                }
                this.canvas.remove(object);
                this.notifyOnAnimableObjectDeleted(indexInMainList);
            }

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
        MainMediator.notify(this.name,this.events.OnDesignPathOptionClicked,[currentSelectedObject])
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
    notificationPanelAssetsOnTextAssetDraggableDropped:function(args){
        let fontFamily=args[0];
        let model={fontFamily:fontFamily}
        this.createAnimableObject(model,"TextAnimable")
    },
    notificationPanelAssetsOnImageURLLoaded:function(args){
      let url=args[0];
      let model={id:"1",url_thumbnail:url,url_image:url,user_id:"",category:"",name:""};
      if(Utils.isSVG(url)){
        this.createAnimableObject(model,"SVGAnimable");
      }else{
        this.createAnimableObject(model);
      }
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
            icon:"icon-front",
            description:"Move forward",
            action:function(animableObject){
                CanvasManager.canvas.bringForward(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-back",
            description:"Move backward",
            action:function (animableObject){
                CanvasManager.canvas.sendBackwards(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-bin",
            description:"Remove",
            action:function (){
                CanvasManager.removeActiveAnimableObject();
            },
            HTMLElement:null
        },
        {
            icon:"icon-settings",
            description:"Configure Object",
            action:function (animableObject){
                CanvasManager.SectionConfigureObject.showModal(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-edit",
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
var SectionConfigureObject={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".canvas-animator__object-configuration__filter");
        this.HTMLAreaEntranceSettings=document.querySelector(".canvas-animator__object-configuration__entrance-settings")
        this.HTMLCollectionEntranceButtons=document.querySelectorAll(".canvas-animator__object-configuration__entrance-settings__box-buttons .entrance-button")
        this.HTMLCollectionModesAreas=document.querySelectorAll(".canvas-animator__object-configuration__entrance-settings__box-mode-settings__mode-options")

        this.HTMLCollectionObjectAppearanceAreas=document.querySelectorAll(".canvas-animator__object-configuration__appearance-settings__box-options__object-type-options");
        this.widgetsEntraceMode={
            modeSelector:{
                value:"",
                htmlElem:document.querySelector(".canvas-animator__object-configuration__entrance-settings__box-buttons"),
                initEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].addEventListener("click",this.OnTriggered.bind(this));}
                },
                removeEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].removeEventListener("click",this.OnTriggered.bind(this));}
                },
                OnTriggered:function(e){console.log(e.target);this.setVal(e.target.id);},
                setVal:function(normalizedEntranceModeName){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].classList.remove("active");}
                    let HTMLCollectionEntraceModesAreas=document.querySelectorAll(".canvas-animator__object-configuration__entrance-settings__box-mode-settings .mode-settings");
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
                htmlElem:document.querySelector(".drawn-mode-widget__resulting-drawing"),
                initEvent:function(){this.htmlElem.querySelector("#checkbox-show-hand").addEventListener("change",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.querySelector("#checkbox-show-hand").removeEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){},
                setVal:function(showBool){this.htmlElem.querySelector("#checkbox-show-hand").checked=showBool;},
                getVal:function(){return this.htmlElem.querySelector("#checkbox-show-hand").checked;}
            },
            drawn_finalDrawingAppearance:{
                value:"",
                htmlElem:document.querySelector(".drawn-mode-widget__resulting-drawing .box-resulting-drawing-buttons"),
                initEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].addEventListener("click",this.OnTriggered.bind(this));}
                },
                removeEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].removeEventListener("click",this.OnTriggered.bind(this));}
                },
                OnTriggered:function(e){
                    if(e.target.className==="tooltip"){return;}
                    this.setVal(e.target.id);
                },
                setVal:function(appearance){
                    this.value=appearance;
                    for(let i=0;i<this.htmlElem.children.length;i++){
                        if(this.htmlElem.children[i].id===appearance){
                            this.htmlElem.children[i].classList.add("active");
                        }else{
                            this.htmlElem.children[i].classList.remove("active");
                        }
                    }
                },
                getVal:function(){return this.value;}
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
                htmlElem:document.querySelector(".ImageAnimable-widged__font-size .property-input"),
                val:0,
                initEvent:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnTriggered.bind(this))
                    this.htmlElem.children[1].addEventListener("input",this.OnTriggered.bind(this))
                    this.htmlElem.children[2].addEventListener("click",this.OnTriggered.bind(this))
                },
                removeEvent:function(){
                    this.htmlElem.children[0].removeEventListener("click",this.OnTriggered.bind(this))
                    this.htmlElem.children[1].removeEventListener("input",this.OnTriggered.bind(this))
                    this.htmlElem.children[2].removeEventListener("click",this.OnTriggered.bind(this))
                },
                OnTriggered:function(e){
                    if(e.target.className==="btn-decrease"){this.setVal(this.val-5)}
                    else if(e.target.className==="btn-increase"){this.setVal(this.val+5)}
                    else{
                        if(isNaN(parseInt(e.target.value))){this.setVal(this.val);}
                        else{this.setVal(e.target.value)}
                    }
                },
                setVal:function(val){
                    val=val<0?0:val;
                    val=parseInt(val);this.val=val;this.htmlElem.children[1].value=val},
                getVal:function(){return this.val},
                },
            lineHeight:{
                htmlElem:document.querySelector(".ImageAnimable-widged__line-height .property-input"),
                initEvent:function(){
                    this.htmlElem.children[0].addEventListener("click",this.OnTriggered.bind(this))
                    this.htmlElem.children[1].addEventListener("input",this.OnTriggered.bind(this))
                    this.htmlElem.children[2].addEventListener("click",this.OnTriggered.bind(this))
                },
                removeEvent:function(){
                    this.htmlElem.children[0].removeEventListener("click",this.OnTriggered.bind(this))
                    this.htmlElem.children[1].removeEventListener("input",this.OnTriggered.bind(this))
                    this.htmlElem.children[2].removeEventListener("click",this.OnTriggered.bind(this))
                },
                OnTriggered:function(e){
                    if(e.target.className==="btn-decrease"){this.setVal(this.val-0.05)}
                    else if(e.target.className==="btn-increase"){this.setVal(this.val+0.05)}
                    else{
                        if(isNaN(parseFloat(e.target.value))){this.setVal(this.val);}
                        else{this.setVal(e.target.value)}
                    }
                },
                setVal:function(val){val=parseFloat(val);
                val=val<0?0:val;
                val=Math.round(val * 100) / 100;
                this.val=val;this.htmlElem.children[1].value=val},
                getVal:function(){return this.val;},
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
        this.HTMLAcceptBtn=document.querySelector(".canvas-animator__object-configuration__footer .btn-accept")

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
        for(let i in this.widgetsEntraceMode){
            this.widgetsEntraceMode[i].initEvent();
        }
    },
    removeEventsWidgetsEntranceModes:function (){
        for(let i in this.widgetsEntraceMode){
            this.widgetsEntraceMode[i].removeEvent();
        }
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
        for(let i=0;i<animableObject.applicableEntrenceModes.length;i++){
            let unnormalizedMode=animableObject.applicableEntrenceModes[i]
            let normalizedMode=this.normalizeObjectEntraceMode(animableObject.applicableEntrenceModes[i]);
            for(let key in animableObject.entraceModesSettings[unnormalizedMode]){
                let val=animableObject.entraceModesSettings[unnormalizedMode][key];
                this.widgetsEntraceMode[normalizedMode + "_"+ key].setVal(val);
            }
        }
    },
    fillWidgetsObjectAppareanceTextAnimable:function(animableObject){
        this.widgetsTextAnimableObjectAppareance.fontFamily.setVal(animableObject.fontFamily);
        this.widgetsTextAnimableObjectAppareance.textAlign.setVal(animableObject.textAlign);
        this.widgetsTextAnimableObjectAppareance.fontSize.setVal(animableObject.fontSize);
        this.widgetsTextAnimableObjectAppareance.lineHeight.setVal(animableObject.lineHeight);
        this.widgetsTextAnimableObjectAppareance.fillColor.setVal(animableObject.fill);
    },
    activateEntraceModeRadios:function(animableObject){
        for(let i=0;i<this.HTMLCollectionEntranceButtons.length;i++) {
            this.HTMLCollectionEntranceButtons[i].style.display="none";
        }
        for(let i=0;i<animableObject.applicableEntrenceModes.length;i++){
            let applicableEntraceMode=this.normalizeObjectEntraceMode(animableObject.applicableEntrenceModes[i]);
            this.HTMLAreaEntranceSettings.querySelector("#" + applicableEntraceMode ).style.display="inline";
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

            for(let i=0;i<this.currentAnimableObject.applicableEntrenceModes.length;i++){
                let unnormalizedApplicapleMode=this.currentAnimableObject.applicableEntrenceModes[i]
                let normalizedApplicableMode=this.normalizeObjectEntraceMode(this.currentAnimableObject.applicableEntrenceModes[i]);
                for(let key in this.currentAnimableObject.entraceModesSettings[unnormalizedApplicapleMode]){
                    let val=this.widgetsEntraceMode[normalizedApplicableMode + "_"+ key].getVal();
                    console.log(val);
                    this.currentAnimableObject.entraceModesSettings[unnormalizedApplicapleMode][key]=val;
                }
            }
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

























