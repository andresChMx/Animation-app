var IllustratorDataAdapterPreview=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager,previewManager,scalerFactorX,scalerFactorY,imgHigh){
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;
        this.previewManager=previewManager;

        this.scalerFactorX=scalerFactorX;
        this.scalerFactorY=scalerFactorY;
        this.duration=3000;
        this.delay=0;
        this.baseImage=imgHigh;
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

    getStrokeTypeAt:function(k,i,j){
        return this.canvasDrawingManager.listPathStrokesType[i][j];
    },

    getDurationOf:function(k){
        return this.duration;
    },
    getDelayOf:function(k){
        return this.delay;
    },
    getExitDelayOf:function(k){
        return 0;
    },
    getWidthCanvasCacheOf:function(k){
        return this.previewManager.canvas.width;
    },
    getHeightCanvasCacheOf:function(k){
        return this.previewManager.canvas.height;
    },
    getWidthMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInMainCanvas();
    },
    getHeightMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInMainCanvas();
    },

    getTypeOf:function(k){
        return "ImageAnimable";
    },
    getPathTypeOf:function(k){
        return global.DrawingDataType.CREATED_PATHDESIGNED;
    },
    getBaseImageOf:function(k){
        return this.baseImage;
    },
    getFinalDrawingImageOf:function(k){
        return null;
    },
    getObjectsToDrawLength:function(){
        return 1;
    },
    getEntraceModeOf:function(k){
        return global.EntranceName.image_drawn;
    },
    getIllustrationFunction:function(k){
        return global.ImageDrawnEntranceMode.prototype.illustrationFunctionOnCache;
    }
})


var IllustratorDataAdapterCache=fabric.util.createClass({
    initialize:function(listAnimableObjectsWidthDrawnEntrances){
        this.listAnimableObjectsWithDrawnEntrances=listAnimableObjectsWidthDrawnEntrances;
    },
    getStrokeCoordXAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points[i][j*2]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getStrokeCoordYAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points[i][j*2+1]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInDrawingCache();
    },
    getPathLength:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points[i].length/2;
    },
    getPathListLength:function(k,){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.points.length;
    },
    getPathTypeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.type;
    },
    getCtrlPointCoordXAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.ctrlPoints[i][j]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getCtrlPointCoordYAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.ctrlPoints[i][j]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInDrawingCache();
    },
    getStrokeTypeAt:function(k,i,j){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.strokesTypes[i][j];
    },
    getListLinesWidthsLength:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.linesWidths.length;
    },
    getBaseImageOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getDrawingBaseImage();
    },
    getFinalDrawingImageOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getDrawingFinalImage();
    },
    getLineWidthAt:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.linesWidths[i]
            * this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getLineColorAt:function(k,i){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.drawingData.linesColors[i];
    },
    getFillColorOf:function(k){/*for texts*/
        return this.listAnimableObjectsWithDrawnEntrances[k].fill;
    },
    getDurationOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceTimes.duration;
    },
    getDelayOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceTimes.delay;
    },
    getExitDelayOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].animator.entranceTimes.transitionDelay;
    },
    getWidthCanvasCacheOf:function(k){//usado por el drawinCacheManger
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInDrawingCache();
    },
    getHeightCanvasCacheOf:function(k){//usado por el drawinCacheManger
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInDrawingCache();
    },
    getWidthMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getWidthInMainCanvas();
    },
    getHeightMainCanvasOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.getHeightInMainCanvas();
    },
    convertPathLeftCoordToHandCoordOf:function(k,coordX){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.convertPathLeftCoordToHandCoord(coordX);
    },
    convertPathTopCoordToHandCoordOf:function(k,coordY){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.convertPathTopCoordToHandCoord(coordY);
    },
    getDrawingHandNameOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.config.drawingHandName;
    },
    getObjectsToDrawLength:function(){
        return this.listAnimableObjectsWithDrawnEntrances.length;
    },
    getEntraceModeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.getCurrentEntranceModeName();
    },
    getTypeOf:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].type;
    },
    getIllustrationFunction:function(k){
        return this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode.illustrationFunctionOnCache.bind(this.listAnimableObjectsWithDrawnEntrances[k].entranceBehaviour.entranceMode);
    }
})