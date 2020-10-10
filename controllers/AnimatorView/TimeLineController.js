var TimeLineController=fabric.util.createClass({
    initialize:function(){
        this.totalDuration=3000;
        this.totalProgress=0;

        this.animStartTime;
        this.animFinishTime;
        this.flagDoLastUpdate;
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
        CanvasManager.canvas.renderAll();
    },
    notificationOnMarkerDragged:function(newProgress){
        this.setTotalProgress(newProgress);
    },
    playAnimation:function(){
        this.animStartTime= +new Date();
        this.animFinishTime= this.animStartTime + (this.totalDuration-this.totalProgress);
        this.flagDoLastUpdate=true;
        this._loop();
    },
    stopAnimation:function(){
        fabric.util.cancelAnimFrame();
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
                CanvasManager.canvas.renderAll();
                if(time>self.animFinishTime){self.flagDoLastUpdate=false;}
                fabric.util.requestAnimFrame(tick)
            }
            else{
              //termino animacion
            }
        }())

    },
    _updateObjectsAccordAnims:function(self){
        for(var i=0;i<CanvasManager.listAnimableObjects.length;i++){
            if(CanvasManager.listAnimableObjects[i].hasAnimations()){
                CanvasManager.listAnimableObjects[i].executeAnimations(self.totalProgress);
              //console.log(listAnimableObjects[i].listAnimations.length);
            }else{
              //no hacer nada
            }
        }
    }
})