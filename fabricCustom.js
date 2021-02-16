/*
* The next block makes the active group (multiple selection) readjust its bounds after the marker has been dragged
* */
fabric.ActiveSelection.prototype.update=function(){
    this._restoreObjectsState();
    this.angle=0;
    this.scaleX=1;
    this.scaleY=1;
    this._calcBounds();
    this._updateObjectsCoords();
    this.setCoords();
    this.dirty=true;
    this.canvas.renderAll();
}
fabric.ActiveSelection.prototype.initialize=function(objects,options){
    options = options || {};
    this._objects = objects || [];
    for (var i = this._objects.length; i--; ) {
        this._objects[i].group = this;
    }

    if (options.originX) {
        this.originX = options.originX;
    }
    if (options.originY) {
        this.originY = options.originY;
    }
    this._calcBounds();
    this._updateObjectsCoords();
    fabric.Object.prototype.initialize.call(this, options);
    this.setCoords();

    //Before here same as the original

    //When the acitveselection starts been rotated the getCustom function will return the true angle of the objects with are in group coordinates and "normalized"
    this.on("modified",function(e){
        if(e.transform.action==="rotate"){
            for (var i = this._objects.length; i--; ){
                this._objects[i].angleInWorld=null;
            }
        }
    })

    //NO OVIDAR UNREGISTRAR CUALQUIER OBSERVER QUE SE REGISTRE EN ESTE OBJECTO, YA UQE ESTE OBJETO SE ELIMNA, Y SI NO TE DESREGISTRAR SEGIRA MOVIENDO A LOS OBJETOS SIN TU CONSENTIMINETO
    MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this);
    MainMediator.registerObserver(PanelInspector.name,PanelInspector.events.OnObjectPropertyWidgedChanged,this);

}
fabric.ActiveSelection.prototype.notificationPanelActionEditorOnMarkerDragEnded=function(){
    this.update();
}
fabric.ActiveSelection.prototype.notificationPanelInspectorOnObjectPropertyWidgedChanged=function(){
    this.update();
}
fabric.ActiveSelection.prototype.onDeselect=function(){
    MainMediator.unregisterObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragEnded,this);
    MainMediator.unregisterObserver(PanelInspector.name,PanelInspector.events.OnObjectPropertyWidgedChanged,this);
    this.__eventListeners["modified"]=[] // este mismo objeto estaba suscrito a este evento ver initialize

    //From here Same as the original
    this.destroy();
    return false;
}


// sets properties in batch where the given properties are in world coordinates
// Esta funcion existe para lograr manejar la seleccion multiple de objectos, es como un proxy entre coordenadas grupales y las absolutas. Consiste en que cuando el objecto se encuentra en un grupo,
// primero obtenemos sus propiedades en coordenadas absolutas con calcTransformMatrix() para poder alterar esos valores con otros que estan en coordenadas aboslutas, de forma que
// siembre estaremos trabajando con coordenadas aboslutas, el problema de hallar una matriz de transformaciones
// en fabric es que las propeidades translateX y translateY las halla respecto al centro del object, no coincide a left y top, este problema biene de calcOwnMatrix(). Entonces se hace un paso en el que se
// esos valores se modifiquen hacia las coordenadas del origen, de forma que si el animator no pasa ni left y top, los valores pasados al objecto
// sean los correctos y no los del centro del objecto.
fabric.Object.prototype.setBatch=function(dictNewProperties){
    if(this.group){// is its in a group, the values will be transformed to the group's coordinates system
        if(Object.keys(dictNewProperties).length===0){//meaning if it has no properties, just for purposes of performance
            return;
        }
        let absoluteMatrix=this.calcTransformMatrix(); // absolute values (world coordinates, never changes)
        let optionsInWorld=fabric.util.qrDecompose(absoluteMatrix);

        // El siguiente bloque se debe a que EN CASO EL ANIMATOR NO ESTABLESCA LAS PROPIEDADES de left y top, no lo sobrescriba al objecto con las propiedaes del centro sino de su origen
        this.set(optionsInWorld);//porque la sigueinte funcion accedera a cosas como escala y angulo.
        this.setPositionByOrigin({x:optionsInWorld.translateX,y:optionsInWorld.translateY},"center","center");
        optionsInWorld.translateX=this.left;
        optionsInWorld.translateY=this.top;

        for(let key in dictNewProperties){
            if(key==="left"){
                optionsInWorld.translateX=dictNewProperties[key];
            }else if(key==="top") {
                optionsInWorld.translateY = dictNewProperties[key];
            }else{
                optionsInWorld[key]=dictNewProperties[key];
            }
        }

        let newMat=fabric.util.composeMatrix(optionsInWorld);
        let groupInverseMatrix=fabric.util.invertTransform(this.group.calcTransformMatrix());// matrix to convert world coordinates to group coordinates
        let finalMatrix=fabric.util.multiplyTransformMatrices(groupInverseMatrix,newMat); //converting object new world coordinates to group coordinates
        let optionsFinal=fabric.util.qrDecompose(finalMatrix);
        //setting new values
        this.set(optionsFinal);
        //this conditional enables de use of the variable angleInWorld by the getCustom function. This way the animator can get the angle value setted
        // by the inspector, which is in world coordinates and is not "normalized" by fabricjs. And will return the true angle value as soon as the Active selection is rotated
        if(dictNewProperties.angle !==undefined){
            this.angleInWorld=dictNewProperties.angle;
        }

        this.opacity=dictNewProperties.opacity===undefined?this.opacity:dictNewProperties.opacity;
        //left y top se pasan directamente, sin considerar el origin, ya que los valores pasados por el animator de left y top ya estan en relacion al origin (ger getCustom)
        this.left=optionsFinal.translateX;
        this.top=optionsFinal.translateY;
    }else{
        for(let key in dictNewProperties){
            this[key]=dictNewProperties[key];
        }
    }
};
/*
* Permite trabajar con seleccion multiple, sirve como un proxy entre coornadas de de la seleccion y las absolutas. De forma que para el resto de
* la aplicacion se retornan las coordenadas absolutas del objecto. Funciona a la par de la funcion setBatch, que de maneja las coordenadas absolutas
* en caso el objecto esté en una seleccion
* */
fabric.Object.prototype.getCustom=function(property){ // gets properties in world coordinates whether it is in a group or not
    if(this.group){
        //getting object transformation in group coordinates system. Note that the location is acoording the center of the object, not its origin
        let optionsInGroup=fabric.util.qrDecompose(this.calcOwnMatrix());
        let optionsInWorld = fabric.util.qrDecompose(this.calcTransformMatrix());

        this.set(optionsInWorld); // we do this because in order to find the location according the object's origin, the next function makes use of the angle and scale of the object, but those values before this line were according the group.
        // finding the object's location its origin
        this.setPositionByOrigin({x:optionsInWorld.translateX,y:optionsInWorld.translateY},"center","center");
        let worldPositionAtOrigin={x:this.left,y:this.top};

        //bringing back coordintates according its group
        this.set(optionsInGroup);
        this.setPositionByOrigin({x:optionsInGroup.translateX,y:optionsInGroup.translateY},"center","center");

        //getting the required value;
        switch (property){
            case "left":return worldPositionAtOrigin.x;case "top":return worldPositionAtOrigin.y;
            case "angle":if(this.angleInWorld){return this.angleInWorld}else{return optionsInWorld.angle}
            case "scaleX":return optionsInWorld.scaleX;
            case "scaleY":return optionsInWorld.scaleY;default:return this.get(property);
        }
    }else{
        return this.get(property);
    }
}

fabric.Object.prototype.getGlobalPosition=function(){// POSITION OF THIS OBJECT IN VIEWPORT COORDS (useful for positioning el floating menu)
    let newPoint=fabric.util.transformPoint(new fabric.Point(this.aCoords.tl.x,this.aCoords.tl.y),this.canvas.viewportTransform);
    newPoint.x+=this.canvas._offset.left;
    newPoint.y+=this.canvas._offset.top;
    return newPoint;
}
fabric.Object.prototype.name="ObjectC";


var ImageAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntrenceModes:[EntranceModes.none,EntranceModes.drawn,EntranceModes.dragged],//FOR UI (enable radios)

    type:'ImageAnimable',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask],
        /*fabric.Object setting*/
        this.padding=20;
        this.transparentCorners= false;
        this.cornerColor="rgb(0,0,0)";
        this.name="ObjectX";
        this.centeredRotation=false;
        this.originX='custom';
        this.originY='custom';
        /*FIN -- fabric.Object setting*/

        this.entranceMode=null;
        this.entraceModesSettings={};
        this.setupEntraceModesSettings();
        this.imageAssetModel=options.imageAssetModel;
        this.imageDrawingData=this.setupImageDrawingDTO(options.imgHighDefinition,
                                                        options.imgLowDefinition);
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
            finalDrawingAppearance:'masked'  // masked || original
        }
        this.entraceModesSettings[this.applicableEntrenceModes[2]]={

        }
    },
    setupImageDrawingDTO:function(imgHighDefinition,imgLowDefinition){ //no es del todo un entity lo que se recibe, puesto que ya se agrego el atributo imgHigh
        return {
            imgHigh:imgHighDefinition,
            imgLow:imgLowDefinition, /*for ui, when appears in lists*/
            imgMasked:null,
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:ImageType.CREATED_NOPATH // BECAUSE YOU COULD HAVE DESIGNED THEIR PATHS OR NOT
        }
    },
    generateFinalMaskedImage:function(){
        let dataGenerator=new ImageAnimableDataGenerator();

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
            dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.imageDrawingData.points,
                this.imageDrawingData /*OUT*/ //SE ESTAN LIMPIANDO los ctrlPoints DESPUES DE GENERAR LA IMAGEN
            );
        }
        else if(this.imageDrawingData.type===ImageType.CREATED_PATHLOADED){
            //NOTHING BECAUSE POINTS AND CTRLPOINTS ARE ALREADY CALCULATED
        }

        let illustratorDataAdapterCache=new IllustratorDataAdapterCache([this]);
        let pathIllustrator=new PathIllustrator(canvas,ctx,illustratorDataAdapterCache,false);
        pathIllustrator.generateFinalImage(function(dataUrl){
            /*  DEBUGGIN PURPOSES
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

            //CLEANING
            canvas.remove();
            this.imageDrawingData.ctrlPoints=[];
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
    // getGlobalPosition:function(){ // POSITION OF THIS OBJECT IN VIEWPORT COORDS (useful for positioning el floating menu)
    //     let newPoint=fabric.util.transformPoint(new fabric.Point(this.left,this.top),this.canvas.viewportTransform);
    //     newPoint.x+=this.canvas._offset.left;
    //     newPoint.y+=this.canvas._offset.top;
    //     return newPoint;
    // },

    applyClipping:function(animObject){
        this.clipPath=animObject;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===AnimObjectOptionMenu.addMask){
                this.applicableMenuOptions[i]=AnimObjectOptionMenu.removeMask;
                break;
            }
        }
    },
    removeClipping:function(){
        this.clipPath=null;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===AnimObjectOptionMenu.removeMask){
                this.applicableMenuOptions[i]=AnimObjectOptionMenu.addMask;
                break;
            }
        }
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
var SVGAnimable=fabric.util.createClass(ImageAnimable,{
    applicableEntrenceModes:[EntranceModes.none,EntranceModes.drawn,EntranceModes.dragged],//FOR UI (enable radios)
    type:'SVGAnimable',
    initialize:function(options,callback){
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];

        let self=this;
        this.loadSVGFromURL(options.imageAssetModel.url_image,function(svgString,image){
            options.imgHighDefinition=image;
            options.imgLowDefinition=image;

            self.callSuper('initialize', image, options);

            self.svgString=svgString;

            //FILL REVEAL MODE VARIABLES
            this.indexFinalTruePath=0; //used for fill reveal mode "fill_drawn"


            // vars used for fill reveal mode "fadein"
            this.auxEntranceDuration=0; // stores entrance effect duration value temporarily
            self.animator.addHiddenAnimationsLane("fadeInTransitionOpacity");

            callback();
        });

    },
    addFadeInAnimation:function(){
        this.auxEntranceDuration=this.animator.entranceTimes.duration;
        let fadeinDuration=this.animator.entranceTimes.duration*0.2;
        let newEntranceDuration=this.animator.entranceTimes.duration-fadeinDuration;
        this.animator.entranceTimes.duration=newEntranceDuration;
        this.animator.entranceTimes.transitionDelay=fadeinDuration;
        let startMoment=this.animator.entranceTimes.startTime+this.animator.entranceTimes.delay+newEntranceDuration;
        let endMoment=startMoment+fadeinDuration;
        if(this.animator.dictHiddenAnimations["fadeInTransitionOpacity"].length>0){alert("ERROR: SE INTENTO REGISTRAR ANIMMACION DE FADEIN CUANDO YA HABIA UNA");return;}
        this.animator.addHiddenAnimation("fadeInTransitionOpacity",0,1,startMoment,endMoment,EnumAnimationEasingType.InOut,EnumAnimationTweenType.Sine);
        console.log(this.animator.dictHiddenAnimations.fadeInTransitionOpacity[0]);
        },
    removeFadeInAnimation:function(){
        this.animator.entranceTimes.transitionDelay=0;
        this.animator.entranceTimes.duration=this.auxEntranceDuration;
        this.animator.removeHiddenAnimation("fadeInTransitionOpacity",0);
    },
    setupImageDrawingDTO:function(imgHighDefinition,imgLowDefinition){ //no es del todo un entity lo que se recibe, puesto que ya se agrego el atributo imgHigh
        let data=this.callSuper("setupImageDrawingDTO",imgHighDefinition,imgLowDefinition);
        data.linesColors=[];
        return data;
    },

    loadSVGFromURL: function(url,callback) {/*fabric modified method*/
        url = url.replace(/^\n\s*/, '').trim();
        new fabric.util.request(url, {
            method: 'get',
            onComplete: onComplete
        });
        let self=this;
        function onComplete(r) {

            var xml = r.responseXML;

            // INICIO MODIFICACION
            let svg = r.response;
            let blob = new Blob([svg], {type: 'image/svg+xml'});
            let url = URL.createObjectURL(blob);

            let image=new Image();
            image.src=url;
            image.onload=function(){

                let dimmension=self.applyViewboxTransform(xml.documentElement);
                xml.documentElement.setAttribute("width",dimmension.width);
                xml.documentElement.setAttribute("height",dimmension.height);

                let newSvgString=(new XMLSerializer).serializeToString(xml.documentElement);
                blob = new Blob([newSvgString], {type: 'image/svg+xml'});
                url = URL.createObjectURL(blob);
                image.src=url;
                image.onload=function(){
                    callback(newSvgString,image);
                }
            }
            // FIN MODIFICACION

        }
    },
    applyViewboxTransform:function(element){/*fabric modified method*/ /*obtener dimensiones reales de svg*/
        var reViewBoxAttrValue = new RegExp(
            '^' +
            '\\s*(' + fabric.reNum + '+)\\s*,?' +
            '\\s*(' + fabric.reNum + '+)\\s*,?' +
            '\\s*(' + fabric.reNum + '+)\\s*,?' +
            '\\s*(' + fabric.reNum + '+)\\s*' +
            '$'
        );
        let parseUnit = fabric.util.parseUnit;
        var viewBoxAttr = element.getAttribute('viewBox'),
            scaleX = 1,
            scaleY = 1,
            minX = 0,
            minY = 0,
            viewBoxWidth, viewBoxHeight, matrix, el,
            widthAttr = element.getAttribute('width'),
            heightAttr = element.getAttribute('height'),
            x = element.getAttribute('x') || 0,
            y = element.getAttribute('y') || 0,
            preserveAspectRatio = element.getAttribute('preserveAspectRatio') || '',
            missingViewBox = (!viewBoxAttr || !fabric.svgViewBoxElementsRegEx.test(element.nodeName)
                || !(viewBoxAttr = viewBoxAttr.match(reViewBoxAttrValue))),
            missingDimAttr = (!widthAttr || !heightAttr || widthAttr === '100%' || heightAttr === '100%'),
            toBeParsed = missingViewBox && missingDimAttr,
            parsedDim = { }, translateMatrix = '', widthDiff = 0, heightDiff = 0;

        parsedDim.width = 0;
        parsedDim.height = 0;
        parsedDim.toBeParsed = toBeParsed;

        if (toBeParsed) {
            return parsedDim;
        }

        if (missingViewBox) {
            parsedDim.width = parseUnit(widthAttr);
            parsedDim.height = parseUnit(heightAttr);
            return parsedDim;
        }
        minX = -parseFloat(viewBoxAttr[1]);
        minY = -parseFloat(viewBoxAttr[2]);
        viewBoxWidth = parseFloat(viewBoxAttr[3]);
        viewBoxHeight = parseFloat(viewBoxAttr[4]);
        parsedDim.minX = minX;
        parsedDim.minY = minY;
        parsedDim.viewBoxWidth = viewBoxWidth;
        parsedDim.viewBoxHeight = viewBoxHeight;
        if (!missingDimAttr) {
            parsedDim.width = parseUnit(widthAttr);
            parsedDim.height = parseUnit(heightAttr);
            scaleX = parsedDim.width / viewBoxWidth;
            scaleY = parsedDim.height / viewBoxHeight;
        }
        else {
            parsedDim.width = viewBoxWidth;
            parsedDim.height = viewBoxHeight;
        }
        return parsedDim
    },
    setupEntraceModesSettings:function(){
        this.entraceModesSettings[this.applicableEntrenceModes[0]]={

        }
        this.entraceModesSettings[this.applicableEntrenceModes[1]]={
            showHand:true,
            forceStrokeDrawing:true,
            fillRevealMode:'fadein'  // fadein || drawn_fill || no-fill
        }
        this.entraceModesSettings[this.applicableEntrenceModes[2]]={

        }
    },
});
var TextAnimable=fabric.util.createClass(fabric.IText, {
    //drawn y text_draw NO son lo mismo, ya que su logica es diferente
    applicableEntrenceModes: [EntranceModes.none,EntranceModes.text_drawn,EntranceModes.dragged,EntranceModes.text_typed],//FOR UI
    applicableMenuOptions:[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete],

    type:"TextAnimable",
    initialize:function(text,options){
        /*exact copy of animable object*/
        this.callSuper('initialize', text,options);
        this.centeredRotation=false;
        this.name=options.name;
        this.fill="#000000";
        this.entranceMode=null;
        this.entraceModesSettings={};
        this.setupEntraceModesSettings();
        this.imageAssetModel={imgLow:""}
        this.fontAssetModel={id:"",url_font:"",user_id:""}
        this.imageDrawingData=this.setupImageDrawingDTO();
        this.animator=new Animator(this);
        this.setFontSize(72);
        this.setFontFamily(options.fontFamily);
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

    // getGlobalPosition:function(){ // POSITION OF THIS OBJECT IN VIEWPORT COORDS (useful for positioning el floating menu)
    //     let newPoint=fabric.util.transformPoint(new fabric.Point(this.left,this.top),this.canvas.viewportTransform);
    //     newPoint.x+=this.canvas._offset.left;
    //     newPoint.y+=this.canvas._offset.top;
    //     return newPoint;
    // },
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
var ShapeAnimable=fabric.util.createClass(fabric.Path, {
    applicableMenuOptions:[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete],
    type:"ShapeAnimable",
    initialize:function(pathList,options){
        this.callSuper('initialize', pathList,options);
        this.objectCaching=false;
        this.absolutePositioned=true;
        this.fill="rgba(0,0,0,.0)";
        this.strokeWidth=1;
        this.stroke="rgba(0,0,0,1)";

        this.startRenderingPoint=0;
        this.endRenderingPoint=100;
        this.totalLength=PathLength.calculate(this.pathOffset.x,this.pathOffset.y,this.path)+10;
        this.setEntranceMode(EntranceModes.none);
        this.animator=new Animator(this);
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },
    _renderPathCommands: function(ctx) {
        var current, // current instruction
            previous = null,
            subpathStartX = 0,
            subpathStartY = 0,
            x = 0, // current x
            y = 0, // current y
            controlX = 0, // current control point x
            controlY = 0, // current control point y
            tempX,
            tempY,
            l = -this.pathOffset.x,
            t = -this.pathOffset.y;

        let renderingPathNormalized=(this.endRenderingPoint/100);
        let renderingPart=renderingPathNormalized*this.totalLength;
        let negativeRenderingPart=(1-renderingPathNormalized)*this.totalLength;

        let startPointNormalized=0;
        let endPointNormalized=0;
        if(this.startRenderingPoint<this.endRenderingPoint){
            startPointNormalized=this.startRenderingPoint/100;
            endPointNormalized=this.endRenderingPoint/100;
        }else{
            startPointNormalized=this.endRenderingPoint/100;
            endPointNormalized=this.startRenderingPoint/100;
        }

        let pattern=[0,startPointNormalized*this.totalLength,(endPointNormalized-startPointNormalized)*this.totalLength,(1-endPointNormalized)*this.totalLength];
        ctx.beginPath();

        ctx.setLineDash(pattern);
        for (var i = 0, len = this.path.length; i < len; ++i) {

            current = this.path[i];

            switch (current[0]) { // first letter

                case 'l': // lineto, relative
                    x += current[1];
                    y += current[2];
                    ctx.lineTo(x + l, y + t);
                    break;

                case 'L': // lineto, absolute
                    x = current[1];
                    y = current[2];
                    ctx.lineTo(x + l, y + t);
                    break;

                case 'h': // horizontal lineto, relative
                    x += current[1];
                    ctx.lineTo(x + l, y + t);
                    break;

                case 'H': // horizontal lineto, absolute
                    x = current[1];
                    ctx.lineTo(x + l, y + t);
                    break;

                case 'v': // vertical lineto, relative
                    y += current[1];
                    ctx.lineTo(x + l, y + t);
                    break;

                case 'V': // verical lineto, absolute
                    y = current[1];
                    ctx.lineTo(x + l, y + t);
                    break;

                case 'm': // moveTo, relative
                    x += current[1];
                    y += current[2];
                    subpathStartX = x;
                    subpathStartY = y;
                    ctx.moveTo(x + l, y + t);
                    break;

                case 'M': // moveTo, absolute
                    x = current[1];
                    y = current[2];
                    subpathStartX = x;
                    subpathStartY = y;
                    ctx.moveTo(x + l, y + t);
                    break;

                case 'c': // bezierCurveTo, relative
                    tempX = x + current[5];
                    tempY = y + current[6];
                    controlX = x + current[3];
                    controlY = y + current[4];
                    ctx.bezierCurveTo(
                        x + current[1] + l, // x1
                        y + current[2] + t, // y1
                        controlX + l, // x2
                        controlY + t, // y2
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;
                    break;

                case 'C': // bezierCurveTo, absolute
                    x = current[5];
                    y = current[6];
                    controlX = current[3];
                    controlY = current[4];
                    ctx.bezierCurveTo(
                        current[1] + l,
                        current[2] + t,
                        controlX + l,
                        controlY + t,
                        x + l,
                        y + t
                    );
                    break;

                case 's': // shorthand cubic bezierCurveTo, relative

                    // transform to absolute x,y
                    tempX = x + current[3];
                    tempY = y + current[4];

                    if (previous[0].match(/[CcSs]/) === null) {
                        // If there is no previous command or if the previous command was not a C, c, S, or s,
                        // the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control points
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }

                    ctx.bezierCurveTo(
                        controlX + l,
                        controlY + t,
                        x + current[1] + l,
                        y + current[2] + t,
                        tempX + l,
                        tempY + t
                    );
                    // set control point to 2nd one of this command
                    // "... the first control point is assumed to be
                    // the reflection of the second control point on
                    // the previous command relative to the current point."
                    controlX = x + current[1];
                    controlY = y + current[2];

                    x = tempX;
                    y = tempY;
                    break;

                case 'S': // shorthand cubic bezierCurveTo, absolute
                    tempX = current[3];
                    tempY = current[4];
                    if (previous[0].match(/[CcSs]/) === null) {
                        // If there is no previous command or if the previous command was not a C, c, S, or s,
                        // the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control points
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }
                    ctx.bezierCurveTo(
                        controlX + l,
                        controlY + t,
                        current[1] + l,
                        current[2] + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;

                    // set control point to 2nd one of this command
                    // "... the first control point is assumed to be
                    // the reflection of the second control point on
                    // the previous command relative to the current point."
                    controlX = current[1];
                    controlY = current[2];

                    break;

                case 'q': // quadraticCurveTo, relative
                    // transform to absolute x,y
                    tempX = x + current[3];
                    tempY = y + current[4];

                    controlX = x + current[1];
                    controlY = y + current[2];

                    ctx.quadraticCurveTo(
                        controlX + l,
                        controlY + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;
                    break;

                case 'Q': // quadraticCurveTo, absolute
                    tempX = current[3];
                    tempY = current[4];

                    ctx.quadraticCurveTo(
                        current[1] + l,
                        current[2] + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;
                    controlX = current[1];
                    controlY = current[2];
                    break;

                case 't': // shorthand quadraticCurveTo, relative

                    // transform to absolute x,y
                    tempX = x + current[1];
                    tempY = y + current[2];

                    if (previous[0].match(/[QqTt]/) === null) {
                        // If there is no previous command or if the previous command was not a Q, q, T or t,
                        // assume the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control point
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }

                    ctx.quadraticCurveTo(
                        controlX + l,
                        controlY + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;

                    break;

                case 'T':
                    tempX = current[1];
                    tempY = current[2];

                    if (previous[0].match(/[QqTt]/) === null) {
                        // If there is no previous command or if the previous command was not a Q, q, T or t,
                        // assume the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control point
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }
                    ctx.quadraticCurveTo(
                        controlX + l,
                        controlY + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;
                    break;

                case 'a':
                    // TODO: optimize this
                    drawArc(ctx, x + l, y + t, [
                        current[1],
                        current[2],
                        current[3],
                        current[4],
                        current[5],
                        current[6] + x + l,
                        current[7] + y + t
                    ]);
                    x += current[6];
                    y += current[7];
                    break;

                case 'A':
                    // TODO: optimize this
                    drawArc(ctx, x + l, y + t, [
                        current[1],
                        current[2],
                        current[3],
                        current[4],
                        current[5],
                        current[6] + l,
                        current[7] + t
                    ]);
                    x = current[6];
                    y = current[7];
                    break;

                case 'z':
                case 'Z':
                    x = subpathStartX;
                    y = subpathStartY;
                    ctx.closePath();
                    break;
            }
            previous = current;
        }
    },

});

ImageAnimable.prototype.illustrationFunction=function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(baseImage,0,0,canvas.width,canvas.height)
    ctx.globalCompositeOperation="destination-in";
    ctx.stroke();
    ctx.globalCompositeOperation="source-over";
    ctx.drawImage(prevPathSnapshot,0,0);
}
TextAnimable.prototype.illustrationFunction=function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(baseImage,0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation="source-in";
    ctx.fill();
    ctx.globalCompositeOperation="source-over";
    ctx.drawImage(prevPathSnapshot,0,0);
}
SVGAnimable.prototype.illustrationFunction=function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
    if(this.imageDrawingData.type===ImageType.CREATED_PATHDESIGNED){
        ImageAnimable.prototype.illustrationFunction(canvas,ctx,baseImage,prevPathSnapshot);
    }else if(indexLayer<=this.indexFinalTruePath){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.stroke();
        ctx.drawImage(prevPathSnapshot,0,0);
    }
    else if(this.entraceModesSettings[EntranceModes.drawn].fillRevealMode==="drawn_fill"){
        ctx.strokeStyle="red";
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(baseImage,0,0,canvas.width,canvas.height);
        ctx.globalCompositeOperation="destination-in";
        ctx.stroke();
        ctx.globalCompositeOperation="source-over";
        ctx.drawImage(prevPathSnapshot,0,0);
    }else{


    }
}

var CameraAnimable=fabric.util.createClass(ImageAnimable,{
    applicableEntrenceModes:[EntranceModes.none],//FOR UI
    type:"CameraAnimable",
    initialize:function(element,options){
        this.callSuper("initialize",element,options);
        this.applicableMenuOptions=[]; //ya que estamos heredando de ImageAnimable, el cual al tene la opcion addMask, el menu es dinamico para el, por en se debe declara en su contructor para evitar que al
        //alterar el menu se altere en todas las instancias, y como esta su contructor lo sobreescribira para todos sus subclases
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
/*
* Canvas en el que se toma en cuenta la opacidad, la cual es aplicar a todos los objetos. Usado para el canvas previewer
* */
var CustomStaticCanvas = fabric.util.createClass(fabric.StaticCanvas, {
    initialize:function(id,options){
        this.callSuper('initialize', id,options);
        this.opacity=1;
    },
    getZoom:function(){
        return Math.sqrt(this.viewportTransform[0]*this.viewportTransform[0] + this.viewportTransform[1]*this.viewportTransform[1]);
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
























