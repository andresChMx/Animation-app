var PathIllustrator=fabric.util.createClass({
    initialize:function(canvas,ctx,dataAdapter,loopMode=true){
        this.listObserversOnDrawingNewObject=[];

        this.canvas=canvas;
        this.ctx=ctx;

        this.data=dataAdapter;
        this.loopMode=loopMode;
        this.prevPathSnapshot=new Image();
        this.actualSnapshot=new Image();

        this.listObjectsToDraw=[];

        this.counterInterruption=0;
        this.flagFirstTime=true;
        this.endLoop=false;


        //vars for previewer
        this.lastPicIndex=0;
        this.lastPath=0;
        this.lastStroke=0;
        this.lastStrokeAnimDuration=0;
        this.prevSnapshot=null
    },
    setListObjectsToDraw:function(listObjects){//Debe ser llamado simpre obligatoriamente
        this.listObjectsToDraw=listObjects;
    },
    start:function(){
        if(this.listObjectsToDraw.length==0){
            return;
        }
        this.prevPathSnapshot.src=this.canvas.toDataURL();
        this.endLoop=false;
        this._loop();
    },
    finish:function(){
        this.endLoop=true;
        this.counterInterruption=-1;
        this.flagFirstTime=true;
    },
    _executeAnimationFirstTime:function(){
        let totalCantPaths=0;
        for(let i=0;i<this.data.getPathListLength(this.lastPicIndex);i++){
            let tmpCant=this.data.getPathLength(this.lastPicIndex,i)-1;
            totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
        }
        this.lastStrokeAnimDuration=this.listObjectsToDraw[this.lastPicIndex].paths.duration/totalCantPaths;
        this.lastPicIndex=0;

        i=this.getFirstPathListIndex(k,-1);
        j=0;
        this.ctx.beginPath();
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        if(this.data.getListLinesWidthsLength(k)>0){
            this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
        }

        this.prevPathSnapshot.src=this.canvas.toDataURL();
    },
    _executeAnimation:function(totalTimeProgress){
        let tmp=totalTimeProgress;
        let k=0;
        for(k=0;k<this.listObjectsToDraw.length;k++){
          tmp-=this.listObjectsToDraw[i].paths.duration;
          if(tmp<0){
              break;
          }
        }
        if(k==this.listObjectsToDraw.length){return}
        if(k!=this.lastPicIndex){

            let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
            let cantJumps=(Math.round(this.listObjectsToDraw[k].paths.duration/animPathDuration)-1)-indexPathTurn;

            this.drawCurveSegment(k,i,j,1);

            for(let p=0;p<cantJumps;p++){
                let indexes=this.getNextPath(k,i,j,1);
                //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                this.drawCompletePath(k,indexes[0],indexes[1]);
                i=indexes[0];
                j=indexes[1];
            }

            this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
            this.ctx.globalCompositeOperation="destination-in";
            this.ctx.stroke();
            this.ctx.globalCompositeOperation="source-over";

            this.actualSnapshot.src=this.canvas.toDataURL();
            this.ctx.drawImage(this.prevPathSnapshot,0,0);
            this.ctx.drawImage(this.actualSnapshot,0,0);
        }else{
            animTotalProgress=nowTime-animStartTime;

            if(this.data.getPathListLength(k)!=0){
                if(!Preprotocol.wantConsume){
                    //return;
                }else{
                    Preprotocol.wantDelete=false;

                    let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                    let cantJumps=indexPathTurn-prevStrokeIndexTurn;
                    let oldValI=i;
                    for(let p=0;p<cantJumps;p++){
                        this.drawCompletePath(k,i,j);
                        //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                        let indexes=this.getNextPath(k,i,j,1);
                        i=indexes[0];
                        j=indexes[1];
                    }

                    if(oldValI!=i){//se paso a otro path
                        this.drawCurrentStrokes(k);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        //}.bind(this);
                        this.ctx.beginPath();
                        this.ctx.lineWidth=this.data.getLineWidthAt(k,i);

                    }else{
                        this.drawCurveSegment(k,i,j,(animTotalProgress%animPathDuration)/animPathDuration);
                        this.drawCurrentStrokes(k);
                    }

                    prevStrokeIndexTurn=indexPathTurn;
                    //FIN AQUI ANIMACIONES
                    Preprotocol.wantDelete=true;
                }
            }
        }
            this.lastPictureIndex=k;

    },
    _loop:function(){
        this.ctx.lineCap = "round";
        let flagFirstTime=true;

        let animStartTime;
        let animFinishTime;
        let animTotalProgress; //0-total duration

        let animPathDuration=0;
        let k=0;
        let i=0;
        let j=0;

        let prevStrokeIndexTurn=0;
        (function tick(){
            this.counterInterruption--;
            if(this.counterInterruption<0){
                if(flagFirstTime){
                    flagFirstTime=false;

                    /// Establer tiempo por stroke
                    let totalCantPaths=0;
                    for(let i=0;i<this.data.getPathListLength(k);i++){
                        let tmpCant=this.data.getPathLength(k,i)-1;
                        totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
                    }
                    animPathDuration=this.listObjectsToDraw[k].paths.duration/totalCantPaths;
                    console.log(totalCantPaths);
                    
                    //Medidor Transcurso de tiempo desde este momento
                    animStartTime=+new Date();
                    animFinishTime=animStartTime+this.listObjectsToDraw[k].paths.duration;
                    animTotalProgress=0;
                    prevStrokeIndexTurn=0;

                    //Encontrar los indices del primer stroke
                    i=this.getFirstPathListIndex(k,-1);
                    j=0;

                    this.ctx.beginPath();
                    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                    if(this.data.getListLinesWidthsLength(k)>0){
                        this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                    }

                    this.prevPathSnapshot.src=this.canvas.toDataURL();
                }
    
                if(animPathDuration!=Infinity){//entrar si hay almenos un stroke
                    let nowTime=+new Date();
                    if(nowTime>animFinishTime){

                        //// Completing not drawn lines
                        
                        let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                        let cantJumps=(Math.round(this.listObjectsToDraw[k].paths.duration/animPathDuration)-1)-indexPathTurn;

                        this.drawCurveSegment(k,i,j,1);

                        for(let p=0;p<cantJumps;p++){
                            let indexes=this.getNextPath(k,i,j,1);
                            //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                            this.drawCompletePath(k,indexes[0],indexes[1]);
                            i=indexes[0];
                            j=indexes[1];
                        }
                        
                        this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        
                        this.actualSnapshot.src=this.canvas.toDataURL(); 
                        this.ctx.drawImage(this.prevPathSnapshot,0,0);
                        this.ctx.drawImage(this.actualSnapshot,0,0);
                        ///
                        k++;
                        if(k==this.listObjectsToDraw.length){
                            if(this.loopMode){
                                k=0;
                            }else{
                                this.finish();return;
                            }
                        }
                        ///
                        this.notifyOnDrawingNewObject(this.listObjectsToDraw[k].imgHTML,k-1,k,this.canvas.toDataURL());
                        //calculando momento final de la animacion de la imagen
                        let offsetTime=nowTime-animFinishTime;

                        animStartTime=+new Date()-offsetTime;
                        animFinishTime=animStartTime+this.listObjectsToDraw[k].paths.duration;
                        animTotalProgress=0;
                        prevStrokeIndexTurn=0;

                        //Buscando los indicices del primer stroke
                        i=this.getFirstPathListIndex(k,-1);
                        j=0;

                        //Setting up canvas for new image (cleaning, empty snapshot, setup linewidth)
                        this.ctx.beginPath();
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        if(this.data.getListLinesWidthsLength(k)>0){
                                this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                        }
                        ////// Calculando tiempo de cada stroke
                        let totalCantPaths=0;
                        for(let i=0;i<this.data.getPathListLength(k);i++){
                                let tmpCant=this.data.getPathLength(k,i)-1;
                                totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
                        }
                        animPathDuration=this.listObjectsToDraw[k].paths.duration/totalCantPaths;

                    }else{
                        animTotalProgress=nowTime-animStartTime;

                        if(this.data.getPathListLength(k)!=0){
                            if(!Preprotocol.wantConsume){
                                //return;
                            }else{
                                Preprotocol.wantDelete=false;
    
                                let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                                let cantJumps=indexPathTurn-prevStrokeIndexTurn;
                                let oldValI=i;
                                for(let p=0;p<cantJumps;p++){
                                      this.drawCompletePath(k,i,j);
                                    //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                                     let indexes=this.getNextPath(k,i,j,1);
                                     i=indexes[0];
                                     j=indexes[1];
                                }

                                if(oldValI!=i){//se paso a otro path
                                    this.drawCurrentStrokes(k);
                                    this.prevPathSnapshot.src=this.canvas.toDataURL();
                                        //}.bind(this);
                                    this.ctx.beginPath();
                                    this.ctx.lineWidth=this.data.getLineWidthAt(k,i);

                                }else{
                                    this.drawCurveSegment(k,i,j,(animTotalProgress%animPathDuration)/animPathDuration);
                                    this.drawCurrentStrokes(k);
                                }
                                
                                prevStrokeIndexTurn=indexPathTurn;
                                //FIN AQUI ANIMACIONES
                                Preprotocol.wantDelete=true;
                            }
                        }
                    }
        ///////////////////////////////// LO DE ARRIBA ES PARA CONTROLAR EL PROGRESO TOTAL O GLOBAL

                    //console.log(this.canvasDrawingManager.listPoints);
                }
            }else{
                flagFirstTime=true;
            }
            if(!this.endLoop){
                fabric.util.requestAnimFrame(tick.bind(this));
            }
        }.bind(this)())

    },
    drawCurrentStrokes:function(k){
        this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
        this.ctx.globalCompositeOperation="destination-in";
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
        
        this.actualSnapshot.src=this.canvas.toDataURL();
        this.ctx.drawImage(this.prevPathSnapshot,0,0);
        this.ctx.drawImage(this.actualSnapshot,0,0);

    },
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
                if(lengthCurrentPath==-1){
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

        var len = this.data.getPathLength(k,i); // number of points
        if(len<2){
            return;
        }
        if (this.data.getStrokeTypeAt(k,i,pAIndex)=="l") {
                this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
                this.ctx.lineTo(this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }
        else if (this.data.getStrokeTypeAt(k,i,pAIndex)=="c"){
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
            this.ctx.bezierCurveTo(
                this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex))*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex))*2+1),
                this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)=="q"){
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
            this.ctx.quadraticCurveTo(
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1));
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)=="q1"){
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,0),this.data.getStrokeCoordYAt(k,i,0));
            this.ctx.quadraticCurveTo(
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,1),
                this.data.getStrokeCoordYAt(k,i,1));
        }
    },

    drawCurveSegment:function(k,i,pAIndex,temperature){
        var len = this.data.getPathLength(k,i); // number of points
        if(len<2){return;}
        if(this.data.getStrokeTypeAt(k,i,pAIndex)=="l"){
            let point=this.getLineCurvePoint(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex),this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature);
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
            this.ctx.lineTo(point.x,point.y);
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)=="c"){
            let points=this._getBezierCtrlPoints(
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
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
            this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)=="q"){
            let points=this._getQuadraticCtrlPoints(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex))
            this.ctx.quadraticCurveTo(points[0],points[1],points[2],points[3])
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)=="q1"){
            let points=this._getQuadraticCtrlPoints(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex))
            this.ctx.quadraticCurveTo(points[0],points[1],points[2],points[3])
        }
    },
    _getBezierCtrlPoints:function(p1x,p1y,c1x,c1y,c2x,c2y,p2x,p2y,temperature){
        let t=temperature;
        let u0=1;
        let u1=1-t;
        let qxa=u0*u0*p1x;
        let qxb=u1*u1*p1x + c1x*2*t*u1 + c2x*t*t;
        let qxc=c1x;
        let qxd=c1x*u1*u1 + c2x*2*t*u1+ p2x*t*t;

        let qya=u0*u0*p1y;
        let qyb=u1*u1*p1y + c1y*2*t*u1 + c2y*t*t;
        let qyc=c1y;
        let qyd=c1y*u1*u1 + c2y*2*t*u1 + p2y*t*t;

        let xb=qxa*u1 +qxc*t ;
        let xc=qxb;
        let xd=qxb*u1+qxd*t;
        
        let yb=qya*u1+qyc*t ;
        let yc=qyb;
        let yd=qyb*u1+qyd*t;

        return [xb,yb,xc,yc,xd,yd];
    },
    _getQuadraticCtrlPoints:function(p1x,p1y,c1x,c1y,p2x,p2y,temperature){
        let t=temperature;
        let v1X=p1x+(c1x-p1x)*t;
        let v1Y=p1y+(c1y-p1y)*t;
        let newCtpX=v1X;
        let newCtpY=v1Y;
        let newP2X=v1X+((c1x+(p2x-c1x)*t)-v1X)*t;
        let newP2Y=v1Y+((c1y+(p2y-c1y)*t)-v1Y)*t;
        return [newCtpX,newCtpY,newP2X,newP2Y];


    },
    _getQBezierValue:function(t,p1,p2,p3){
        var iT = 1 - t;
        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
    },

    _getLValue:function(t,p1,p2){
        return p1 + t*(p2-p1);
    },
    getQuadraticCurvePoint:function(startX, startY, cpX, cpY, endX, endY, position) {
        return {
            x:  this._getQBezierValue(position, startX, cpX, endX),
            y:  this._getQBezierValue(position, startY, cpY, endY)
        };
    },
    getLineCurvePoint:function(startX,startY,endX,endY,position){
        return{
            x: this._getLValue(position,startX,endX),
            y: this._getLValue(position,startY,endY)
        }
    },
    notifyOnDrawingNewObject:function(imgHTML,lastObjIndex,newObjIndex,lastDataUrl){//suscritos : su manejador de este en la vista PreviewerView (DrawingCacheManager)
        for(let i=0;i<this.listObserversOnDrawingNewObject.length;i++){
            this.listObserversOnDrawingNewObject[i].notificationOnDrawingNewObject(imgHTML,lastObjIndex,newObjIndex,lastDataUrl);
        }
    },
    registerOnDrawingNewObject:function(obj){
        this.listObserversOnDrawingNewObject.push(obj);
    }
})
var IllustratorDataAdapterPreview=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager,scalerFactorX,scalerFactorY){
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;

        this.scalerFactorX=scalerFactorX;
        this.scalerFactorY=scalerFactorY;
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
    }
})


var IllustratorDataAdapterCache=fabric.util.createClass({
    initialize:function(listObjectsToDraw,listScalerFactors){
        //this.setNewAnimableObject(scalerFactorX,scalerFactorY,imageModel);
        this.imagesModel=listObjectsToDraw;
        this.scalerFactors=listScalerFactors;
    },
    getStrokeCoordXAt:function(k,i,j){
        return this.imagesModel[k].paths.points[i][j*2]*this.scalerFactors[k].x;
    },
    getStrokeCoordYAt:function(k,i,j){
        return this.imagesModel[k].paths.points[i][j*2+1]*this.scalerFactors[k].y;
    },
    getPathLength:function(k,i){
        return this.imagesModel[k].paths.points[i].length/2;
    },
    getPathListLength:function(k,){
        return this.imagesModel[k].paths.points.length;
    },

    getCtrlPointCoordXAt:function(k,i,j){
        return this.imagesModel[k].paths.ctrlPoints[i][j]*this.scalerFactors[k].x;
    },
    getCtrlPointCoordYAt:function(k,i,j){
        return this.imagesModel[k].paths.ctrlPoints[i][j]*this.scalerFactors[k].y;
    },
    getStrokeTypeAt:function(k,i,j){
        return this.imagesModel[k].paths.strokesTypes[i][j];
    },
    getListLinesWidthsLength:function(k){
        return this.imagesModel[k].paths.linesWidths.length;
    },
    getLineWidthAt:function(k,i){
        return this.imagesModel[k].paths.linesWidths[i]*this.scalerFactors[k].x;
    },

})