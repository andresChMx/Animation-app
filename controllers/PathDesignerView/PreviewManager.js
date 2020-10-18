var PreviewManager=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager){
        this.canvas=document.getElementById("cPreview");
        this.ctx=this.canvas.getContext("2d");
        this.prevPathSnapshot=new Image();
        this.actualSnapshot=new Image();
        this.parentWidth=300 -10-10;
        this.imageModel=null;
        
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;
        this.pathIllustrator=null;
        
        this.canvasDrawingManager.registerOnPointModified(this);
        this.canvasDrawingManager.registerOnMouseUp(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingLineWidthChanged(this);
        PanelDesignerOptions.SectionPaths.registerOnBtnAddPathClicked(this);
        PanelDesignerOptions.SectionPaths.registerOnBtnDeletePathClicked(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingDurationChanged(this);

        this.scalerFactorX;
        this.scalerFactorY;
        this.scalerLineWidth;

    },
    wakeUp:function(imageModel,drawingData){
        this.imageModel=imageModel;
        this.animTotalDuration=imageModel.paths.duration;
        let imgWidth=imageModel.imgHTML.naturalWidth;
        let imgHeight=imageModel.imgHTML.naturalHeight;
        let aspect=imgWidth/imgHeight;
        if(imgWidth>imgHeight){
            this.canvas.width=this.parentWidth;
            this.canvas.height=this.parentWidth/aspect;
        }else{
            this.canvas.height=this.parentWidth;
            this.canvas.width=this.parentWidth*aspect
        }
        this.prevPathSnapshot.src=this.canvas.toDataURL();
        this.endLoop=false;

        this.scalerFactorX=this.canvas.width/this.canvasDrawingManager.canvasOriginalWidth;
        this.scalerFactorY=this.canvas.height/this.canvasDrawingManager.canvasOriginalHeight;
    
        this.illustratorDataAdapter=new IllustratorDataAdapterPreview(this.drawingManager,this.canvasDrawingManager,this.scalerFactorX,this.scalerFactorY);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,this.illustratorDataAdapter);
        this.pathIllustrator.setListObjectsToDraw([this.imageModel]);
        this.pathIllustrator.start();
    },
    sleep:function(){
        this.pathIllustrator.finish();
        this.pathIllustrator=null;
    },
    notificationOnPointModified:function(pointIndex,pathIndex){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnMouseUp:function(mouseX,mouseY){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnLineWidthChanged:function(value){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnBtnAddPathClicked:function(){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationOnBtnDeletePathClicked:function(index){
        this.pathIllustrator.counterInterruption=100;
    },  
    notificationOnDurationChanged:function(value){
        this.pathIllustrator.counterInterruption=100;
        if(isNaN(value)){
            this.pathIllustrator.listObjectsToDraw[0].paths.duration=3000;
        }
        else if(value<2){
            this.pathIllustrator.listObjectsToDraw[0].paths.duration=3000;
        }
        else if(value>10){
            this.pathIllustrator.listObjectsToDraw[0].paths.duration=3000;
        }else{
            this.pathIllustrator.listObjectsToDraw[0].paths.duration=value*1000;
        }

    }
})
