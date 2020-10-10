var DrawingCacheManager=fabric.util.createClass({
    
    initialize:function(){
        this.canvas=document.createElement("canvas");
        document.body.append(this.canvas);
        this.ctrlPointsManager=new CrtlPoinstManagement();
        this.pathsList;
    },
    wakeUp:function(imageModel){
        this.imageModel=imageModel;
        this.animTotalDuration=imageModel.paths.duration;
        this.canvas.width=imageModel.imgHTML.naturalWidth;
        this.canvas.height=imageModel.imgHTML.naturalHeight;

        this.ctrlPointsManager.wakeUp(imageModel.paths.points);
        this.pathsList=imageModel.paths.points;
        console.log("LISTA DE CONTROL POINTS GENERADOS");
        console.log(this.ctrlPointsManager.list);
        this.prevPathSnapshot.src=this.canvas.toDataURL();
        this.endLoop=false;


        this._loop();
    },
    sleep:function(){
        this.endLoop=true;
        this.counterInterruption=-1;
        this.pathsList=[];
        this.ctrlPointsManager=[];
    },
    getPathPointCoord:function(i,j,axis){
        if("left"){this.pathsList[i][j*2];}
        else if("top"){this.pathsList[i][j*2+1];};
    },
    getPathsListLength:function(){
        return this.pathsList.length;
    },
    getPathLength:function(i){
        return this.pathsList[i].length;
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
                    for(let i=0;i<this.getPathsListLength();i++){
                        
                        let tmpCant=this.getPathLength(i)-1;
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
                    if(this.imageModel.paths.linesWidths.length>0){
                        this.ctx.lineWidth=(this.imageModel.paths.linesWidths[i]*this.canvas.width);
                    }
                }
    
                if(animPathDuration!=Infinity){//entrar si hay almenos un stroke
                    let nowTime=+new Date();
                    if(nowTime>animFinishTime){
                        /*
                        let indexPathTurn=parseInt(animTotalProgress/animPathDuration);
                        let cantJumps=indexPathTurn-(parseInt(this.animTotalDuration/animPathDuration)-1);

                        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        this.drawCurveSegment(this.canvasDrawingManager.listPoints[i],this.drawingManager.ctrlPointsManager.list[i],j,1);
                        this.ctx.stroke();
                        this.ctx.globalCompositeOperation="source-over";
                        this.actualSnapshot.src=this.canvas.toDataURL();

                        this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                        this.ctx.globalCompositeOperation="destination-in";
                        for(let k=prevIndexPathTurn;k<prevIndexPathTurn+cantJumps;k++){
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
                        */
                        animStartTime=+new Date();
                        animFinishTime=animStartTime+this.animTotalDuration;
                        animTotalProgress=0;

                        i=this.getFirstPathListIndex(-1);
                        j=0;
                        prevIndexPathTurn=0;
                        this.ctx.beginPath();
                        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
                        this.prevPathSnapshot.src=this.canvas.toDataURL();
                        if(this.imageModel.paths.linesWidths.length>0){
                            this.ctx.lineWidth=(this.imageModel.paths.linesWidths[i]*this.canvas.width);
                        }

                    }else{
                        animTotalProgress=nowTime-animStartTime;
                    }
        ///////////////////////////////// LO DE ARRIBA ES PARA CONTROLAR EL PROGRESO TOTAL O GLOBAL
                    if(this.getPathsListLength()!=0){
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
                                this.drawCurveSegment(this.pathsList[i],this.ctrlPointsManager.list[i],j,1);
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
                                        this.drawCompletePath(this.pathsList[indexes[0]],
                                        this.ctrlPointsManager.list[indexes[0]],indexes[1]);
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
                                    this.ctx.lineWidth=(this.imageModel.paths.linesWidths[i]*this.canvas.width)
                                    
                                    if(this.getPathLength(i)>0){
                                       this.ctx.moveTo(this.pathsList[i][0]*this.canvas.width,this.pathsList[i][1]*this.canvas.height);
                                    }
                                }
                            }
                            //AQUI ANIMACIONES
                            this.ctx.drawImage(this.imageModel.imgHTML,0,0,this.canvas.width,this.canvas.height)
                            this.ctx.globalCompositeOperation="destination-in";
                            this.drawCurveSegment(this.pathsList[i],this.ctrlPointsManager.list[i],j,(animTotalProgress%animPathDuration)/animPathDuration);
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
    getNextPath:function(i,j,jumps){
        let lengthCurrentPath=this.getPathLength(i);
        if(j<lengthCurrentPath-1-jumps){
            j+=jumps
            return [i,j];
        }else{
            let carry=(lengthCurrentPath-1)-j
            jumps-=carry;
            while(jumps>=0){
                i++;
                if(i>=this.getPathsListLength()){i=0;}
                let lengthCurrentPath=this.getPathLength(i)-1;
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
        if(i>=this.getPathsListLength()){i=0;return i;}
        while(this.getPathLength(i)<2 ){
            i++;
            if(i>=this.getPathsListLength()){i=0;break;}
        }
        return i;
    },
    drawCompletePath:function(listPaths,listPathsCtrl,pAIndex){
        let self=this;

        var len = listPaths.length; // number of points
        if (len >=2){
            if (len == 2) {
                this.ctx.moveTo(listPaths[0]*this.canvas.width,listPaths[1]*this.canvas.height);
                this.ctx.lineTo(listPaths[2]*this.canvas.width,listPaths[3]*this.canvas.height);
            }
            else {
                if(pAIndex==0){
                    this.ctx.moveTo(listPaths[0]*this.canvas.width,listPaths[1]*this.canvas.height);
                    this.ctx.quadraticCurveTo(listPathsCtrl[0]*this.canvas.width,listPathsCtrl[1]*this.canvas.height,
                                            listPaths[1*2]*this.canvas.width,
                                            listPaths[1*2+1]*this.canvas.height);    
                }else if(pAIndex<(listPaths.length/2)-2){
                    this.ctx.moveTo(listPaths[pAIndex*2]*this.canvas.width,listPaths[pAIndex*2+1]*this.canvas.height);
                    this.ctx.bezierCurveTo(listPathsCtrl[(2*(pAIndex)-1)*2]*this.canvas.width,
                                            listPathsCtrl[(2*(pAIndex)-1)*2+1]*this.canvas.height,
                                            listPathsCtrl[(2*(pAIndex))*2]*this.canvas.width,
                                            listPathsCtrl[(2*(pAIndex))*2+1]*this.canvas.height,
                                            listPaths[(pAIndex+1)*2]*this.canvas.width,
                                            listPaths[(pAIndex+1)*2+1]*this.canvas.height);

                }else if(pAIndex==(listPaths.length/2)-2){
                    this.ctx.moveTo(listPaths[pAIndex*2]*this.canvas.width,listPaths[pAIndex*2+1]*this.canvas.height);
                    this.ctx.quadraticCurveTo(listPathsCtrl[(2*(pAIndex)-1)*2]*this.canvas.width,listPathsCtrl[(2*(pAIndex)-1)*2+1]*this.canvas.height,
                                                listPaths[(pAIndex+1)*2]*this.canvas.width,listPaths[(pAIndex+1)*2+1]*this.canvas.height); 
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
                let point=this.getLineCurvePoint(listPaths[0],listPaths[1],listPaths[2],listPaths[3],
                    temperature);
                 point.x=point.x*this.canvas.width;
                 point.y=point.y*this.canvas.height;
                 this.ctx.lineTo(point.x,point.y);
            }
            else {
                if(pAIndex==0){
                    point=this.getQuadraticCurvePoint(
                        listPaths[0],
                        listPaths[1],
                        listPathsCtrl[0],
                        listPathsCtrl[1],
                        listPaths[2],
                        listPaths[3],
                        temperature
                    )
                    point.x=point.x*this.canvas.width;
                    point.y=point.y*this.canvas.height;
                    this.ctx.lineTo(point.x,point.y);
                    
                }else if(pAIndex<listPaths.length-2){
                    points=this._getBezierCtrlPoints(
                        listPaths[pAIndex*2],
                        listPaths[pAIndex*2+1],
                        listPathsCtrl[(2*(pAIndex)-1)*2],
                        listPathsCtrl[(2*(pAIndex)-1)*2+1],
                        listPathsCtrl[(2*(pAIndex))*2],
                        listPathsCtrl[(2*(pAIndex))*2+1],
                        listPaths[(pAIndex+1)*2],
                        listPaths[(pAIndex+1)*2+1],
                        temperature
                    )
                    let startX=listPaths[pAIndex].get("left")*this.canvas.width;
                    let startY=listPaths[pAIndex].get("top")*this.canvas.height; 
                    points[0]=points[0]*this.canvas.width;
                    points[1]=points[1]*this.canvas.height;
                    points[2]=points[2]*this.canvas.width;
                    points[3]=points[3]*this.canvas.height;
                    points[4]=points[4]*this.canvas.width;
                    points[5]=points[5]*this.canvas.height;
                    this.ctx.moveTo(startX,startY);
                    this.ctx.bezierCurveTo(points[0],points[1],points[2],points[3],points[4],points[5]);   

                }else if(pAIndex==listPaths.length-2){
                    point=this.getQuadraticCurvePoint(
                        listPaths[pAIndex*2],
                        listPaths[pAIndex*2+1],
                        listPathsCtrl[(2*(pAIndex)-1)*2],
                        listPathsCtrl[(2*(pAIndex)-1)*2+1],
                        listPaths[(pAIndex+1)*2],
                        listPaths[(pAIndex+1)*2+1],
                        temperature
                        )
                    point.x=point.x*this.canvas.width;
                    point.y=point.y*this.canvas.height;
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
});


var CrtlPoinstManagement=fabric.util.createClass({
    initialize:function(){
        this.list=[];
    },
    wakeUp:function(matPts){
        this.generateCrtlPointsFromPointsMatrix(matPts);
    },
    sleep:function(){
        this.list=[];
    },
    _triangleWidthHeight:function(arr, i, j){
        return [arr[2*j]-arr[2*i], arr[2*j+1]-arr[2*i+1]]
    },
    _distace:function(arr, i, j) {
        return Math.sqrt(Math.pow(arr[2*i]-arr[2*j], 2) + Math.pow(arr[2*i+1]-arr[2*j+1], 2));
    },
    _calcCrtlPointsSinglePoint:function(x1,y1,x2,y2,x3,y3){
        var t = 0.5;
        var v = this._triangleWidthHeight(arguments, 0, 2);
        var d01 = this._distace(arguments, 0, 1);
        var d12 = this._distace(arguments, 1, 2);
        var d012 = d01 + d12;
        return [x2 - v[0] * t * d01 / d012, y2 - v[1] * t * d01 / d012,
                    x2 + v[0] * t * d12 / d012, y2 + v[1] * t * d12 / d012 ];
    },
    
    generateCrtlPointsFromPointsMatrix:function(matPts){
        if(matPts.length==0){
            this.list.push([]);
            return;
        }
        this.list=[];
        for (var i = 0; i <matPts.length; i += 1) {
            let newCrtlPoints=[]; 
            if(matPts[i].length>=3){
                for(var j=0;j<(matPts[i].length/2)-2;j++){
                    newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(matPts[i][j], matPts[i][j+1], matPts[i][j+2], matPts[i][j+3], matPts[i][j+4], matPts[i][j+5]));
                }
            }
            this.list.push(newCrtlPoints);
          }
    },

    
    
});
