var DrawingCacheManager=fabric.util.createClass({
    
    initialize:function(){
        this.canvas=document.createElement("canvas");
        this.ctx=this.canvas.getContext("2d");
        this.canvas.style.display="none";
        //this.canvas.style.position="absolute";
        //this.canvas.style.zIndex=10000;
        //this.canvas.style.background="white";

        this.listDrawableObjects=[];
        //this.canvas=new OffscreenCanvas(100,1);
        //this.ctx=this.canvas.getContext("2d"); 
        //document.body.append(this.canvas);
        
        this.pathIllustrator=null;

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
        this.canvas.width = w * this.PIXEL_RATIO;
        this.canvas.height = h * this.PIXEL_RATIO;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.ctx=this.canvas.getContext("2d");
        this.ctx.setTransform(this.PIXEL_RATIO, 0, 0, this.PIXEL_RATIO, 0, 0);
    },
    wakeUp:function(listDrawableObjects,listAnimableWithDrawnEntrance){
        this.listDrawableObjects=listDrawableObjects;
        let illustratorDataAdapterCache=new IllustratorDataAdapterCache(listAnimableWithDrawnEntrance);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,illustratorDataAdapterCache,false);
        this.pathIllustrator.registerOnDrawingNewObject(this);
        this.pathIllustrator.start();
    },
    notificationOnDrawingNewObject:function(lastObjIndex,newObjIndex,lastDataUrl){
        this.OnIllustratorDrawingNewObject(lastObjIndex,newObjIndex,lastDataUrl);
    },
    OnIllustratorDrawingNewObject:function(lastObjIndex,newObjIndex,lastDataUrl){
        this.setCanvasDimentions(this.pathIllustrator.data.getWidthCanvasCacheOf(newObjIndex),
                                this.pathIllustrator.data.getHeightCanvasCacheOf(newObjIndex))
        this.listDrawableObjects[lastObjIndex].setTurn(false,lastDataUrl);
        this.listDrawableObjects[newObjIndex].setTurn(true,lastDataUrl);
    },
    sleep:function(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.pathIllustrator.finish();
        this.pathIllustrator=null;
    },
});


