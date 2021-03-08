var CurveSegmentTool={
    getBezier:function(p1x,p1y,c1x,c1y,c2x,c2y,p2x,p2y,temperature) {
        let t = temperature;
        let u0 = 1;
        let u1 = 1 - t;
        let qxa = u0 * u0 * p1x;
        let qxb = u1 * u1 * p1x + c1x * 2 * t * u1 + c2x * t * t;
        let qxc = c1x;
        let qxd = c1x * u1 * u1 + c2x * 2 * t * u1 + p2x * t * t;

        let qya = u0 * u0 * p1y;
        let qyb = u1 * u1 * p1y + c1y * 2 * t * u1 + c2y * t * t;
        let qyc = c1y;
        let qyd = c1y * u1 * u1 + c2y * 2 * t * u1 + p2y * t * t;

        let xb = qxa * u1 + qxc * t;
        let xc = qxb;
        let xd = qxb * u1 + qxd * t;

        let yb = qya * u1 + qyc * t;
        let yc = qyb;
        let yd = qyb * u1 + qyd * t;

        return [xb, yb, xc, yc, xd, yd];
    },
    getQuadratic:function(p1x,p1y,c1x,c1y,p2x,p2y,temperature){
        let t=temperature;
        let v1X=p1x+(c1x-p1x)*t;
        let v1Y=p1y+(c1y-p1y)*t;
        let newCtpX=v1X;
        let newCtpY=v1Y;
        let newP2X=v1X+((c1x+(p2x-c1x)*t)-v1X)*t;
        let newP2Y=v1Y+((c1y+(p2y-c1y)*t)-v1Y)*t;
        return [newCtpX,newCtpY,newP2X,newP2Y];
    },
    getLine:function(startX,startY,endX,endY,position){
        return{
            x: this._getLValue(position,startX,endX),
            y: this._getLValue(position,startY,endY)
        }
    },
    _getLValue:function(t,p1,p2){
        return p1 + t*(p2-p1);
    },
}

var PathIllustrator=fabric.util.createClass({
    initialize:function(canvas,ctx,dataAdapter,loopMode){
        this.observersOnDrawingNewObject=null;
        this.observerOnLastObjectDrawingFinished=null;
        this.canvas=canvas;
        this.ctx=ctx;

        this.data=dataAdapter;
        this.loopMode=loopMode;

        this.baseImageCanvas=document.createElement("canvas");
        this.baseImageCtx=this.baseImageCanvas.getContext("2d");

        this.prevPathCanvas=document.createElement("canvas");
        this.prevPathSnapshot=this.prevPathCanvas.getContext("2d");

        this.counterInterruption=0;
        this.flagCompleted=false;

        //vars for previewer
        this.lastPicIndex=0;
        this.lastPath=0;
        this.lastStroke=0;
        this.lastStrokeAnimDuration=0;
        this.prevSnapshot=null

        //vars para scenePreview
        this.animStartTime=0;
        this.animFinishTime=0;
        this.animTotalProgress=-1;
        this.animStrokeDuration=0;
        this.k=0;this.i=0;this.j=0;
        this.prevStrokeTurnIndex=0;
        this.functionDrawingMode=null;
        this.flagFirstTime=false;

    },
    setupPreviewSceneVars:function(){
        if(this.data.getObjectsToDrawLength()<=0){return;}
        this.ctx.lineCap = "round";
        this.flagCompleted=false;
        this.animStartTime=0;
        this.animFinishTime=0;
        this.animTotalProgress=0; //0-total duratthis.
        this.animStrokeDuration=0;
        this.k=-1;
        this.i=0;
        this.j=0;
        this.prevStrokeTurnIndex=0;

        this.functionDrawingMode=null;
        this.flagFirstTime=true;
    },
    delete:function(){
        this.baseImageCanvas.remove();
        this.prevPathCanvas.remove();
    },
    generateFinalImage:function(callbackOnFinish){
        this.k=0;
        this.i=this.getFirstPathListIndex(this.k,-1);
        this.j=0;
        let totalCantPathStrokes=this.getTotalStrokesInImage(this.k);
        let oldValI=this.i;
        let p=0;
        this.canvas.width=this.data.getWidthMainCanvasOf(this.k);
        this.canvas.height=this.data.getHeightMainCanvasOf(this.k);

        this.ctx.lineWidth=this.data.getLineWidthAt(this.k,this.i);

        this.prevPathCanvas.width=this.canvas.width;
        this.prevPathCanvas.height=this.canvas.height;

        this.baseImageCanvas.width=this.canvas.width;
        this.baseImageCanvas.height=this.canvas.height;
        this.baseImageCtx.drawImage(this.data.getBaseImageOf(this.k),0,0)

        this.ctx.lineCap="round";
        (function looper(){
            for(p;p<totalCantPathStrokes;p++){
                if(oldValI!==this.i){//se paso a otro path
                    oldValI=this.i;
                    this.data.getIllustrationFunction(this.k)(this.canvas,this.ctx,this.baseImageCanvas,this.prevPathCanvas);
                    this.prevPathSnapshot.drawImage(this.canvas,0,0);
                    this._setupCanvasOnNewLayer();
                }

                this.drawCompletePath(this.k,this.i,this.j);
                let indexes=this.getNextPath(this.k,this.i,this.j,1);
                this.i=indexes[0];
                this.j=indexes[1];
            }
            if(p===totalCantPathStrokes){
                this.data.getIllustrationFunction(this.k)(this.canvas,this.ctx,this.baseImageCanvas,this.prevPathCanvas);
                callbackOnFinish(this.canvas.toDataURL());
            }
        }.bind(this)())

    },
    _manualDrawingLoop:function(nowTime){
        if(this.flagCompleted || this.data.getObjectsToDrawLength()<=0){return null;}
        let finalSegmentPoint={x:null,y:null}; //for the animation hand which belongs to a DrawingCacheManager
        if(nowTime>=this.animFinishTime || this.flagFirstTime){ // siguiente imagen o primera vez
            this._setupOnNewImage(nowTime);
            this.flagFirstTime=false;
        }else{
            finalSegmentPoint=this._illustrateImage(nowTime);
        }
        return finalSegmentPoint;
    },
    _designerDrawingLoop:function(nowTime){
        if(this.flagCompleted || this.data.getObjectsToDrawLength()<=0){return null;}
        if(nowTime>=this.animFinishTime || this.flagFirstTime){ // siguiente imagen o primera vez
            this._setupOnNewImage(nowTime);
            this.flagFirstTime=false;
        }else{
            if(this.animStrokeDuration===Infinity){return}
            if(this.data.getPathListLength(null)!==0) {
                if (!Preprotocol.wantConsume) {
                    //return;
                } else {
                    Preprotocol.wantDelete=false;
                    this._illustrateImage(nowTime);
                    Preprotocol.wantDelete = true;
                }
            }
        }
    },
    _setupOnNewImage:function(nowTime){
        let imageFinalFrame=new Image();
        if(!this.flagFirstTime){
            //// Completing not drawn lines
            imageFinalFrame=this.data.getFinalDrawingImageOf(this.k);
        }
        //Finding next image index, if final, then exit everything
        this.k++;
        if(this.k===this.data.getObjectsToDrawLength()){
            if(this.loopMode){
                this.k=0;
            }else{
                this.notifyOnLastObjectDrawingFinished(this.k-1,imageFinalFrame);
                this.flagCompleted=true;return null;
            }
        }
        /// notification On  a new object will be drawn
        if(this.flagFirstTime){
            this.notifyOnDrawingNewObject(0,0,null);
        }else{
            this.notifyOnDrawingNewObject(this.k-1,this.k,imageFinalFrame);
        }
        // initilize baseImageCanvas
        this.baseImageCtx.clearRect(0,0,this.baseImageCanvas.width,this.baseImageCanvas.height);
        this.baseImageCanvas.width=this.data.getWidthCanvasCacheOf(this.k);
        this.baseImageCanvas.height=this.data.getHeightCanvasCacheOf(this.k);

        this.baseImageCtx.drawImage(this.data.getBaseImageOf(this.k),0,0,this.data.getWidthCanvasCacheOf(this.k),this.data.getHeightCanvasCacheOf(this.k));

        this.prevPathCanvas.width=this.data.getWidthCanvasCacheOf(this.k);
        this.prevPathCanvas.height=this.data.getHeightCanvasCacheOf(this.k);
        //calculando momento final de la animacion de la imagen
        let offsetTime=nowTime-this.animFinishTime;

        this.animStartTime=nowTime-offsetTime;
        this.animFinishTime=this.animStartTime+this.data.getDurationOf(this.k)+ this.data.getDelayOf(this.k)+this.data.getExitDelayOf(this.k);
        this.animTotalProgress=0;
        this.prevStrokeTurnIndex=0;
        //Buscando los indicices del primer stroke
        this.i=this.getFirstPathListIndex(this.k,-1);
        this.j=0;
        //Setting up canvas for new image (cleaning, empty snapshot, setup linewidth)

        this._setupCanvasOnNewLayer();

        this.prevPathSnapshot.drawImage(this.canvas,0,0);
        // pintara un texto o una imagen

        this.functionDrawingMode=this.data.getIllustrationFunction(this.k);
        ////// Calculando tiempo de cada stroke
        let totalCantPathStrokes=this.getTotalStrokesInImage(this.k);
        this.animStrokeDuration=this.data.getDurationOf(this.k)/totalCantPathStrokes;

    },
    _illustrateImage:function(nowTime){
        let finalSegmentPoint={x:null,y:null};  // Coordinate for the drawing Hand
        this.animTotalProgress=nowTime-this.animStartTime;

        if(this.data.getPathListLength(this.k)!==0){

            let animTrueProgress=this.animTotalProgress-this.data.getDelayOf(this.k);

            if(animTrueProgress<0){return null;}
            if(animTrueProgress>=this.data.getDurationOf(this.k)){return null;}

            let indexPathTurn=Math.floor(animTrueProgress/this.animStrokeDuration);
            let cantJumps=indexPathTurn-this.prevStrokeTurnIndex;
            let oldValI=this.i;
            for(let p=0;p<cantJumps;p++){
                if(oldValI!==this.i){//se paso a otro path
                    oldValI=this.i;

                    this.functionDrawingMode(this.canvas,this.ctx,this.baseImageCanvas,this.prevPathCanvas,this.i);

                    this.prevPathSnapshot.clearRect(0,0,this.prevPathCanvas.width,this.prevPathCanvas.height);
                    this.prevPathSnapshot.drawImage(this.canvas,0,0);

                    this._setupCanvasOnNewLayer();
                }
                this.drawCompletePath(this.k,this.i,this.j);
                let indexes=this.getNextPath(this.k,this.i,this.j,1);
                this.i=indexes[0];
                this.j=indexes[1];
            }

            if(oldValI!==this.i){//se paso a otro path
                this.functionDrawingMode(this.canvas,this.ctx,this.baseImageCanvas,this.prevPathCanvas,this.i);

                this.prevPathSnapshot.clearRect(0,0,this.prevPathCanvas.width,this.prevPathCanvas.height);
                this.prevPathSnapshot.drawImage(this.canvas,0,0);

                this._setupCanvasOnNewLayer();
            }

            finalSegmentPoint=this.drawCurveSegment(this.k,this.i,this.j,(animTrueProgress%this.animStrokeDuration)/this.animStrokeDuration);
            this.functionDrawingMode(this.canvas,this.ctx,this.baseImageCanvas,this.prevPathCanvas,this.i);

            this.prevStrokeTurnIndex=indexPathTurn;
        }
        return finalSegmentPoint;
    },
    _setupCanvasOnNewLayer:function(){
        this.ctx.beginPath();
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.lineWidth=this.data.getLineWidthAt(this.k,this.i);

        if(this.data.getTypeOf(this.k)==="SVGAnimable" && this.data.getPathTypeOf(this.k)===DrawingDataType.CREATED_NOPATH){
            this.ctx.strokeStyle=this.data.getLineColorAt(this.k,this.i);
        }
        if(this.data.getTypeOf(this.k)==="TextAnimable"){
            this.ctx.fillStyle=this.data.getFillColorOf(this.k);
        }
        this.ctx.lineCap = "round";
    },
    // captureCanvas(img,callback){
    //     this.canvas.toBlob(function(blob){
    //         let self=this;
    //         let url=URL.createObjectURL(blob);
    //         img.onload=function(){
    //             callback.bind(this)();
    //             URL.revokeObjectURL(url);
    //         }.bind(this);
    //         img.src=url;
    //     }.bind(this))
    // },
    getNextPath:function(k,i,j,jumps){
        let lengthCurrentPath=this.data.getPathLength(k,i);
        if(j<lengthCurrentPath-1-jumps){
            j+=jumps
            return [i,j];
        }else{
            let carry=(lengthCurrentPath-1)-j
            jumps-=carry;
            while(jumps>=0){
                i++;
                if(i>=this.data.getPathListLength(k)){i=0;}
                let lengthCurrentPath=this.data.getPathLength(k,i)-1;
                if(lengthCurrentPath===-1){
                    continue;
                }
                carry=jumps-lengthCurrentPath;  
                if(carry<0){
                    j=jumps;
                    break;
                }
                jumps=carry;
            }
        }
        return [i,j]
    },
    getFirstPathListIndex:function(k,i){
        i++;
        if(i>=this.data.getPathListLength(k,)){i=0;return i;}
        while(this.data.getPathLength(k,i)<2 ){
            i++;
            if(i>=this.data.getPathListLength(k,)){i=0;break;}
        }
        return i;
    },
    drawCompletePath:function(k,i,pAIndex){
        let self=this;
        if(this.data.getEntraceModeOf(k)!==EntranceName.text_drawn){ //para los text-drawn no se debe hacer moveto en cada stroke, ya que de lo contrario, no se mostrara el relleno ya que al hacer move to como que que se resetea
            //el punto desde el cual se aplica el composite operation effect para que solo se pinte las partes que coinciden. Esto no resulve del todo el problema ya que, la forma en que funcionan las funciones de dibujado de un stroke
            // es que se provee los puntos del stroke considerando el punto inicial del stroke, asi que es oblicatio que se haga un move to al punto inicial siempre
            // aun asi esto es una solucion que funciona bien
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
        }
        var len = this.data.getPathLength(k,i); // number of points
        if(len<2){
            return;
        }

        if (this.data.getStrokeTypeAt(k,i,pAIndex)==="l") {
                this.ctx.lineTo(this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }
        else if (this.data.getStrokeTypeAt(k,i,pAIndex)==="c"){
            this.ctx.bezierCurveTo(
                this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex))*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex))*2+1),
                this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="q"){
            this.ctx.quadraticCurveTo(
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="q1"){
            this.ctx.quadraticCurveTo(
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="m"){
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }
    },

    drawCurveSegment:function(k,i,pAIndex,temperature){
        if(this.data.getEntraceModeOf(k)!==EntranceName.text_drawn) { //para los text-drawn no se debe hacer moveto en cada stroke
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k, i, pAIndex), this.data.getStrokeCoordYAt(k, i, pAIndex));
        }
        var len = this.data.getPathLength(k,i); // number of points
        if(len<2){return null;}
        let finalSegmentPoint={x:null,y:null}; // for the scene previewer, specifically the hand movement
        if(this.data.getStrokeTypeAt(k,i,pAIndex)==="l"){
            let point=CurveSegmentTool.getLine(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex),this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature);
            this.ctx.lineTo(point.x,point.y);
            finalSegmentPoint.x=point.x;
            finalSegmentPoint.y=point.y;
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="c"){
            let points=CurveSegmentTool.getBezier(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex))*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex))*2+1),
                this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);
            finalSegmentPoint.x=points[4];
            finalSegmentPoint.y=points[5];
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="q"){
            let points=CurveSegmentTool.getQuadratic(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.quadraticCurveTo(points[0],points[1],points[2],points[3]);
            finalSegmentPoint.x=points[2];
            finalSegmentPoint.y=points[3];
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="q1"){
            let points=CurveSegmentTool.getQuadratic(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.quadraticCurveTo(points[0],points[1],points[2],points[3]);
            finalSegmentPoint.x=points[2];
            finalSegmentPoint.y=points[3];
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="m"){
            finalSegmentPoint.x=this.data.getStrokeCoordXAt(k,i,pAIndex+1);
            finalSegmentPoint.y=this.data.getStrokeCoordYAt(k,i,pAIndex+1);
            this.ctx.moveTo(finalSegmentPoint.x,finalSegmentPoint.y);
        }
        return finalSegmentPoint;
    },
    getTotalStrokesInImage:function(k){
        let totalCantPathStrokes=0;
        for(let i=0;i<this.data.getPathListLength(k);i++){
            let tmpCant=this.data.getPathLength(k,i)-1;
            totalCantPathStrokes=tmpCant<0?totalCantPathStrokes:totalCantPathStrokes+tmpCant;
        }
        return totalCantPathStrokes;
    },
    notifyOnDrawingNewObject:function(lastObjIndex,newObjIndex,lastDataUrl){//suscritos : su manejador de este en la vista PreviewerView (DrawingCacheManager)
        if(this.observersOnDrawingNewObject){
            this.observersOnDrawingNewObject.notificationOnDrawingNewObject(lastObjIndex,newObjIndex,lastDataUrl);
        }
        this.prevPathCanvas.width=this.data.getWidthCanvasCacheOf(newObjIndex);
        this.prevPathCanvas.height=this.data.getHeightCanvasCacheOf(newObjIndex);
    },
    notifyOnLastObjectDrawingFinished:function(indexLastObject,finalObjectImage){
        if(this.observerOnLastObjectDrawingFinished){
            this.observerOnLastObjectDrawingFinished.notificationOnLastObjectDrawingFinished(indexLastObject,finalObjectImage);
        }
    },
    registerOnDrawingNewObject:function(obj){
        this.observersOnDrawingNewObject=obj;
    },
    registerOnLastObjectDrawingFinished:function(obj){
        this.observerOnLastObjectDrawingFinished=obj;
    }
})


var IllustratorDataAdapterPreview=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager,previewManager,scalerFactorX,scalerFactorY,imgHigh){
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;
        this.previewManager=previewManager;

        this.scalerFactorX=scalerFactorX;
        this.scalerFactorY=scalerFactorY;
        this.duration=3000;
        this.delay=0;
        this.baseImage=imgHigh;
    },
    getStrokeCoordXAt:function(k,i,j){
        return this.canvasDrawingManager.listPoints[i][j].get("left")*this.scalerFactorX;
    },
    getStrokeCoordYAt:function(k,i,j){
        return this.canvasDrawingManager.listPoints[i][j].get("top")*this.scalerFactorY;
    },
    getPathLength:function(k,i){
        return this.canvasDrawingManager.listPoints[i].length;
    },
    getPathListLength:function(k){
        return this.canvasDrawingManager.listPoints.length;
    },

    getCtrlPointCoordXAt:function(k,i,j){
        return this.drawingManager.ctrlPointsManager.list[i][j]*this.scalerFactorX;
    },
    getCtrlPointCoordYAt:function(k,i,j){
        return this.drawingManager.ctrlPointsManager.list[i][j]*this.scalerFactorY;
    },

    getListLinesWidthsLength:function(k,){
        return this.canvasDrawingManager.listLinesWidths.length;
    },
    getLineWidthAt:function(k,i){
        return this.canvasDrawingManager.listLinesWidths[i]*this.scalerFactorX;
    },

    getStrokeTypeAt:function(k,i,j){
        return this.canvasDrawingManager.listPathStrokesType[i][j];
    },

    getDurationOf:function(k){
        return this.duration;
    },
    getDelayOf:function(k){
        return this.delay;
    },
    getExitDelayOf:function(k){
        return 0;
    },
    getWidthCanvasCacheOf:function(k){
        return this.previewManager.canvas.width;
    },
    getHeightCanvasCacheOf:function(k){
        return this.previewManager.canvas.height;
    },
    getWidthMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInMainCanvas();
    },
    getHeightMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInMainCanvas();
    },

    getTypeOf:function(k){
        return "ImageAnimable";
    },
    getPathTypeOf:function(k){
        return DrawingDataType.CREATED_PATHDESIGNED;
    },
    getBaseImageOf:function(k){
        return this.baseImage;
    },
    getFinalDrawingImageOf:function(k){
        return null;
    },
    getObjectsToDrawLength:function(){
        return 1;
    },
    getEntraceModeOf:function(k){
        return EntranceName.image_drawn;
    },
    getIllustrationFunction:function(k){
        return ImageDrawnEntranceMode.prototype.illustrationFunctionOnCache;
    }
})


var IllustratorDataAdapterCache=fabric.util.createClass({
    initialize:function(listAnimableObjectsWidthDrawnEntrances){
        this.listAnimableObjectsWithDrawnEntrances=listAnimableObjectsWidthDrawnEntrances;
    },
    getStrokeCoordXAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points[i][j*2]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getStrokeCoordYAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points[i][j*2+1]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInDrawingCache();
    },
    getPathLength:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points[i].length/2;
    },
    getPathListLength:function(k,){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points.length;
    },
    getPathTypeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.type;
    },
    getCtrlPointCoordXAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.ctrlPoints[i][j]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getCtrlPointCoordYAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.ctrlPoints[i][j]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInDrawingCache();
    },
    getStrokeTypeAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.strokesTypes[i][j];
    },
    getListLinesWidthsLength:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.linesWidths.length;
    },
    getBaseImageOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getDrawingBaseImage();
    },
    getFinalDrawingImageOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getDrawingFinalImage();
    },
    getLineWidthAt:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.linesWidths[i]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getLineColorAt:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.linesColors[i];
    },
    getFillColorOf:function(k){/*for texts*/
        return this.listAnimableObjectsWithDrawnEntrances[k].fill;
    },
    getDurationOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceTimes.duration;
    },
    getDelayOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceTimes.delay;
    },
    getExitDelayOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceTimes.transitionDelay;
    },
    getWidthCanvasCacheOf:function(k){//usado por el drawinCacheManger
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getHeightCanvasCacheOf:function(k){//usado por el drawinCacheManger
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInDrawingCache();
    },
    getWidthMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInMainCanvas();
    },
    getHeightMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInMainCanvas();
    },
    convertPathLeftCoordToHandCoordOf:function(k,coordX){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.convertPathLeftCoordToHandCoord(coordX);
    },
    convertPathTopCoordToHandCoordOf:function(k,coordY){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.convertPathTopCoordToHandCoord(coordY);
    },

    getObjectsToDrawLength:function(){
      return this.listAnimableObjectsWithDrawnEntrances.length;
    },
    getEntraceModeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.getCurrentEntranceModeName();
    },
    getTypeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].type;
    },
    getIllustrationFunction:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.illustrationFunctionOnCache.bind(this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode);
    }
})