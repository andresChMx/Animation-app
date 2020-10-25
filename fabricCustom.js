var Animation=fabric.util.createClass({
    startValue:-1,
    endValue:-1,
    byValue:-1,

    startMoment:-1,
    endMoment:-1,
    

    property:"",
    initialize:function(property,startValue,endValue,startMoment,endMoment){
        this.property=property;
        this.startValue=startValue;
        this.endValue=endValue;
        
        this.startMoment=startMoment;
        this.endMoment=endMoment;

        this.localDuration=endMoment-startMoment;
        this.byValue=endValue-startValue;
    },
    /*
    updateValues:function(startValue,endValue,startMoment,endMoment){
        this.startValue=startValue;
        this.endValue=endValue;
        this.startMoment=startMoment;
        this.endMoment=endMoment;

        this.localDuration=this.endMoment-this.startMoment;
        this.byValue=this.endValue-this.startValue;
    },
    */
    tick:function(currentTime){
        if(currentTime<this.startMoment){
            return "tiempoMenor";
        }else if(currentTime>this.endMoment){
            return "tiempoMayor";
        }else{
            let currentTimeLocalAnim=currentTime-this.startMoment;
            let currentValue = fabric.util.ease.easeInOutSine(currentTimeLocalAnim, this.startValue, this.byValue, this.localDuration);
            return currentValue;
        }
    },
    hasTwoKeys:function(){
        return this.endMoment!=-1 && this.endValue!=-1;
    }
});

var ImageAnimable=fabric.util.createClass(fabric.Image,{
    type:'ImageAnimable',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
        this.entranceMode=EntranceModes.drawn;
        this.dictAnimations={
            "left":[],
            "top":[],
            "scaleX":[],
            "scaleY":[],
            "angle":[],
            "opacity":[]
        };
        this.entranceDuration=3000;
        this.entranceDelay=0;
        this.imageModel=null;
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },
    getGlobalLeft:function(){
        return this.left + this.canvas._offset.left;
    },
    getGlobalTop:function(){
        return this.top + this.canvas._offset.top;
    },
    addAnimation:function(property,startValue,endValue,startMoment,endMoment){//string,number,number
        this.dictAnimations[property].push(new Animation(property,startValue,endValue,startMoment,endMoment));
        console.log("TOTAL CANT ANIMACIONES EN PROPEIDAD : " + property + this.dictAnimations[property].length);
    },
    /*
    updateAnimation:function(property,indexAnimation, startValue,endValue,startMoment,endMoment){
        this.dictAnimations[property][indexAnimation].updateValues(startValue,endValue,startMoment,endMoment);
    },*/
    executeAnimations:function(currentTime){

        for(const prop in this.dictAnimations){
            let anims=this.dictAnimations[prop]
            for(var i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value==="tiempoMenor"){
                        if(this.isFirstIndex(i)){
                            this.set(anim.property,anim.startValue);
                            break;
                        }
                    }else if (value==="tiempoMayor"){
                        if(this.isLastIndex(i,anims.length)){
                            this.set(anim.property,anim.endValue);
                            break;
                        }
                    }
                    else{
                        this.set(anim.property,value);
                        break;
                    }
                }else{
                    this.set(anim.property,anim.startValue);
                }
            }
        }
    },

    isLastIndex:function(index,listLength){
        return index===listLength-1;
    },
    isFirstIndex:function(index){
        return index===0;
    },
    hasAnimations:function(){
        for(const prop in this.dictAnimations){
            if(this.dictAnimations[prop].length>0){
                return true;
            }
        }
        return false;
    },
    hasPropertyAnimations:function(prop){
        return (this.dictAnimations[prop].length>0);
    },
    render:function(ctx){
        ctx.save();
        this._setupCompositeOperation(ctx);
        this.drawSelectionBackground(ctx);
        this.transform(ctx);
        this._setOpacity(ctx);
        this._setShadow(ctx, this);
        if (this.transformMatrix) {
          ctx.transform.apply(ctx, this.transformMatrix);
        }
        this.clipTo && fabric.util.clipContext(this, ctx);
        if (this.shouldCache()) {
          this.renderCache();
          this.drawCacheOnCanvas(ctx);
        }
        else {
          this._removeCacheCanvas();
          this.dirty = false;
          this.drawObject(ctx);
          if (this.objectCaching && this.statefullCache) {
            this.saveState({ propertySet: 'cacheProperties' });
          }
        }
        this.clipTo && ctx.restore();
        ctx.restore();
    }
    //TODO: update animation handler
})

fabric.util.object.extend(fabric.Image,{
    fromURLCustom:function(url, callback, imgOptions){
      fabric.util.loadImage(url, function(img) {
        callback && callback(new AnimableCamera(img, imgOptions));
      }, null, imgOptions && imgOptions.crossOrigin);
    }
})

var DrawableImage = fabric.util.createClass(fabric.Object, {

    type: 'DrawableImage',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize',options);
        this.set('label', options.label || '');

        this.cacheCanvas=options.cacheCanvas;
    //this.mainCanvas=options.mainCanvas;
        this.myTurn=false;
        this.lastSnapShot=new Image();
        this.lastSnapShot.src=this.cacheCanvas.toDataURL();
        this.width=options.width;
        this.height=options.height;

        this.dictAnimations=options.animations;

    },
    setTurn:function(is,lastDataUrl){
        if(!is){
            this.lastSnapShot.src=lastDataUrl;
        }
        this.myTurn=is;
    },
    toObject: function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        label: this.get('label')
      });
    },
    
    render:function(ctx){
        
        ctx.save();
            this._setOpacity(ctx);
            this.transform(ctx);
            if(this.myTurn){
                ctx.drawImage(this.cacheCanvas,-this.width/2,-this.height/2);
            }else{
                ctx.drawImage(this.lastSnapShot,-this.width/2,-this.height/2);  
            }
        ctx.restore();
        
       /*
       if(this.myTurn){
           ctx.drawImage(this.cacheCanvas,0,0);
       }else{
           ctx.drawImage(this.lastSnapShot,0,0);  
       }*/
    },
    executeAnimations:function(currentTime){

        for(const prop in this.dictAnimations){
            let anims=this.dictAnimations[prop]
            for(var i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value==="tiempoMenor"){
                        if(this.isFirstIndex(i,anims.length)){
                            this.set(anim.property,anim.startValue);
                            break;
                        }
                    }else if (value==="tiempoMayor"){
                        if(this.isLastIndex(i)){
                            this.set(anim.property,anim.endValue);
                            break;
                        }
                    }
                    else{
                        this.set(anim.property,value);
                        break;
                    }
                }else{
                    this.set(anim.property,anim.startValue);
                }
            }
        }
    },
    isLastIndex:function(index,listLength){
        return index===listLength-1;
    },
    isFirstIndex:function(index){
        return index===0;
    },
    hasAnimations:function(){

        for(const prop in this.dictAnimations){
            if(this.dictAnimations[prop].length>0){
                return true;
            }
            
        }

        return false;
    },
    hasPropertyAnimations:function(prop){
        return (this.dictAnimations[prop].length>0);
    },


  });
const EntranceModes={
    drawn:"drawn",
    dragged:"dragged",
    none:"none"
}
var AnimableCamera=fabric.util.createClass(ImageAnimable,{
    type:"AnimableCamera",
    initialize:function(element,options){
        this.callSuper("initialize",element,options)
        this.started=false;
        this.canvasCamera=null;
        this.entranceMode=EntranceModes.none;

        this.lockUniScaling=true;
        this.lockRotation=true;
        this.cornerStyle="rect";
        this.cornerColor="rgba(200,100,0,0.9)"
        this.cornerSize=20;
    },
    start:function(){
        this.started=true;
    },
    stop:function(){
        this.started=false;
    },
    setCanvasCamera:function(canvas){
        this.canvasCamera=canvas;
    },
    executeAnimations:function(currentTime){
        this.callSuper("executeAnimations",currentTime);
        if(this.started){
            this.updateCanvastWithOwnState();
        }
    },
    updateCanvastWithOwnState:function(){
        var vpt = this.canvasCamera.viewportTransform;
        let vtmp=[this.get("scaleX"),0,0,this.get("scaleX"),0,0]
        let inverseScale=this.invertTransform(vtmp);
        vpt[4] = -this.get("left")*inverseScale[0];
        vpt[5] = -this.get("top") *inverseScale[0];
        this.canvasCamera.zoomToPoint(new fabric.Point(0,0),inverseScale[0]);
        this.canvasCamera.opacity=this.get("opacity");
    },
    invertTransform: function(t) {
        var a = 1 / (t[0] * t[3] - t[1] * t[2]),
            r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
            o = fabric.util.transformPoint({ x: t[4], y: t[5] }, r, true);
        r[4] = -o.x;
        r[5] = -o.y;
        return r;
    }
})
/*
* Canvas en el que se toma en cuenta la opacidad, la cual es aplicar a todos los objetos. Usado para el canvas previewer
* */
var CustomStaticCanvas = fabric.util.createClass(fabric.Canvas, {
    initialize:function(id,options){
        this.callSuper('initialize', id,options);
        this.opacity=1;
    },
    renderCanvas:function(ctx, objects){
        var v = this.viewportTransform, path = this.clipPath;
        this.cancelRequestedRender();
        this.calcViewportBoundaries();
        this.clearContext(ctx);
        this.fire('before:render', { ctx: ctx, });
        if (this.clipTo) {
            fabric.util.clipContext(this, ctx);
        }
        this._renderBackground(ctx);

        ctx.save();
        ctx.globalAlpha=this.opacity;
        //apply viewport transform once for all rendering process
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        this._renderObjects(ctx, objects);
        ctx.restore();
        if (!this.controlsAboveOverlay && this.interactive) {
            this.drawControls(ctx);
        }
        if (this.clipTo) {
            ctx.restore();
        }
        if (path) {
            path.canvas = this;
            // needed to setup a couple of variables
            path.shouldCache();
            path._transformDone = true;
            path.renderCache({ forClipping: true });
            this.drawClipPathOnCanvas(ctx);
        }
        this._renderOverlay(ctx);
        if (this.controlsAboveOverlay && this.interactive) {
            this.drawControls(ctx);
        }
        this.fire('after:render', { ctx: ctx, });
    }
});
























