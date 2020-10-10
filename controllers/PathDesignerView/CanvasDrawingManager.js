var CanvasDrawingManager=fabric.util.createClass({
    
    initialize:function(){
        this.listObserversOnPointModified=[];
        this.listObserversOnMouseUp=[];
        this.listObserversOnImageLoaded=[];

        this.listPoints=[];
        this.listLinesWidths=[];

        this.listPathsColors=[];

        this.canvasZoomVal=1;
        this.canvasOriginalWidth=0;
        this.canvasOriginalHeight=0;
        this.drawingPath=null;
        
        this.canvas=new fabric.Canvas('cPathsDesigner',{ width: window.innerWidth+200, height: window.innerHeight ,backgroundColor: 'rgb(123,123,123)',selection:false}); 
        
        SectionSettings.registerOnSettingZoomIn(this);
        SectionSettings.registerOnSettingZoomOut(this);


    },
    wakeUp:function(imageModel){
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
        this.tryLoadPaths(imageModel);
        this.tryLoadLinesWidths(imageModel);
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
        this.drawingPath=null;
    },
    initDrawingPath:function(){
        this.drawingPath=new DrawingPath({left:0,top:0,width:this.canvasOriginalWidth,height:this.canvasOriginalHeight,pts:[],cps:[],listLinesWidths:[],listPathsColors:this.listPathsColors,selectable:false,evented:false,globalCompositeOperation:"destination-in",stroke:"rgb(255,0,0)"});
        this.canvas.add(this.drawingPath);
    },
    setupCanvasDimensions:function(){
        this.canvas.setZoom(this.canvasZoomVal);
        this.canvas.setWidth(this.canvasOriginalWidth*this.canvasZoomVal);
        this.canvas.setHeight(this.canvasOriginalHeight*this.canvasZoomVal);
        
    },
    tryLoadPaths:function(imageModel){
        if(imageModel.paths.points.length==0){
            this.listPoints.push([]);
            this.listPathsColors.push(this.genearteRandomColor());
            return
        };
        this.listPoints=[];
        for(let i=0;i<imageModel.paths.points.length;i++){
            this.listPoints.push([]);
            this.listPathsColors.push(this.genearteRandomColor());
            for(let j=0;j<imageModel.paths.points[i].length/2;j++){
                let pathPoints=imageModel.paths.points[i];
                this.addPoint(pathPoints[2*j]*this.canvasOriginalWidth,pathPoints[(2*j)+1]*this.canvasOriginalHeight,i);
            }
        }

    },
    tryLoadLinesWidths:function(imageModel){
        if(imageModel.paths.linesWidths.length==0){
            this.listLinesWidths.push(10);
            return;
        }
        this.listLinesWidths=imageModel.paths.linesWidths.map(function(width){return width*this.canvasOriginalWidth}.bind(this));
    },
    getLinesWidthsNormalized:function(){
        let linesWidths=[]
        for(let i=0;i<this.listLinesWidths.length;i++){
            linesWidths[i]=this.listLinesWidths[i]/this.canvasOriginalWidth;
        }
        return linesWidths;
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
    addPath:function(){
        this.listPoints.push([]);
        this.listLinesWidths.push(10);
        this.listPathsColors.push(this.genearteRandomColor());
    },
    removePathAt:function(index){
        for(let i=0;i<this.listPoints[index].length;i++){
            this.canvas.remove(this.listPoints[index][i]);
        }
        this.listPoints.splice(index,1);
        this.listLinesWidths.splice(index,1);
        this.listPathsColors.splice(index,1);

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
    notificationOnZoomIn:function(){
        this.canvasZoomVal*=1.1;
        this.setupCanvasDimensions();
    },
    notificationOnZoomOut:function(){
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
            if (len == 2) {
                ctx.moveTo(this.pts[i][0].get("left"), this.pts[i][0].get("top"));
                ctx.lineTo(this.pts[i][1].get("left"), this.pts[i][1].get("top"));
            }
            else {
              ctx.moveTo(this.pts[i][0].get("left"), this.pts[i][0].get("top"));
              // from point 0 to point 1 is a quadratic
              ctx.quadraticCurveTo(this.cps[i][0], this.cps[i][1], this.pts[i][1].get("left"), this.pts[i][1].get("top"));
              // for all middle points, connect with bezier
              for (var j = 2; j < len-1; j += 1) {
                // console.log("to", this.pts[i][2*i], this.pts[i][2*i+1]);
                ctx.bezierCurveTo(this.cps[i][(2*(j-1)-1)*2], this.cps[i][(2*(j-1)-1)*2+1],
                                  this.cps[i][(2*(j-1))*2], this.cps[i][(2*(j-1))*2+1],
                                  this.pts[i][j].get("left"), this.pts[i][j].get("top"));
              }
              ctx.quadraticCurveTo(this.cps[i][(2*(j-1)-1)*2], this.cps[i][(2*(j-1)-1)*2+1],
                                   this.pts[i][j].get("left"), this.pts[i][j].get("top"));
            }
            ctx.stroke();
        }
    }

  });

