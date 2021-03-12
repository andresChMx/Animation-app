var SVGAnimable=fabric.util.createClass(ImageAnimable,{
    applicableEntranceModes:[EntranceName.svg_drawn,EntranceName.none],
    applicableAnimationProperties:["position","scale","rotation","opacity"],
    applicableCanvasManagerCollections:[
        EnumCollectionsNames.renderingObjs,
        EnumCollectionsNames.animObjs,
        EnumCollectionsNames.animObjsWithEntrance,
        EnumCollectionsNames.animObjsNotReady,
    ],
    type:'SVGAnimable',
    initialize:function(options){
        if(!options){options={};}
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];
        this.callSuper('initialize',options);

        this.svgString=null                 //stores svg image in string format
        //FILL REVEAL MODE VARIABLES
        this.fadeInTransitionOpacity=0;

        this.animator.addHiddenAnimationsLane("fadeInTransitionOpacity"); // at initialization time we can call just methods that set state, that dont use other variables, because this object could being loaded and no data been passed

    },
    /*Used by path design editor*/
    getDrawingData:function(){
        return this.entranceBehaviour.dictEntranceModes[EntranceName.svg_drawn].drawingData;
    },
    generateFinalMaskedImage:function(){ //called after path editor design is saved
        this.entranceBehaviour.dictEntranceModes[EntranceName.svg_drawn].generateFinalMaskedImage();
    },
    /*state images loading methods*/
    loadImages:function(){
        if(!this.imageAssetModel){return}
        NetworkManager.loadSVG(this.imageAssetModel.url_image,function(svgString,image,error){
            if(!error){
                this.svgString=svgString;
                this._setImageLoadingState(EnumAnimableLoadingState.ready,image);
            }else{
                this.svgString="";
                this._setImageLoadingState(EnumAnimableLoadingState.error,StaticResource.images.loadingError.cloneNode());
            }
        }.bind(this))

        fabric.util.loadImage(this.imageAssetModel.url_thumbnail, function(img, error) {
            if (error) {
                this._setThumbnailLoadingState(EnumAnimableLoadingState.error,StaticResource.images.loadingError.cloneNode());
                return;
            }
            this._setThumbnailLoadingState(EnumAnimableLoadingState.ready,img);
        }.bind(this),null,true);
    },
    clone:function(callback){
        let object=this.toObject();
        delete object.filters;
        delete object.resizeFilter;
        object.svgString=this.svgString;
        SVGAnimable.cloneFromObject(
            object,
            this.largeImage.cloneNode(),
            this.thumbnailImage.cloneNode(),
            callback)
    }
});
/*===============================*/
/*=====  Static functions  ======*/
/*===============================*/
/*Object loading*/
SVGAnimable.cloneFromObject = function(_object,largeImage,thumbnailImage, callback) {
    var object = fabric.util.object.clone(_object,true);
    /*initializing with no state*/
    let newSVGAnimable=new SVGAnimable({});

    let entranceBehaviourObject=object.entranceBehaviour;
    let animatorObject=object.animator;

    delete object.entranceBehaviour;
    delete object.animator;
    setTimeout(function(){
        newSVGAnimable.setOptions(object);//suposed to set fabric.object state

        newSVGAnimable.entranceBehaviour.fromObject(entranceBehaviourObject);
        newSVGAnimable.animator.fromObject(animatorObject);

        if(object.hasOwnProperty("clipPath")){
            newSVGAnimable.clipPath=CanvasManager.collections.animObjsClippers.list[object.clipPath];
        }

        newSVGAnimable.svgString=object.svgString;

        newSVGAnimable._setImageLoadingState(EnumAnimableLoadingState.ready,largeImage);
        newSVGAnimable._setThumbnailLoadingState(EnumAnimableLoadingState.ready,thumbnailImage);
        callback(newSVGAnimable);
    },1)
};
SVGAnimable.fromObject=function(object,callback){
    // object.toObject()
    /*initializing with no state*/
    let newSVGAnimable=SVGAnimable.createInstance(0,0,null)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

    let entranceBehaviourObject=object.entranceBehaviour;
    let animatorObject=object.animator;
    delete object.entranceBehaviour;
    delete object.animator;

    newSVGAnimable.setOptions(object);//suposed to set object state
    newSVGAnimable.loadImages();

    newSVGAnimable.entranceBehaviour.fromObject(entranceBehaviourObject);
    newSVGAnimable.animator.fromObject(animatorObject);

    if(object.hasOwnProperty("clipPath")){
        newSVGAnimable.indexUnresolvedClipPath=object.clipPath;
    }

    callback(newSVGAnimable,false);

}
/*====================================*/
/*======== Object creation ===========*/
/*====================================*/
/*the next two methods are called separetely if object is cloned or loaded*/
SVGAnimable.createInstance=function(left,top,imageAssetModel){
    let newObjectAnimable=new SVGAnimable({
        left:left,
        top:top,
        imageAssetModel:imageAssetModel,
    });
    return newObjectAnimable;
}
SVGAnimable.instanceSetupInCanvasManager=function(instance,collectionName){
    ImageAnimable.instanceSetupInCanvasManager(instance,collectionName);
}
SVGAnimable.removeInstance=function(instance){
    ImageAnimable.removeInstance(instance);
}

