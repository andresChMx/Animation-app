var CrtlPoinstManagement=fabric.util.createClass({
    initialize:function(){
        this.list=[];
    },
    wakeUp:function(matPts){
        this.generateCrtlPointsFromPointsMatrix(matPts);
    },
    sleep:function(){
        this.list=[];
    },
    tryLoadCrtlPoints:function(imageModel){
        
        if(imageModel.paths.ctrlPoints.length==0){return};

        for(let i=0;i<imageModel.paths.ctrlPoints.length;i++){
            this.list.push(imageModel.paths.ctrlPoints[i]);
        }
    },
    _triangleWidthHeight:function(arr, i, j){
        return [arr[2*j]-arr[2*i], arr[2*j+1]-arr[2*i+1]]
    },
    _distace:function(arr, i, j) {
        return Math.sqrt(Math.pow(arr[2*i]-arr[2*j], 2) + Math.pow(arr[2*i+1]-arr[2*j+1], 2));
    },
    _calcCrtlPointsSinglePoint:function(x1,y1,x2,y2,x3,y3){
        var t = 0.5;
        var v = this._triangleWidthHeight(arguments, 0, 2);
        var d01 = this._distace(arguments, 0, 1);
        var d12 = this._distace(arguments, 1, 2);
        var d012 = d01 + d12;
        return [x2 - v[0] * t * d01 / d012, y2 - v[1] * t * d01 / d012,
                    x2 + v[0] * t * d12 / d012, y2 + v[1] * t * d12 / d012 ];
    },
    
    generateCrtlPointsFromPointsMatrix:function(matPts){
        if(matPts.length==0){
            this.list.push([]);
            return;
        }
        this.list=[];
        for (var i = 0; i <matPts.length; i += 1) {
            let newCrtlPoints=[]; 
            if(matPts[i].length>=3){
                for(var j=0;j<matPts[i].length-2;j++){
                    newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(matPts[i][j].get("left"), matPts[i][j].get("top"), matPts[i][j+1].get("left"), matPts[i][j+1].get("top"), matPts[i][j+2].get("left"), matPts[i][j+2].get("top")));
                }
            }
            this.list.push(newCrtlPoints);
          }
    },
    recalcCtrlPointsForDeletedPoint:function(indexPath){
        let length=this.list[indexPath].length;
        this.list[indexPath].slice(length-1-4,4);
        //flata para diferetnes cantidades de elementos
    },
    recalcCtrlPointsForNewPoint:function(pts,indexPath){
        let i=pts.length-1;
        if(pts.length>2){
            this.list[indexPath]=this.list[indexPath].concat(this._calcCrtlPointsSinglePoint(pts[i-2].get("left"), pts[i-2].get("top"), pts[i-1].get("left"), pts[i-1].get("top"), pts[i].get("left"), pts[i].get("top")));
        }
    },
    recalcCtrlPointsPointArea:function(pts,pointIndex,pathIndex){
        let length=pts.length;
        if(length<=4){
            let newCrtlPoints=[]; 
            for (var i = 0; i < length-2; i += 1) {
                newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(pts[i].get("left"), pts[i].get("top"), pts[i+1].get("left"), pts[i+1].get("top"), pts[i+2].get("left"), pts[i+2].get("top")));
              }
            for(var i=0;i<newCrtlPoints.length;i++){
               this.list[pathIndex][i]=newCrtlPoints[i];
            }
            return;   
        }

        if(pointIndex==0){
            let newCtrlPoint=this._calcCrtlPointsSinglePoint(pts[0].get("left"), pts[0].get("top"), pts[1].get("left"), pts[1].get("top"), pts[2].get("left"), pts[2].get("top"))
           this.list[pathIndex][0]=newCtrlPoint[0];
           this.list[pathIndex][1]=newCtrlPoint[1];
           this.list[pathIndex][2]=newCtrlPoint[2];
           this.list[pathIndex][3]=newCtrlPoint[3];
            return;
        }else if(pointIndex==1){
            let newCrtlPoints=[]; 
            for (var i = 0; i <=1; i += 1) {
                newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(pts[i].get("left"), pts[i].get("top"), pts[i+1].get("left"), pts[i+1].get("top"), pts[i+2].get("left"), pts[i+2].get("top")));
              }
            for(var i=0;i<newCrtlPoints.length;i++){
               this.list[pathIndex][i]=newCrtlPoints[i];
            }
            return;  
        }else if(pointIndex==length-2){
            let newCrtlPoints=[]; 
            for (var i = pointIndex-2; i <=pointIndex-1; i += 1) {
                newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(pts[i].get("left"), pts[i].get("top"), pts[i+1].get("left"), pts[i+1].get("top"), pts[i+2].get("left"), pts[i+2].get("top")));
              }
            for(var i=0;i<newCrtlPoints.length;i++){
               this.list[pathIndex][this.list[pathIndex].length-8+i]=newCrtlPoints[i];
            }
        }else if(pointIndex==length-1){
            let newCrtlPoints=this._calcCrtlPointsSinglePoint(pts[pointIndex-2].get("left"), pts[pointIndex-2].get("top"), pts[pointIndex-1].get("left"), pts[pointIndex-1].get("top"), pts[pointIndex].get("left"), pts[pointIndex].get("top"))
            for(var i=0;i<newCrtlPoints.length;i++){
                this.list[pathIndex][this.list[pathIndex].length-4+i]=newCrtlPoints[i];
             }
        }else{
            let newCrtlPoints=[]; 
            for (var i = pointIndex-2; i <=pointIndex; i += 1) {
                newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(pts[i].get("left"), pts[i].get("top"), pts[i+1].get("left"), pts[i+1].get("top"), pts[i+2].get("left"), pts[i+2].get("top")));
              }
            for(var i=pointIndex-1;i<=pointIndex+1;i++){
               this.list[pathIndex][(2*(i-1)-1)*2+2]=newCrtlPoints[((i-(pointIndex-1))*4)];
               this.list[pathIndex][(2*(i-1)-1)*2+1+2]=newCrtlPoints[((i-(pointIndex-1))*4)+1]
               this.list[pathIndex][(2*(i-1))*2+2]=newCrtlPoints[((i-(pointIndex-1))*4)+2]
               this.list[pathIndex][(2*(i-1))*2+1+2]=newCrtlPoints[((i-(pointIndex-1))*4)+3]
            }
            return;  
        }
    },
    addPath:function(){
        this.list.push([]);
    },
    removePathAt:function(index){
        this.list.splice(index,1);
    },
    movePath:function(old_index,new_index){
        if (new_index >= this.list.length) {
            var k = new_index - this.list.length + 1;
            while (k--) {
                this.list.push(undefined);
            }
        }
        this.list.splice(new_index, 0, this.list.splice(old_index, 1)[0]);
    },
})
var DrawingManager=fabric.util.createClass({
    initialize:function(canvasManager){
        this.tools={
            selection:"selection",
            add:"add",
            remove:"remove"
        }
        this.listObserversOnSetupCompleted=[];


        this.currentTool=this.tools.selection;
        this.listPathsNames=[]

        this.totalAmountPaths=1;
        this.currentPathIndex=0;

        this.canvasManager=canvasManager;
        this.ctrlPointsManager=new CrtlPoinstManagement();

        this.canvasManager.registerOnPointModified(this);
        this.canvasManager.registerOnMouseUp(this);
        
        PanelDesignerOptions.SectionSettings.registerOnSettingToolClicked(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingLineWidthChanged(this);

        PanelDesignerOptions.SectionPaths.registerOnBtnAddPathClicked(this);
        PanelDesignerOptions.SectionPaths.registerOnPathClicked(this);
        PanelDesignerOptions.SectionPaths.registerOnBtnDeletePathClicked(this);
    },
    wakeUp:function(imageModel){

        this.tryLoadPathsNames(imageModel.paths.pathsNames);
        this.ctrlPointsManager.wakeUp(this.canvasManager.listPoints);
        this.canvasManager.updatePathData(this.ctrlPointsManager.list,this.canvasManager.listPoints);
        this.totalAmountPaths=this.canvasManager.listPoints.length;
        this.currentPathIndex=0;
    },
    sleep:function(){
        this.totalAmountPaths=1;
        this.currentPathIndex=0;
        this.ctrlPointsManager.sleep();
        this.listPathsNames=[];

    },
    tryLoadPathsNames:function(pathsNames){
        if(pathsNames.length==0){
            this.listPathsNames.push("Path uno");
            return;
        }
        this.listPathsNames=pathsNames;
    },
    getMatrixPathsPoints:function(){
        let mat=[];
        for(let i=0;i<this.canvasManager.listPoints.length;i++){
            mat.push([])
            for(let j=0;j<this.canvasManager.listPoints[i].length;j++){
                let p=this.canvasManager.listPoints[i][j];
                mat[i].push(p.get("left")/this.canvasManager.canvasOriginalWidth);
                mat[i].push(p.get("top")/this.canvasManager.canvasOriginalHeight);
            }
        }
        return mat;
    },
    addPathAtLast:function(){
        this.canvasManager.addPath();
        this.ctrlPointsManager.addPath();

        let pathName="Path" + this.totalAmountPaths
        this.listPathsNames.push(pathName);

        this.currentPathIndex=this.totalAmountPaths;
        this.totalAmountPaths=this.canvasManager.listPoints.length;
        
    },
    removePathAt:function(index){
        (function Wait(){
            if(!Preprotocol.wantDelete){setTimeout(Wait.bind(this),5);return;}
                Preprotocol.wantConsume=false;

                if(this.totalAmountPaths==1 || this.index>=this.totalAmountPaths){
                    Preprotocol.wantConsume=true;
                    return;
                }
                this.canvasManager.removePathAt(index);
                this.ctrlPointsManager.removePathAt(index);
                this.listPathsNames.splice(index,1)
                if(index<=this.currentPathIndex){
                    this.currentPathIndex=this.currentPathIndex==0?0:this.currentPathIndex-1;
                }
                this.totalAmountPaths--;
                
                Preprotocol.wantConsume=true;
            
        }.bind(this)())


    },
    //NOTIFICAIOENS DE CANVASmANAGER
    notificationOnPointModified:function(pointIndex,pathIndex){
        this.ctrlPointsManager.recalcCtrlPointsPointArea(this.canvasManager.listPoints[pathIndex],pointIndex,pathIndex);
        this.canvasManager.updatePathData(this.ctrlPointsManager.list,this.canvasManager.listPoints);
    },
    notificationOnMouseUp:function(mouseX,mouseY){
        switch(this.currentTool){
            case this.tools.selection:
                break;
            case this.tools.add:
                this.canvasManager.addPoint(mouseX,mouseY,this.currentPathIndex);
                this.ctrlPointsManager.recalcCtrlPointsForNewPoint(this.canvasManager.listPoints[this.currentPathIndex],this.currentPathIndex);
                this.canvasManager.updatePathData(this.ctrlPointsManager.list,this.canvasManager.listPoints);
                break;
            case this.tools.remove:
                break;
        }
        //this.canvasManager.
    },

    //NOTIFICAIONES SETTINGS SECTION
    notificationOnToolClicked:function(toolId){
        switch(toolId){
            case this.tools.selection:
                this.currentTool=this.tools.selection;
            break;
            case this.tools.add:
                this.currentTool=this.tools.add;
            break;
            case this.tools.remove:
                this.currentTool=this.tools.remove;
            break;
        }
    },
    notificationOnLineWidthChanged:function(value){
        this.canvasManager.setPathLineWidth(value,this.currentPathIndex);
        this.canvasManager.canvas.renderAll();
    },
    notificationOnBtnAddPathClicked:function(){
        this.addPathAtLast();
    },
    notificationOnBtnDeletePathClicked:function(index){
        this.removePathAt(index);
    },  
    notificationOnPathClicked:function(index){
        this.currentPathIndex=index;
    },
})