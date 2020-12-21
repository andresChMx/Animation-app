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
fabric.Object.prototype.pivotX=0;
fabric.Object.prototype.pivotY=0;
fabric.Object.prototype.pivotCornerX=0;
fabric.Object.prototype.pivotCornerY=0;
fabric.Object.prototype.mouseStickRange=10;
fabric.Object.prototype.setPivotCornerPos=function(pointer){
    var padding = this.padding, angle = fabric.util.degreesToRadians(this.angle),
        cos = fabric.util.cos(angle), sin = fabric.util.sin(angle),
        cosP = cos * padding, sinP = sin * padding, cosPSinP = cosP + sinP,
        cosPMinusSinP = cosP - sinP;
    let stickyCorners={}; //will store world key point's positions
    for(let i in this.aCoords){
        stickyCorners[i]={};
        stickyCorners[i].x=this.aCoords[i].x;
        stickyCorners[i].y=this.aCoords[i].y;
    }


    let center=this.getCenterPoint();
    let dim = this._getTransformedDimensions();

    stickyCorners.mm={x:center.x,y:center.y};
    /*looping through corners to check if mouse is in sticky range*/
    for(let i in stickyCorners){
        if(pointer.x>stickyCorners[i].x-this.mouseStickRange &&
            pointer.x<stickyCorners[i].x+this.mouseStickRange &&
            pointer.y>stickyCorners[i].y-this.mouseStickRange &&
            pointer.y<stickyCorners[i].y+this.mouseStickRange){
            let stickyCornerRotated=fabric.util.rotatePoint(new fabric.Point(stickyCorners[i].x,stickyCorners[i].y), center, fabric.util.degreesToRadians(-this.angle));
            let tmppivotX=stickyCornerRotated.x-center.x;
            let tmppivotY=stickyCornerRotated.y-center.y;
            tmppivotX/=dim.x;
            tmppivotY/=dim.y;
            this.pivotCornerX=tmppivotX;
            this.pivotCornerY=tmppivotY;
            this.canvas.renderAll();
            return;
        }
    }
        let newPointer={x:pointer.x,y:pointer.y};
        let rotatedPointer=fabric.util.rotatePoint(pointer, center, fabric.util.degreesToRadians(-this.angle));

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
        this.canvas.renderAll();

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
        fromOriginX = this.originXToValue(fromOriginX);
    }
    else {
        fromOriginX -= 0.5;
    }

    if (typeof toOriginX === 'string') {
        toOriginX = this.originXToValue(toOriginX);
    }
    else {
        toOriginX -= 0.5;
    }

    offsetX = toOriginX - fromOriginX;

    if (typeof fromOriginY === 'string') {
        fromOriginY = this.originYToValue(fromOriginY);
    }
    else {
        fromOriginY -= 0.5;
    }

    if (typeof toOriginY === 'string') {
        toOriginY = this.originYToValue(toOriginY);
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
    var size = this.cornerSize, stroke = !this.transparentCorners && this.cornerStrokeColor;
    let widthMinusPadding=width-this.padding*2;
    let heightMinusPadding=height-this.padding*2;
    let pivotPosX=widthMinusPadding*this.pivotCornerX,
        pivotPosY=heightMinusPadding*this.pivotCornerY;
    ctx.moveTo(pivotPosX,pivotPosY);
    ctx.arc(pivotPosX,pivotPosY, size/2,0,Math.PI*2,false);
    ctx.lineTo(pivotPosX-size/2,pivotPosY);
    ctx.moveTo(pivotPosX,pivotPosY-size/2);
    ctx.lineTo(pivotPosX,pivotPosY+size/2);
    ctx.stroke();
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
        pivot=fabric.util.transformPoint({x:this.pivotX*dim.x,y:this.pivotY*dim.y},finalMatrix); //ADDED
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
        ,pivot:pivot                                            //ADDED
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
             return 'movepivot';                                    //ADDED
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
        //////////MODIFICACION////////////////
    } else if (action === "movepivot") {
        transform.target.setPivotCornerPos(pointer);
        ///////////////////////////////////////////
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
    if(transform.action==="movepivot"){
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
    //TODO: update animation handler
    // FOR MIDDLE FUCKING POINT
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
        this.currentSnapShot=new Image();
        this.currentSnapShot.src=this.cacheCanvas.toDataURL();
        this.snapShot=new Image();
        this.snapShot.src=this.cacheCanvas.toDataURL();
        this.flagCurrentSnapReady=true;

        this.width=options.width;
        this.height=options.height;

        this.animator=new Animator(this);
        this.animator.dictAnimations=options.animations;
        this.entranceModesSettings=options.entraceModesSettings;
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
        //ctx.imageSmoothingEnabled = false;
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
























