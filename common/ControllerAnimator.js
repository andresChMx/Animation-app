var ControllerAnimator=fabric.util.createClass({
    initialize:function(canvasToDisplay,objectsToAnimate){
        this.canvasToDisplay=canvasToDisplay;
        this.objectsToAnimate=objectsToAnimate;
        this.totalDuration=9000;
        this.totalProgress=0;

        this.animStartTime;
        this.animFinishTime;
        this.flagDoLastUpdate;

        this.requestAnimFrameID=null;
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

    _loop:function(){
        let self=this;
        (function tick(){
            let time= +new Date();
            self.totalProgress=time>self.animFinishTime?self.totalDuration:time-self.animStartTime;
            //console.log(timelineCurrentTime);
            if(!(time>self.animFinishTime) || self.flagDoLastUpdate){
                self._updateObjectsAccordAnims(self);
                //onAnimFrame();
                //CanvasManager.canvas.renderAll();
                self.canvasToDisplay.renderAll();
                if(time>self.animFinishTime){self.flagDoLastUpdate=false;}
                self.requestAnimFrameID=fabric.util.requestAnimFrame(tick)
            }
            else{
              //termino animacion
              self.setTotalProgress(0);
            }
        }())

    },
    _updateObjectsAccordAnims:function(self){
        for(var i=0;i<this.objectsToAnimate.length;i++){
            if(this.objectsToAnimate[i].hasAnimations()){
                this.objectsToAnimate[i].executeAnimations(self.totalProgress);
              //console.log(listAnimableObjects[i].listAnimations.length);
            }else{
              //no hacer nada
            }
        }
    }
})