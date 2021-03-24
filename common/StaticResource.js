// const fabric = require('fabric').fabric;
// const fs = require('fs');

let StaticResource={
    images:{
        general:{
            loading:{
                elem:fabric.util.createImage(),
                rute:"loading-error.png"
            },
            loadingError:{
                elem:fabric.util.createImage(),
                rute:"loading-image.png"
            },
            textThumbnail:{
                elem:fabric.util.createImage(),
                rute:"text-thumbnail.png"
            },
            camera:{
                elem:fabric.util.createImage(),
                rute:"camera.png"
            },
        },
        drawing_hands:{
            man:{
                elem:fabric.util.createImage(),
                rute:"drawing-hands/man.png",
                name:"man",
                offset:{x:7,y:70}
            },
            woman:{
                elem:fabric.util.createImage(),
                rute:"drawing-hands/woman.png",
                name:"woman",
                offset:{x:0,y:0}
            },
            eraser:{
                elem:fabric.util.createImage(),
                rute:"drawing-hands/eraser.png",
                name:"eraser",
                offset:{x:19,y:140}
            }
        },

    },

    counterReadyImages:0,
    cbOnImagesLoaded:null,
    init:function(){
        let imagesLength=0;
        for(let imageType in this.images){
            imagesLength+=Object.keys(this.images[imageType]).length;
        }

        for(let imageType in this.images){
            for(let image in this.images[imageType]){
                this.images[imageType][image].elem.crossOrigin="anonymous";
                this.images[imageType][image].elem.onload=function(){
                    this.counterReadyImages++;
                    if(this.counterReadyImages===imagesLength){
                        this.cbOnImagesLoaded();
                    }
                }.bind(this)
            }
        }

        if (global.browserBehaviour.LoadStaticResourcesForBrowser) {
            if(production){
                for(let imageType in this.images) {
                    for (let image in this.images[imageType]) {
                        this.images[imageType][image].elem.src=global.RUTES.assets_static_images + this.images[imageType][image].rute;
                    }
                }
            }else{
                this.images.general.loadingError.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/s3pxo5idinbk5bzle09m.png";
                this.images.general.loading.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/ttqignry6zg48tvsvved.png";
                this.images.general.textThumbnail.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1614058005/temporary/pm6xunopcwgojwnmy8mm.png";
                this.images.general.camera.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1616209847/wfywgjjnpinry9v7ekxu.png";

                this.images.drawing_hands.man.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1616399565/r0f2urm23bpbcxeg8jdx.png";
                this.images.drawing_hands.woman.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1616399565/gxkhxkspxdpyjjbsniyd.png";
                this.images.drawing_hands.eraser.elem.src="https://res.cloudinary.com/dfr41axmh/image/upload/v1616399564/kockptnhwluva9otvjod.png";
            }
        }
        else {
            let preRute=__dirname + "/../assets/images/";

            let encoding="base64";
            let mime="image/png";

            for(let imageType in this.images) {
                for (let image in this.images[imageType]) {
                    fs.readFile(preRute + this.images[imageType][image].rute, function(err, data) {
                        if (err) throw err;
                        data=data.toString(encoding);
                        let uri="data:" + mime + ";"  + encoding + "," +data;
                        this.images[imageType][image].elem.src = uri;
                    }.bind(this));
                }
            }
        }

    },
    addListenerOnImagesReady:function(callback){
        this.cbOnImagesLoaded=callback;
    }
}

