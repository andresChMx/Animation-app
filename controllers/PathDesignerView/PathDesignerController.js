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
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
        PanelDesignerOptions.SectionPaths.registerOnBtnLoadSVGClicked(this);
    },
    notificationOnItemsMenu_designPaths:function(imageModel){
        this.imageModel=imageModel;
        this.canvasManager.wakeUp(imageModel,imageModel.paths);
        this.drawingManager.wakeUp(imageModel,imageModel.paths);
        this.previewManager.wakeUp(imageModel);
        this.notifyOnSetupCompleted();

    },
    notificationOnSettingActionClicked:function(actionId){
        switch (actionId){
            case "save":
                //let matCtrlPoints=this.drawingManager.getMatrixCrtlPoints();
                
                let matPoints=this.drawingManager.getMatrixPathsPoints();
                let listLinesWidths=this.canvasManager.getLinesWidthsNormalized();
                let listPathsNames=this.drawingManager.listPathsNames;
                let listPathStrokesType= this.canvasManager.getListPathStrokesType();
                if(this.imageModel.paths.fromSVG || this.hasLoadedFromSVG){
                    this.imageModel.paths.fromSVG=true;
                    this.imageModel.paths.ctrlPoints=this.drawingManager.getMatrixCtrlPoints();
                }
                this.imageModel.paths.points=matPoints;
                this.imageModel.paths.linesWidths=listLinesWidths;
                this.imageModel.paths.pathsNames=listPathsNames;
                this.imageModel.paths.strokesTypes=listPathStrokesType;

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
    notificationOnbtnLoadSVGClicked:function(){
        let self=this;
        if(this.imageModel!=null){
            this.svgManager.loadSVG(this.imageModel.url,this.imageModel.imgHTML.naturalWidth,this.imageModel.imgHTML.naturalHeight,function( svgLoadedData){

                (function Wait(){
                    if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),1);return;}
                    Preprotocol.wantConsume=false;

                    this.hasLoadedFromSVG=true;

                    this.previewManager.sleep();
                    this.drawingManager.sleep();
                    this.canvasManager.sleep();

                    Preprotocol.wantConsume=true;

                    this.canvasManager.wakeUp(this.imageModel, svgLoadedData);
                    this.drawingManager.wakeUp(this.imageModel,svgLoadedData);
                    this.previewManager.wakeUp(this.imageModel,svgLoadedData);
                    this.notifyOnSetupCompleted();
                }.bind(self)())

            })
        }
    },
    notifyOnSetupCompleted:function(){
        for(let i=0;i<this.listObserversOnSetupCompleted.length;i++){
            this.listObserversOnSetupCompleted[i].notificationOnSetupCompleted();
        }
    },
    registerOnSetupCompleted:function(obj){
        this.listObserversOnSetupCompleted.push(obj);
    }

})