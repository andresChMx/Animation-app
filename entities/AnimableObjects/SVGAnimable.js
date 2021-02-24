var SVGAnimable=fabric.util.createClass(ImageAnimable,{
    applicableEntranceModes:[EntranceName.svg_drawn,EntranceName.none],
    type:'SVGAnimable',
    initialize:function(options){
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];
        this.callSuper('initialize',options);

        this.svgString=null                 //stores svg image in string format
        //FILL REVEAL MODE VARIABLES
        this.fadeInTransitionOpacity=0;

        this.animator.addHiddenAnimationsLane("fadeInTransitionOpacity");

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

        NetworkManager.loadSVG(this.imageAssetModel.url_image,function(svgString,image,error){
            if(!error){
                this.largeImage=image;
                this.svgString=svgString;
                this._setImageLoadingState(EnumAnimableLoadingState.ready);
            }else{
                this.largeImage=StaticResource.images.loadingError.cloneNode();
                this.svgString="";
                this._setImageLoadingState(EnumAnimableLoadingState.error);
            }
            this.setElement(this.largeImage);
            this.setCoords();
            this.canvas.renderAll();
        }.bind(this))

        NetworkManager.loadImage(this.imageAssetModel.url_thumbnail).then(function(img){
            this.thumbnailImage=img;
            this._setThumbnailLoadingState(EnumAnimableLoadingState.ready);
        }.bind(this)).catch(function(){
            this.thumbnailImage=StaticResource.images.loadingError;
            this._setThumbnailLoadingState(EnumAnimableLoadingState.error);
        }.bind(this))
    },
});


