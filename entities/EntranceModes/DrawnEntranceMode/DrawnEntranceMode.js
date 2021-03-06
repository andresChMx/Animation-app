var DrawnEntranceMode=fabric.util.createClass(EntranceMode,{
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
        this.parentObject.registerOnImageStateChanged(this);

        this.cacheManager=EntranceEffectManagerMap.DrawnEntranceMode;
        this.drawingData=this.generateInitialImageDrawingData();//new Class Property: Holds drawind data for 'drawn' entrance mode

        this.isMyTurnToCopyCache=false;
        this.baseImage=this.parentObject.largeImage;
        this.meanWhileImage=new Image();

    },
    /*implemented inherited methods*/
    renderEntranceEffect:function(ctx){
        if(this.isMyTurnToCopyCache){
            ctx.drawImage(this.cacheManager.canvas,-this.parentObject.width/2,-this.parentObject.height/2);
        }else{
            ctx.drawImage(this.meanWhileImage,-this.parentObject.width/2,-this.parentObject.height/2);
        }
    },
    /*fin*/
    getWidthInDrawingCache:function(){
    },
    getHeightInDrawingCache:function(){
    },
    getWidthInMainCanvas:function(){
    },
    getHeightInMainCanvas:function(){
    },
    convertPathLeftCoordToHandCoord:function(coordX){
    },
    convertPathTopCoordToHandCoord:function(coordY){

    },
    generateInitialImageDrawingData:function(){
        return {
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:DrawingDataType.CREATED_NOPATH
        }
    },
    setTurnToCopyCache:function(turn,meanwhileImage){
        if(!turn){
            this.meanWhileImage=meanwhileImage;
        }
        this.isMyTurnToCopyCache=turn;
    },
    notificationOnImageStateChanged:function(){
        this.baseImage=this.parentObject.largeImage;
    },
    /* New abstract methods (to be implemented)*/
    getDrawingBaseImage:function(){},
    getDrawingFinalImage:function(){},
    illustrationFunctionOnCache:function(){},
});