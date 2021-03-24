var Preprotocol={
    wantConsume:true,
    wantDelete:true
}
var PathDesignerController=fabric.util.createClass({
    
    initialize:function(){
        this.listObserversOnSetupCompleted=[];
        this.listObserversOnLayerIndexChanged=[];
        this.listObserversOnToolChanged=[];
        this.imageDrawingData=null;
        this.objectDesigning=null;

        this.canvasManager=new CanvasDrawingManager();
        this.drawingManager=new DrawingManager(this,this.canvasManager);

        this.previewManager=new PreviewManager(this.drawingManager,this.canvasManager);
        this.svgManager=new SVGManager();

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);

        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);

    },
    wakeUpComponentes:function(imageDrawingData,baseImage){
        if(imageDrawingData.pathsNames.length===0){
            imageDrawingData.strokesTypes.push([]);
            imageDrawingData.points.push([]);
            // imageDrawingData.ctrlPoints.push([]);
            imageDrawingData.linesWidths.push(10);
            imageDrawingData.pathsNames.push("Path 1")
        }
        this.canvasManager.wakeUp(imageDrawingData,baseImage);
        this.drawingManager.wakeUp(imageDrawingData,baseImage);
        this.previewManager.wakeUp(imageDrawingData,baseImage);//tiene acceso al drawinData ya que tiene referencia al canvasManager y drawingManager

        this.notifyOnSetupCompleted();
    },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        let animableObject=args[0];

        this.objectDesigning=animableObject;

        this.imageDrawingData=animableObject.getDrawingData();


        this.wakeUpComponentes(this.imageDrawingData,this.objectDesigning.largeImage);
    },
    notificationPanelDesignerOptionsOnActionClicked:function(args){
        let actionId=args[0];
        switch (actionId){
            case "save":

                //let matCtrlPoints=this.drawingManager.getMatrixCrtlPoints();
                let matPoints=[];
                let listLinesWidths=[];
                let listPathsNames=[];
                let listPathStrokesType=[];
                if(this.drawingManager.getTotalAmountPoints()!==0){
                    matPoints=this.drawingManager.getMatrixPathsPoints();
                    listLinesWidths=this.canvasManager.getLinesWidthsNormalized();
                    listPathsNames=this.drawingManager.listPathsNames;
                    listPathStrokesType= this.canvasManager.getListPathStrokesType();
                }

                this.imageDrawingData.points=matPoints;
                this.imageDrawingData.linesWidths=listLinesWidths;
                this.imageDrawingData.pathsNames=listPathsNames;
                this.imageDrawingData.strokesTypes=listPathStrokesType;

                if(this.imageDrawingData.type===global.DrawingDataType.CREATED_NOPATH){
                    if(this.getTotalStrokesAmount(matPoints)===0) {
                    }else{
                        this.imageDrawingData.type = global.DrawingDataType.CREATED_PATHDESIGNED;
                    }
                }else if(this.imageDrawingData.type===global.DrawingDataType.CREATED_PATHDESIGNED){
                    if(this.getTotalStrokesAmount(matPoints)===0) {
                        this.imageDrawingData.type=global.DrawingDataType.CREATED_NOPATH;
                    }
                }

                this.objectDesigning.generateFinalMaskedImage();

                this.objectDesigning=null;
                this.imageDrawingData=null;
                (function Wait(){
                    if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
                    Preprotocol.wantConsume=false;

                    this.previewManager.sleep();
                    this.drawingManager.sleep();
                    this.canvasManager.sleep();

                    Preprotocol.wantConsume=true;
                }.bind(this)())
            break;
            case "cancel":
            //debugger;
                (function Wait(){
                    if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
                        Preprotocol.wantConsume=false;

                        this.previewManager.sleep();
                        this.drawingManager.sleep();
                        this.canvasManager.sleep();

                        Preprotocol.wantConsume=true;

                }.bind(this)())
            break;
        }
    },
    childNotificationOnPathIndexChanged:function(){
        this.notifyOnPathIndexChanged();
    },
    childNotificationOnToolChanged:function(){
        this.notifyOnToolChanged();
    },
    // loadingPathsFromSVG:function(loadingMode){
    //     let self=this;
    //     if(this.imageDrawingData!=null){
    //         this.svgManager.calcDrawingData(this.objectDesigning.imageAssetModel.url_image,this.imageDrawingData.imgHigh.naturalWidth,this.imageDrawingData.imgHigh.naturalHeight,loadingMode,"url",function( svgLoadedData){
    //
    //             (function Wait(){
    //                 if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
    //                 Preprotocol.wantConsume=false;
    //
    //                 this.hasLoadedFromSVG=true;
    //
    //                 svgLoadedData.type=global.DrawingDataType.CREATED_PATHLOADED;
    //                 svgLoadedData.url=this.imageDrawingData.url;
    //                 svgLoadedData.imgHigh=this.imageDrawingData.imgHigh;
    //
    //                 this.previewManager.sleep();
    //                 this.drawingManager.sleep();
    //                 this.canvasManager.sleep();
    //
    //                 Preprotocol.wantConsume=true;
    //                 this.wakeUpComponentes(svgLoadedData);
    //             }.bind(self)())
    //
    //         })
    //     }
    // },
    getTotalStrokesAmount:function(matrixPoints){
        let totalCantPaths=0;
        for(let i=0;i<matrixPoints.length;i++){
            let tmpCant=(matrixPoints[i].length/2)-1;
            totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
        }
        return totalCantPaths;
    },
    // notificationPanelDesignerOptionsOnBtnLoadSVGClicked:function(){
    //     let self=this;
    //     PanelDesignerOptions.SectionPathDesignerPopup.showMessage("", "loading mode:",[
    //         {
    //             name:"force Strokes",action:function(){self.loadingPathsFromSVG.bind(self)("force_paths")}
    //         },
    //         {
    //             name:"Not Forcing", action:function(){self.loadingPathsFromSVG.bind(self)("no-force")}
    //         }
    //     ])
    // },
    notifyOnPathIndexChanged:function(){
        for(let i=0;i<this.listObserversOnLayerIndexChanged.length;i++){
            this.listObserversOnLayerIndexChanged[i].notificationOnPathIndexChanged();
        }
    },
    notifyOnSetupCompleted:function(){
        for(let i=0;i<this.listObserversOnSetupCompleted.length;i++){
            this.listObserversOnSetupCompleted[i].notificationOnSetupCompleted();
        }
    },
    notifyOnToolChanged:function(){
        for(let i=0;i<this.listObserversOnToolChanged.length;i++){
            this.listObserversOnToolChanged[i].notificationOnToolChanged();
        }
    },
    registerOnSetupCompleted:function(obj){ /*JUST FOR ITS UI CLASS*/
        this.listObserversOnSetupCompleted.push(obj);
    },
    registerOnLayerIndexChanged:function(obj){
        this.listObserversOnLayerIndexChanged.push(obj);
    },
    registerOnToolChanged:function(obj){
        this.listObserversOnToolChanged.push(obj);
    }

})