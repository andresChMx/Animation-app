let EnumAnimableLoadingState={
    "loading":"loading",
    "error":"error",
    "ready":"ready"
}
var ImageAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntranceModes:[EntranceName.image_drawn,EntranceName.none],
    type:'ImageAnimable',
    initialize:function(options){
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];
            /*fabric.Object setting*/
        this.left=options.left;
        this.top=options.top;
        this.padding=20;                   //
        this.transparentCorners= false;    //
        this.cornerColor="rgb(0,0,0)";     //
        this.name="ObjectX";               //New fabric property (fabricCustom.js)
        this.centeredRotation=false;       //
        this.originX='custom';             //New fabric property (fabricCustom.js)
        this.originY='custom';             //New fabric property (fabricCustom.js)
        /*FIN -- fabric.Object setting*/


        /*images loading*/
        this.listObserversOnImageStateChanged=[];
        this.cbOnThumbnailStateChanged=function(){};

        this.imageAssetModel=options.imageAssetModel;           //New Class Property, de aqui solo usamod thumbnail_url, y image_url. Solo las urls

        this.largeImage=StaticResource.images.loading;          //New Class Property
        this.thumbnailImage=StaticResource.images.loading;             //New Class Property /*for ui, when appears in lists*/
        this.callSuper("initialize",this.largeImage,{})

        this.imageLoadingState=EnumAnimableLoadingState.loading;//New Class Property
        this.thumbnailLoadingState=EnumAnimableLoadingState.loading;

        this.loadImages();
        /*fin -- images loading*/

        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        this.animator=new Animator(this);           //New fabric property

        //el entranceMode debe estar establecido a drawn antes de generar la imagen final mascarada (la siguiente funcion invocada)

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
        NetworkManager.loadImage(this.imageAssetModel.url_image).then(function(img){
            this.largeImage=img;
            this.setElement(this.largeImage);
            this.setCoords();
            this.canvas.renderAll();
            this._setImageLoadingState(EnumAnimableLoadingState.ready);
        }.bind(this)).catch(function(){
            this.largeImage=StaticResource.images.loadingError;
            this.setElement(this.largeImage);
            this.setCoords();
            this.canvas.renderAll();
            this._setImageLoadingState(EnumAnimableLoadingState.error);
        }.bind(this))

        NetworkManager.loadImage(this.imageAssetModel.url_thumbnail).then(function(img){
            this.thumbnailImage=img;
            this._setThumbnailLoadingState(EnumAnimableLoadingState.ready);
        }.bind(this)).catch(function(){
            this.thumbnailImage=StaticResource.images.loadingError.cloneNode();
            this._setThumbnailLoadingState(EnumAnimableLoadingState.error);
        }.bind(this))
    },
    _setThumbnailLoadingState:function(state){
        this.thumbnailLoadingState=state;
        this.cbOnThumbnailStateChanged(this.thumbnailLoadingState,this.thumbnailImage);
    },
    _setImageLoadingState:function(state){
        this.imageLoadingState=state;
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
    }
})

/*--------save upload state---------*/
ImageAnimable.toObject = (function(toObject) {

    return function() {
        return fabric.util.object.extend(toObject.call(this), {
            name: this.name,

        });
    };
})(ImageAnimable.toObject);