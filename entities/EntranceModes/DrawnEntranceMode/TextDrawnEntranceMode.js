var TextDrawnEntranceMode=fabric.util.createClass(DrawnEntranceMode,{
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
        this.dataGenerator=new TextDrawingDataGenerator();
        this.config={
            showHand:true,
        }
    },
    /*Implementing inherited abstract methods*/
    generateEntranceData:function(callback){
        /*meanWhileImage has to be a new image,since it will be set to baseImage or masked image after drawing completion
* And if we just change src attribute, we would be altering baseImage or maskedImage
* We have to set the meanwhileImage var to the empty canvas because we need that while
* it is not its drawing turn this should be rendering an empy transparent image.
* */
        this.meanWhileImage=new Image();
        this.meanWhileImage.src=this.cacheManager.canvas.toDataURL();
        this.isMyTurnToCopyCache=false;

        let pathOpenTypeObjects=[] //for each line we need the path to generate the image
        let result=this.dataGenerator.generateTextDrawingData(this.parentObject,this.getWidthInDrawingCache(),this.getHeightInDrawingCache(),pathOpenTypeObjects);
        this.drawingData = result;
        this.drawingData.type=DrawingDataType.CREATED_NOPATH;

        this.dataGenerator.generateTextBaseImage(this.parentObject,pathOpenTypeObjects,function(image){
            this.baseImage=image;
            callback();
        }.bind(this));

        this.parentObject.objectCaching=false;
    },
    clearEntranceData:function(){
        this.drawingData.points=[];
        this.drawingData.linesWidths=[];
        this.drawingData.ctrlPoints=[];
        this.drawingData.strokesTypes=[];
        this.drawingData.pathsNames=[];

        this.parentObject.objectCaching=true;
    },
    getDrawingBaseImage:function(){
        return this.baseImage;
    },
    getDrawingFinalImage:function(){
        return this.baseImage;
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(baseImage,0,0,canvas.width,canvas.height);
        ctx.globalCompositeOperation="source-in";
        ctx.fill();
        ctx.globalCompositeOperation="source-over";
        ctx.drawImage(prevPathSnapshot,0,0);
    },
    notificationOnImageStateChanged:function(){
        //NOTHING
    },
    /*overwritten methods*/
    getWidthInDrawingCache:function(){
        return this.parentObject.width
    },
    getHeightInDrawingCache:function(){
        return this.parentObject.height;
    },
})