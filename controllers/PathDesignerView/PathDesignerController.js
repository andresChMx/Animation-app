var Preprotocol={
    wantConsume:true,
    wantDelete:true
}
var PathDesignerController=fabric.util.createClass({
    
    initialize:function(){
        this.listObserversOnSetupCompleted=[];
        this.imageDrawingData=null;
        this.objectDesigning=null;

        this.canvasManager=new CanvasDrawingManager();
        this.drawingManager=new DrawingManager(this.canvasManager);

        this.previewManager=new PreviewManager(this.drawingManager,this.canvasManager);
        this.svgManager=new SVGManager();

        this.hasLoadedFromSVG=false;

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnBtnLoadSVGClicked,this);

        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);

    },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.imageDrawingData=args[0];
        this.objectDesigning=args[1];
        if(this.imageDrawingData.type===ImageType.CREATED_NOPATH){
            this.wakeUpComponentes(this.imageDrawingData);
        }else if(this.imageDrawingData.type===ImageType.CREATED_PATHLOADED){
            if(this.imageDrawingData.points.length===0){
                //TODO: query firebase points,ctrlPoints,lineswidths,pathsNames,strokesTypes,type
            }else{
                this.wakeUpComponentes(this.imageDrawingData);
            }
        }else if (this.imageDrawingData.type===ImageType.CREATED_PATHDESIGNED){
            if(this.imageDrawingData.points.length===0) {
                //TODO: query firebase points,lineswidths,pathsNames,type, strokesTypes
            }else{
                this.wakeUpComponentes(this.imageDrawingData);
            }
        }
    },
    wakeUpComponentes:function(imageDrawingData){
        if(imageDrawingData.pathsNames.length===0){
            imageDrawingData.strokesTypes.push([]);
            imageDrawingData.points.push([]);
            imageDrawingData.ctrlPoints.push([]);
            imageDrawingData.linesWidths.push(10);
            imageDrawingData.pathsNames.push("Path 1")
        }
        this.canvasManager.wakeUp(imageDrawingData);
        this.drawingManager.wakeUp(imageDrawingData);
        this.previewManager.wakeUp(imageDrawingData);//tiene acceso al drawinData ya que tiene referencia al canvasManager y drawingManager
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

                this.imageDrawingData.points=matPoints;
                this.imageDrawingData.linesWidths=listLinesWidths;
                this.imageDrawingData.pathsNames=listPathsNames;
                this.imageDrawingData.strokesTypes=listPathStrokesType;

                if(this.hasLoadedFromSVG || this.imageDrawingData.type===ImageType.CREATED_PATHLOADED){
                    if(this.getTotalStrokesAmount(matPoints)===0) {
                        this.imageDrawingData.type=ImageType.CREATED_NOPATH;
                    }else{
                        this.imageDrawingData.type=ImageType.CREATED_PATHLOADED;
                        this.imageDrawingData.ctrlPoints=this.drawingManager.getMatrixCtrlPoints();
                    }
                }else if(this.imageDrawingData.type===ImageType.CREATED_NOPATH){
                    if(this.getTotalStrokesAmount(matPoints)===0) {

                    }else{
                        this.imageDrawingData.type = ImageType.CREATED_PATHDESIGNED;
                    }
                }else if(this.imageDrawingData.type===ImageType.CREATED_PATHDESIGNED){
                    if(this.getTotalStrokesAmount(matPoints)===0) {
                        this.imageDrawingData.type=ImageType.CREATED_NOPATH;
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
        if(this.imageDrawingData!=null){
            this.svgManager.calcDrawingData(this.imageDrawingData.url,this.imageDrawingData.imgHTML.naturalWidth,this.imageDrawingData.imgHTML.naturalHeight,loadingMode,"url",function( svgLoadedData){

                (function Wait(){
                    if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
                    Preprotocol.wantConsume=false;

                    this.hasLoadedFromSVG=true;

                    svgLoadedData.type=ImageType.CREATED_PATHLOADED;
                    svgLoadedData.url=this.imageDrawingData.url;
                    svgLoadedData.imgHTML=this.imageDrawingData.imgHTML;

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
        let imageModelIsSVG=this.isSVG(this.imageDrawingData.url);
        for(let i=0;i<this.listObserversOnSetupCompleted.length;i++){
            this.listObserversOnSetupCompleted[i].notificationOnSetupCompleted(imageModelIsSVG);
        }
    },
    registerOnSetupCompleted:function(obj){

        this.listObserversOnSetupCompleted.push(obj);
    }

})