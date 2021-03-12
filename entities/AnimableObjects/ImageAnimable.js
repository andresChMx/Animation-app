let EnumAnimableLoadingState={
    "loading":"loading",
    "error":"error",
    "ready":"ready"
};
var ImageAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntranceModes:[EntranceName.image_drawn,EntranceName.none],
    applicableAnimationProperties:["position","scale","rotation","opacity"],
    applicableCanvasManagerCollections:[
        EnumCollectionsNames.renderingObjs,
        EnumCollectionsNames.animObjs,
        EnumCollectionsNames.animObjsWithEntrance,
        EnumCollectionsNames.animObjsNotReady,
    ],
    type:'ImageAnimable',
    initialize:function(options){
        if(!options){options={};}
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];
        /*fabric.Object setting*/
        this.left=options.left;
        this.top=options.top;
        this.padding=10;                   //
        this.transparentCorners= false;    //
        this.cornerColor="rgb(0,0,0)";     //
        this.name="ObjectX";               //New fabric property (fabricCustom.js)
        this.centeredRotation=false;       //
        /*FIN -- fabric.Object setting*/


        /*images loading attributes*/
        this.listObserversOnImageStateChanged=[];
        this.imageAssetModel=options.imageAssetModel;           //New Class Property, de aqui solo usamod thumbnail_url, y image_url. Solo las urls
        this.cbOnThumbnailStateChanged=function(){};
        this.largeImage=StaticResource.images.loading;          //New Class Property
        this.thumbnailImage=StaticResource.images.loading;             //New Class Property /*for ui, when appears in lists*/
        this.imageLoadingState=EnumAnimableLoadingState.loading;//New Class Property
        this.thumbnailLoadingState=EnumAnimableLoadingState.loading;

        this.callSuper("initialize",this.largeImage,{})
        /*fin -- images loading*/

        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        this.animator=new Animator(this);           //New fabric property

        //el entranceMode debe estar establecido a drawn antes de generar la imagen final mascarada (la siguiente funcion invocada)

        /*starting logic*/
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnShapeAnimableDeleted,this);/*solo objectos que se les pueda agrega clipping*/

        if(this.imageAssetModel){
            this.loadImages(); // because this object is just been created, be can call it here, since we already passed image asset model at initialization time
        }


    },
    /*Used by path design editor*/
    getDrawingData:function(){
        return this.entranceBehaviour.dictEntranceModes[EntranceName.image_drawn].drawingData;
    },
    generateFinalMaskedImage:function(){ //called after path editor design is saved
        this.entranceBehaviour.dictEntranceModes[EntranceName.image_drawn].generateFinalMaskedImage();
    },
    /*state images loading methods*/
    loadImages:function(){
        fabric.util.loadImage(this.imageAssetModel.url_image, function(img, error) {
            if (error) {
                this._setImageLoadingState(EnumAnimableLoadingState.error,StaticResource.images.loadingError);
                return;
            }
            this._setImageLoadingState(EnumAnimableLoadingState.ready,img);
        }.bind(this),null,true);

        fabric.util.loadImage(this.imageAssetModel.url_thumbnail, function(img, error) {
            if (error) {
                this._setThumbnailLoadingState(EnumAnimableLoadingState.error,StaticResource.images.loadingError.cloneNode());
                return;
            }
            this._setThumbnailLoadingState(EnumAnimableLoadingState.ready,img);
        }.bind(this),null,true);

    },
    _setThumbnailLoadingState:function(state,img){
        this.thumbnailLoadingState=state;
        this.thumbnailImage=img;
        this.cbOnThumbnailStateChanged(this.thumbnailLoadingState,this.thumbnailImage);
    },
    _setImageLoadingState:function(state,img){
        this.imageLoadingState=state;
        this.largeImage=img
        this.setElement(this.largeImage);
        this.setCoords();
        this.canvas && this.canvas.renderAll();

        this.notifyOnImageStateChanged();
    },
    /*Inspector main Object list, items options actions*/
    setLockState:function(val){
        this.selectable=!val;
        this.evented=!val;
    },
    getLockState:function(){
        return !this.selectable;
    },
    setVisibilityState:function(val){
        this.visible=val;
        this.selectable=val;
        this.evented=val;
    },
    getVisibilityState:function(){
        return this.visible;
    },

    applyClipping:function(animObject){
        this.clipPath=animObject;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===AnimObjectOptionMenu.addMask){
                this.applicableMenuOptions[i]=AnimObjectOptionMenu.removeMask;
                break;
            }
        }
    },
    removeClipping:function(){
        this.clipPath=null;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===AnimObjectOptionMenu.removeMask){
                this.applicableMenuOptions[i]=AnimObjectOptionMenu.addMask;
                break;
            }
        }
    },
    /*fabric overwritten methods*/
    render:function(ctx){
        fabric.Object.prototype.customRenderOffScreen.bind(this)(ctx);
    },
    _render:function(ctx){
        this.entranceBehaviour.renderEntranceEffect(ctx);
    },
    /*observer pattern*/
    registerOnImageStateChanged:function(obj){
        this.listObserversOnImageStateChanged.push(obj);
        if(this.imageLoadingState!==EnumAnimableLoadingState.loading){
            this.notifyOnImageStateChanged()
        }
    },
    notifyOnImageStateChanged:function(){
        for(let i in this.listObserversOnImageStateChanged){
            this.listObserversOnImageStateChanged[i].notificationOnImageStateChanged(this);
        }
    },
    listenOnThumbnailStateChanged:function(callback){
        this.cbOnThumbnailStateChanged=callback;
        if(this.thumbnailLoadingState!==EnumAnimableLoadingState.loading){
            this.cbOnThumbnailStateChanged(this.thumbnailLoadingState,this.thumbnailImage);
        }
    },
    notificationCanvasManagerOnShapeAnimableDeleted:function(args){
        let deletedObject=args[1];
        if(deletedObject===this.clipPath){
            this.removeClipping();
            this.canvas && this.canvas.renderAll();
        }
    },
    toObject:function(){
        var filters = [];

        this.filters.forEach(function(filterObj) {
            if (filterObj) {
                filters.push(filterObj.toObject());
            }
        });
        var object = fabric.util.object.extend(
            fabric.Object.prototype.toObject.call(this,['crossOrigin', 'cropX', 'cropY'])
                , {
                filters:filters,

                applicableMenuOptions:this.applicableMenuOptions,
                imageAssetModel:this.imageAssetModel,
                name:this.name,

                pivotX:this.pivotX,
                pivotY:this.pivotY,
                pivotCornerX:this.pivotCornerX,
                pivotCornerY:this.pivotCornerY,

                entranceBehaviour:this.entranceBehaviour.toObject(),
                animator:this.animator.toObject()
            });
        if (this.resizeFilter) {
            object.resizeFilter = this.resizeFilter.toObject();
        }
        delete object.clipPath; // temporal, ya que Object.toObject lo igualara al toObject de clipPath, si es que hay
        if(this.clipPath){
            object.clipPath=CanvasManager.getListIndexClipperObjects(this.clipPath);
            if(object.clipPath===-1){alert("BUGGGy7543");}// si es que tienes un clippath este tiene que estar en la lista del canvasManager si o sii, algo anda mall
        }
        return object;
    },
    // fromObject:function(){
    //
    // },
    clone:function(callback){
        let object=this.toObject();
        ImageAnimable.cloneFromObject(
            object,
            this.largeImage.cloneNode(),
            this.thumbnailImage.cloneNode(),
            callback)
    }
})
/*===============================*/
/*=====  Static functions  ======*/
/*===============================*/
/*Object loading*/
ImageAnimable.cloneFromObject = function(_object,largeImage,thumbnailImage, callback) {
    var object = fabric.util.object.clone(_object,true);
    /*initializing with no state*/
    /*we are not pasing model, so it will not start logic*/
    let newImageAnimable=ImageAnimable.createInstance(0,0,null)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

    let entranceBehaviourObject=object.entranceBehaviour;
    let animatorObject=object.animator;

    delete object.entranceBehaviour;
    delete object.animator;

    fabric.Image.prototype._initFilters.call(object, object.filters, function(filters) {
        object.filters = filters || [];
        fabric.Image.prototype._initFilters.call(object, [object.resizeFilter], function(resizeFilters) {
            object.resizeFilter = resizeFilters[0];
            // fabric.util.enlivenObjects([object.clipPath], function(enlivedProps) {
            //     object.clipPath = enlivedProps[0];

            newImageAnimable.setOptions(object);//suposed to set object state

            newImageAnimable.entranceBehaviour.fromObject(entranceBehaviourObject);
            newImageAnimable.animator.fromObject(animatorObject);
            if(object.hasOwnProperty("clipPath")){
                newImageAnimable.clipPath=CanvasManager.collections.animObjsClippers.list[object.clipPath];
            }

            newImageAnimable._setImageLoadingState(EnumAnimableLoadingState.ready,largeImage);
            newImageAnimable._setThumbnailLoadingState(EnumAnimableLoadingState.ready,thumbnailImage);

            callback(newImageAnimable);
            // });
        });
    });

};
ImageAnimable.fromObject=function(object,callback){
    // object.toObject()
    /*initializing with no state*/
    let newImageAnimable=ImageAnimable.createInstance(0,0,object.imageAssetModel)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

    let entranceBehaviourObject=object.entranceBehaviour;
    let animatorObject=object.animator;

    delete object.entranceBehaviour;
    delete object.animator;

    newImageAnimable.setOptions(object);//suposed to set object state

    newImageAnimable.entranceBehaviour.fromObject(entranceBehaviourObject);
    newImageAnimable.animator.fromObject(animatorObject);

    if(object.hasOwnProperty("clipPath")){
        newImageAnimable.indexUnresolvedClipPath=object.clipPath;
    }

    callback(newImageAnimable,false);

}

/*====================================*/
/*======== Object creation ===========*/
/*====================================*/
/*the next two methods are called separetely if object is cloned or loaded*/
ImageAnimable.createInstance=function(left,top,imageAssetModel){
    let newObjectAnimable=new ImageAnimable({
        left:left,
        top:top,
        imageAssetModel:imageAssetModel,
    });
    return newObjectAnimable;
}
ImageAnimable.instanceSetupInCanvasManager=function(instance,collectionName){
    let contains=this.prototype.applicableCanvasManagerCollections.indexOf(collectionName);
    if(contains>-1){
        CanvasManager.collections[collectionName].add(instance);
    }
};
ImageAnimable.removeInstance=function(instance){
    MainMediator.unregisterObserver(CanvasManager.name,CanvasManager.events.OnShapeAnimableDeleted,instance);

    this.prototype.applicableCanvasManagerCollections.forEach(function(elem){
        CanvasManager.collections[elem].remove(instance)
    })
}
