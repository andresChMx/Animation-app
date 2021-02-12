var PreviewManager=fabric.util.createClass({
    initialize:function(drawingManager,canvasDrawingManager){
        this.canvas=document.getElementById("cPreview");
        this.ctx=this.canvas.getContext("2d");
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

        this.endLoop=false;
        this.counterInterruption=0;
        this.flagFirstTime=false;

        this.requestAnimID=null;
    },
    getIllustrationDuration:function(){
        return this.pathIllustrator.data.duration;
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
        this.endLoop=false;

        this.scalerFactorX=this.canvas.width/this.canvasDrawingManager.canvasOriginalWidth;
        this.scalerFactorY=this.canvas.height/this.canvasDrawingManager.canvasOriginalHeight;
    
        this.illustratorDataAdapter=new IllustratorDataAdapterPreview(this.drawingManager,this.canvasDrawingManager,this,this.scalerFactorX,this.scalerFactorY,this.imageDrawingData.imgHigh);
        this.pathIllustrator=new PathIllustrator(this.canvas,this.ctx,this.illustratorDataAdapter,true);
        this.pathIllustrator.setupPreviewSceneVars();
        this.start();
    },
    start:function(){
        this.flagFirstTime=true;
        this.endLoop=false;
        this.loop();
    },
    loop:function(){
        let animStartTime=0;
        let progress=0;

        (function tick(){
            this.counterInterruption--;
            if(this.counterInterruption<0){
                if(this.flagFirstTime){
                    animStartTime=+new Date();

                    this.flagFirstTime=false;

                    this.pathIllustrator.flagFirstTime=true;
                    this.pathIllustrator.setupPreviewSceneVars();
                }

                let nowTime=+ new Date();
                progress=nowTime-animStartTime;

                this.pathIllustrator._designerDrawingLoop(progress);

            }else{
                this.flagFirstTime=true;
            }
            if(!this.endLoop){
                this.requestAnimID=fabric.util.requestAnimFrame(tick.bind(this));
            }
        }.bind(this)());
    },
    sleep:function(){
        if(this.requestAnimID){
           window.cancelAnimationFrame(this.requestAnimID);
           this.requestAnimID=null;
        }
        this.endLoop=true;
        this.counterInterruption=-1;

        this.pathIllustrator.delete();
        this.pathIllustrator=null;
    },
    notificationOnPointModified:function(pointIndex,pathIndex){
        this.counterInterruption=100;
    },
    notificationOnMouseUp:function(mouseX,mouseY){
        this.counterInterruption=100;
    },
    notificationPanelDesignerOptionsOnSettingLineWidthChanged:function(args){
        this.counterInterruption=100;
    },
    notificationPanelDesignerOptionsOnBtnAddPathClicked:function(){
        this.counterInterruption=100;
    },
    notificationPanelDesignerOptionsOnBtnDeletePathClicked:function(index){
        this.counterInterruption=100;
    },  
    notificationPanelDesignerOptionsOnSettingDurationChanged:function(args){
        let value=args[0];
        this.counterInterruption=100;
        console.log(value);
        if(!isNaN(value)){
            this.pathIllustrator.data.duration=value;
        }
    }
})
