let StaticResource={
    images:{
        loading:new Image(),
        loadingError:new Image(),
        textThumbnail:new Image(),
        camera:new Image(),
    },
    counterReadyImages:0,
    cbOnImagesLoaded:null,
    init:function(){
        let imagesLength=Object.keys(this.images).length;
        for(let key in this.images){
            this.images[key].onload=function(){
                this.counterReadyImages++;
                if(this.counterReadyImages===imagesLength){
                    this.cbOnImagesLoaded();
                }
            }.bind(this)
        }
        this.images.loadingError.src=RUTES.assets_images + "loading-error.png";
        this.images.loading.src=RUTES.assets_images + "loading-image.png";
        this.images.textThumbnail.src=RUTES.assets_images + "text-thumbnail.png";
        this.images.camera.src=RUTES.assets_images + "camera.svg"


    },
    addListenerOnImagesReady:function(callback){
        this.cbOnImagesLoaded=callback;
    }
}
