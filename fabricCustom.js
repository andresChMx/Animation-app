fabric.Object.prototype.setBatch=function(dictNewProperties){// sets properties in batch where the given properties are in world coordinates
    if(this.group){// is its in a group, the values will be transformed to the group's coordinates system
        if(dictNewProperties["left"]===undefined){//meaning if it has no properties
            return;
        }
        let absoluteMatrix=this.calcTransformMatrix(); // absolute values (world coordinates, never changes)
        let options=fabric.util.qrDecompose(absoluteMatrix);

        for(let key in dictNewProperties){
            if(key==="left"){
                options.translateX=dictNewProperties[key];
            }else if(key==="top"){
                options.translateY=dictNewProperties[key];
            }else{
                options[key]=dictNewProperties[key];
            }
        }
        let newMat=fabric.util.composeMatrix(options);
        let groupInverseMatrix=fabric.util.invertTransform(this.group.calcTransformMatrix());// matrix to convert world coordinates to group coordinates
        let finalMatrix=fabric.util.multiplyTransformMatrices(groupInverseMatrix,newMat); //converting object new world coordinates to group coordinates
        let optionsFinal=fabric.util.qrDecompose(finalMatrix);
        //setting new values
        this.set(optionsFinal);
        this.left=optionsFinal.translateX;
        this.top=optionsFinal.translateY;
    }else{
        for(let key in dictNewProperties){
            this[key]=dictNewProperties[key];
        }
    }
};
fabric.Object.prototype.getCustom=function(property){ // gets properties in world coordinates whether it is in a group or not
    if(this.group){
        let optionsInGroup=fabric.util.qrDecompose(this.calcOwnMatrix());
        let optionsInWorld = fabric.util.qrDecompose(this.calcTransformMatrix());

        this.set(optionsInWorld);
        this.setPositionByOrigin({x:optionsInWorld.translateX,y:optionsInWorld.translateY},"center","center");
        let worldPositionAtOrigin={x:this.left,y:this.top};

        this.set(optionsInGroup);
        this.setPositionByOrigin({x:optionsInGroup.translateX,y:optionsInGroup.translateY},"center","center");

        switch (property){
            case "left":return worldPositionAtOrigin.x;case "top":return worldPositionAtOrigin.y;
            case "angle":return optionsInWorld.angle;case "scaleX":return optionsInWorld.scaleX;
            case "scaleY":return optionsInWorld.scaleY;default:return this.get(property);
        }
    }else{
        return this.get(property);
    }
}
var ImageAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntrenceModes:[EntranceModes.none,EntranceModes.drawn,EntranceModes.dragged],//FOR UI (enable radios)
    type:'ImageAnimable',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
        this.centeredRotation=false;
        this.name="";
        this.entranceMode=null;
        this.entraceModesSettings={};
        this.setupEntraceModesSettings();
        this.imageAssetModel=options.imageAssetModel;
        this.imageDrawingData=this.setupImageDrawingDTO(options);
        this.animator=new Animator(this);
        this.setEntranceMode(EntranceModes.drawn); //debe estar a drawn antes de generar la imagen final mascarada (la siguiente funcion invocada)
        if(this.type==="ImageAnimable"){ // since the subclasse (CameraAnimable) are invoking this constructor ()
            this.generateFinalMaskedImage();
        }
    },
    setupEntraceModesSettings:function(){
        this.entraceModesSettings[this.applicableEntrenceModes[0]]={

        }
        this.entraceModesSettings[this.applicableEntrenceModes[1]]={
            showHand:true,
            finalDrawingAppearance:'masked'
        }
        this.entraceModesSettings[this.applicableEntrenceModes[2]]={

        }
    },
    setupImageDrawingDTO:function(options){ //no es del todo un entity lo que se recibe, puesto que ya se agrego el atributo imgHigh
        return {
            imgHigh:options.imgHighDefinition,
            imgLow:options.imgLowDefinition,
            imgMasked:null,
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:ImageType.CREATED_NOPATH
        }
    },
    generateFinalMaskedImage:function(){
        let dataGenerator=new ImageModelDrawingDataGenerator();

        let canvas=document.createElement("canvas");
        let ctx=canvas.getContext("2d");
        if(this.imageDrawingData.type===ImageType.CREATED_NOPATH){
            canvas.width=this.imageDrawingData.imgHigh.naturalWidth;
            canvas.height=this.imageDrawingData.imgHigh.naturalHeight;
            ctx.drawImage(this.imageDrawingData.imgHigh,0,0);
            this.imageDrawingData.imgMasked=new Image();
            this.imageDrawingData.imgMasked.src=canvas.toDataURL();
            canvas.remove();
            return;
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

    getWidthInDrawingCache:function(){
        return this.imageDrawingData.imgHigh.naturalWidth;
    },
    getHeightInDrawingCache:function(){
        return this.imageDrawingData.imgHigh.naturalHeight;
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },
    getGlobalPosition:function(){ // POSITION OF THIS OBJECT IN VIEWPORT COORDS (useful for positioning el floating menu)
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
})
var TextAnimable=fabric.util.createClass(fabric.IText, {
    //drawn y text_draw NO son lo mismo, ya que su logica es diferente
    applicableEntrenceModes: [EntranceModes.none,EntranceModes.text_drawn,EntranceModes.dragged,EntranceModes.text_typed],//FOR UI
    type:"TextAnimable",
    initialize:function(text,options){
        /*exact copy of animable object*/
        this.callSuper('initialize', text,options);
        this.centeredRotation=false;
        this.name="";
        this.fill="#000000";
        this.entranceMode=null;
        this.entraceModesSettings={};
        this.setupEntraceModesSettings();
        this.imageAssetModel={imgLow:""}
        this.fontAssetModel={id:"",url_font:"",user_id:""}
        this.imageDrawingData=this.setupImageDrawingDTO();
        this.animator=new Animator(this);
        this.setFontSize(72);
        this.setFontFamily(FontsNames["bauhs 93"]);
        /*---------------------------*/
    },//exitEditing
    setupEntraceModesSettings:function(){
        this.entraceModesSettings[this.applicableEntrenceModes[0]]={

        }
        this.entraceModesSettings[this.applicableEntrenceModes[1]]={
            showHand:true,
            finalDrawingAppearance:'masked'
        }
        this.entraceModesSettings[this.applicableEntrenceModes[2]]={

        }
    },
    setupImageDrawingDTO:function(){
        return {
            imgMasked:null,
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:ImageType.CREATED_NOPATH
        }

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
        this.entranceMode=mode;
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

    getGlobalPosition:function(){ // POSITION OF THIS OBJECT IN VIEWPORT COORDS (useful for positioning el floating menu)
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
});
var CameraAnimable=fabric.util.createClass(ImageAnimable,{
    applicableEntrenceModes:[EntranceModes.none],//FOR UI
    type:"CameraAnimable",
    initialize:function(element,options){
        this.callSuper("initialize",element,options);
        this.name="Camera";
        this.isCamera=true;
        this.started=false;
        this.lockUniScaling=true;
        this.canvasCamera=null;
        this.entranceMode=EntranceModes.none;
        this.setControlsVisibility({"pivot":false});
        this.cornerStyle="rect";
        this.cornerColor="rgba(200,100,0,0.9)"
        this.cornerSize=20;
        this.animator=new AnimatorCamera(this,this.canvasCamera);
    },
})
fabric.util.object.extend(fabric.Image,{
    fromURLCustom:function(url, callback, imgOptions){
      fabric.util.loadImage(url, function(img) {
        callback && callback(new CameraAnimable(img, imgOptions));
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
        this.width=options.width;
        this.height=options.height;

        this.animator=new Animator(this);
        this.animator.dictAnimations=options.animations;
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
    
    render:function(ctx){
        ctx.save();
        this._setOpacity(ctx);
        this.transform(ctx);
        //ctx.imageSmoothingEnabled = false;
        if(this.myTurn){
            ctx.drawImage(this.cacheCanvas,-this.width/2,-this.height/2)
        }else{
            ctx.drawImage(this.lastSnapShot,-this.width/2,-this.height/2);
        }
        ctx.restore();
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
























