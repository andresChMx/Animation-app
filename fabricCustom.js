var EnumAnimationFunctionTypes={
    Sine:'Sine',
    Cubic:'Cubic',
    Quint:'Quint',
    Circ:'Circ',
    Back:'Back',
    Elastic:'Elastic',
    Bounce:'Bounce',
}
var EnumAnimationTweenType={
    In:'In',
    Out:'Out',
    InOut:'InOut',
    Linear:'Linear',
}
var Animation=fabric.util.createClass({
    startValue:-1,
    endValue:-1,
    byValue:-1,

    startMoment:-1,
    endMoment:-1,
    

    property:"",
    functionName:'easeInSine',
    easeFunctionType:'Sine', // sine,quart, etc...
    tweenType:'In',  // In | Out | InOut | linear
    initialize:function(property,startValue,endValue,startMoment,endMoment){
        this.property=property;
        this.initParameters(startValue,endValue,startMoment,endMoment)
    },
    initParameters:function(startValue,endValue,startMoment,endMoment){
        this.startValue=startValue;
        this.endValue=endValue;

        this.startMoment=startMoment;
        this.endMoment=endMoment;

        this.localDuration=endMoment-startMoment;
        this.byValue=endValue-startValue;
    },
    updateMoments:function(startMoment,endMoment){
        this.startMoment=startMoment;
        this.endMoment=endMoment;
        this.localDuration=this.endMoment-this.startMoment;
    },
    setEaseFunctionType:function(functionTypeName){
        let name=EnumAnimationFunctionTypes[functionTypeName];
        if(name===undefined){
            name=EnumAnimationFunctionTypes.Sine;
        }
        this.easeFunctionType=name;
        this.assembleFunctionName();
    },
    setTweenType:function(tweenType){
        let type=EnumAnimationTweenType[tweenType];
        if(type===undefined){
            type=EnumAnimationTweenType.In;
        }
        this.tweenType=type;
        this.assembleFunctionName();
    },
    assembleFunctionName:function(){
        if(this.tweenType===EnumAnimationTweenType.Linear){
            this.functionName='Linear';
        }else{
            this.functionName='ease' + this.tweenType + this.easeFunctionType;
        }
    },
    tick:function(currentTime){
        if(currentTime<this.startMoment){
            return "tiempoMenor";
        }else if(currentTime>this.endMoment){
            return "tiempoMayor";
        }else{
            let currentTimeLocalAnim=currentTime-this.startMoment;
            let currentValue = fabric.util.ease[this.functionName](currentTimeLocalAnim, this.startValue, this.byValue, this.localDuration);
            return currentValue;
        }
    },
    hasTwoKeys:function(){
        return this.endMoment!=-1 && this.endValue!=-1;
    }
});
fabric.util.ease.Linear=function(t,b,c,d){
    return (t/d)*c + b;
}
var Animator=fabric.util.createClass({
    initialize:function(animableObject){
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
        this.animableObject=animableObject;
    },
    setAnimableObject:function(obj){
        this.animableObject=obj;
    },
    executeAnimations:function(currentTime){

        for(const prop in this.dictAnimations){
            let anims=this.dictAnimations[prop]
            for(var i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value==="tiempoMenor"){
                        if(this.isFirstIndex(i)){
                            this.animableObject.set(anim.property,anim.startValue);
                            break;
                        }
                    }else if (value==="tiempoMayor"){
                        if(this.isLastIndex(i,anims.length)){
                            this.animableObject.set(anim.property,anim.endValue);
                            break;
                        }
                    }
                    else{
                        this.animableObject.set(anim.property,value);
                        break;
                    }
                }else{
                    this.animableObject.set(anim.property,anim.startValue);
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
    addAnimation:function(property,startValue,endValue,startMoment,endMoment){//string,number,number
        this.dictAnimations[property].push(new Animation(property,startValue,endValue,startMoment,endMoment));
        console.log("TOTAL CANT ANIMACIONES EN PROPEIDAD : " + property + this.dictAnimations[property].length);
    },
    addAnimations:function(properties,startValues,endValues,startMoment,endMoment){
        for(let i in properties){
            this.addAnimation(properties[i],startValues[i],endValues[i],startMoment,endMoment)
        }
    },
    updateAnimation:function(animIndex,property,startValue,endValue,startMoment,endMoment){
        this.dictAnimations[property][animIndex].initParameters(startValue,endValue,startMoment,endMoment);
    },
    updateAnimations:function(animIndex,properties,startValues,endValues,startMoment,endMoment){
        for (let i in properties){
            this.updateAnimation(animIndex,properties[i],startValues[i],endValues[i],startMoment,endMoment);
        }
    },
    /*
    updateAnimation:function(property,indexAnimation, startValue,endValue,startMoment,endMoment){
        this.dictAnimations[property][indexAnimation].updateValues(startValue,endValue,startMoment,endMoment);
    },*/

    hasPropertyAnimations:function(prop){
        return (this.dictAnimations[prop].length>0);
    },
    onDurationChange:function(durationBefore,durationAfter){
        if(this.hasAnimations() && durationBefore>durationAfter){
            for(const prop in this.dictAnimations){
                if(this.hasPropertyAnimations(prop)) {
                    for (let i = 0; i < this.dictAnimations[prop].length; i++) {
                        let listAnims = this.dictAnimations[prop];
                        if (listAnims[0].hasTwoKeys()) {
                            let percentStartMoment = listAnims[i].startMoment / durationBefore;
                            let percentEndMoment = listAnims[i].endMoment / durationBefore;
                            listAnims[i].updateMoments(durationAfter * percentStartMoment, durationAfter * percentEndMoment)
                        } else {
                            let percentStartTime = listAnims[0].startMoment / durationBefore;
                            listAnims[0].updateMoments(durationAfter * percentStartTime, -1)
                            break;
                        }

                    }
                }
            }
        }

    }
});
var AnimatorCamera=fabric.util.createClass(Animator,{
    initialize:function(animableObject,canvasCamera){
      this.callSuper("initialize",animableObject);
      this.canvasCamera=canvasCamera;
      this.startCameraAnimation=false;
    },
    executeAnimations:function(currentTime){
        this.callSuper("executeAnimations",currentTime);
        if(this.startCameraAnimation){
            this.updateCanvastWithOwnState();
        }
    },
    updateCanvastWithOwnState:function(){
        var vpt = this.canvasCamera.viewportTransform;
        let vtmp=[this.animableObject.get("scaleX"),0,0,this.animableObject.get("scaleX"),0,0]
        let inverseScale=this.invertTransform(vtmp);
        /*
        vpt[0]=Math.cos(-20/180*Math.PI);
        vpt[1]=Math.sin(-20/180*Math.PI);
        vpt[2]=-Math.sin(-20/180*Math.PI);
        vpt[3]=Math.cos(-20/180*Math.PI);
         */
        vpt[4] = -this.animableObject.get("left")*inverseScale[0];
        vpt[5] = -this.animableObject.get("top") *inverseScale[0];
        this.canvasCamera.zoomToPoint(new fabric.Point(0,0),inverseScale[0]);
        this.canvasCamera.opacity=this.animableObject.get("opacity");
    },
    invertTransform: function(t) {
        var a = 1 / (t[0] * t[3] - t[1] * t[2]),
            r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
            o = fabric.util.transformPoint({ x: t[4], y: t[5] }, r, true);
        r[4] = -o.x;
        r[5] = -o.y;
        return r;
    },
    start:function(camera){
        this.startCameraAnimation=true;
        this.canvasCamera=camera;
    },
    stop:function(){
        this.startCameraAnimation=false;
    },
});
var ImageAnimable=fabric.util.createClass(fabric.Image,{
    type:'ImageAnimable',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
        this.name="";
        this.entranceMode=null;
        this.imageDrawingData=this.convertEntityToDTO(options.imageDrawingData);
        this.animator=new Animator(this);
        this.setEntranceMode(EntranceModes.drawn); //debe estar a drawn antes de generar la imagen final mascarada (la siguiente funcion invocada)
        if(this.type==="ImageAnimable"){ // since the subclasse (AnimableCamera) are invoking this constructor ()
            this.generateFinalMaskedImage();
        }
    },
    convertEntityToDTO:function(entityDrawingData){ //no es del todo un entity lo que se recibe, puesto que ya se agrego el atributo imgHTML
        let DTO={
            id:entityDrawingData.id,
            url:entityDrawingData.url,
            userid:entityDrawingData.userid,

            imgHTML:entityDrawingData.imgHTML,
            imgMasked:null,
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:ImageType.CREATED_NOPATH
        }
        return DTO;
    },
    generateFinalMaskedImage:function(){
        let canvas=document.createElement("canvas");
        let ctx=canvas.getContext("2d");
        let dataGenerator=new ImageModelDrawingDataGenerator();
        if(this.imageDrawingData.type===ImageType.CREATED_NOPATH){
            //calculate points and ctrlPoints and strokestyes (para el pathillustrator)
            canvas.width=this.imageDrawingData.imgHTML.naturalWidth;
            canvas.height=this.imageDrawingData.imgHTML.naturalHeight;
            ctx.drawImage(this.imageDrawingData.imgHTML,0,0);
            this.imageDrawingData.imgMasked=new Image();
            this.imageDrawingData.imgMasked.src=canvas.toDataURL();
            canvas.remove();
            return;
            //dataGenerator.generateDefaultDrawingPointsAndLineWidth(this.imageDrawingData, 35)
            //this.imageDrawingData.ctrlPoints=dataGenerator.generateCrtlPointsFromPointsMatrix(this.imageDrawingData.points);
            //this.imageDrawingData.strokesTypes=dataGenerator.generateStrokesTypesFromPoints(this.imageDrawingData.points);
            //this.imageDrawingData.pathsNames=dataGenerator.generateLayerNames(this.imageDrawingData.points)
        }else if(this.imageDrawingData.type===ImageType.CREATED_PATHDESIGNED){
            // solo cargamos ctrlpoints porque los strokestypes y points estan guardados en el objeto
            this.imageDrawingData.ctrlPoints=dataGenerator.generateCrtlPointsFromPointsMatrix(this.imageDrawingData.points);
        }
        else if(this.imageDrawingData.type===ImageType.CREATED_PATHLOADED){
            //NOTHING BECAUSE POINTS AND CTRLPOINTS ARE ALREADY CALCULATED
        }

        let illustratorDataAdapterCache=new IllustratorDataAdapterCache([this]);
        let pathIllustrator=new PathIllustrator(canvas,ctx,illustratorDataAdapterCache,false);
        pathIllustrator.generateFinalImage(function(dataUrl){
            /*
            var link = document.createElement("a");
            link.download = name;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            delete link;
            */
            this.imageDrawingData.imgMasked=new Image();
            this.imageDrawingData.imgMasked.src=dataUrl;
            canvas.remove();
        }.bind(this))
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },
    getWidthInDrawingCache:function(){
        return this.imageDrawingData.imgHTML.naturalWidth;
    },
    getHeightInDrawingCache:function(){
        return this.imageDrawingData.imgHTML.naturalHeight;
    },
    getGlobalPosition:function(){ // POSITION OF THIS OBJECT IN VIEWPORT COORDS
        let newPoint=fabric.util.transformPoint(new fabric.Point(this.left,this.top),this.canvas.viewportTransform);
        newPoint.x+=this.canvas._offset.left;
        newPoint.y+=this.canvas._offset.top;
        return newPoint;

    },
    render:function(ctx){
        /*se sobreescribio por que cuando un objeto sale de vista, no se renderizaba, es tamos oviando eso
        esa parte del metodo render original*/
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
    },
    //TODO: update animation handler
})

var TextAnimable=fabric.util.createClass(fabric.IText, {
    type:"TextAnimable",
    initialize:function(text,options){
        /*exact copy of animable object*/
        this.callSuper('initialize', text,options);
        this.name="";
        this.entranceMode=null;
        this.imageDrawingData=this.convertEntityToDTO(options.imageDrawingData);
        this.animator=new Animator(this);
        this.setFontSize(72);
        this.setFontFamily(FontsNames["bauhs 93"]);
        /*---------------------------*/
    },//exitEditing
    convertEntityToDTO:function(entityDrawingData){ //no es del todo un entity lo que se recibe, puesto que ya se agrego el atributo imgHTML
        let DTO={
            //id:entityDrawingData.id,
            url:entityDrawingData.url,
            //userid:entityDrawingData.userid,

            //imgHTML:entityDrawingData.imgHTML,
            //imgMasked:null,
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:ImageType.CREATED_NOPATH
        }
        return DTO;
    },
    setFontFamily:function(fontname){ //Cargando Font Object y guardandolo, solo si aun no esta cargado
        if(!FontsFileName[fontname]){fontname=Object.keys(FontsFileName)[0];} //validando que nombre sea uno valido

        this.fontFamily=fontname;
        OpenTypeFontManager.LoadOpenTypeFont(FontsFileName[fontname]);
    },
    setFontSize:function(size){
        this.fontSize=size;
        //this.exitEditing();
        if(this.canvas){//en cuanto es inicializado aun no tiene asignado un canvas, hasta que se llame a add en su canvas padre
            this.canvas.renderAll();
        }
    },
    setEntranceMode:function(mode){
        if(mode===EntranceModes.drawn){
            this.entranceMode=EntranceModes.text_drawn;
        }else{
            this.entranceMode=mode;
        }
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },
    getWidthInDrawingCache:function(){
        return this.width; // estas dimensiones son calculadas en base al fontSize, es decir , siempre que no sea escaldo el objeto la dimencion es correcta
    },
    getHeightInDrawingCache:function(){
        return this.height; // estas dimensiones son calculadas en base al fontSize, es decir , siempre que no sea escaldo el objeto la dimencion es correcta
    },
    getGlobalPosition:function(){ // POSITION OF THIS OBJECT IN VIEWPORT COORDS
        let newPoint=fabric.util.transformPoint(new fabric.Point(this.left,this.top),this.canvas.viewportTransform);
        newPoint.x+=this.canvas._offset.left;
        newPoint.y+=this.canvas._offset.top;
        return newPoint;

    },
    render:function(ctx){

        /*se sobreescribio por que cuando un objeto sale de vista, no se renderizaba, es tamos oviando eso
        esa parte del metodo render original*/
        ctx.save();
        //this._setupCompositeOperation(ctx);
        this.drawSelectionBackground(ctx);
        this.transform(ctx);
        this._setOpacity(ctx);
        //this._setShadow(ctx, this);
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
    },
});
const EntranceModes={
    drawn:"drawn",
    dragged:"dragged",
    none:"none",

    text_drawn:"text_drawn",
    text_typed:"text_typed"
}
var AnimableCamera=fabric.util.createClass(ImageAnimable,{
    type:"AnimableCamera",
    initialize:function(element,options){
        this.callSuper("initialize",element,options);
        this.name="Camera";
        this.isCamera=true;
        this.started=false;
        this.canvasCamera=null;
        this.entranceMode=EntranceModes.none;

        this.lockUniScaling=true;
        this.lockRotation=true;
        this.cornerStyle="rect";
        this.cornerColor="rgba(200,100,0,0.9)"
        this.cornerSize=20;
        this.animator=new AnimatorCamera(this,this.canvasCamera);
    },
})
fabric.util.object.extend(fabric.Image,{
    fromURLCustom:function(url, callback, imgOptions){
      fabric.util.loadImage(url, function(img) {
        callback && callback(new AnimableCamera(img, imgOptions));
      }, null, imgOptions && imgOptions.crossOrigin);
    }
})
/*Hacemos que al cargar el svg string pase por el flatenner */
fabric.loadSVGFromURLCustom= function(url, callback, reviver, options) {

    url = url.replace(/^\n\s*/, '').trim();
    new fabric.util.request(url, {
        method: 'get',
        onComplete: onComplete
    });

    function onComplete(r) {

        var xml = r.responseXML;
        if (xml && !xml.documentElement && fabric.window.ActiveXObject && r.responseText) {
            xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.async = 'false';
            //IE chokes on DOCTYPE
            xml.loadXML(r.responseText.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*\])*?>/i, ''));
        }
        if (!xml || !xml.documentElement) {
            callback && callback(null);
            return false;
        }
        /*------------------*/
        let cacheSVG=document.createElement("div");
        cacheSVG.style.visibility="hidden";
        document.body.appendChild(cacheSVG);

        cacheSVG.appendChild(
            xml.documentElement
        )

        flatten(cacheSVG);

        let s = new XMLSerializer();
        let str = s.serializeToString(cacheSVG);

        fabric.loadSVGFromString(str,callback)
        /*------------------- */
        /**
        fabric.parseSVGDocument(str, function (results, _options, elements, allElements) {
            callback && callback(results, _options, elements, allElements);
        }, reviver, options);
         **/
    }
};
var DrawableImage = fabric.util.createClass(fabric.Object, {

    type: 'DrawableImage',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    //
    initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize',options);
        this.set('label', options.label || '');

        this.cacheCanvas=options.cacheCanvas;
    //this.mainCanvas=options.mainCanvas;
        this.myTurn=false;
        this.lastSnapShot=new Image();
        this.lastSnapShot.src=this.cacheCanvas.toDataURL();
        this.currentSnapShot=new Image();
        this.currentSnapShot.src=this.cacheCanvas.toDataURL();
        this.snapShot=new Image();
        this.snapShot.src=this.cacheCanvas.toDataURL();
        this.flagCurrentSnapReady=true;

        this.width=options.width;
        this.height=options.height;

        this.animator=new Animator(this);
        this.animator.dictAnimations=options.animations;

        this.flaglastSnapShotReady=false;
    },
    setTurn:function(is,finalImageMask){
        this.flaglastSnapShotReady=false;
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
    
    render:function(ctx){
        ctx.save();
        this._setOpacity(ctx);
        this.transform(ctx);
        ctx.imageSmoothingEnabled = false;
        if(this.myTurn){
            ctx.drawImage(this.cacheCanvas,-this.width/2,-this.height/2)
            // if(this.flagCurrentSnapReady){
            //     this.flagCurrentSnapReady=false;
            //     this.currentSnapShot.src=this.cacheCanvas.toDataURL("image/png",1);
            //     this.currentSnapShot.onload=function(img){
            //         this.snapShot=img.target.cloneNode();
            //         if(this.myTurn){
            //             ctx.drawImage(this.snapShot,-this.width/2,-this.height/2);
            //         }
            //         this.flagCurrentSnapReady=true;
            //     }.bind(this);
            //     ctx.drawImage(this.snapShot,-this.width/2,-this.height/2);
            // }else{
            //     ctx.drawImage(this.snapShot,-this.width/2,-this.height/2);
            // }
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
  });

/*
* Canvas en el que se toma en cuenta la opacidad, la cual es aplicar a todos los objetos. Usado para el canvas previewer
* */
var CustomStaticCanvas = fabric.util.createClass(fabric.StaticCanvas, {
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
























