var PreviewManager=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager){
        this.canvas=document.getElementById("cPreview");
        this.ctx=this.canvas.getContext("2d");
        this.prevPathSnapshot=new Image();
        this.actualSnapshot=new Image();
        this.parentWidth=300 -10-10;
        this.imageDrawingData=null;
        
        this.drawingManager=drawingManager;
        this.canvasDrawingManager=canvasDrawingManager;
        this.pathIllustrator=null;
        
        this.canvasDrawingManager.registerOnPointModified(this);
        this.canvasDrawingManager.registerOnMouseUp(this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingLineWidthChanged,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnBtnAddPathClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnBtnDeletePathClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingDurationChanged,this);

        this.scalerFactorX;
        this.scalerFactorY;
        this.scalerLineWidth;

    },
    wakeUp:function(imageDrawingData){
        this.imageDrawingData=imageDrawingData;
        let imgWidth=imageDrawingData.imgHigh.naturalWidth;
        let imgHeight=imageDrawingData.imgHigh.naturalHeight;
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
    
        this.illustratorDataAdapter=new IllustratorDataAdapterPreview(this.drawingManager,this.canvasDrawingManager,this.scalerFactorX,this.scalerFactorY,this.imageDrawingData.imgHigh);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,this.illustratorDataAdapter,true);
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
    notificationPanelDesignerOptionsOnSettingLineWidthChanged:function(args){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationPanelDesignerOptionsOnBtnAddPathClicked:function(){
        this.pathIllustrator.counterInterruption=100;
    },
    notificationPanelDesignerOptionsOnBtnDeletePathClicked:function(index){
        this.pathIllustrator.counterInterruption=100;
    },  
    notificationPanelDesignerOptionsOnSettingDurationChanged:function(args){
        let value=args[0];
        this.pathIllustrator.counterInterruption=100;
        if(isNaN(value)){
            this.pathIllustrator.data.duration=3000;
        }
        else if(value<2){
            this.pathIllustrator.data.duration=3000;
        }
        else if(value>10){
            this.pathIllustrator.data.duration=3000;
        }else{
            this.pathIllustrator.data.duration=value*1000;
        }

    }
})
