var PathIllustrator=fabric.util.createClass({
    initialize:function(canvas,ctx,dataAdapter,imageModel){
        this.canvas=canvas;
        this.ctx=ctx;

        this.data=dataAdapter;
        this.imageModel=imageModel;
        this.prevPathSnapshot=new Image();
        this.actualSnapshot=new Image();

        this.animTotalDuration=imageModel.paths.duration;

        this.counterInterruption=0;
        this.flagFirstTime=true;
        this.endLoop=false;
    },
    start:function(){
        this.prevPathSnapshot.src=this.canvas.toDataURL();
        this.endLoop=false;
        this._loop();
    },
    finish:function(){
        this.endLoop=true;
        this.counterInterruption=-1;
        this.flagFirstTime=true;
    },
    _loop:function(){
        let flagFirstTime=true;

        let animStartTime;
        let animFinishTime;
        let animTotalProgress; //0-total duration

        let animPathDuration=0;

        let i=0;
        let j=0;

        let prevIndexPathTurn=0;
        (function tick(){
            this.counterInterruption--;
            if(this.counterInterruption<0){
                if(flagFirstTime){
                    flagFirstTime=false;

                    let totalCantPaths=0;
                    for(let i=0;i<this.data.getPathListLength();i++){
                        let tmpCant=this.data.getPathLength(i)-1;
                        totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
                    }
                    animPathDuration=this.animTotalDuration/totalCantPaths;
                    console.log(totalCantPaths);
                    

                        animStartTime=+new Date();
                        animFinishTime=animStartTime+this.animTotalDuration;
                        animTotalProgress=0;

                        i=this.getFirstPathListIndex(-1);;
                        j=0;

                        prevIndexPathTurn=0;
                        this.ctx.beginPath();
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        if(this.data.getListLinesWidthsLength()>0){
                            this.ctx.lineWidth=this.data.getLineWidthAt(i);
                        }
                }
    
                if(animPathDuration!=Infinity){//entrar si hay almenos un stroke
                    let nowTime=+new Date();
                    if(nowTime>animFinishTime){
                        ////
                        let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                        let cantJumps=(Math.round(this.animTotalDuration/animPathDuration)-1)-indexPathTurn;

                        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        this.drawCurveSegment(i,j,1);
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        this.actualSnapshot.src=this.canvas.toDataURL();

                        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        for(let k=0;k<cantJumps;k++){
                            let indexes=this.getNextPath(i,j,1);
                            //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                            this.drawCompletePath(indexes[0],indexes[1]);
                            i=indexes[0];
                            j=indexes[1];
                        }
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        this.actualSnapshot.src=this.canvas.toDataURL(); 
                        this.ctx.drawImage(this.prevPathSnapshot,0,0);
                        this.ctx.drawImage(this.actualSnapshot,0,0);
                        ////
                        animStartTime=+new Date();
                        animFinishTime=animStartTime+this.animTotalDuration;
                        animTotalProgress=0;

                        i=this.getFirstPathListIndex(-1);
                        j=0;
                        prevIndexPathTurn=0;
                        this.ctx.beginPath();
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        if(this.data.getListLinesWidthsLength()>0){
                            this.ctx.lineWidth=this.data.getLineWidthAt(i);
                        }

                    }else{
                        animTotalProgress=nowTime-animStartTime;
                    }
        ///////////////////////////////// LO DE ARRIBA ES PARA CONTROLAR EL PROGRESO TOTAL O GLOBAL
                    if(this.data.getPathListLength()!=0){
                        //console.log(this.canvasDrawingManager.listPoints);
                        if(!Preprotocol.wantConsume){
                            //return;
                        }else{
                            Preprotocol.wantDelete=false;

                            let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                            if(prevIndexPathTurn!=indexPathTurn){
                                let cantJumps=indexPathTurn-prevIndexPathTurn;

                                this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                                this.ctx.globalCompositeOperation="destination-in";
                                this.drawCurveSegment(i,j,1);
                                this.ctx.stroke();
                                this.ctx.globalCompositeOperation="source-over";

                                this.actualSnapshot.src=this.canvas.toDataURL();
                                let oldValI=i;
                                if(cantJumps>=2){
                                    this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                                    this.ctx.globalCompositeOperation="destination-in";
                                    for(let k=0;k<cantJumps-1;k++){
                                        let indexes=this.getNextPath(i,j,1);
                                        //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                                        this.drawCompletePath(indexes[0],indexes[1]);
                                        i=indexes[0];
                                        j=indexes[1];
                                    }
                                    this.ctx.stroke();
                                    this.ctx.globalCompositeOperation="source-over";
                                    this.actualSnapshot.src=this.canvas.toDataURL();                    
                                }

                                
                                prevIndexPathTurn=indexPathTurn;
                                let indexes=this.getNextPath(i,j,1);
                                j=indexes[1];

                                if(oldValI!=indexes[0]){
                                    i=indexes[0];
                                    this.ctx.drawImage(this.prevPathSnapshot,0,0);
                                    this.ctx.drawImage(this.actualSnapshot,0,0);
                                    this.prevPathSnapshot.src=this.canvas.toDataURL();
                                    this.ctx.beginPath();
                                    this.ctx.lineWidth=this.data.getLineWidthAt(i);
                                    
                                    if(this.data.getPathLength(i).length>0){
                                       this.ctx.moveTo(this.data.getStrokeCoordXAt(i,0),this.data.getStrokeCoordYAt(i,0));
                                    }
                                }
                            }
                            //AQUI ANIMACIONES
                            this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                            this.ctx.globalCompositeOperation="destination-in";
                            this.drawCurveSegment(i,j,(animTotalProgress%animPathDuration)/animPathDuration);
                            this.ctx.stroke();
                            this.ctx.globalCompositeOperation="source-over";
                            
                            this.actualSnapshot.src=this.canvas.toDataURL();
                            
                            this.ctx.drawImage(this.prevPathSnapshot,0,0);
                            this.ctx.drawImage(this.actualSnapshot,0,0);
                            //FIN AQUI ANIMACIONES
                            Preprotocol.wantDelete=true;
                        }
                    }
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
    drawOnNewPathList:function(cantJumps){
        /*
        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
        this.ctx.globalCompositeOperation="destination-in";
        this.drawCurveSegment(this.canvasDrawingManager.listPoints[i],this.drawingManager.ctrlPointsManager.list[i],j,1);
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";

        this.actualSnapshot.src=this.canvas.toDataURL();
        let oldValI=i;
        if(cantJumps>=2){
            this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
            this.ctx.globalCompositeOperation="destination-in";
            for(let k=prevIndexPathTurn;k<prevIndexPathTurn+cantJumps-1;k++){
                let indexes=this.getNextPath(i,j,1);
                //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                this.drawCompletePath(this.canvasDrawingManager.listPoints[indexes[0]],
                this.drawingManager.ctrlPointsManager.list[indexes[0]],indexes[1]);
                i=indexes[0];
                j=indexes[1];
            }
            this.ctx.stroke();
            this.ctx.globalCompositeOperation="source-over";
            this.actualSnapshot.src=this.canvas.toDataURL();                    
        }*/
    },
    getNextPath:function(i,j,jumps){
        let lengthCurrentPath=this.data.getPathLength(i);
        if(j<lengthCurrentPath-1-jumps){
            j+=jumps
            return [i,j];
        }else{
            let carry=(lengthCurrentPath-1)-j
            jumps-=carry;
            while(jumps>=0){
                i++;
                if(i>=this.data.getPathListLength()){i=0;}
                let lengthCurrentPath=this.data.getPathLength(i)-1;
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
    getFirstPathListIndex:function(i){
        i++;
        if(i>=this.data.getPathListLength()){i=0;return i;}
        while(this.data.getPathLength(i)<2 ){
            i++;
            if(i>=this.data.getPathListLength()){i=0;break;}
        }
        return i;
    },
    drawCompletePath:function(i,pAIndex){
        let self=this;

        var len = this.data.getPathLength(i); // number of points
        if (len >=2){
            if (len == 2) {
                this.ctx.moveTo(this.data.getStrokeCoordXAt(i,0),this.data.getStrokeCoordYAt(i,0));
                this.ctx.lineTo(this.data.getStrokeCoordXAt(i,1),this.data.getStrokeCoordYAt(i,1));
            }
            else {
                if(pAIndex==0){
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(i,0),this.data.getStrokeCoordYAt(i,0));
                    this.ctx.quadraticCurveTo(this.data.getCtrlPointCoordXAt(i,0),this.data.getCtrlPointCoordYAt(i,1),
                                            this.data.getStrokeCoordXAt(i,1),
                                            this.data.getStrokeCoordYAt(i,1));    
                }else if(pAIndex<this.data.getPathLength(i)-2){
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(i,pAIndex),this.data.getStrokeCoordYAt(i,pAIndex));
                    this.ctx.bezierCurveTo(this.data.getCtrlPointCoordXAt(i,(2*(pAIndex)-1)*2),
                                            this.data.getCtrlPointCoordYAt(i,(2*(pAIndex)-1)*2+1),
                                            this.data.getCtrlPointCoordXAt(i,(2*(pAIndex))*2),
                                            this.data.getCtrlPointCoordYAt(i,(2*(pAIndex))*2+1),
                                            this.data.getStrokeCoordXAt(i,pAIndex+1),
                                            this.data.getStrokeCoordYAt(i,pAIndex+1));

                }else if(pAIndex==this.data.getPathLength(i)-2){
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(i,pAIndex),this.data.getStrokeCoordYAt(i,pAIndex));
                    this.ctx.quadraticCurveTo(this.data.getCtrlPointCoordXAt(i,(2*(pAIndex)-1)*2),this.data.getCtrlPointCoordYAt(i,(2*(pAIndex)-1)*2+1),
                                               this.data.getStrokeCoordXAt(i,pAIndex+1),this.data.getStrokeCoordYAt(i,pAIndex+1)); 
                }else{
                    alert("WDF?? sesuponge que a drawCompletePath se le pasa puntos ya validos");
                }
            }
        }

    },

    drawCurveSegment:function(i,pAIndex,temperature){
        //console.log(listPaths);

        //console.log(Preprotocol.wantConsume);
        var len = this.data.getPathLength(i); // number of points
        if (len >=2){
            if (len == 2) {
                let point=this.getLineCurvePoint(this.data.getStrokeCoordXAt(i,0),this.data.getStrokeCoordYAt(i,0),this.data.getStrokeCoordXAt(i,1),this.data.getStrokeCoordYAt(i,1),
                    temperature);
                 this.ctx.lineTo(point.x,point.y);
            }
            else {
                if(pAIndex==0){
                    point=this.getQuadraticCurvePoint(
                        this.data.getStrokeCoordXAt(i,0),
                        this.data.getStrokeCoordYAt(i,0),
                        this.data.getCtrlPointCoordXAt(i,0),
                        this.data.getCtrlPointCoordYAt(i,1),
                        this.data.getStrokeCoordXAt(i,1),
                        this.data.getStrokeCoordYAt(i,1),
                        temperature
                    )
                    this.ctx.lineTo(point.x,point.y);
                    
                }else if(pAIndex<this.data.getPathLength(i)-2){
                    points=this._getBezierCtrlPoints(
                        this.data.getStrokeCoordXAt(i,pAIndex),
                        this.data.getStrokeCoordYAt(i,pAIndex),
                        this.data.getCtrlPointCoordXAt(i,(2*(pAIndex)-1)*2),
                        this.data.getCtrlPointCoordYAt(i,(2*(pAIndex)-1)*2+1),
                        this.data.getCtrlPointCoordXAt(i,(2*(pAIndex))*2),
                        this.data.getCtrlPointCoordYAt(i,(2*(pAIndex))*2+1),
                        this.data.getStrokeCoordXAt(i,pAIndex+1),
                        this.data.getStrokeCoordYAt(i,pAIndex+1),
                        temperature
                    )
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(i,pAIndex),this.data.getStrokeCoordYAt(i,pAIndex));
                    this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);   

                }else if(pAIndex==this.data.getPathLength(i)-2){
                    point=this.getQuadraticCurvePoint(
                        this.data.getStrokeCoordXAt(i,pAIndex),
                        this.data.getStrokeCoordYAt(i,pAIndex),
                        this.data.getCtrlPointCoordXAt(i,(2*(pAIndex)-1)*2),
                        this.data.getCtrlPointCoordYAt(i,(2*(pAIndex)-1)*2+1),
                        this.data.getStrokeCoordXAt(i,pAIndex+1),
                        this.data.getStrokeCoordYAt(i,pAIndex+1),
                        temperature
                        )
                    this.ctx.lineTo(point.x,point.y);
                }

            }
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
})
var IllustratorDataAdapterPreview=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager,scalerFactorX,scalerFactorY){
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;

        this.scalerFactorX=scalerFactorX;
        this.scalerFactorY=scalerFactorY;
    },
    getStrokeCoordXAt:function(i,j){
        return this.canvasDrawingManager.listPoints[i][j].get("left")*this.scalerFactorX;
    },
    getStrokeCoordYAt:function(i,j){
        return this.canvasDrawingManager.listPoints[i][j].get("top")*this.scalerFactorY;
    },
    getPathLength:function(i){
        return this.canvasDrawingManager.listPoints[i].length;
    },
    getPathListLength:function(){
        return this.canvasDrawingManager.listPoints.length;
    },

    getCtrlPointCoordXAt:function(i,j){
        return this.drawingManager.ctrlPointsManager.list[i][j]*this.scalerFactorX;
    },
    getCtrlPointCoordYAt:function(i,j){
        return this.drawingManager.ctrlPointsManager.list[i][j]*this.scalerFactorY;
    },

    getListLinesWidthsLength:function(){
        return this.canvasDrawingManager.listLinesWidths.length;
    },
    getLineWidthAt:function(i){
        return this.canvasDrawingManager.listLinesWidths[i]*this.scalerFactorX;
    }
})
var IllustratorDataAdapterCache=fabric.util.createClass({
    initialize:function(getPath){

    },
    getStrokeCoordXAt:function(i,j){

    },
    getStrokeCoordYAt:function(i,j){

    },
    getPathLength:function(i){

    },
    getPathListLength:function(){

    },

    getCtrlPointCoordAt:function(i){

    },
    getListLinesWidthsLength:function(){

    },
    getLineWidthAt:function(i){

    }
})