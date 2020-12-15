var PathIllustrator=fabric.util.createClass({
    initialize:function(canvas,ctx,dataAdapter,loopMode){
        this.listObserversOnDrawingNewObject=[];

        this.canvas=canvas;
        this.ctx=ctx;

        this.data=dataAdapter;
        this.loopMode=loopMode;
        this.prevPathSnapshot=new Image();

        this.counterInterruption=0;
        this.endLoop=false;

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
        let self=this;
        this.animator={
            executeAnimations:this._executeAnimations.bind(self)
        }
    },
    setupPreviewSceneVars:function(){
        if(this.data.getObjectsToDrawLength()<=0){return;}
        this.ctx.lineCap = "round";
        this.endLoop=false;
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
    start:function(){
        if(this.data.getObjectsToDrawLength()<=0){return};//SI NO HAY OBJECTOS PARA DIBUJAR NO INICIAMOS CUANDO NOS LO SOLICITEN
        this.endLoop=false;
        this._loop();
    },
    finish:function(){
        this.endLoop=true;
        this.counterInterruption=-1;
    },
    generateFinalImage:function(callbackOnFinish){
        let k=0;
        let i=this.getFirstPathListIndex(k,-1);
        let j=0;
        let totalCantPathStrokes=this.getTotalStrokesInImage(k);
        let oldValI=i;
        let p=0;
        this.canvas.width=this.data.getBaseImageOf(k).naturalWidth;
        this.canvas.height=this.data.getBaseImageOf(k).naturalHeight;
        this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
        this.ctx.lineCap="round";
        (function looper(){
            for(p;p<totalCantPathStrokes;p++){
                if(oldValI!==i){//se paso a otro path
                    oldValI=i;
                    this.drawCurrentStrokes(k);
                    this.prevPathSnapshot.src=this.canvas.toDataURL();
                    this.ctx.beginPath();
                    this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                    this.prevPathSnapshot.onload=function(){
                        setTimeout(function(){
                        looper.bind(this)();
                        }.bind(this),64)
                    }.bind(this)
                    break;
                }
                //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                this.drawCompletePath(k,i,j);
                let indexes=this.getNextPath(k,i,j,1);
                i=indexes[0];
                j=indexes[1];
            }
            if(p===totalCantPathStrokes){
                this.drawCurrentStrokes(k);
                callbackOnFinish(this.canvas.toDataURL());
            }
        }.bind(this)())

    },
    _executeAnimations:function(nowTime){
        if(this.endLoop || this.data.getObjectsToDrawLength()<=0){return;}
        if(nowTime>=this.animFinishTime || this.flagFirstTime){ // siguiente imagen o primera vez
            let imageFinalFrame=new Image();
            if(!this.flagFirstTime){
                //// Completing not drawn lines
                if(this.data.getEntraceModeOf(this.k)===EntranceModes.drawn){
                    imageFinalFrame=this.data.getFinalMaskedImageOf(this.k);
                    //this.ctx.drawImage(,0,0,this.canvas.width,this.canvas.height);

                }else if(this.data.getEntraceModeOf(this.k)===EntranceModes.text_drawn){
                    let animTrueProgress=this.animTotalProgress-this.data.getDelayOf(this.k);
                    animTrueProgress=Math.max(0,animTrueProgress);
                    let indexPathTurn=parseInt(animTrueProgress/this.animStrokeDuration);
                    let cantJumps=(Math.round(this.data.getDurationOf(this.k)/this.animStrokeDuration)-1)-indexPathTurn;

                    this.drawCurveSegment(this.k,this.i,this.j,1);
                    let oldValI=this.i;
                    let flagNewPath=false;
                    for(let p=0;p<cantJumps;p++){
                        let indexes=this.getNextPath(this.k,this.i,this.j,1);
                        this.i=indexes[0];
                        this.j=indexes[1];
                        this.drawCompletePath(this.k,indexes[0],indexes[1]);
                    }
                    this.functionDrawingMode(this.k);
                    imageFinalFrame=this.data.getFinalMaskedImageOf(this.k);
                }
            }else{
                imageFinalFrame.src=this.canvas.toDataURL();
            }
            this.k++;
            if(this.k===this.data.getObjectsToDrawLength()){
                if(this.loopMode){
                    this.k=0;
                }else{
                    this.finish();return;
                }
            }
            ///
            if(this.flagFirstTime){
                this.notifyOnDrawingNewObject(0,0,imageFinalFrame);
            }else{
                this.notifyOnDrawingNewObject(this.k-1,this.k,imageFinalFrame);
            }

            //calculando momento final de la animacion de la imagen
            let offsetTime=nowTime-this.animFinishTime;

            this.animStartTime=nowTime-offsetTime;
            this.animFinishTime=this.animStartTime+this.data.getDurationOf(this.k)+ this.data.getDelayOf(this.k);
            this.animTotalProgress=0;
            this.prevStrokeTurnIndex=0;

            //Buscando los indicices del primer stroke
            this.i=this.getFirstPathListIndex(this.k,-1);
            this.j=0;
            //Setting up canvas for new image (cleaning, empty snapshot, setup linewidth)
            this.ctx.beginPath();
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            this.prevPathSnapshot.src=this.canvas.toDataURL();
            if(this.data.getListLinesWidthsLength(this.k)>0){
                this.ctx.lineWidth=this.data.getLineWidthAt(this.k,this.i);
            }
            this.ctx.lineCap = "round";
            // pintara un texto o una imagen
            if(this.data.getEntraceModeOf(this.k)===EntranceModes.drawn){
                this.functionDrawingMode=this.drawCurrentStrokes.bind(this);
            }else if(this.data.getEntraceModeOf(this.k)===EntranceModes.text_drawn){
                this.functionDrawingMode=this.drawCurrentFills.bind(this);
                this.ctx.fillStyle=this.data.getTextFillColor(this.k);
            }
            ////// Calculando tiempo de cada stroke
            let totalCantPathStrokes=this.getTotalStrokesInImage(this.k);
            this.animStrokeDuration=this.data.getDurationOf(this.k)/totalCantPathStrokes;

            this.flagFirstTime=false;
        }else{
            this.animTotalProgress=nowTime-this.animStartTime;

            if(this.data.getPathListLength(this.k)!==0){
                if(!Preprotocol.wantConsume){
                    //return;
                }else{
                    Preprotocol.wantDelete=false;
                    let animTrueProgress=this.animTotalProgress-this.data.getDelayOf(this.k);
                    animTrueProgress=Math.max(0,animTrueProgress);
                    let indexPathTurn=Math.floor(animTrueProgress/this.animStrokeDuration);
                    let cantJumps=indexPathTurn-this.prevStrokeTurnIndex;
                    let oldValI=this.i;
                    let flagNewPath=false;
                    let p=0;
                    for(p=0;p<cantJumps;p++){
                        if(oldValI!==this.i){//se paso a otro path
                            oldValI=this.i;
                            flagNewPath=true;

                            this.functionDrawingMode(this.k);
                            this.prevPathSnapshot.src=this.canvas.toDataURL();
                            this.ctx.beginPath();
                            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.he);
                            this.ctx.lineWidth=this.data.getLineWidthAt(this.k,this.i);
                            this.ctx.lineCap = "round";
                            break;
                        }
                        //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                        this.drawCompletePath(this.k,this.i,this.j);
                        let indexes=this.getNextPath(this.k,this.i,this.j,1);
                        this.i=indexes[0];
                        this.j=indexes[1];
                    }
                    if(!flagNewPath){
                        if(oldValI!==this.i){//se paso a otro path
                            this.functionDrawingMode(this.k);
                            this.prevPathSnapshot.src=this.canvas.toDataURL();
                            this.ctx.beginPath();
                            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.he);
                            this.ctx.lineWidth=this.data.getLineWidthAt(this.k,this.i);
                            this.ctx.lineCap = "round";
                        }else{
                            this.drawCurveSegment(this.k,this.i,this.j,(animTrueProgress%this.animStrokeDuration)/this.animStrokeDuration);
                            this.functionDrawingMode(this.k);
                        }
                        this.prevStrokeTurnIndex=indexPathTurn;
                    }else{
                        this.prevStrokeTurnIndex+=p;
                    }
                    //FIN AQUI ANIMACIONES
                    Preprotocol.wantDelete=true;
                }
            }
        }
    },
    _loop:function(){
        this.ctx.lineCap = "round";
        let flagFirstTime=true;

        let animStartTime;
        let animFinishTime;
        let animTotalProgress; //0-total duration

        let animStrokeDuration=0;
        let k=0;
        let i=0;
        let j=0;

        let prevStrokeTurnIndex=0;

        let functionDrawingMode=null;
        (function tick(){
            this.counterInterruption--;
            if(this.counterInterruption<0){
                if(flagFirstTime){
                    flagFirstTime=false;

                    /// Establer tiempo por stroke
                    let totalCantPathStrokes=this.getTotalStrokesInImage(k);
                    animStrokeDuration=this.data.getDurationOf(k)/totalCantPathStrokes;
                    //Medidor Transcurso de tiempo desde este momento
                    animStartTime=+new Date();
                    animFinishTime=animStartTime+this.data.getDurationOf(k) +this.data.getDelayOf(k) ;

                    animTotalProgress=0;
                    prevStrokeTurnIndex=0;

                    //seleccionar funcion de dibujado
                    if(this.data.getEntraceModeOf(k)===EntranceModes.drawn){
                            functionDrawingMode=this.drawCurrentStrokes.bind(this);
                    }else if(this.data.getEntraceModeOf(k)===EntranceModes.text_drawn){
                        functionDrawingMode=this.drawCurrentFills.bind(this);
                    }
                    //Encontrar los indices del primer stroke
                    i=this.getFirstPathListIndex(k,-1);
                    j=0;

                    this.ctx.beginPath();
                    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

                    this.prevPathSnapshot.src=this.canvas.toDataURL();
                    this.notifyOnDrawingNewObject(0,0,this.canvas.toDataURL());
                    if(this.data.getListLinesWidthsLength(k)>0){
                        this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                    }
                }

                if(animStrokeDuration!==Infinity){//entrar si hay almenos un stroke
                    let nowTime=+new Date();
                    if(nowTime>animFinishTime){

                        //// Completing not drawn lines
                        if(this.data.getEntraceModeOf(k)===EntranceModes.drawn){
                            this.ctx.drawImage(this.data.getBaseImageOf(k),0,0,this.canvas.width,this.canvas.height);

                        }else if(this.data.getEntraceModeOf(k)===EntranceModes.text_drawn){
                            let animTrueProgress=animTotalProgress-this.data.getDelayOf(k);
                            animTrueProgress=Math.max(0,animTrueProgress);
                            let indexPathTurn=parseInt(animTrueProgress/animStrokeDuration);
                            let cantJumps=(Math.round(this.data.getDurationOf(k)/animStrokeDuration)-1)-indexPathTurn;

                            this.drawCurveSegment(k,i,j,1);
                            let oldValI=i;
                            let flagNewPath=false;
                            for(let p=0;p<cantJumps;p++){
                                let indexes=this.getNextPath(k,i,j,1);
                                i=indexes[0];
                                j=indexes[1];
                                this.drawCompletePath(k,indexes[0],indexes[1]);
                            }
                            functionDrawingMode(k);
                        }
                            k++;
                            if(k===this.data.getObjectsToDrawLength()){
                                if(this.loopMode){
                                    k=0;
                                }else{
                                    this.finish();return;
                                }
                            }
                            ///
                            this.notifyOnDrawingNewObject(k-1,k,this.canvas.toDataURL());

                            //calculando momento final de la animacion de la imagen
                            let offsetTime=nowTime-animFinishTime;

                            animStartTime=+new Date()-offsetTime;
                            animFinishTime=animStartTime+this.data.getDurationOf(k)+ this.data.getDelayOf(k);
                            animTotalProgress=0;
                            prevStrokeTurnIndex=0;

                            //Buscando los indicices del primer stroke
                            i=this.getFirstPathListIndex(k,-1);
                            j=0;
                            // pintara un texto o una imagen
                            if(this.data.getEntraceModeOf(k)===EntranceModes.drawn){
                                functionDrawingMode=this.drawCurrentStrokes.bind(this);
                            }else if(this.data.getEntraceModeOf(k)===EntranceModes.text_drawn){
                                functionDrawingMode=this.drawCurrentFills.bind(this);
                            }
                            //Setting up canvas for new image (cleaning, empty snapshot, setup linewidth)
                            this.ctx.beginPath();
                            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                            this.prevPathSnapshot.src=this.canvas.toDataURL();
                            if(this.data.getListLinesWidthsLength(k)>0){
                                this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                            }
                            ////// Calculando tiempo de cada stroke
                            let totalCantPathStrokes=0;
                            for(let i=0;i<this.data.getPathListLength(k);i++){
                                let tmpCant=this.data.getPathLength(k,i)-1;
                                totalCantPathStrokes=tmpCant<0?totalCantPathStrokes:totalCantPathStrokes+tmpCant;
                            }
                            animStrokeDuration=this.data.getDurationOf(k)/totalCantPathStrokes;



                    }else{
                        animTotalProgress=nowTime-animStartTime;

                        if(this.data.getPathListLength(k)!==0){
                            if(!Preprotocol.wantConsume){
                                //return;
                            }else{
                                Preprotocol.wantDelete=false;
                                let animTrueProgress=animTotalProgress-this.data.getDelayOf(k);
                                animTrueProgress=Math.max(0,animTrueProgress);
                                let indexPathTurn=Math.floor(animTrueProgress/animStrokeDuration);
                                let cantJumps=indexPathTurn-prevStrokeTurnIndex;
                                let oldValI=i;
                                let flagNewPath=false;
                                let p=0;
                                for(p=0;p<cantJumps;p++){
                                    if(oldValI!=i){//se paso a otro path
                                        oldValI=i;
                                        flagNewPath=true;

                                        functionDrawingMode(k);
                                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                                        this.ctx.beginPath();
                                        this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                                        break;
                                    }
                                    //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                                    this.drawCompletePath(k,i,j);
                                    let indexes=this.getNextPath(k,i,j,1);
                                    i=indexes[0];
                                    j=indexes[1];
                                }
                                if(!flagNewPath){
                                    if(oldValI!==i){//se paso a otro path

                                        functionDrawingMode(k);
                                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                                        this.ctx.beginPath();
                                        this.ctx.lineWidth=this.data.getLineWidthAt(k,i);

                                    }else{
                                        this.drawCurveSegment(k,i,j,(animTrueProgress%animStrokeDuration)/animStrokeDuration);
                                        functionDrawingMode(k);
                                    }
                                    prevStrokeTurnIndex=indexPathTurn;
                                }else{
                                    prevStrokeTurnIndex+=p;
                                }

                                //FIN AQUI ANIMACIONES
                                Preprotocol.wantDelete=true;
                            }
                        }
                    }
                    ///////////////////////////////// LO DE ARRIBA ES PARA CONTROLAR EL PROGRESO TOTAL O GLOBAL
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
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.drawImage(this.data.getBaseImageOf(k),0,0,this.canvas.width,this.canvas.height)
        this.ctx.globalCompositeOperation="destination-in";
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";
        this.ctx.drawImage(this.prevPathSnapshot,0,0);

    },
    drawCurrentFills:function(k){
        // this.ctx.strokeStyle="red";
        // this.ctx.lineWidth="2";
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.drawImage(this.data.getBaseImageOf(k),0,0,this.canvas.width,this.canvas.height)
        this.ctx.globalCompositeOperation="source-in";
        //this.ctx.stroke();
        this.ctx.fill();
        this.ctx.globalCompositeOperation="source-over";
        this.ctx.drawImage(this.prevPathSnapshot,0,0);

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
        if(this.data.getEntraceModeOf(k)===EntranceModes.drawn){ //para los text-drawn no se debe hacer moveto en cada stroke
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
        if(this.data.getEntraceModeOf(k)===EntranceModes.drawn) { //para los text-drawn no se debe hacer moveto en cada stroke
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k, i, pAIndex), this.data.getStrokeCoordYAt(k, i, pAIndex));
        }
        var len = this.data.getPathLength(k,i); // number of points
        if(len<2){return;}
        if(this.data.getStrokeTypeAt(k,i,pAIndex)==="l"){
            let point=this.getLineCurvePoint(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex),this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature);
            this.ctx.lineTo(point.x,point.y);
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="c"){
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
            this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="q"){
            let points=this._getQuadraticCtrlPoints(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.quadraticCurveTo(points[0],points[1],points[2],points[3])
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="q1"){
            let points=this._getQuadraticCtrlPoints(
                this.data.getStrokeCoordXAt(k,i,pAIndex),
                this.data.getStrokeCoordYAt(k,i,pAIndex),
                this.data.getCtrlPointCoordXAt(k,i,(2*pAIndex+1)*2),
                this.data.getCtrlPointCoordYAt(k,i,(2*pAIndex+1)*2+1),
                this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                temperature
            )
            this.ctx.quadraticCurveTo(points[0],points[1],points[2],points[3])
        }else if(this.data.getStrokeTypeAt(k,i,pAIndex)==="m"){
            this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1));
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
    getTotalStrokesInImage:function(k){
        let totalCantPathStrokes=0;
        for(let i=0;i<this.data.getPathListLength(k);i++){
            let tmpCant=this.data.getPathLength(k,i)-1;
            totalCantPathStrokes=tmpCant<0?totalCantPathStrokes:totalCantPathStrokes+tmpCant;
        }
        return totalCantPathStrokes;
    },
    notifyOnDrawingNewObject:function(lastObjIndex,newObjIndex,lastDataUrl){//suscritos : su manejador de este en la vista PreviewerView (DrawingCacheManager)
        for(let i=0;i<this.listObserversOnDrawingNewObject.length;i++){
            this.listObserversOnDrawingNewObject[i].notificationOnDrawingNewObject(lastObjIndex,newObjIndex,lastDataUrl);
        }
    },
    registerOnDrawingNewObject:function(obj){
        this.listObserversOnDrawingNewObject.push(obj);
    }
})
var IllustratorDataAdapterPreview=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager,scalerFactorX,scalerFactorY,imgHTML){
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;

        this.scalerFactorX=scalerFactorX;
        this.scalerFactorY=scalerFactorY;
        this.duration=3000;
        this.delay=0;
        this.baseImage=imgHTML;
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
    getBaseImageOf:function(k){
        return this.baseImage;
    },
    getObjectsToDrawLength:function(){
        return 1;
    },
    getEntraceModeOf:function(k){
        return EntranceModes.drawn;
    }
})


var IllustratorDataAdapterCache=fabric.util.createClass({
    initialize:function(listAnimableObjectsWidthDrawnEntrances){
        //this.setNewAnimableObject(scalerFactorX,scalerFactorY,imageModel);
        this.listAnimableObjectsWithDrawnEntrances=listAnimableObjectsWidthDrawnEntrances;
        // this.imagesModel=listObjectsToDraw;
        // this.scalerFactors=listScalerFactors;
        // this.listTimings=listTimings;
    },
    getStrokeCoordXAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.points[i][j*2]
            * this.listAnimableObjectsWithDrawnEntrances[k].getWidthInDrawingCache();
    },
    getStrokeCoordYAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.points[i][j*2+1]
            * this.listAnimableObjectsWithDrawnEntrances[k].getHeightInDrawingCache();
    },
    getPathLength:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.points[i].length/2;
    },
    getPathListLength:function(k,){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.points.length;
    },

    getCtrlPointCoordXAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.ctrlPoints[i][j]
            * this.listAnimableObjectsWithDrawnEntrances[k].getWidthInDrawingCache();
    },
    getCtrlPointCoordYAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.ctrlPoints[i][j]
            * this.listAnimableObjectsWithDrawnEntrances[k].getHeightInDrawingCache();
    },
    getStrokeTypeAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.strokesTypes[i][j];
    },
    getListLinesWidthsLength:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.linesWidths.length;
    },
    getBaseImageOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.imgHTML;
    },
    getFinalMaskedImageOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.imgMasked;
    },
    getLineWidthAt:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].imageDrawingData.linesWidths[i]
            * this.listAnimableObjectsWithDrawnEntrances[k].getWidthInDrawingCache();
    },
    getDurationOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceDuration;
    },
    getDelayOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceDelay;
    },
    getWidthCanvasCacheOf:function(k){//usado por el drawinCacheManger
        return this.listAnimableObjectsWithDrawnEntrances[k].getWidthInDrawingCache();
    },
    getHeightCanvasCacheOf:function(k){//usado por el drawinCacheManger
        return this.listAnimableObjectsWithDrawnEntrances[k].getHeightInDrawingCache();

    },
    getObjectsToDrawLength:function(){
      return this.listAnimableObjectsWithDrawnEntrances.length;
    },
    getEntraceModeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].getEntranceMode();
    },
    getTextFillColor:function(k){
        if(this.listAnimableObjectsWithDrawnEntrances[k].type==="TextAnimable"){
            return this.listAnimableObjectsWithDrawnEntrances[k].fill;
        }else{
            alert("ERROR CONOCIDOO: el pathillustrator solicito fill color a un obj no TextAnimable");
            return "#000000";
        }
    }
})