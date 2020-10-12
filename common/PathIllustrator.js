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
    },
    setListObjectsToDraw:function(listObjects){//Debe ser llamado simpre obligatoriamente
        this.listObjectsToDraw=listObjects;
    },
    start:function(){
        if(this.listObjectsToDraw.length==0){return;}
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
        let k=0;
        let i=0;
        let j=0;

        let prevIndexPathTurn=0;
        (function tick(){
            this.counterInterruption--;
            if(this.counterInterruption<0){
                if(flagFirstTime){
                    flagFirstTime=false;

                    let totalCantPaths=0;
                    for(let i=0;i<this.data.getPathListLength(k);i++){
                        let tmpCant=this.data.getPathLength(k,i)-1;
                        totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
                    }
                    animPathDuration=this.listObjectsToDraw[k].paths.duration/totalCantPaths;
                    console.log(totalCantPaths);
                    

                        animStartTime=+new Date();
                        animFinishTime=animStartTime+this.listObjectsToDraw[k].paths.duration;
                        animTotalProgress=0;

                        i=this.getFirstPathListIndex(k,-1);;
                        j=0;

                        prevIndexPathTurn=0;
                        this.ctx.beginPath();
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        if(this.data.getListLinesWidthsLength(k)>0){
                            this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                        }
                }
    
                if(animPathDuration!=Infinity){//entrar si hay almenos un stroke
                    let nowTime=+new Date();
                    if(nowTime>animFinishTime){

                        ////
                        
                        let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                        let cantJumps=(Math.round(this.listObjectsToDraw[k].paths.duration/animPathDuration)-1)-indexPathTurn;

                        this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        this.drawCurveSegment(k,i,j,1);
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        this.actualSnapshot.src=this.canvas.toDataURL();

                        this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        for(let p=0;p<cantJumps;p++){
                            let indexes=this.getNextPath(k,i,j,1);
                            //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                            this.drawCompletePath(k,indexes[0],indexes[1]);
                            i=indexes[0];
                            j=indexes[1];
                        }
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        this.actualSnapshot.src=this.canvas.toDataURL(); 
                        this.ctx.drawImage(this.prevPathSnapshot,0,0);
                        this.ctx.drawImage(this.actualSnapshot,0,0);
                        this.actualSnapshot.src=this.canvas.toDataURL(); 
                        this.ctx.drawImage(this.actualSnapshot,0,0);
                        ////

                        k++;
                        if(k==this.listObjectsToDraw.length){
                            if(this.loopMode){
                                k=0;
                            }else{
                                this.finish();return;
                            }
                        }
                        this.notifyOnDrawingNewObject(this.listObjectsToDraw[k].imgHTML,k-1,k);

                        let totalCantPaths=0;
                        for(let i=0;i<this.data.getPathListLength(k);i++){
                            let tmpCant=this.data.getPathLength(k,i)-1;
                            totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
                        }
                        animPathDuration=this.listObjectsToDraw[k].paths.duration/totalCantPaths;


                    
                        /////

                        animStartTime=+new Date();
                        animFinishTime=animStartTime+this.listObjectsToDraw[k].paths.duration;
                        animTotalProgress=0;

                        i=this.getFirstPathListIndex(k,-1);
                        j=0;
                        prevIndexPathTurn=0;
                        this.ctx.beginPath();
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        if(this.data.getListLinesWidthsLength(k)>0){
                            this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                        }

                    }else{
                        animTotalProgress=nowTime-animStartTime;
                    }
        ///////////////////////////////// LO DE ARRIBA ES PARA CONTROLAR EL PROGRESO TOTAL O GLOBAL
                    if(this.data.getPathListLength(k)!=0){
                        //console.log(this.canvasDrawingManager.listPoints);
                        if(!Preprotocol.wantConsume){
                            //return;
                        }else{
                            Preprotocol.wantDelete=false;

                            let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                            if(prevIndexPathTurn!=indexPathTurn){// se paso a otro stroke
                                let cantJumps=indexPathTurn-prevIndexPathTurn;

                                this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
                                this.ctx.globalCompositeOperation="destination-in";
                                this.drawCurveSegment(k,i,j,1);
                                this.ctx.stroke();
                                this.ctx.globalCompositeOperation="source-over";
                                this.actualSnapshot.src=this.canvas.toDataURL();

                                let oldValI=i;
                                if(cantJumps>=2){
                                    this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
                                    this.ctx.globalCompositeOperation="destination-in";
                                    for(let p=0;p<cantJumps-1;p++){
                                        let indexes=this.getNextPath(k,i,j,1);
                                        //TODO: verificar su cambio de path y aplicar conifguracion de linewiddth y beginpath
                                        this.drawCompletePath(k,indexes[0],indexes[1]);
                                        i=indexes[0];
                                        j=indexes[1];
                                    }
                                    this.ctx.stroke();
                                    this.ctx.globalCompositeOperation="source-over";
                                    this.actualSnapshot.src=this.canvas.toDataURL();                    
                                }

                                
                                let indexes=this.getNextPath(k,i,j,1);
                                j=indexes[1];
                                
                                if(oldValI!=indexes[0]){//se paso a otro path
                                    i=indexes[0];
                                    this.ctx.drawImage(this.prevPathSnapshot,0,0);
                                    this.ctx.drawImage(this.actualSnapshot,0,0);
                                    this.prevPathSnapshot.src=this.canvas.toDataURL();
                                    this.ctx.beginPath();
                                    this.ctx.lineWidth=this.data.getLineWidthAt(k,i);
                                    
                                    if(this.data.getPathLength(k,i).length>0){
                                        this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,0),this.data.getStrokeCoordYAt(k,i,0));
                                    }
                                }
                                prevIndexPathTurn=indexPathTurn;
                            }
                            //AQUI ANIMACIONES
                            this.ctx.drawImage(this.listObjectsToDraw[k].imgHTML,0,0,this.canvas.width,this.canvas.height)
                            this.ctx.globalCompositeOperation="destination-in";
                            this.drawCurveSegment(k,i,j,(animTotalProgress%animPathDuration)/animPathDuration);
                            this.ctx.stroke();
                            this.ctx.globalCompositeOperation="source-over";
                            
                            this.actualSnapshot.src=this.canvas.toDataURL();
                            this.ctx.drawImage(this.prevPathSnapshot,0,0);
                            this.ctx.drawImage(this.actualSnapshot,0,0);
                            //this.data.drawInTrueCanvas(k,this.actualSnapshot,0,0);
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
        this.ctx.drawImage(this.imageHTML,0,0,this.canvas.width,this.canvas.height)
        this.ctx.globalCompositeOperation="destination-in";
        this.drawCurveSegment(this.canvasDrawingManager.listPoints[i],this.drawingManager.ctrlPointsManager.list[i],j,1);
        this.ctx.stroke();
        this.ctx.globalCompositeOperation="source-over";

        this.actualSnapshot.src=this.canvas.toDataURL();
        let oldValI=i;
        if(cantJumps>=2){
            this.ctx.drawImage(this.imageHTML,0,0,this.canvas.width,this.canvas.height)
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
        if (len >=2){
            if (len == 2) {
                this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,0),this.data.getStrokeCoordYAt(k,i,0));
                this.ctx.lineTo(this.data.getStrokeCoordXAt(k,i,1),this.data.getStrokeCoordYAt(k,i,1));
            }
            else {
                if(pAIndex==0){
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,0),this.data.getStrokeCoordYAt(k,i,0));
                    this.ctx.quadraticCurveTo(this.data.getCtrlPointCoordXAt(k,i,0),this.data.getCtrlPointCoordYAt(k,i,1),
                                            this.data.getStrokeCoordXAt(k,i,1),
                                            this.data.getStrokeCoordYAt(k,i,1));    
                }else if(pAIndex<this.data.getPathLength(k,i)-2){
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
                    this.ctx.bezierCurveTo(this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)-1)*2),
                                            this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)-1)*2+1),
                                            this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex))*2),
                                            this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex))*2+1),
                                            this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                                            this.data.getStrokeCoordYAt(k,i,pAIndex+1));

                }else if(pAIndex==this.data.getPathLength(k,i)-2){
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
                    this.ctx.quadraticCurveTo(this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)-1)*2),this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)-1)*2+1),
                                               this.data.getStrokeCoordXAt(k,i,pAIndex+1),this.data.getStrokeCoordYAt(k,i,pAIndex+1)); 
                }else{
                    alert("WDF?? sesuponge que a drawCompletePath se le pasa puntos ya validos");
                }
            }
        }

    },

    drawCurveSegment:function(k,i,pAIndex,temperature){
        //console.log(listPaths);

        //console.log(Preprotocol.wantConsume);
        var len = this.data.getPathLength(k,i); // number of points
        if (len >=2){
            if (len == 2) {
                let point=this.getLineCurvePoint(this.data.getStrokeCoordXAt(k,i,0),this.data.getStrokeCoordYAt(k,i,0),this.data.getStrokeCoordXAt(k,i,1),this.data.getStrokeCoordYAt(k,i,1),
                    temperature);
                 this.ctx.lineTo(point.x,point.y);
            }
            else {
                if(pAIndex==0){
                    point=this.getQuadraticCurvePoint(
                        this.data.getStrokeCoordXAt(k,i,0),
                        this.data.getStrokeCoordYAt(k,i,0),
                        this.data.getCtrlPointCoordXAt(k,i,0),
                        this.data.getCtrlPointCoordYAt(k,i,1),
                        this.data.getStrokeCoordXAt(k,i,1),
                        this.data.getStrokeCoordYAt(k,i,1),
                        temperature
                    )
                    this.ctx.lineTo(point.x,point.y);
                    
                }else if(pAIndex<this.data.getPathLength(k,i)-2){
                    points=this._getBezierCtrlPoints(
                        this.data.getStrokeCoordXAt(k,i,pAIndex),
                        this.data.getStrokeCoordYAt(k,i,pAIndex),
                        this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)-1)*2),
                        this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)-1)*2+1),
                        this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex))*2),
                        this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex))*2+1),
                        this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                        this.data.getStrokeCoordYAt(k,i,pAIndex+1),
                        temperature
                    )
                    this.ctx.moveTo(this.data.getStrokeCoordXAt(k,i,pAIndex),this.data.getStrokeCoordYAt(k,i,pAIndex));
                    this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);   

                }else if(pAIndex==this.data.getPathLength(k,i)-2){
                    point=this.getQuadraticCurvePoint(
                        this.data.getStrokeCoordXAt(k,i,pAIndex),
                        this.data.getStrokeCoordYAt(k,i,pAIndex),
                        this.data.getCtrlPointCoordXAt(k,i,(2*(pAIndex)-1)*2),
                        this.data.getCtrlPointCoordYAt(k,i,(2*(pAIndex)-1)*2+1),
                        this.data.getStrokeCoordXAt(k,i,pAIndex+1),
                        this.data.getStrokeCoordYAt(k,i,pAIndex+1),
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
    notifyOnDrawingNewObject:function(imgHTML,lastObjIndex,newObjIndex){//suscritos : su manejador de este en la vista PreviewerView (DrawingCacheManager)
        for(let i=0;i<this.listObserversOnDrawingNewObject.length;i++){
            this.listObserversOnDrawingNewObject[i].notificationOnDrawingNewObject(imgHTML,lastObjIndex,newObjIndex);
        }
    },
    registerOnDrawingNewObject:function(obj){
        this.listObserversOnDrawingNewObject.push(obj);
    }
})
var IllustratorDataAdapterPreview=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager,scalerFactorX,scalerFactorY,ctx){
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;

        this.scalerFactorX=scalerFactorX;
        this.scalerFactorY=scalerFactorY;

        this.ctx=ctx;
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
    getImageData:function(){
        return this.ctx.toDataURL();
    },
    drawInTrueCanvas:function(k,imageDataUrl,posX,posY){
        //this.ctx.drawImage(imageDataUrl,posX,posY);
    }
})


var IllustratorDataAdapterCache=fabric.util.createClass({
    initialize:function(listObjectsToDraw,listScalerFactors,ctx){
        //this.setNewAnimableObject(scalerFactorX,scalerFactorY,imageModel);
        this.imagesModel=listObjectsToDraw;
        this.scalerFactors=listScalerFactors;
        this.ctx=ctx;
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

    getListLinesWidthsLength:function(k){
        return this.imagesModel[k].paths.linesWidths.length;
    },
    getLineWidthAt:function(k,i){
        return this.imagesModel[k].paths.linesWidths[i]*this.scalerFactors[k].x;
    },
    getImageData:function(){
        return this.ctx.toBlob();
    },
    drawInTrueCanvas:function(k,imageDataUrl,posX,posY){
        //this.listDrawableImageObjects[k].setImageData(imageDataUrl);
        //this.canvas.renderAll();
    }
})