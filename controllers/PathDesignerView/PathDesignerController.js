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


        SectionImageAssets.registerOnItemsMenu_designPaths(this);
        SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnItemsMenu_designPaths:function(imageModel){
        this.imageModel=imageModel;
        this.canvasManager.wakeUp(imageModel);
        this.drawingManager.wakeUp(imageModel);
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
                this.imageModel.paths.points=matPoints;
                this.imageModel.paths.linesWidths=listLinesWidths;
                this.imageModel.paths.pathsNames=listPathsNames;
                this.drawingManager.sleep();
                this.canvasManager.sleep();
                this.previewManager.sleep();
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
    notifyOnSetupCompleted:function(){
        for(let i=0;i<this.listObserversOnSetupCompleted.length;i++){
            this.listObserversOnSetupCompleted[i].notificationOnSetupCompleted();
        }
    },
    registerOnSetupCompleted:function(obj){
        this.listObserversOnSetupCompleted.push(obj);
    }
})