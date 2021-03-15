var TextDrawnEntranceMode=fabric.util.createClass(DrawnEntranceMode,{
    type:"TextDrawn",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
        this.dataGenerator=new TextDrawingDataGenerator();

        this.cacheCanvasWidth=0;
        this.cacheCanvasHeight=0;
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

        //Para obtener las dimenciones del cache canvas para el texto mas grande
        let tmpOriginalFontSize=this.parentObject.fontSize;
        this.parentObject.set("fontSize",this._getTemporalFontSize(this.parentObject.fontSize));
        this.parentObject.exitEditing();
        this.cacheCanvasWidth=this.parentObject.width;
        this.cacheCanvasHeight=this.parentObject.height;

        let pathOpenTypeObjects=[] //for each line we need the path to generate the image
        let result=this.dataGenerator.generateTextDrawingData(this.parentObject,this.getWidthInDrawingCache(),this.getHeightInDrawingCache(),this._getDisplacementLeft(),this._getDisplacementTop(),pathOpenTypeObjects);
        this.drawingData = result;
        this.drawingData.type=DrawingDataType.CREATED_NOPATH;

        this.dataGenerator.generateTextBaseImage(this.parentObject,pathOpenTypeObjects,function(image){
            this.baseImage=image;

            this.parentObject.set("fontSize",tmpOriginalFontSize);
            this.parentObject.exitEditing();
            callback();
        }.bind(this));

        this.parentObject.objectCaching=false;
    },
        /*temporal font size for while generating drawing data*/
        _getTemporalFontSize:function(fontSize){
            if(fontSize<40){
                return fontSize*3.5;
            }else if(fontSize<75){
                return fontSize*3.7;
            }else{
                return fontSize*2

            }
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
    renderEntranceEffect:function(ctx){
        if(this.isMyTurnToCopyCache){
            ctx.drawImage(this.cacheManager.canvas,(-this.parentObject.width/2)-this._getDisplacementLeft(),(-this.parentObject.height/2)-this._getDisplacementTop(),this.parentObject.width+this._getDisplacementLeft()*2,this.parentObject.height+this._getDisplacementTop()*2);
        }else{
            ctx.drawImage(this.meanWhileImage,(-this.parentObject.width/2)-this._getDisplacementLeft(),(-this.parentObject.height/2)-this._getDisplacementTop(),this.parentObject.width+this._getDisplacementLeft()*2,this.parentObject.height+this._getDisplacementTop()*2);
        }
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(baseImage,0,0,canvas.width,canvas.height);
        // ctx.strokeStyle="red";
        // ctx.lineWidth=2;
        // ctx.stroke();
        ctx.globalCompositeOperation="source-in";
        ctx.fill();
        ctx.globalCompositeOperation="source-over";
        ctx.drawImage(prevPathSnapshot,0,0);
    },
    notificationOnAssetStateReady:function(){
        //NOTHING
    },
    /*overwritten methods*/
    getWidthInDrawingCache:function(){
        return this.cacheCanvasWidth+this._getDisplacementLeft()*2;
    },
    getHeightInDrawingCache:function(){
        return this.cacheCanvasHeight+this._getDisplacementTop()*2;
    },
        /*indican los paddings adicionales a lso bordes del texto, 0.4 numero a la zar que parece ser uan dimencion razonable*/
        _getDisplacementLeft:function(){return this.parentObject.fontSize*0.25},
        _getDisplacementTop:function(){return this.parentObject.fontSize*0.25},
    getWidthInMainCanvas:function(){
        return this.parentObject.width;
    },
    getHeightInMainCanvas:function(){
        return this.parentObject.height;
    },
    convertPathLeftCoordToHandCoord:function(coordX){
        // return (coordX/((this.getWidthInDrawingCache()-this._getDisplacementLeft()*2)/this.getWidthInMainCanvas()))-this.getWidthInMainCanvas()/2;
        return (((coordX-this._getDisplacementLeft())/(((this.cacheCanvasWidth)/this.getWidthInMainCanvas())))-(this.getWidthInMainCanvas()/2))*1.1;
    },
    convertPathTopCoordToHandCoord:function(coordY){
        // return (coordY/((this.getHeightInDrawingCache()-this._getDisplacementTop()*2)/this.getHeightInMainCanvas()))-this.getHeightInMainCanvas()/2;
        return (((coordY-this._getDisplacementTop())/(((this.cacheCanvasHeight)/this.getHeightInMainCanvas())))-(this.getHeightInMainCanvas()/2))*1.1;
    },
    toObject:function(){
        let self=this;
        return {
            config:this.config,
            turnIndexInEntranceList:self.turnIndexInEntranceList,
        }
    },
    fromObject:function(object){
        this.config=object.config;
        this.turnIndexInEntranceList=object.turnIndexInEntranceList
    }
})