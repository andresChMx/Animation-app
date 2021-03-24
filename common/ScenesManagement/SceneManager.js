let ScenesManager={
    name:"ScenesManager",
    events:{
        animObjsItemAdded:"animObjsItemAdded",
        animObjsItemRemoved:"animObjsItemRemoved",
        animObjsWithEntranceItemAdded:"animObjsWithEntranceItemAdded",
        animObjsWithEntranceItemRemoved:"animObjsWithEntranceItemRemoved",
        animObjsClippersItemAdded:"animObjsClippersItemAdded",
        animObjsClippersItemRemoved:"animObjsClippersItemRemoved",
        animObjsNotReadyItemAdded:"animObjsNotReadyItemAdded",
        animObjsNotReadyItemRemoved:"animObjsNotReadyItemRemoved",

        animObjsItemsSwapped:"animObjsItemsSwapped",
        animObjsWithEntranceItemsSwapped:"animObjsWithEntranceItemsSwapped",
        animObjsClippersItemsSwapped:"animObjsClippersItemsSwapped",
        animObjsNotReadyItemsSwapped:"animObjsNotReadyItemsSwapped",

        OnProjectCollectionsLoaded:'OnProjectCollectionsLoaded',

    },
    init:function(){
        this.sceneList=new ScenesList(this);
        //Importante inicializar listas antes que carge la UI
        this.addFirstScene();

        this.projectPersistance=new ProjectPersistance(this.sceneList);
        this.projectPersistance.registerOnProjectLoaded(this);


        MainMediator.registerObserver(WindowManager.name,WindowManager.events.OnUILoaded,this);

        MainMediator.registerObserver(PanelConfig.name,PanelConfig.events.OnDimensionsChanged,this);

        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDummyDraggingEnded,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnTextAssetDraggableDropped,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnShapeAssetDraggableDropped,this);
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageURLLoaded,this);

        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnMoveUpObjectEntranceOrder,this);
        MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnBtnMoveDownObjectEntranceOrder,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnBtnMoveBackwards,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnBtnMoveForward,this);

        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this)

        //this class is the exception in that it will be suscribed to itself
    },
    //fucntions called from from scenes objects (children)
    onSceneItemAdded:function(collectionName,obj){
        MainMediator.notify(this.name,collectionName+"ItemAdded",[obj]);
    },
    onSceneItemRemoved:function(collectionName,index,obj){
        MainMediator.notify(this.name,collectionName+"ItemRemoved",[index,obj]);
    },
    onSceneItemsSwapped:function(collectionName,firstIndex,secondIndex){
        MainMediator.notify(this.name,collectionName+"ItemSwapped",[firstIndex,secondIndex]);
    },
    /*=============
    *procedures*
    *==============*/
    addFirstScene:function(){
        let camera=global["CameraAnimable"].createInstance(0,0,null);
        //The camera will be settedUp in collections when ui is fully loaded, to update all ui components
        this.sceneList.addNewScene(camera);
    },
    addNewScene:function(){
        let camera=global["CameraAnimable"].createInstance(0,0,null);
        this.sceneList.addNewScene(camera);
        this.sceneList.addInstanceToAllCollections(camera);
    },
    /*objects initialization and setup*/
    //Invocado cuando se crea(desde cero) o clona un objeto
    createAnimableObject:function(model,type="ImageAnimable",thumbnail=null){
        let initPosition=CanvasManager.getMousePositionInCanvas();
        if(type==="ShapeAnimable"){
            window[type].createInstance(initPosition.x,initPosition.y,model,function(newInstance){
                this.sceneList.addInstanceToAllCollections(newInstance);
            }.bind(this));
        }
        else{
            let newInstance=window[type].createInstance(initPosition.x,initPosition.y,model);
            this.sceneList.addInstanceToAllCollections(newInstance);
        }
    },
    removeActiveAnimableObject:function(){//no called on loading project
        let activeAnimableObject=CanvasManager.getSelectedAnimableObj();
        if(activeAnimableObject){
            let listObjects;
            if(activeAnimableObject.type==="activeSelection"){listObjects=activeAnimableObject.getObjects();}
            else{listObjects=[activeAnimableObject]}

            CanvasManager.canvas.discardActiveObject();
            //Actually removing
            for(let i=0;i<listObjects.length;i++){
                let object=listObjects[i];
                object.remove();
                this.sceneList.removeInstanceFromAllCollections(object);
            }
        }
    },
    /*only used when loading project*/
    removeAllAnimableObjects:function(){

    },

    //helpers
    AreAllAssetsReady:function(){
        return this.sceneList.AreAllAssetsReady();
    },
    getObjectIndexInCollection:function(collectionName,object){
        return this.sceneList.getObjectIndexInCollection(collectionName,object);
    },
    getCollection:function(collectionName){
        return this.sceneList.getCollection(collectionName);
    },
    getCamera:function(){
        return this.sceneList.getCamera();
    },
    removeInstanceFromCollection:function(instance,collectionName){
        this.sceneList.removeInstanceFromCollection(instance,collectionName);
    },
    addInstanceToCollection:function(instance,collectionName){
        this.sceneList.addInstanceToCollection(instance,collectionName);
    },
    /*===================
    * INCOMING EVENTS
    * ==================*/
    notificationWindowManagerOnUILoaded:function(){
        this.sceneList.addInstanceToAllCollections(this.sceneList.getCamera());
    },
    notificationPanelConfigOnDimensionsChanged:function(args){
        let projectWidth=args[0];
        let projectHeight=args[1];
        this.sceneList.setSceneCameraDimensions(projectWidth,projectHeight);
    },
    /*childEvents*/
    notificationOnProjectLoaded:function(data){//usado para popular la data adicional por cargar,(animatorDuration,width,height)
        MainMediator.notify(this.name,this.events.OnProjectCollectionsLoaded,[data]);
    },
    /*creating of items*/
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

    /*ordering*/
    notificationPanelInspectorOnBtnMoveDownObjectEntranceOrder:function(args){
        let index=args[0];
        this.sceneList.swapInstancesInCollection(index,index+1,global.EnumCollectionsNames.animObjsWithEntrance);
    },
    notificationPanelInspectorOnBtnMoveUpObjectEntranceOrder:function(args){
        let index=args[0];
        this.sceneList.swapInstancesInCollection(index,index-1,global.EnumCollectionsNames.animObjsWithEntrance);
    },
    notificationCanvasManagerOnBtnMoveForward:function(args){
        let index=args[0];
        this.sceneList.swapInstancesInCollection(index,index+1,global.EnumCollectionsNames.animObjs);
    },
    notificationCanvasManagerOnBtnMoveBackwards:function(args){
        let index=args[0];
        this.sceneList.swapInstancesInCollection(index,index-1,global.EnumCollectionsNames.animObjs);
    },

    /*helper procedures*/
    notificationPanelActionEditorOnMarkerDragEnded:function(){
        let listAnimObjs=this.sceneList.getCollection(global.EnumCollectionsNames.animObjs);
        for(let i=0;i<listAnimObjs.length;i++){
            listAnimObjs[i].setCoords();
        }
    },
};


