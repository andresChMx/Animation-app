var CanvasDrawingManager=fabric.util.createClass({
    
    initialize:function(){
        this.listObserversOnPointModified=[];
        this.listObserversOnMouseUp=[];
        this.listObserversOnImageLoaded=[];

        this.listPoints=[];
        this.listLinesWidths=[];
        this.listPathStrokesType=[];

        this.listPathsColors=[];

        this.canvasZoomVal=1;
        this.canvasOriginalWidth=0;
        this.canvasOriginalHeight=0;
        this.drawingPath=null;
        
        this.canvas=new fabric.Canvas('cPathsDesigner',{ width: window.innerWidth+200, height: window.innerHeight ,backgroundColor: 'rgb(123,123,123)',selection:false}); 
        

        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingZoomOut,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingZoomIn,this);


    },
    wakeUp:function(imageModel,drawingData){
        this.canvasZoomVal=1;
        this.canvas.on("mouse:move",this.OnMouseMoved.bind(this))
        this.canvas.on("mouse:up",this.OnMouseUp.bind(this))

        this.canvasOriginalWidth=imageModel.imgHTML.naturalWidth;
        this.canvasOriginalHeight=imageModel.imgHTML.naturalHeight;
        let oImg=new fabric.Image(imageModel.imgHTML,{
            "left":0,
            "top":0,
            "selectable":false,
            "evented":false,
        })
        this.canvas.add(oImg);
        this.setupCanvasDimensions();
        this.initDrawingPath();

        if(drawingData.type===ImageType.CREATED_NOPATH){
            this.initDrawingDataAsEmpty();

        }else{
            this.loadPaths(drawingData);
            this.loadPathStrokesType(drawingData);
            this.loadLinesWidths(drawingData);
        }

    },
    sleep:function(){
        //clean canvas
        this.canvas.clear();
        //turn off event listeners
        this.canvas.off();
        //clean arrays
        this.listPathsNames=[];
        this.listLinesWidths=[];
        this.listPathsColors=[];
        this.listPoints=[];
        this.listPathStrokesType=[];
        this.drawingPath=null;
    },
    initDrawingDataAsEmpty:function(){
        this.listPoints.push([]);
        this.listPathsColors.push(this.genearteRandomColor());

        this.listLinesWidths.push(10);

        this.listPathStrokesType.push([]);

    },
    initDrawingPath:function(){
        this.drawingPath=new DrawingPath({left:0,top:0,width:this.canvasOriginalWidth,height:this.canvasOriginalHeight,pts:[],cps:[],listLinesWidths:[],listPathsColors:this.listPathsColors,strokesType:this.listPathStrokesType,selectable:false,evented:false,globalCompositeOperation:"destination-in"});
        this.canvas.add(this.drawingPath);
    },
    setupCanvasDimensions:function(){
        this.canvas.setZoom(this.canvasZoomVal);
        this.canvas.setWidth(this.canvasOriginalWidth*this.canvasZoomVal);
        this.canvas.setHeight(this.canvasOriginalHeight*this.canvasZoomVal);
        
    },
    loadPaths:function(drawingData){
        this.listPoints=[];
        for(let i=0;i<drawingData.points.length;i++){
            this.listPoints.push([]);
            this.listPathsColors.push(this.genearteRandomColor());
            for(let j=0;j<drawingData.points[i].length/2;j++){
                let pathPoints=drawingData.points[i];
                this.addPoint(pathPoints[2*j]*this.canvasOriginalWidth,pathPoints[(2*j)+1]*this.canvasOriginalHeight,i);
            }
        }
    },
    loadLinesWidths:function(drawingData){
        this.listLinesWidths=drawingData.linesWidths.map(function(width){return width*this.canvasOriginalWidth}.bind(this));
    },
    loadPathStrokesType:function(drawingData){
        this.listPathStrokesType=[];
        for(let i=0;i<drawingData.strokesTypes.length;i++){
            this.listPathStrokesType.push(drawingData.strokesTypes[i].slice(0));
        }
    },
    getLinesWidthsNormalized:function(){
        let linesWidths=[]
        for(let i=0;i<this.listLinesWidths.length;i++){
            linesWidths[i]=this.listLinesWidths[i]/this.canvasOriginalWidth;
        }
        return linesWidths;
    },
    getListPathStrokesType:function(){
        return this.listPathStrokesType;
    },
    genearteRandomColor:function(){
        return 'rgba('+Math.random()*255+','+Math.random()*255+','+Math.random()*255+','+0.7+')';
    },

    addPoint:function(x,y,pathIndex){
        let point=new fabric.Circle({radius:3,left:x,top:y,originX:"center",originY:"center"});
        point.on("moving",this.OnPointModified.bind(this))
        point.pointIndex=this.listPoints[pathIndex].length;
        point.pathIndex=pathIndex;
        this.canvas.add(point);
        this.listPoints[pathIndex].push(point);

        
    },
    addStrokeType:function(pathIndex){
        let len=this.listPoints[pathIndex].length;
        if(len<2){return;}
        if(len==2){
            this.listPathStrokesType[pathIndex].push("l");

        }else{
            let strokesLen=this.listPathStrokesType[pathIndex].length;
            if(len==3){this.listPathStrokesType[pathIndex][0]="q1";this.listPathStrokesType[pathIndex].push("q")}
            else{this.listPathStrokesType[pathIndex][strokesLen-1]="c";this.listPathStrokesType[pathIndex].push("q");}
        }
    },
    addPath:function(){
        this.listPoints.push([]);
        this.listLinesWidths.push(10);
        this.listPathsColors.push(this.genearteRandomColor());
        this.listPathStrokesType.push([]);
    },
    removePathAt:function(index){
        for(let i=0;i<this.listPoints[index].length;i++){
            this.canvas.remove(this.listPoints[index][i]);
        }
        this.listPoints.splice(index,1);
        this.listLinesWidths.splice(index,1);
        this.listPathsColors.splice(index,1);
        this.listPathStrokesType.splice(index,1)

        this.reassignPointsPathIndex(index);
    },
    movePath:function(old_index,new_index){
        if (new_index >= this.listPoints.length) {
            var k = new_index - this.listPoints.length + 1;
            let i=k;
            while (i--) {
                this.listPoints.push(undefined);
            }
            while (k--) {
                this.listLinesWidths.push(undefined);
            }
        }
        this.listPoints.splice(new_index, 0, this.listPoints.splice(old_index, 1)[0]);
        this.listLinesWidths.splice(new_index, 0, this.listLinesWidths.splice(old_index, 1)[0]);
    },
    setPathLineWidth:function(value,pathIndex){
        this.listLinesWidths[pathIndex]=value;
    },
    updatePathData:function(ctrlPoints,points){
        this.drawingPath.cps=ctrlPoints;
        this.drawingPath.pts=points;
        this.drawingPath.listLinesWidths=this.listLinesWidths;
        this.drawingPath.strokesType=this.listPathStrokesType;
    },
    reassignPointsPathIndex:function(index){
        for(let i=index;i<this.listPoints.length;i++){
            for(let j=0;j<this.listPoints[i].length;j++){
                this.listPoints[i][j].pathIndex=i;
            }
        }
    },
    OnPointModified:function(e){
        this.notifyOnPointModified(e);
    },
    OnMouseMoved:function(e){

    },
    OnMouseUp:function(e){
        this.notifyOnMouseUp(e);
    },
    notifyOnPointModified:function(e){
        for(let i=0;i<this.listObserversOnPointModified.length;i++){
            this.listObserversOnPointModified[i].notificationOnPointModified(e.target.pointIndex,e.target.pathIndex);
        }
    },
    notifyOnMouseUp:function(options){
        var pointer=this.canvas.getPointer(event.e);
        var posX=pointer.x;
        var posY=pointer.y;
        for(let i=0;i<this.listObserversOnMouseUp.length;i++){
            this.listObserversOnMouseUp[i].notificationOnMouseUp(posX,posY);
        }
    },
    registerOnPointModified:function(obj){
        this.listObserversOnPointModified.push(obj);
    },
    registerOnMouseUp:function(obj){
        this.listObserversOnMouseUp.push(obj);
    },
    notificationPanelDesignerOptionsOnSettingZoomOut:function(){
        this.canvasZoomVal*=1.1;
        this.setupCanvasDimensions();
    },
    notificationPanelDesignerOptionsOnSettingZoomIn:function(){
        this.canvasZoomVal*=0.9;
        this.setupCanvasDimensions();
    },

})



var DrawingPath = fabric.util.createClass(fabric.Object, {

    type: 'DrawingPath',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
      options || (options = { });
  
      this.callSuper('initialize', options);
      this.set('label', options.label || '');
      this.set({width:1000,height:800});
      this.pts=options.pts;
      this.cps=options.cps;
      this.strokesType=options.strokesType;
      this.ctx=null;
    },
  
    toObject: function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        label: this.get('label')
      });
    },
    render:function(ctx){
        
        for(let i=0;i<this.pts.length;i++){
            var len = this.pts[i].length; // number of points
            if (len < 2) continue;
            ctx.beginPath();
            ctx.strokeStyle=this.listPathsColors[i];
            ctx.lineWidth=this.listLinesWidths[i];
            ctx.moveTo(this.pts[i][0].get("left"), this.pts[i][0].get("top"));
              for (var j = 1; j < len; j += 1) {
                  if(this.strokesType[i][j-1]=="l"){
                      ctx.moveTo(this.pts[i][j-1].get("left"), this.pts[i][j-1].get("top"));
                      ctx.lineTo(this.pts[i][j].get("left"), this.pts[i][j].get("top"));
                  }else if(this.strokesType[i][j-1]=="c"){
                      ctx.bezierCurveTo(this.cps[i][((2*j)-2)*2], this.cps[i][((2*j)-2)*2 +1],
                          this.cps[i][((2*j)-1)*2 ], this.cps[i][((2*j)-1)*2 +1],
                          this.pts[i][j].get("left"), this.pts[i][j].get("top"));
                  }else if(this.strokesType[i][j-1]=="q"){
                      ctx.quadraticCurveTo(this.cps[i][((2*j)-2)*2], this.cps[i][((2*j)-2)*2 +1],
                          this.pts[i][j].get("left"), this.pts[i][j].get("top"));
                  }else if(this.strokesType[i][j-1]=="q1"){
                      ctx.quadraticCurveTo(this.cps[i][(2*j-1)*2], this.cps[i][(2*j-1)*2 +1],
                          this.pts[i][j].get("left"), this.pts[i][j].get("top"));
                  }

              }
            ctx.stroke();
        }
    }

  });

