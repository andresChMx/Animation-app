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
        let tmpCount=0;
        let largeImageSuccessfulLoading=false;

        NetworkManager.loadSVG(this.imageAssetModel.url_image,function(svgString,image,error){
            if(error){
                this.largeImage=StaticResource.images.loadingError.cloneNode();
                this.svgString="";
            }else{
                this.largeImage=image;
                this.thumbnailImage=image
                this.svgString=svgString;
                largeImageSuccessfulLoading=true;
            }
            tmpCount++;
            if(tmpCount===1){ready()}
        }.bind(this))

        // NetworkManager.loadImage(this.imageAssetModel.url_thumbnail).then(function(img){
        //     this.thumbnailImage=img;
        //     tmpCount++;
        //     if(tmpCount===2){ready()}
        // }.bind(this)).catch(function(){
        //     this.thumbnailImage=StaticResource.images.loadingError.cloneNode();
        //     tmpCount++;
        //     if(tmpCount===2){ready()}
        // }.bind(this))
        let self=this;
        function ready(){
            if(largeImageSuccessfulLoading){
                self._setImageLoadingState(EnumAnimableLoadingState.ready);
            }else{
                self._setImageLoadingState(EnumAnimableLoadingState.error);
            }

            self.setElement(self.largeImage);
            self.setCoords();
            self.canvas.renderAll();
        }
    },


});


