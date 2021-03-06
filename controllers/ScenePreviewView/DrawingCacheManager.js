var DrawingCacheManager=fabric.util.createClass({
    
    initialize:function(drawingHand){
        this.canvas=document.createElement("canvas");
        this.ctx=this.canvas.getContext("2d");
        this.canvas.style.display="none";
        // this.canvas.style.position="absolute";
        // this.canvas.style.left=100 + "px";
        // this.canvas.style.top=20 + "px";
        //
        // this.canvas.style.zIndex=10000;
        // this.canvas.style.background="gray";
        this.listAnimableWithDrawnEntrance=[];
        // this.canvas=new OffscreenCanvas(100,1);
        // document.body.append(this.canvas);

        this.pathIllustrator=null;
        this.drawingHand=drawingHand;
        this.UIScenePreviewerCanvas=null;
        this.indexDrawableTurn=-1;

        let self=this;
        this.animator={
            executeAnimations:this._executeAnimations.bind(self)
        }
        this.PIXEL_RATIO = (function () {
            var ctx = document.createElement("canvas").getContext("2d"),
                dpr = window.devicePixelRatio || 1,
                bsr = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1;

            return dpr / bsr;
        })();

    },
    setCanvasDimentions:function(w,h){
        this.canvas.width = w ;
        this.canvas.height = h ;
        //this.canvas.style.width = w + "px";
        //this.canvas.style.height = h + "px";
        //this.ctx=this.canvas.getContext("2d");
        //this.ctx.setTransform(this.PIXEL_RATIO, 0, 0, this.PIXEL_RATIO, 0, 0);
    },
    addDrawingHandToCanvas:function(canvas){
        canvas.add(this.drawingHand.getHandImage());
        this.UIScenePreviewerCanvas=canvas;
    },
    OnReplayPreview:function(){
      this.pathIllustrator.setupPreviewSceneVars();
      this.ctx.clearRect(0,0,2000,2000);
      let placeholderBlankImage=new Image();
      placeholderBlankImage.src=this.canvas.toDataURL();
      for(let i=0;i<this.listAnimableWithDrawnEntrance.length;i++){
          this.listAnimableWithDrawnEntrance[i].entranceBehaviour.entranceMode.setTurnToCopyCache(false,placeholderBlankImage);
      }
    },
    //(POSIT NOTA MENTAL) turn your drawing into whiteboard animation
    _executeAnimations:function(animatorTime){
        let finalSegmentPoint=this.pathIllustrator._manualDrawingLoop(animatorTime);
        if(finalSegmentPoint===null){// no more drawings or the pathillustrator is in a delay time ||
            this.drawingHand.updatePosition(-1000,-1000);
        }else if(this.listAnimableWithDrawnEntrance[this.indexDrawableTurn].entranceBehaviour &&
            !this.listAnimableWithDrawnEntrance[this.indexDrawableTurn].entranceBehaviour.entranceMode.config.showHand
        ){
            this.drawingHand.updatePosition(-1000,-1000);
        }
        else {
            if(finalSegmentPoint.x!==null && finalSegmentPoint.y!==null){
                let objMatrix = this.listAnimableWithDrawnEntrance[this.indexDrawableTurn].calcOwnMatrix();
                //finalp=originalp*scaledwidth
                // normalp=orginalp*mainWidth
                // normalp=finalp/scaledwidth*mainwidth
                finalSegmentPoint.x=this.pathIllustrator.data.convertPathLeftCoordToHandCoordOf(this.indexDrawableTurn,finalSegmentPoint.x);
                finalSegmentPoint.y=this.pathIllustrator.data.convertPathTopCoordToHandCoordOf(this.indexDrawableTurn,finalSegmentPoint.y);

                finalSegmentPoint=fabric.util.transformPoint(new fabric.Point(finalSegmentPoint.x,finalSegmentPoint.y),objMatrix);
                finalSegmentPoint=fabric.util.transformPoint(finalSegmentPoint,this.UIScenePreviewerCanvas.viewportTransform);
                this.drawingHand.updatePosition(finalSegmentPoint.x,finalSegmentPoint.y);
            }else{
                this.drawingHand.updatePosition(-1000,-1000);
            }
        }
    },
    wakeUp:function(listAnimableWithDrawnEntrance){
        this.listAnimableWithDrawnEntrance=listAnimableWithDrawnEntrance;
        let illustratorDataAdapterCache=new IllustratorDataAdapterCache(listAnimableWithDrawnEntrance);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,illustratorDataAdapterCache,false);
        this.pathIllustrator.registerOnDrawingNewObject(this);
        this.pathIllustrator.registerOnLastObjectDrawingFinished(this);
        this.pathIllustrator.setupPreviewSceneVars();
    },
    notificationOnDrawingNewObject:function(lastObjIndex,newObjIndex,lastDataUrl){
        this.OnIllustratorDrawingNewObject(lastObjIndex,newObjIndex,lastDataUrl);
    },
    notificationOnLastObjectDrawingFinished:function(indexLastObject,finalObjectImage){
        this.listAnimableWithDrawnEntrance[indexLastObject].entranceBehaviour.entranceMode.setTurnToCopyCache(false,finalObjectImage)
    },
    OnIllustratorDrawingNewObject:function(lastObjIndex,newObjIndex,finalObjectImage){
        this.setCanvasDimentions(this.pathIllustrator.data.getWidthCanvasCacheOf(newObjIndex),
                                this.pathIllustrator.data.getHeightCanvasCacheOf(newObjIndex))
        this.indexDrawableTurn=newObjIndex;

        this.listAnimableWithDrawnEntrance[lastObjIndex].entranceBehaviour.entranceMode.setTurnToCopyCache(false,finalObjectImage);
        this.listAnimableWithDrawnEntrance[newObjIndex].entranceBehaviour.entranceMode.setTurnToCopyCache(true,finalObjectImage);
        },
    sleep:function(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.pathIllustrator.delete();
        this.pathIllustrator=null;
    },
});


