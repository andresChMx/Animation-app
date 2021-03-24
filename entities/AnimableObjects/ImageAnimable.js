
global.ImageAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntranceModes:[global.EntranceName.image_drawn,global.EntranceName.none],
    applicableAnimationProperties:["position","scale","rotation","opacity"],
    applicableCanvasManagerCollections:[
        global.EnumCollectionsNames.animObjs,
        global.EnumCollectionsNames.animObjsWithEntrance,
        global.EnumCollectionsNames.animObjsNotReady,
    ],
    type:'ImageAnimable',
    initialize:function(options){
        if(!options){options={};}
        this.applicableMenuOptions=[global.AnimObjectOptionMenu.duplicate,global.AnimObjectOptionMenu.delete,global.AnimObjectOptionMenu.addMask];
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
        this.largeImage=StaticResource.images.general.loading.elem;          //New Class Property
        this.thumbnailImage=StaticResource.images.general.loading.elem;             //New Class Property /*for ui, when appears in lists*/
        this.imageLoadingState=global.EnumAssetLoadingState.loading;//New Class Property
        this.thumbnailLoadingState=global.EnumAssetLoadingState.loading;

        this.callSuper("initialize",this.largeImage,{})
        /*fin -- images loading*/

        this.entranceBehaviour=new global.EntranceEffectBehaviour(this,this.applicableEntranceModes);

        this.animator=new Animator(this);           //New fabric property

        //el entranceMode debe estar establecido a drawn antes de generar la imagen final mascarada (la siguiente funcion invocada)

        /*starting logic*/
        if(global.browserBehaviour.RegisterAnimableOnClipperRemoved){
            MainMediator.registerObserver(ScenesManager.name,ScenesManager.events.animObjsClippersItemRemoved,this);/*solo objectos que se les pueda agrega clipping*/
        }

        if(this.imageAssetModel){
            this.loadImages(); // because this object is just been created, be can call it here, since we already passed image asset model at initialization time
        }


    },
    /*Used by path design editor*/
    getDrawingData:function(){
        return this.entranceBehaviour.dictEntranceModes[global.EntranceName.image_drawn].drawingData;
    },
    generateFinalMaskedImage:function(){ //called after path editor design is saved
        this.entranceBehaviour.dictEntranceModes[global.EntranceName.image_drawn].generateFinalMaskedImage();
    },
    /*state images loading methods*/
    loadImages:function(){
        fabric.util.loadImage(this.imageAssetModel.url_image, function(img, error) {
            if (error) {
                this._setImageLoadingState(global.EnumAssetLoadingState.error,StaticResource.images.general.loadingError.elem);
                return;
            }
            this._setImageLoadingState(global.EnumAssetLoadingState.ready,img);
        }.bind(this),null,true);

        fabric.util.loadImage(this.imageAssetModel.url_thumbnail, function(img, error) {
            if (error) {
                this._setThumbnailLoadingState(global.EnumAssetLoadingState.error,StaticResource.images.general.loadingError.elem.cloneNode());
                return;
            }
            this._setThumbnailLoadingState(global.EnumAssetLoadingState.ready,img);
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

        if(this.imageLoadingState===global.EnumAssetLoadingState.ready){
            this.notifyOnAssetStateReady();
        }
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
            if(this.applicableMenuOptions[i]===global.AnimObjectOptionMenu.addMask){
                this.applicableMenuOptions[i]=global.AnimObjectOptionMenu.removeMask;
                break;
            }
        }
    },
    removeClipping:function(){
        this.clipPath=null;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===global.AnimObjectOptionMenu.removeMask){
                this.applicableMenuOptions[i]=global.AnimObjectOptionMenu.addMask;
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
    registerOnAssetReadyState:function(obj){
        this.listObserversOnImageStateChanged.push(obj);
        if(this.imageLoadingState===global.EnumAssetLoadingState.ready){
            this.notifyOnAssetStateReady()
        }
    },
    notifyOnAssetStateReady:function(){
        for(let i in this.listObserversOnImageStateChanged){
            this.listObserversOnImageStateChanged[i].notificationOnAssetStateReady(this);
        }
    },
    listenOnThumbnailStateChanged:function(callback){
        this.cbOnThumbnailStateChanged=callback;
        if(this.thumbnailLoadingState!==global.EnumAssetLoadingState.loading){
            this.cbOnThumbnailStateChanged(this.thumbnailLoadingState,this.thumbnailImage);
        }
    },
    notificationScenesManageranimObjsClippersItemRemoved:function(args){
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
            object.clipPath=ScenesManager.getObjectIndexInCollection(global.EnumCollectionsNames.animObjsClippers,this.clipPath);
            if(object.clipPath===-1){alert("BUGGGy7543");}// si es que tienes un clippath este tiene que estar en la lista del canvasManager si o sii, algo anda mall
        }
        return object;
    },
    // fromObject:function(){
    //
    // },
    clone:function(callback){
        let object=this.toObject();
        global.ImageAnimable.cloneFromObject(
            object,
            this.largeImage.cloneNode(),
            this.thumbnailImage.cloneNode(),
            callback)
    },
    remove:function(){
        if(global.browserBehaviour.RegisterAnimableOnClipperRemoved){
            MainMediator.unregisterObserver(ScenesManager.name,ScenesManager.events.animObjsClippersItemRemoved,this)
        }
    },
})
/*===============================*/
/*=====  Static functions  ======*/
/*===============================*/
/*Object loading*/
global.ImageAnimable.cloneFromObject = function(_object,largeImage,thumbnailImage, callback) {
    var object = fabric.util.object.clone(_object,true);
    /*initializing with no state*/
    /*we are not pasing model, so it will not start logic*/
    let newImageAnimable=global.ImageAnimable.createInstance(0,0,null)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

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
                newImageAnimable.clipPath=ScenesManager.getCollection(global.EnumCollectionsNames.animObjsClippers)[object.clipPath];
            }

            newImageAnimable._setImageLoadingState(global.EnumAssetLoadingState.ready,largeImage);
            newImageAnimable._setThumbnailLoadingState(global.EnumAssetLoadingState.ready,thumbnailImage);

            callback(newImageAnimable);
            // });
        });
    });

};
global.ImageAnimable.fromObject=function(object,callback){
    // object.toObject()
    /*initializing with no state*/
    let newImageAnimable=global.ImageAnimable.createInstance(0,0,object.imageAssetModel)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

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
global.ImageAnimable.createInstance=function(left,top,imageAssetModel){
    let newObjectAnimable=new global.ImageAnimable({
        left:left,
        top:top,
        imageAssetModel:imageAssetModel,
    });
    return newObjectAnimable;
}
