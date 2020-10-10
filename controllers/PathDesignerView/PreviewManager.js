var PreviewManager=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager){
        this.canvas=document.getElementById("cPreview");
        this.ctx=this.canvas.getContext("2d");
        this.prevPathSnapshot=new Image();
        this.actualSnapshot=new Image();
        this.parentWidth=300 -10-10;
        this.imageModel=null;
        
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;
        this.pathIllustrator=null;
        
        this.canvasDrawingManager.registerOnPointModified(this);
        this.canvasDrawingManager.registerOnMouseUp(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingLineWidthChanged(this);
        PanelDesignerOptions.SectionPaths.registerOnBtnAddPathClicked(this);
        PanelDesignerOptions.SectionPaths.registerOnBtnDeletePathClicked(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingDurationChanged(this);

        this.scalerFactorX;
        this.scalerFactorY;
        this.scalerLineWidth;

    },
    wakeUp:function(imageModel){
        this.imageModel=imageModel;
        this.animTotalDuration=imageModel.paths.duration;
        let imgWidth=imageModel.imgHTML.naturalWidth;
        let imgHeight=imageModel.imgHTML.naturalHeight;
        let aspect=imgWidth/imgHeight;
        if(imgWidth>imgHeight){
            this.canvas.width=this.parentWidth;
            this.canvas.height=this.parentWidth/aspect;
        }else{
            this.canvas.height=this.parentWidth;
            this.canvas.width=this.parentWidth*aspect
        }
        this.prevPathSnapshot.src=this.canvas.toDataURL();
        this.endLoop=false;

        this.scalerFactorX=this.canvas.width/this.canvasDrawingManager.canvasOriginalWidth;
        this.scalerFactorY=this.canvas.height/this.canvasDrawingManager.canvasOriginalHeight;
    
        this.illustratorDataAdapter=new IllustratorDataAdapterPreview(this.drawingManager,this.canvasDrawingManager,this.scalerFactorX,this.scalerFactorY);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,this.illustratorDataAdapter,this.imageModel);
        this.pathIllustrator.start();
    },
    sleep:function(){
        this.pathIllustrator.finish();
    },
    _loop:function(){
        this.ctx.strokeStyle="black";
        this.ctx.lineWidth=5;
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
                    for(let i=0;i<this.canvasDrawingManager.listPoints.length;i++){
                        let tmpCant=this.canvasDrawingManager.listPoints[i].length-1;
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
                        if(this.canvasDrawingManager.listLinesWidths.length>0){
                            this.ctx.lineWidth=(this.canvasDrawingManager.listLinesWidths[i]/(this.canvasDrawingManager.canvasOriginalWidth/this.canvas.width))
                        }
                }
    
                if(animPathDuration!=Infinity){//entrar si hay almenos un stroke
                    let nowTime=+new Date();
                    if(nowTime>animFinishTime){
                        ////
                        let tmp=-1;
                        let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                        let cantJumps=(Math.round(this.animTotalDuration/animPathDuration)-1)-indexPathTurn;

                        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        this.drawCurveSegment(this.canvasDrawingManager.listPoints[i],this.drawingManager.ctrlPointsManager.list[i],j,1);
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        this.actualSnapshot.src=this.canvas.toDataURL();

                        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        for(let k=0;k<cantJumps;k++){
                            tmp=k;
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
                        if(this.canvasDrawingManager.listLinesWidths.length>0){
                            this.ctx.lineWidth=(this.canvasDrawingManager.listLinesWidths[i]/(this.canvasDrawingManager.canvasOriginalWidth/this.canvas.width))
                        }

                    }else{
                        animTotalProgress=nowTime-animStartTime;
                    }
        ///////////////////////////////// LO DE ARRIBA ES PARA CONTROLAR EL PROGRESO TOTAL O GLOBAL
                    if(this.canvasDrawingManager.listPoints.length!=0){
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
                                this.drawCurveSegment(this.canvasDrawingManager.listPoints[i],this.drawingManager.ctrlPointsManager.list[i],j,1);
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
                                        this.drawCompletePath(this.canvasDrawingManager.listPoints[indexes[0]],
                                        this.drawingManager.ctrlPointsManager.list[indexes[0]],indexes[1]);
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
                                    this.ctx.lineWidth=(this.canvasDrawingManager.listLinesWidths[i]/(this.canvasDrawingManager.canvasOriginalWidth/this.canvas.width))
                                    
                                    if(this.canvasDrawingManager.listPoints[i].length>0){
                                       this.ctx.moveTo(this.canvasDrawingManager.listPoints[i][0].get("left")*this.scalerFactorX,this.canvasDrawingManager.listPoints[i][0].get("top")*this.scalerFactorY);
                                    }
                                }
                            }
                            //AQUI ANIMACIONES
                            this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                            this.ctx.globalCompositeOperation="destination-in";
                            this.drawCurveSegment(this.canvasDrawingManager.listPoints[i],this.drawingManager.ctrlPointsManager.list[i],j,(animTotalProgress%animPathDuration)/animPathDuration);
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
        }
    },
    getNextPath:function(i,j,jumps){
        let lengthCurrentPath=this.canvasDrawingManager.listPoints[i].length;
        if(j<lengthCurrentPath-1-jumps){
            j+=jumps
            return [i,j];
        }else{
            let carry=(lengthCurrentPath-1)-j
            jumps-=carry;
            while(jumps>=0){
                i++;
                if(i>=this.canvasDrawingManager.listPoints.length){i=0;}
                let lengthCurrentPath=this.canvasDrawingManager.listPoints[i].length-1;
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
        if(i>=this.canvasDrawingManager.listPoints.length){i=0;return i;}
        while(this.canvasDrawingManager.listPoints[i].length<2 ){
            i++;
            if(i>=this.canvasDrawingManager.listPoints.length){i=0;break;}
        }
        return i;
    },
    drawCompletePath:function(listPaths,listPathsCtrl,pAIndex){
        let self=this;

        var len = listPaths.length; // number of points
        if (len >=2){
            if (len == 2) {
                this.ctx.moveTo(listPaths[0].get("left")*this.scalerFactorX,listPaths[0].get("top")*this.scalerFactorY);
                this.ctx.lineTo(listPaths[1].get("left")*this.scalerFactorX,listPaths[1].get("top")*this.scalerFactorY);
            }
            else {
                if(pAIndex==0){
                    this.ctx.moveTo(listPaths[0].get("left")*this.scalerFactorX,listPaths[0].get("top")*this.scalerFactorY);
                    this.ctx.quadraticCurveTo(listPathsCtrl[0]*this.scalerFactorX,listPathsCtrl[1]*this.scalerFactorY,
                                            listPaths[1].get("left")*this.scalerFactorX,
                                            listPaths[1].get("top")*this.scalerFactorY);    
                }else if(pAIndex<listPaths.length-2){
                    this.ctx.moveTo(listPaths[pAIndex].get("left")*this.scalerFactorX,listPaths[pAIndex].get("top")*this.scalerFactorY);
                    this.ctx.bezierCurveTo(listPathsCtrl[(2*(pAIndex)-1)*2]*this.scalerFactorX,
                                            listPathsCtrl[(2*(pAIndex)-1)*2+1]*this.scalerFactorY,
                                            listPathsCtrl[(2*(pAIndex))*2]*this.scalerFactorX,
                                            listPathsCtrl[(2*(pAIndex))*2+1]*this.scalerFactorY,
                                            listPaths[pAIndex+1].get("left")*this.scalerFactorX,
                                            listPaths[pAIndex+1].get("top")*this.scalerFactorY);

                }else if(pAIndex==listPaths.length-2){
                    this.ctx.moveTo(listPaths[pAIndex].get("left")*this.scalerFactorX,listPaths[pAIndex].get("top")*this.scalerFactorY);
                    this.ctx.quadraticCurveTo(listPathsCtrl[(2*(pAIndex)-1)*2]*this.scalerFactorX,listPathsCtrl[(2*(pAIndex)-1)*2+1]*this.scalerFactorY,
                                                listPaths[pAIndex+1].get("left")*this.scalerFactorX,listPaths[pAIndex+1].get("top")*this.scalerFactorY); 
                }else{
                    alert("WDF?? sesuponge que a drawCompletePath se le pasa puntos ya validos");
                }
            }
        }

    },

    drawCurveSegment:function(listPaths,listPathsCtrl,pAIndex,temperature){
        //console.log(listPaths);

        //console.log(Preprotocol.wantConsume);
        var len = listPaths.length; // number of points
        if (len >=2){
            if (len == 2) {
                let point=this.getLineCurvePoint(listPaths[0].get("left"),listPaths[0].get("top"),listPaths[1].get("left"),listPaths[1].get("top"),
                    temperature);
                 point.x=point.x*this.scalerFactorX;
                 point.y=point.y*this.scalerFactorY;
                 this.ctx.lineTo(point.x,point.y);
            }
            else {
                if(pAIndex==0){
                    point=this.getQuadraticCurvePoint(
                        listPaths[0].get("left"),
                        listPaths[0].get("top"),
                        listPathsCtrl[0],
                        listPathsCtrl[1],
                        listPaths[1].get("left"),
                        listPaths[1].get("top"),
                        temperature
                    )
                    point.x=(point.x/this.canvasDrawingManager.canvasOriginalWidth)*this.canvas.width;
                    point.y=(point.y/this.canvasDrawingManager.canvasOriginalHeight)*this.canvas.height;
                    this.ctx.lineTo(point.x,point.y);
                    
                }else if(pAIndex<listPaths.length-2){
                    points=this._getBezierCtrlPoints(
                        listPaths[pAIndex].get("left"),
                        listPaths[pAIndex].get("top"),
                        listPathsCtrl[(2*(pAIndex)-1)*2],
                        listPathsCtrl[(2*(pAIndex)-1)*2+1],
                        listPathsCtrl[(2*(pAIndex))*2],
                        listPathsCtrl[(2*(pAIndex))*2+1],
                        listPaths[pAIndex+1].get("left"),
                        listPaths[pAIndex+1].get("top"),
                        temperature
                    )
                    let startX=listPaths[pAIndex].get("left")*this.scalerFactorX;
                    let startY=listPaths[pAIndex].get("top")*this.scalerFactorY; 
                    points[0]=points[0]*this.scalerFactorX;
                    points[1]=points[1]*this.scalerFactorY;
                    points[2]=points[2]*this.scalerFactorX;
                    points[3]=points[3]*this.scalerFactorY;
                    points[4]=points[4]*this.scalerFactorX;
                    points[5]=points[5]*this.scalerFactorY;
                    this.ctx.moveTo(startX,startY);
                    this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);   

                }else if(pAIndex==listPaths.length-2){
                    point=this.getQuadraticCurvePoint(
                        listPaths[pAIndex].get("left"),
                        listPaths[pAIndex].get("top"),
                        listPathsCtrl[(2*(pAIndex)-1)*2],
                        listPathsCtrl[(2*(pAIndex)-1)*2+1],
                        listPaths[pAIndex+1].get("left"),
                        listPaths[pAIndex+1].get("top"),
                        temperature
                        )
                    point.x=(point.x/this.canvasDrawingManager.canvasOriginalWidth)*this.canvas.width;
                    point.y=(point.y/this.canvasDrawingManager.canvasOriginalHeight)*this.canvas.height;
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
    notificationOnPointModified:function(pointIndex,pathIndex){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnMouseUp:function(mouseX,mouseY){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnLineWidthChanged:function(value){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnBtnAddPathClicked:function(){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnBtnDeletePathClicked:function(index){
        this.pathIllustrator.counterInterruption=100;
    },  
    notificationOnDurationChanged:function(value){
        this.pathIllustrator.counterInterruption=100;
        if(isNaN(value)){
            this.pathIllustrator.animTotalDuration=3000;
        }
        else if(value<2){
            this.pathIllustrator.animTotalDuration=3000;
        }
        else if(value>10){
            this.pathIllustrator.animTotalDuration=3000;
        }else{
            this.pathIllustrator.animTotalDuration=value*1000;
        }

    }
})
