var ImageDrawnEntranceMode=fabric.util.createClass(DrawnEntranceMode,{
    type:"ImageDrawn",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);

        this.maskedImage=this.baseImage;//New Class Property
        this.dataGenerator=new ImageDrawingDataGenerator();
        /*auxiliary attributes*/

        /*configuration attributes*/
        this.config={
            showHand:true,
            finalDrawingAppearance:'masked',  // masked || original
        }
        /*fin*/
    },
    /*overwritten methods*/
    notificationOnImageStateChanged:function(){
        this.baseImage=this.parentObject.largeImage;
        if(this.parentObject.imageLoadingState===EnumAnimableLoadingState.ready){
            this.generateFinalMaskedImage();
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

        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            this.dataGenerator.generateDefaultDrawingPointsAndLineWidth(
                this.baseImage.naturalWidth,
                this.baseImage.naturalHeight,
                this.drawingData,//OUT
                35);

            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
            this.dataGenerator.generateStrokesTypesFromPoints(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
        }
        /*setting up object*/

        callback();
    },
    clearEntranceData:function(){
        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            this.drawingData.points=[];
            this.drawingData.linesWidths=[];
            this.drawingData.ctrlPoints=[];
            this.drawingData.strokesTypes=[];
            this.drawingData.pathsNames=[];
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.drawingData.ctrlPoints=[];
        }
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(baseImage,0,0,canvas.width,canvas.height)
        ctx.globalCompositeOperation="destination-in";
        ctx.stroke();
        ctx.globalCompositeOperation="source-over";
        ctx.drawImage(prevPathSnapshot,0,0);
    },
    getDrawingBaseImage:function(){
        return this.baseImage;
    },
    getDrawingFinalImage:function(){
        if(this.config.finalDrawingAppearance==="masked"){
            return this.maskedImage;
        }else{
            return this.baseImage;
        }

    },

    /* new custom methods*/
    generateFinalMaskedImage:function(){

        let canvas=document.createElement("canvas");
        let ctx=canvas.getContext("2d");
        // Generating drawing data if necessary, se estan limpiando los ctrlPoints al final, en caso fueron generados
        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            // canvas.width=this.baseImage.naturalWidth;
            // canvas.height=this.baseImage.naturalHeight;
            // ctx.drawImage(this.baseImage,0,0);
            // this.maskedImage=new Image();
            // this.maskedImage.src=canvas.toDataURL();
            // canvas.remove();
            this.maskedImage=this.baseImage.cloneNode();
            return;
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
        }
        // lo siguiente es porque se puede invocar a esta funcion aun estando en otro entrance mode diferente a uno de tipo drawn, ya que se puede entrar al editor de paths desde cualquier modo
        // pero obviamente al final de ejecutar el pathIllustrator debemos devolverlo a como estaba
        let tmpCurrentEntranceMode=this.parentObject.entranceBehaviour.getCurrentEntranceModeName();
        if(tmpCurrentEntranceMode!==this.type){
            this.parentObject.entranceBehaviour.setEntranceModeName(this.type);
        }

        let illustratorDataAdapterCache=new IllustratorDataAdapterCache([this.parentObject]);
        let pathIllustrator=new PathIllustrator(canvas,ctx,illustratorDataAdapterCache,false);
        pathIllustrator.generateFinalImage(function(dataUrl){
            /*  DEBUGGIN PURPOSES*/
            // var link = document.createElement("a");
            // link.download = name;
            // link.href = dataUrl;
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            // delete link;

            this.maskedImage=new Image();
            this.maskedImage.src=dataUrl;
            //CLEANING
            canvas.remove();
            this.drawingData.ctrlPoints=[];
            this.parentObject.entranceBehaviour.setEntranceModeName(tmpCurrentEntranceMode); // restoring animable object entrance mode
        }.bind(this))
    }
})