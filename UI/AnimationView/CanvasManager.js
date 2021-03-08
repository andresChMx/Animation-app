var CanvasManager={
    name:'CanvasManager',
    events:{
        OnSelectionUpdated:'OnSelectionUpdated',// cuando se crea, oculta o cambia a otro objeto

        OnObjAddedToListWithEntrance:'OnObjAddedToListWithEntrance',//cuando se agrego o elimina un elemento de la lista listAnimableObjectsWithEntraces
        OnAnimableObjectAdded:'OnAnimableObjectAdded',
        OnShapeAnimableAdded:"OnShapeAnimableAdded",
        OnObjDeletedFromListWidthEntraces:'OnObjDeletedFromListWidthEntraces', // cuando se elimina un objeto del canvas (entonces de las dos listas)
        OnAnimableObjectDeleted:'OnAnimableObjectDeleted',
        OnShapeAnimableDeleted:'OnShapeAnimableDeleted',

        OnObjModified:'OnObjModified',

        OnDesignPathOptionClicked:'OnDesignPathOptionClicked',
    },
    HTMLElement:null,
    canvas:null,
    listAnimableObjects:[],//(SII QUE LA TIENE)NO TIENE UNA RAZON DE SER CLARA PERO SE ESPERA QUE CUANDO DENGAMOS QUE HACER ALGO EN LOS ELEMENTOS ANIMABLES, NO TENGMOS QUE RECORRER TODOS LOS ELEMENTOS DEL CANVAS, sino solo lso animables, ademas son los que se muestran en el objects editor
    listAnimableObjectsWithEntrance:[],// este es un subconjunto de la lista de arriba
    listClipableAnimableObjects:[],
    camera:null,

    SectionFloatingMenu:null,

    listNotReadyAnimableObjects:[], //holds images and svgs that are loading or failed loading
    init:function(){
        this.SectionFloatingMenu=SectionFloatingMenu;
        this.SectionEntranceObjectConfiguration=SectionEntranceObjectConfiguration;
        this.SectionFloatingMenu.init();
        this.SectionEntranceObjectConfiguration.init();

        this.HTMLElement=document.querySelector(".canvas-animator");
        this.boundingClientRect=this.HTMLElement.getBoundingClientRect();

        MainMediator.registerObserver(WindowManager.name,WindowManager.events.OnUILoaded,this);

        this.initCanvas();

        this.panningAndZoomBehaviour();

        this.initEvents();
    },
    notificationWindowManagerOnUILoaded:function(){//PARA EMISION DE EVENTOS DEBEMOS ESPERAR QUE TODOS ESTEN LISTOS
        this.initCamera();
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
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnDurationInput,this);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this)
        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnMoveUpObjectEntranceOrder,this);
        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnMoveDownObjectEntranceOrder,this);


        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDummyDraggingEnded,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnTextAssetDraggableDropped,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnShapeAssetDraggableDropped,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageURLLoaded,this);
        WindowManager.registerObserverOnResize(this);
        WindowManager.registerOnKeyDeletePressed(this);
        },
    initCamera:function(){
        let cameraImage=new Image();
        cameraImage.src=RUTES.assets_images + "camera.svg";
        cameraImage.onload=function(){
            this.camera=new CameraAnimable(cameraImage,{
                left:0,
                top:0,
                width:1400,
                height:800,
            });
            this.listAnimableObjects.push(this.camera);
            this.canvas.add(this.camera);
            this.notifyOnAnimableObjectAdded.bind(this)(this.camera);
        }.bind(this);

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
    createAnimableObject:function(model,type="ImageAnimable",thumbnail=null){
        let self=this;
        let initPoint=this.objectInitializationPosition();
        if(type==="ImageAnimable"){
                let animObj=new ImageAnimable({
                    "left":initPoint.x,
                    "top":initPoint.y,
                    "imageAssetModel":model,
                    //"thumbnailImage":thumbnail
                })
                animObj.setCoords();

                this.listNotReadyAnimableObjects.push(animObj);
                animObj.registerOnImageStateChanged(this);

                this.listAnimableObjects.push(animObj);
                this.listAnimableObjectsWithEntrance.push(animObj);
                this.canvas.add(animObj);
                this.notifyOnObjAddedToListObjectsWithEntrance.bind(self)(animObj);
                this.notifyOnAnimableObjectAdded.bind(self)(animObj);

             // por defecto las imagenes tendran entrada siendo dibujadas, por eso tambien lo agregamos al arreglo del a siguiente linea
        }else if(type==="SVGAnimable"){
            let animObj=new SVGAnimable({
                "left":initPoint.x,
                "top":initPoint.y,
                "imageAssetModel":model,
                //"thumbnailImage":StaticResource.images.loading
            });
            animObj.setCoords();

            this.listNotReadyAnimableObjects.push(animObj);
            animObj.registerOnImageStateChanged(this);

            this.listAnimableObjects.push(animObj);
            this.listAnimableObjectsWithEntrance.push(animObj);
            this.canvas.add(animObj);
            this.notifyOnObjAddedToListObjectsWithEntrance.bind(self)(animObj);
            this.notifyOnAnimableObjectAdded.bind(self)(animObj);

        }else if(type==="ShapeAnimable"){
            fabric.loadSVGFromString(model.data,function(objects, options){
                var groupObj = fabric.util.groupSVGElements(objects, options);
                //let path=groupObj;// TODO: if more than 1 path fuse them into one
                let shapeAnimable=null;
                if(groupObj.type==="path"){
                    shapeAnimable=new ShapeAnimable(groupObj.path,{
                        "left":initPoint.x,
                        "top":initPoint.y,
                    })
                }else if(groupObj.type==="circle"){
                    shapeAnimable=new CircleShapeAnimable({
                        "left":initPoint.x,
                        "top":initPoint.y,
                    });
                }else if(groupObj.type==="rect"){
                    shapeAnimable=new RectShapeAnimable({
                        "left":initPoint.x,
                        "top":initPoint.y,
                    })
                }else if(groupObj.type==="polygon"){
                    let pathStr="";
                    let x=0;
                    let y=0;
                    for(let j=0;j<groupObj.points.length;j++){
                        x=groupObj.points[j].x;
                        y=groupObj.points[j].y;
                        if(j===0){
                            pathStr+="M " +x + " " + y + " ";
                        }else{
                            pathStr+="L " +x + " " + y + " ";
                        }
                    }
                    //solucion bug con estrella, al parecer la longitud de la recta generada por comando "z" no es contada como longitud total de stroke de un shape
                    x=groupObj.points[0].x;
                    y=groupObj.points[0].y;
                    pathStr+="L " +x + " " + y + " ";

                    shapeAnimable=new ShapeAnimable(pathStr,{
                        "left":initPoint.x,
                        "top":initPoint.y,
                    })
                    shapeAnimable.pathOffset={x:groupObj.pathOffset.x,y:groupObj.pathOffset.y}
                }

                shapeAnimable.setCoords();
                self.listAnimableObjects.push(shapeAnimable);
                self.listClipableAnimableObjects.push(shapeAnimable);
                self.canvas.add(shapeAnimable);
                self.notifyOnShapeAnimableObjectAdded.bind(self)(shapeAnimable);
                self.notifyOnAnimableObjectAdded.bind(self)(shapeAnimable);
            })
        }
        else{ //(type==="TextAnimable")
            let animObj=new TextAnimable("Sample Text",{
                "left":initPoint.x,
                "top":initPoint.y,
                "fontFamily":model.fontFamily,
                //"thumbnailImage":StaticResource.images.textThumbnail
            })
            //textos tambien tendran entrada siendo dibujados
            animObj.setCoords();
            animObj.exitEditing();
            self.listAnimableObjects.push(animObj);
            self.listAnimableObjectsWithEntrance.push(animObj);
            self.canvas.add(animObj);
            self.notifyOnObjAddedToListObjectsWithEntrance.bind(this)(animObj);
            self.notifyOnAnimableObjectAdded.bind(self)(animObj);
        }
    },
    objectInitializationPosition:function(){
        let self=this;

        let canvasRelativePosition={
            x:WindowManager.mouse.x-self.canvas._offset.left,
            y:WindowManager.mouse.y-self.canvas._offset.top
        }
        let invertMat=fabric.util.invertTransform(self.canvas.viewportTransform);

        return fabric.util.transformPoint(canvasRelativePosition,invertMat);
    },
    moveUpObjectInEntranceList:function(index){
        if(index>0){
            let tmp=this.listAnimableObjectsWithEntrance[index];
            this.listAnimableObjectsWithEntrance[index]=this.listAnimableObjectsWithEntrance[index-1];
            this.listAnimableObjectsWithEntrance[index-1]=tmp;
        }
    },
    moveDownObjectInEntranceList:function(index){
        if(index<this.listAnimableObjectsWithEntrance.length-1){
            let tmp=this.listAnimableObjectsWithEntrance[index];
            this.listAnimableObjectsWithEntrance[index]=this.listAnimableObjectsWithEntrance[index+1];
            this.listAnimableObjectsWithEntrance[index+1]=tmp;
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
                this._removeAnimableObject(object);
            }
        }
    },
    _removeAnimableObject:function(object){
        let indexInMainList=this.listAnimableObjects.indexOf(object);
        let indexInObjsWithEntrance=this.listAnimableObjectsWithEntrance.indexOf(object);
        let indexInShapeObjsList=this.listClipableAnimableObjects.indexOf(object);
        let indexInNotReadyList=this.listNotReadyAnimableObjects.indexOf(object);

        if(indexInNotReadyList!==-1){
            this.listNotReadyAnimableObjects.splice(indexInNotReadyList,1);
        }

        if(indexInMainList!==-1){
            this.listAnimableObjects.splice(indexInMainList,1);
        }
        if(indexInObjsWithEntrance!==-1){
            this.listAnimableObjectsWithEntrance.splice(indexInObjsWithEntrance,1);
            this.notifyOnObjDeletedFromListWithEntrance(indexInObjsWithEntrance);
        }
        if(indexInShapeObjsList!==-1){
            this.listClipableAnimableObjects.splice(indexInShapeObjsList,1);
            this.notifyOnShapeAnimableDeleted(indexInShapeObjsList);
        }
        this.canvas.remove(object);
        this.notifyOnAnimableObjectDeleted(indexInMainList);
    },
    AreAllImagesReady:function(){
        return this.listNotReadyAnimableObjects.length===0;
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
    notifyOnShapeAnimableObjectAdded:function(animObj){
        MainMediator.notify(this.name,this.events.OnShapeAnimableAdded,[animObj]);
    },
    notifyOnAnimableObjectAdded:function(animObj){
        MainMediator.notify(this.name,this.events.OnAnimableObjectAdded,[animObj]);
    },
    notifyOnAnimableObjectDeleted:function(indexInAnimableObjectsList){
        MainMediator.notify(this.name,this.events.OnAnimableObjectDeleted,[indexInAnimableObjectsList]);
    },
    /*Object deleted from every where*/
    notifyOnObjDeletedFromListWithEntrance:function(indexInObjsWithEntrance){
        MainMediator.notify(this.name,this.events.OnObjDeletedFromListWidthEntraces,[indexInObjsWithEntrance]);
    },
    notifyOnShapeAnimableDeleted:function(indexInShapeAnimableList){
        MainMediator.notify(this.name,this.events.OnShapeAnimableDeleted,[indexInShapeAnimableList]);
    },

    notifyOnObjSelectionUpdated:function(opt){
        MainMediator.notify(this.name,this.events.OnSelectionUpdated,[opt.target]);
    },
    notifyOnObjModified:function(opt){
        MainMediator.notify(this.name,this.events.OnObjModified,[opt.target]);
    },
    notificationOnKeyDeleteUp:function(){
        this.removeActiveAnimableObject()
    },
    notificationOnResize:function(){//window resize
        this._setCanvasDimensions();
    },
    childNotificationOnDesignPathOptionClicked:function(currentSelectedObject){
        MainMediator.notify(this.name,this.events.OnDesignPathOptionClicked,[currentSelectedObject])
    },
    /*child*/notificationOnImageStateChanged:function(imageAnimable){/*naming convention exception, this could be considered as called by children, since it is being called by imageAnimables and svgAniambles*/
        if(imageAnimable.imageLoadingState===EnumAnimableLoadingState.ready){
            let index=this.listNotReadyAnimableObjects.indexOf(imageAnimable);
            if(index!==-1){
                this.listNotReadyAnimableObjects.splice(index,1);
            }
        }
    },

    notificationPanelInspectorOnBtnMoveDownObjectEntranceOrder:function(args){
        let index=args[0];
        this.moveDownObjectInEntranceList(index);
    },
    notificationPanelInspectorOnBtnMoveUpObjectEntranceOrder:function(args){
        let index=args[0];
        this.moveUpObjectInEntranceList(index);
    },
    notificationPanelAssetsOnImageAssetDummyDraggingEnded:function(args){
        let model=args[0];
        let thumbnail=args[1]
        this.createAnimableObject(model,"ImageAnimable",thumbnail);
    },
    notificationPanelAssetsOnTextAssetDraggableDropped:function(args){
        let fontFamily=args[0];
        let model={fontFamily:fontFamily}
        this.createAnimableObject(model,"TextAnimable")
    },
    notificationPanelAssetsOnShapeAssetDraggableDropped:function(args){
        let model=args[0];
        this.createAnimableObject(model,"ShapeAnimable");
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
                CanvasManager.SectionEntranceObjectConfiguration.showModal(animableObject);
            },
            HTMLElement:null
        },
        {
            icon:"icon-edit",
            description:"design path for this object",
            action:function(animableObject){
                if(CanvasManager.AreAllImagesReady()){
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
        }



        this.HTMLcloseBtn=document.querySelector(".canvas-animator__object-entrance-configuration__btn-close");
        this.HTMLAcceptBtn=document.querySelector(".canvas-animator__object-entrance-configuration__footer .btn-accept")

        this.currentAnimableObject=null;
        this.currentSelectedOptions={};

        this.initEvents();

    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));

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
            console.log(applicableEntraceMode);
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
                if(entranceModeChoosen===EntranceName.none && entranceModeBefore!==EntranceName.none){
                    CanvasManager.removeFromListObjectsWithEntrance(this.currentAnimableObject);
                }
                else if(entranceModeBefore===EntranceName.none && entranceModeChoosen!==EntranceName.none){
                    CanvasManager.addItemToListObjectsWithEntrance(this.currentAnimableObject);
                }
                this.currentAnimableObject.entranceBehaviour.setEntranceModeName(entranceModeChoosen);
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
        if(objectEntraceModeName===EntranceName.text_drawn ||
            objectEntraceModeName===EntranceName.image_drawn ||
            objectEntraceModeName===EntranceName.svg_drawn){return "drawn"}

        else if(objectEntraceModeName===EntranceName.text_typed){return 'typed'}
        else{return objectEntraceModeName.toLowerCase();}
    },
    unnormalizeUIEntraceMode:function(UIentraceModeName){
        if(UIentraceModeName==="drawn"){
            if(this.currentAnimableObject.type==="TextAnimable"){return EntranceName.text_drawn}
            else if(this.currentAnimableObject.type==="ImageAnimable"){return EntranceName.image_drawn}
            else if(this.currentAnimableObject.type==="SVGAnimable"){return EntranceName.svg_drawn}

        }else if(UIentraceModeName==='typed'){
            return EntranceName.text_typed;
        }
        return Utils.capitalize(UIentraceModeName);

    }
};

























