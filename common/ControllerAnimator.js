var ControllerAnimator=fabric.util.createClass({
    initialize:function(canvasToDisplay,parentClass){
        this.parentClass=parentClass;
        this.canvasToDisplay=canvasToDisplay;
        this.objectsToAnimate=[];
        this.totalDuration=9000;
        this.totalProgress=0;

        this.animStartTime;
        this.animFinishTime;
        this.flagDoLastUpdate;

        this.requestAnimFrameID=null;
    },
    setListObjectsToAnimate:function(list){
        this.objectsToAnimate=list;
    },
    setTotalDuration:function(valDuration){
        this.totalDuration=valDuration;
    },
    setTotalProgress:function(valProgress){
        if(valProgress>this.totalDuration){
            valProgress=this.totalDuration;
            alert("Advertancia: valor pasado mayor a la duracion total");
        }else if(valProgress<0){
            valProgress=0;
            alert("Advertencia: valor pasado menor a 0");
        }
        this.totalProgress=valProgress;
        this._updateObjectsAccordAnims(this);
        this.canvasToDisplay.renderAll();
    },
    playAnimation:function(){

        this.animStartTime= +new Date();
        this.animFinishTime= this.animStartTime + (this.totalDuration-this.totalProgress);
        this.flagDoLastUpdate=true;

        this.animStartTime-=this.totalProgress;
        this._loop();
    },
    stopAnimation:function(){
        if(this.requestAnimFrameID!=null){
            fabric.util.cancelAnimFrame(this.requestAnimFrameID);
            this.requestAnimFrameID=null;
        }
    },
    calcNormalizedTotalProgress:function(){
      return this.totalProgress/this.totalDuration;
    },
    _loop:function(){
        let self=this;
        (function tick(){
            let time= +new Date();
            self.totalProgress=time>self.animFinishTime?self.totalDuration:time-self.animStartTime;
            //console.log(timelineCurrentTime);
            if(!(time>self.animFinishTime) || self.flagDoLastUpdate){
                self._updateObjectsAccordAnims(self);
                self.parentClass.childNotificationOnAnimatorTick(self.calcNormalizedTotalProgress());
                //onAnimFrame();
                //CanvasManager.canvas.renderAll();
                self.canvasToDisplay.renderAll();
                if(time>self.animFinishTime){self.flagDoLastUpdate=false;}
                self.requestAnimFrameID=fabric.util.requestAnimFrame(tick)
            }
            else{
              //termino animacion
              //self.setTotalProgress(0);
            }
        }())

    },
    _updateObjectsAccordAnims:function(self){
        for(var i=0;i<this.objectsToAnimate.length;i++){
            //if(this.objectsToAnimate[i].animator.hasAnimations()){

                this.objectsToAnimate[i].animator.executeAnimations(self.totalProgress);
                //if (!this.objectsToAnimate[i].isOnScreen()) {
                //}
              //console.log(listAnimableObjects[i].listAnimations.length);
            //}else{
              //no hacer nada
            //}
        }
    }
})