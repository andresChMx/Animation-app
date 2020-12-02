var Preprotocol={
    wantConsume:true,
    wantDelete:true
}
var PathDesignerController=fabric.util.createClass({
    
    initialize:function(){
        this.listObserversOnSetupCompleted=[];
        this.imageModel=null;

        this.canvasManager=new CanvasDrawingManager();
        this.drawingManager=new DrawingManager(this.canvasManager);

        this.previewManager=new PreviewManager(this.drawingManager,this.canvasManager);
        this.svgManager=new SVGManager();

        this.hasLoadedFromSVG=false;

        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDesignPathsClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnBtnLoadSVGClicked,this);

        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);

    },
    notificationPanelAssetsOnImageAssetDesignPathsClicked:function(args){
        let imageModel=args[0];
        this.imageModel=imageModel;
        if(imageModel.paths.type===ImageType.CREATED_NOPATH){
            this.wakeUpComponentes(imageModel.paths);
        }else if(imageModel.paths.type===ImageType.CREATED_PATHLOADED){
            if(imageModel.paths.points.length===0){
                //TODO: query firebase points,ctrlPoints,lineswidths,pathsNames,strokesTypes,type
            }else{
                this.wakeUpComponentes(imageModel.paths);
            }
        }else if (imageModel.paths.type===ImageType.CREATED_PATHDESIGNED){
            if(imageModel.paths.points.length===0) {
                //TODO: query firebase points,lineswidths,pathsNames,type, strokesTypes
            }else{
                this.wakeUpComponentes(imageModel.paths);
            }
        }
    },
    wakeUpComponentes:function(drawingData){
        if(drawingData.pathsNames.length===0){
            drawingData.strokesTypes.push([]);
            drawingData.points.push([]);
            drawingData.ctrlPoints.push([]);
            drawingData.linesWidths.push(10);
            drawingData.pathsNames.push("Path 1")
        }
        this.canvasManager.wakeUp(this.imageModel,drawingData);
        this.drawingManager.wakeUp(this.imageModel,drawingData);
        this.previewManager.wakeUp(this.imageModel,null);//tiene acceso al drawinData ya que tiene referencia al canvasManager y drawingManager
        this.notifyOnSetupCompleted();
    },
    isSVG:function(urlstring){
        const regex1 = RegExp('.svg$', 'i');

        return regex1.test(urlstring);
    },
    notificationPanelDesignerOptionsOnSettingActionClicked:function(args){
        let actionId=args[0];
        switch (actionId){
            case "save":
                //let matCtrlPoints=this.drawingManager.getMatrixCrtlPoints();
                
                let matPoints=this.drawingManager.getMatrixPathsPoints();
                let listLinesWidths=this.canvasManager.getLinesWidthsNormalized();
                let listPathsNames=this.drawingManager.listPathsNames;
                let listPathStrokesType= this.canvasManager.getListPathStrokesType();

                this.imageModel.paths.points=matPoints;
                this.imageModel.paths.linesWidths=listLinesWidths;
                this.imageModel.paths.pathsNames=listPathsNames;
                this.imageModel.paths.strokesTypes=listPathStrokesType;

                if(this.hasLoadedFromSVG || this.imageModel.paths.type===ImageType.CREATED_PATHLOADED){
                    if(this.getTotalStrokesAmount(matPoints)===0) {
                        this.imageModel.paths.type=ImageType.CREATED_NOPATH;
                    }else{
                        this.imageModel.paths.type=ImageType.CREATED_PATHLOADED;
                        this.imageModel.paths.ctrlPoints=this.drawingManager.getMatrixCtrlPoints();
                    }
                }else if(this.imageModel.paths.type===ImageType.CREATED_NOPATH){
                    if(this.getTotalStrokesAmount(matPoints)===0) {

                    }else{
                        this.imageModel.paths.type = ImageType.CREATED_PATHDESIGNED;
                    }
                }else if(this.imageModel.paths.type===ImageType.CREATED_PATHDESIGNED){
                    if(this.getTotalStrokesAmount(matPoints)===0) {
                        this.imageModel.paths.type=ImageType.CREATED_NOPATH;
                    }
                }


                (function Wait(){
                    if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
                    Preprotocol.wantConsume=false;

                    this.previewManager.sleep();
                    this.drawingManager.sleep();
                    this.canvasManager.sleep();

                    Preprotocol.wantConsume=true;
                }.bind(this)())
                this.hasLoadedFromSVG=false;
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
                this.hasLoadedFromSVG=false;
            break;
        }
    },
    loadingPathsFromSVG:function(loadingMode){
        let self=this;
        if(this.imageModel!=null){
            this.svgManager.calcDrawingData(this.imageModel.url,this.imageModel.imgHTML.naturalWidth,this.imageModel.imgHTML.naturalHeight,loadingMode,"url",function( svgLoadedData){

                (function Wait(){
                    if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
                    Preprotocol.wantConsume=false;

                    this.hasLoadedFromSVG=true;
                    svgLoadedData.type=ImageType.CREATED_PATHLOADED;

                    this.previewManager.sleep();
                    this.drawingManager.sleep();
                    this.canvasManager.sleep();

                    Preprotocol.wantConsume=true;
                    this.wakeUpComponentes(svgLoadedData);
                }.bind(self)())

            })
        }
    },
    getTotalStrokesAmount:function(matrixPoints){
        let totalCantPaths=0;
        for(let i=0;i<matrixPoints.length;i++){
            let tmpCant=(matrixPoints[i].length/2)-1;
            totalCantPaths=tmpCant<0?totalCantPaths:totalCantPaths+tmpCant;
        }
        return totalCantPaths;
    },
    notificationPanelDesignerOptionsOnBtnLoadSVGClicked:function(){
        let self=this;
        PanelDesignerOptions.SectionPathDesignerPopup.showMessage("", "loading mode:",[
            {
                name:"force Strokes",action:function(){self.loadingPathsFromSVG.bind(self)("force_paths")}
            },
            {
                name:"Not Forcing", action:function(){self.loadingPathsFromSVG.bind(self)("no-force")}
            }
        ])

    },
    notifyOnSetupCompleted:function(){
        let imageModelIsSVG=this.isSVG(this.imageModel.url);
        for(let i=0;i<this.listObserversOnSetupCompleted.length;i++){
            this.listObserversOnSetupCompleted[i].notificationOnSetupCompleted(imageModelIsSVG);
        }
    },
    registerOnSetupCompleted:function(obj){

        this.listObserversOnSetupCompleted.push(obj);
    }

})