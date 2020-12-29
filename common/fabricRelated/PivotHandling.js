fabric.Object.prototype.originX="custom";
fabric.Object.prototype.originY="custom";
fabric.Object.prototype.centeredRotation=false;
fabric.Object.prototype.centeredScaling=false;
fabric.Object.prototype.pivotX=0;
fabric.Object.prototype.pivotY=0;
fabric.Object.prototype.pivotCornerX=0;//visual corner pos X
fabric.Object.prototype.pivotCornerY=0;//visual corner pos y
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