var DrawingCacheManager=fabric.util.createClass({
    
    initialize:function(){
        this.canvas=document.createElement("canvas");
        this.ctx=this.canvas.getContext("2d");
        this.canvas.style.display="none";

        this.listDrawableObjects=[];
        //this.canvas=new OffscreenCanvas(100,1);
        //this.ctx=this.canvas.getContext("2d"); 
        document.body.append(this.canvas);
        
        this.pathIllustrator=null;

    },
    wakeUp:function(imagesModelsToDraw,listScalerFactors,listDrawableObjects){
        this.canvas.width=listScalerFactors[0].x;
        this.canvas.height=listScalerFactors[0].y;
        this.listDrawableObjects=listDrawableObjects;
        this.listDrawableObjects[0].setTurn(true);
        let illustratorDataAdapterCache=new IllustratorDataAdapterCache(imagesModelsToDraw,listScalerFactors,this.ctx);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,illustratorDataAdapterCache,false);
        this.pathIllustrator.setListObjectsToDraw(imagesModelsToDraw);
        this.pathIllustrator.registerOnDrawingNewObject(this);
        this.pathIllustrator.start();
    },
    notificationOnDrawingNewObject:function(imgHTML,lastObjIndex,newObjIndex,lastDataUrl){
        
        //console.log(this.listDrawableObjects.length + "  " + lastObjIndex + "    " + newObjIndex);
        this.canvas.width=imgHTML.naturalWidth;
        this.canvas.height=imgHTML.naturalHeight;
        this.listDrawableObjects[lastObjIndex].setTurn(false,lastDataUrl);
        this.listDrawableObjects[newObjIndex].setTurn(true,lastDataUrl);
    },
    sleep:function(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.pathIllustrator.finish();
        this.pathIllustrator=null;
    },
});


