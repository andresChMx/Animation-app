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



/*
* ================================================================================================
* */

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
        this.set(optionsInWorld);//porque la funcions setPositionbyorigin accedera a cosas como escala y angulo.
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
        //Setting all properties comming from the animator, this will set wronly the transformations properties
        this.set(optionsInWorld);
        //Overwritting wrong transformation properterties setted by above instruction
        this.set(optionsFinal);
        //this conditional enables de use of the variable angleInWorld by the getCustom function. This way the animator can get the angle value setted
        // by the inspector, which is in world coordinates and is not "normalized" by fabricjs. And will return the true angle value as soon as the Active selection is rotated
        if(dictNewProperties.angle !==undefined){
            this.angleInWorld=dictNewProperties.angle;
        }

        //this.opacity=dictNewProperties.opacity===undefined?this.opacity:dictNewProperties.opacity;
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


/*
* ================================================================================================
* */
fabric.Object.prototype.getGlobalPosition=function(){// POSITION OF THIS OBJECT IN VIEWPORT COORDS (useful for positioning el floating menu)
    let newPoint=fabric.util.transformPoint(new fabric.Point(this.aCoords.tl.x,this.aCoords.tl.y),this.canvas.viewportTransform);
    newPoint.x+=this.canvas._offset.left;
    newPoint.y+=this.canvas._offset.top;
    return newPoint;
}
fabric.Object.prototype.name="ObjectC";


/*
* ================================================================================================
* */

// EXTENDING FABRIC BEHAVIOUR TO SUPPORT A DINAMIC PIVOT
fabric.Object.prototype.originX="custom";
fabric.Object.prototype.originY="custom";
fabric.Object.prototype.centeredRotation=false;
fabric.Object.prototype.centeredScaling=false;
fabric.Object.prototype.pivotX=0;
fabric.Object.prototype.pivotY=0;
fabric.Object.prototype.pivotCornerX=0;//visual corner pos X, (while dragging)
fabric.Object.prototype.pivotCornerY=0;//visual corner pos y, (while dragging)
fabric.Object.prototype.mouseStickRange=10;
fabric.Object.prototype.movePivotCornerPos=function(x,y){
    let stickyCorners={}; //will store world key point's positions
    for(let i in this.aCoords){
        stickyCorners[i]={x:this.aCoords[i].x, y:this.aCoords[i].y};
    }
    let center=this.getCenterPoint();
    let dim = this._getTransformedDimensions();

    stickyCorners.mm={x:center.x,y:center.y};
    /*looping through corners to check if mouse is in sticky range*/
    for(let i in stickyCorners){
        if( x>stickyCorners[i].x-this.mouseStickRange &&
            x<stickyCorners[i].x+this.mouseStickRange &&
            y>stickyCorners[i].y-this.mouseStickRange &&
            y<stickyCorners[i].y+this.mouseStickRange){
            let stickyCornerRotated=fabric.util.rotatePoint(new fabric.Point(stickyCorners[i].x,stickyCorners[i].y), center, fabric.util.degreesToRadians(-this.angle));
            let tmppivotX=stickyCornerRotated.x-center.x;
            let tmppivotY=stickyCornerRotated.y-center.y;
            tmppivotX/=dim.x;
            tmppivotY/=dim.y;
            this.pivotCornerX=tmppivotX;
            this.pivotCornerY=tmppivotY;
            return true;
        }
    }
    let newPointer={x:x,y:y};
    let rotatedPointer=fabric.util.rotatePoint(new fabric.Point(x,y), center, fabric.util.degreesToRadians(-this.angle));

    let dx=rotatedPointer.x-center.x;
    let dy=rotatedPointer.y-center.y;
    dx/=(dim.x);
    dy/=(dim.y);

    // if(newPointer.x>stickyCorners.tl.x - this.mouseStickRange && newPointer.x<stickyCorners.tl.x+this.mouseStickRange){
    //     dx=-0.5;
    // }
    // else if(newPointer.x>stickyCorners.tr.x - this.mouseStickRange && newPointer.x<stickyCorners.tr.x+this.mouseStickRange){
    //     dx=0.5;
    // }
    // else if(newPointer.y>stickyCorners.tl.y - this.mouseStickRange && newPointer.y<stickyCorners.tl.y+this.mouseStickRange){
    //     dy=-0.5;
    // }
    // else if(newPointer.y>stickyCorners.br.y - this.mouseStickRange && newPointer.y<stickyCorners.br.y+this.mouseStickRange){
    //     dy=0.5;
    // }
    this.pivotCornerX=dx;
    this.pivotCornerY=dy;
    return true;
};
fabric.Object.prototype.originXToValue=function(originX){
    switch (originX){
        case "left": return -0.5;
        case "center": return 0;
        case "right": return 0.5;
        case "custom": return this.pivotX;
    }
};
fabric.Object.prototype.originYToValue=function(originY){
    switch (originY){
        case "top": return -0.5;
        case "center": return 0;
        case "bottom": return 0.5;
        case "custom": return this.pivotY;
    }
};

fabric.Object.prototype.translateToGivenOrigin=function(point,fromOriginX,fromOriginY,toOriginX,toOriginY){
    var x = point.x,
        y = point.y,
        offsetX, offsetY, dim;
    if (typeof fromOriginX === 'string') {
        fromOriginX = this.originXToValue(fromOriginX); //MODIFICED : FUNCTION CALL
    }
    else {
        fromOriginX -= 0.5;
    }

    if (typeof toOriginX === 'string') {
        toOriginX = this.originXToValue(toOriginX);  //MODIFICED : FUNCTION CALL
    }
    else {
        toOriginX -= 0.5;
    }

    offsetX = toOriginX - fromOriginX;

    if (typeof fromOriginY === 'string') {
        fromOriginY = this.originYToValue(fromOriginY);  //MODIFICED : FUNCTION CALL
    }
    else {
        fromOriginY -= 0.5;
    }

    if (typeof toOriginY === 'string') {
        toOriginY = this.originYToValue(toOriginY);   //MODIFICED : FUNCTION CALL
    }
    else {
        toOriginY -= 0.5;
    }

    offsetY = toOriginY - fromOriginY;

    if (offsetX || offsetY) {
        dim = this._getTransformedDimensions();
        x = point.x + offsetX * dim.x;
        y = point.y + offsetY * dim.y;
    }

    return new fabric.Point(x, y);
};
// RENDERING OF NEW CONTROL POINT
fabric.Object.prototype.drawControls= function(ctx, styleOverride) {
    styleOverride = styleOverride || {};
    var wh = this._calculateCurrentDimensions(),
        width = wh.x,
        height = wh.y,
        scaleOffset = styleOverride.cornerSize || this.cornerSize,
        left = -(width + scaleOffset) / 2,
        top = -(height + scaleOffset) / 2,
        transparentCorners = typeof styleOverride.transparentCorners !== 'undefined' ?
            styleOverride.transparentCorners : this.transparentCorners,
        hasRotatingPoint = typeof styleOverride.hasRotatingPoint !== 'undefined' ?
            styleOverride.hasRotatingPoint : this.hasRotatingPoint,
        methodName = transparentCorners ? 'stroke' : 'fill';

    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = styleOverride.cornerColor || this.cornerColor;
    if (!this.transparentCorners) {
        ctx.strokeStyle = styleOverride.cornerStrokeColor || this.cornerStrokeColor;
    }
    this._setLineDash(ctx, styleOverride.cornerDashArray || this.cornerDashArray, null);

    // top-left
    this._drawControl('tl', ctx, methodName,
        left,
        top, styleOverride);

    // top-right
    this._drawControl('tr', ctx, methodName,
        left + width,
        top, styleOverride);

    // bottom-left
    this._drawControl('bl', ctx, methodName,
        left,
        top + height, styleOverride);

    // bottom-right
    this._drawControl('br', ctx, methodName,
        left + width,
        top + height, styleOverride);

    if (!this.get('lockUniScaling')) {

        // middle-top
        this._drawControl('mt', ctx, methodName,
            left + width / 2,
            top, styleOverride);

        // middle-bottom
        this._drawControl('mb', ctx, methodName,
            left + width / 2,
            top + height, styleOverride);

        // middle-right
        this._drawControl('mr', ctx, methodName,
            left + width,
            top + height / 2, styleOverride);

        // middle-left
        this._drawControl('ml', ctx, methodName,
            left,
            top + height / 2, styleOverride);
    }
    /////MODIFICACION//////
    if (this.isControlVisible("pivot")) {
        var size = this.cornerSize, stroke = !this.transparentCorners && this.cornerStrokeColor;
        let pivotLeft=(width-this.padding*2)*this.pivotCornerX;
        let pivotTop=(height-this.padding*2)*this.pivotCornerY;
        ctx.moveTo(pivotLeft,pivotTop);
        ctx.arc(pivotLeft,pivotTop, size/2,0,Math.PI*2,false);
        ctx.lineTo(pivotLeft-size/2,pivotTop);
        ctx.moveTo(pivotLeft,pivotTop-size/2);
        ctx.lineTo(pivotLeft,pivotTop+size/2);
        ctx.stroke();
    }

    //////////

    // middle-top-rotate
    if (hasRotatingPoint) {
        this._drawControl('mtr', ctx, methodName,
            left + width / 2,
            top - this.rotatingPointOffset, styleOverride);
    }
    ctx.restore();
    return this;
}
fabric.Object.prototype._getControlsVisibility=function() {
    if (!this._controlsVisibility) {
        this._controlsVisibility = {
            tl: true,
            tr: true,
            br: true,
            bl: true,
            ml: true,
            mt: true,
            mr: true,
            mb: true,
            mtr: true,
            pivot:true,   //ADDED
        };
    }
    return this._controlsVisibility;
};
fabric.Object.prototype.calcCoords=function(absolute){
    var rotateMatrix = this._calcRotateMatrix(),
        translateMatrix = this._calcTranslateMatrix(),
        startMatrix = fabric.util.multiplyTransformMatrices(translateMatrix, rotateMatrix),
        vpt = this.getViewportTransform(),
        finalMatrix = absolute ? startMatrix : fabric.util.multiplyTransformMatrices(vpt, startMatrix),
        dim = this._getTransformedDimensions(),
        w = dim.x / 2, h = dim.y / 2,
        tl = fabric.util.transformPoint({ x: -w, y: -h }, finalMatrix),
        tr = fabric.util.transformPoint({ x: w, y: -h }, finalMatrix),
        bl = fabric.util.transformPoint({ x: -w, y: h }, finalMatrix),
        br = fabric.util.transformPoint({ x: w, y: h }, finalMatrix),
        pivot=fabric.util.transformPoint({x:this.pivotX*dim.x,y:this.pivotY*dim.y},finalMatrix);                //ADDED
    if (!absolute) {
        var padding = this.padding, angle = fabric.util.degreesToRadians(this.angle),
            cos = fabric.util.cos(angle), sin = fabric.util.sin(angle),
            cosP = cos * padding, sinP = sin * padding, cosPSinP = cosP + sinP,
            cosPMinusSinP = cosP - sinP;
        if (padding) {
            tl.x -= cosPMinusSinP;
            tl.y -= cosPSinP;
            tr.x += cosPSinP;
            tr.y -= cosPMinusSinP;
            bl.x -= cosPSinP;
            bl.y += cosPMinusSinP;
            br.x += cosPMinusSinP;
            br.y += cosPSinP;
        }
        var ml  = new fabric.Point((tl.x + bl.x) / 2, (tl.y + bl.y) / 2),
            mt  = new fabric.Point((tr.x + tl.x) / 2, (tr.y + tl.y) / 2),
            mr  = new fabric.Point((br.x + tr.x) / 2, (br.y + tr.y) / 2),
            mb  = new fabric.Point((br.x + bl.x) / 2, (br.y + bl.y) / 2),
            mtr = new fabric.Point(mt.x + sin * this.rotatingPointOffset, mt.y - cos * this.rotatingPointOffset);
    }
    var coords = {
        // corners
        tl: tl, tr: tr, br: br, bl: bl
        ,pivot:pivot                                                                                               //ADDED
    };
    if (!absolute) {
        // middle
        coords.ml = ml;
        coords.mt = mt;
        coords.mr = mr;
        coords.mb = mb;
        // rotating point
        coords.mtr = mtr;
    }
    return coords;
}
fabric.Canvas.prototype._getActionFromCorner=function(alreadySelected, corner, e /* target */){
    if (!corner || !alreadySelected) {
        return 'drag';
    }
    switch (corner) {
        case 'mtr':
            return 'rotate';
        case 'ml':
        case 'mr':
            return e[this.altActionKey] ? 'skewY' : 'scaleX';
        case 'mt':
        case 'mb':
            return e[this.altActionKey] ? 'skewX' : 'scaleY';
        case 'pivot':                                              //ADDED
            return 'pivotmove';                                    //ADDED
        default:
            return 'scale';
    }
}
fabric.Canvas.prototype._performTransformAction=function(e, transform, pointer) {
    var x = pointer.x,
        y = pointer.y,
        action = transform.action,
        actionPerformed = false,
        options = {
            target: transform.target,
            e: e,
            transform: transform,
            pointer: pointer
        };

    if (action === 'rotate') {
        (actionPerformed = this._rotateObject(x, y)) && this._fire('rotating', options);
    } else if (action === 'scale') {
        (actionPerformed = this._onScale(e, transform, x, y)) && this._fire('scaling', options);
    } else if (action === 'scaleX') {
        (actionPerformed = this._scaleObject(x, y, 'x')) && this._fire('scaling', options);
    } else if (action === 'scaleY') {
        (actionPerformed = this._scaleObject(x, y, 'y')) && this._fire('scaling', options);
    } else if (action === 'skewX') {
        (actionPerformed = this._skewObject(x, y, 'x')) && this._fire('skewing', options);
    } else if (action === 'skewY') {
        (actionPerformed = this._skewObject(x, y, 'y')) && this._fire('skewing', options);
    } else if (action === "pivotmove") {                                                                                //  ADDED
        (actionPerformed = transform.target.movePivotCornerPos(x,y))      //  ADDED
    } else {
        actionPerformed = this._translateObject(x, y);
        if (actionPerformed) {
            this._fire('moving', options);
            this.setCursor(options.target.moveCursor || this.moveCursor);
        }
    }
    transform.actionPerformed = transform.actionPerformed || actionPerformed;
}
fabric.Canvas.prototype._finalizeCurrentTransform=function(e){ //ON MOUSE UP
    var transform = this._currentTransform,
        target = transform.target,
        eventName,
        options = {
            e: e,
            target: target,
            transform: transform,
        };

    if (target._scaling) {
        target._scaling = false;
    }
    //////////////MODIFICACOIN//////////////////
    let center=transform.target.getCenterPoint();
    let worldPivotPos=target.translateToOriginPoint(center,'custom','custom');

    //prestado de calcCoords() de Object
    var rotateMatrix = transform.target._calcRotateMatrix(),
        translateMatrix = transform.target._calcTranslateMatrix(),
        startMatrix = fabric.util.multiplyTransformMatrices(translateMatrix, rotateMatrix),
        dim = transform.target._getTransformedDimensions(),
        w = dim.x, h = dim.y,
        woldNewPivotPos = fabric.util.transformPoint({ x: w*transform.target.pivotCornerX, y: h*transform.target.pivotCornerY }, startMatrix);
    //fin prestado
    if(transform.action==="pivotmove"){
        let offsetX=woldNewPivotPos.x-worldPivotPos.x;
        let offsetY=woldNewPivotPos.y-worldPivotPos.y;
        target.left+=offsetX;
        target.top+=offsetY;
    }
    target.pivotX=target.pivotCornerX;
    target.pivotY=target.pivotCornerY;
    target.setCoords();

    ////////////M//////////////////////////////
    if (transform.actionPerformed || (this.stateful && target.hasStateChanged())) {
        if (transform.actionPerformed) {
            eventName = this._addEventOptions(options, transform);
            this._fire(eventName, options);
        }
        this._fire('modified', options);
    }
}

/*
* ================================================================================================
* */

// CUSTOM RENDER FUNCTION FOR ANIMABLES
/*
* soluciono problema sobre que los objetos no se renderizaban tras ser animados estando fuera del canvas hacia dentro del canvas.
* El problema se debia a que la funcion render no renderiza al objeto si este se encuentra offscreen, para esto usa las coordenadas del objecto oCoords,
* pero estas coordenadas solo son actualizadas al llamar a setCoords().
*
* En esta modificacion, el objeto sera renderizado aun estando offscreen, y para contrarestar el bajo rendimiento que esto
* puede provocar ante muchos objetos en escena, se podria usar un cache canvas adicional, donde solo una vez se dibuje la imagen original,
* y al renderizar el objeto simplemente se copie el contenido de ese cache canvas
* */

fabric.Object.prototype.customRenderOffScreen=function(ctx){ //SOBREESCRITO DE RENDER()
    if (this.isNotVisible()) {
        return;
    }
    // Se elimino esta linea que era la que omitia el renderizaje ante objeto offscreen
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
        //ImageAnimables usan siempre el cache, pero en caso esta tenga aplicado un clipping se refrescara cada frame el cache , ya que usan composite operation
        //lo cual de ser aplicado en el main canvas, al aplicarse el cliping, se aplicara a todos los objetos dl canvas
        //
        // ImageAnimables que no tengan clipping practicamente omiten la funcion renderCache() y pasan de fente a drawCacheOnCanvas()
        // donde solo se dibuja directamente el cacheCanvas

        //SVGAnimable, al igual que imageAnimable no refresca cache nunca,solo ante clipping

        // Shape Animables tambien usan siempre esta seccion, ya que se dejo objectCaching a true.
        // sin embargo siempre refrescan el cache, cada frame, ya que los shapeanimables sambian constantenmente su estructura(no solo transformaciones
        // , sino propiedades como strokewidth, stroke,fill, startRenderingPoint, endrenderingPoint,)



        //TextAnimable, al igual que shape animable refresca cache cada frame, ya que sus estilos pueden ser
        //animados, al igual que shapeAnimable, ademas que puede ser usado como clippath, por ende tras cada renderizacion,
        // tambien se establece dirty a true
        //Camera Animable nunca actualiza cache, ya que al ser solo una imagen que no puede ser clippeada, solo se trnsforma
        this.renderCache();
        this.drawCacheOnCanvas(ctx);
    }
    else {
        //Los Drawables son los unicos que tienen objectCaching false, ya que casi siempre ira cambiando lo
        //que renderiza, que es a otro canvas donde se proyecta una animacion, entonce en lugar de reflescar un
        //cache y luego pasarlo al canvas principal, derectamente hacemos que se renderize dirtamente en el canvas principal
        this._removeCacheCanvas();
        this.dirty = false;
        this.drawObject(ctx);             //TODO: better performance with an extra cacheCanvas where the image is drawn and in the main canvas only the cache is copied rather than drawin the image again and again
        if (this.objectCaching && this.statefullCache) {
            this.saveState({ propertySet: 'cacheProperties' });
        }
    }
    this.clipTo && ctx.restore();
    ctx.restore();
}

var applyViewboxTransform=function(element){/*modificado de: applyViewboxTransform() */ /*obtener dimensiones reales de svg, ya que las dimenciones dadas por el tag html <img> son muy diferentes a las dadas por fabric,
por lo que conclui que las dimenciones reales las halla fabric, es asi que de esta funcion se conservo solo lo que permite calcular las dimenciones reales del svg, esto es usado por
NetworkManager.loadSVG , la cual fue a su vez modificada de fabric.util.loadSVGFromURL, para que una vez cargada la iamgen,
se modifique el codigo svg para pasar las dimenciones como atributos, y de esta forma el tag <img> usa esas dimenciones, las cuale son las reales.
En conclusion, esta funcion calcula las dimenciones reales de la imagen svg*/
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
};




















