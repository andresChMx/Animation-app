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
            this.images[key].crossOrigin="anonymous";
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
        this.images.camera.src=RUTES.assets_images + "camera.svg";
        // this.images.loadingError.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/s3pxo5idinbk5bzle09m.png";
        // this.images.loading.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/ttqignry6zg48tvsvved.png";
        // this.images.textThumbnail.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/pm6xunopcwgojwnmy8mm.png";
        // this.images.camera.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/gtye4hcshe2qcofikt4o.svg";

    },
    addListenerOnImagesReady:function(callback){
        this.cbOnImagesLoaded=callback;
    }
}

