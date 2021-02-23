var DrawableImage = fabric.util.createClass(fabric.Object, {

    type: 'DrawableImage',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    //
    initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize',options);
        this.set('label', options.label || '');
        this.objectCaching=false;                   // SOLUCIION BUG, ahora con solo sobreescribir _render funciona, antes se quedaba en blanco
        this.cacheCanvas=options.cacheCanvas;

        this.myTurn=false;
        this.lastSnapShot=new Image();
        this.lastSnapShot.src=this.cacheCanvas.toDataURL();
        this.width=options.width;
        this.height=options.height;

        this.animator=new Animator(this);
        this.animator.dictAnimations=options.animations;
        this.animator.dictHiddenAnimations=options.hiddenAnimations;
        this.animator.entranceTimes=options.entranceTimes;

        this.entranceModesSettings=options.entraceModesSettings;
    },
    setTurn:function(is,finalImageMask){
        if(!is){
            this.lastSnapShot=finalImageMask
        }
        this.myTurn=is;

    },
    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },
    _render:function(ctx){
        if(this.myTurn){
            ctx.drawImage(this.cacheCanvas,-this.width/2,-this.height/2);
        }else{
            ctx.drawImage(this.lastSnapShot,-this.width/2,-this.height/2);
        }
    }
});

var DrawableSVGImage=fabric.util.createClass(DrawableImage, {
    initialize:function(options,imageHigh){
        this.callSuper('initialize',options);
        this.imageToBeFadeIn=imageHigh;

        this.fadeInTransitionOpacity=0; /*animated property*/
    },
    _render:function(ctx){
        if(this.myTurn){
            if(this.fadeInTransitionOpacity!==0){
                let currentGlobalAlpha=ctx.globalAlpha;
                ctx.globalAlpha=currentGlobalAlpha*this.fadeInTransitionOpacity;
                ctx.drawImage(this.imageToBeFadeIn,-this.width/2,-this.height/2)

                let negativeAlpha=1-this.fadeInTransitionOpacity;

                ctx.globalAlpha=currentGlobalAlpha*negativeAlpha;
                ctx.drawImage(this.cacheCanvas,-this.width/2,-this.height/2);
                ctx.globalAlpha=currentGlobalAlpha;
            }else{
                ctx.drawImage(this.cacheCanvas,-this.width/2,-this.height/2);

            }
        }else{
            ctx.drawImage(this.lastSnapShot,-this.width/2,-this.height/2);
        }
    },
});
var FactoryDrawableImages={
    create:function(object,cacheCanvas){
        let options={
            cacheCanvas:cacheCanvas,
            left:object.get("left"), top:object.get("top"),
            width:object.get("width"), height:object.get("height"), angle:object.get("angle"),
            scaleX:object.get("scaleX"), scaleY:object.get("scaleY"), opacity:object.get("opacity"),

            pivotX:object.get("pivotX"), pivotY:object.get("pivotY"),
            pivotCornerX:object.get("pivotCornerX"), pivotCornerY:object.get("pivotCornerY"),
            originX: 'custom', originY: 'custom',

            clipPath:object.clipPath,

            animations:object.animator.dictAnimations,
            hiddenAnimations:object.animator.dictHiddenAnimations,
            entranceTimes:object.animator.entranceTimes,

            entraceModesSettings:object.entraceModesSettings
        };
        if(object.type==="SVGAnimable" && object.entraceModesSettings["drawn"].fillRevealMode==="fadein"){
            return new DrawableSVGImage(options,object.imageDrawingData.imgHigh);
        }else if(object.type==="ImageAnimable"){
            return new DrawableImage(options);
        }else if(object.type==="TextAnimable"){
            return new DrawableImage(options);
        }else{
            return new DrawableImage(options);
        }
    }
}