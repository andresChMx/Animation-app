var ControllerAnimator=fabric.util.createClass({
    EnumStates:{playing:"playing",paused:"paused"},
    initialize:function(canvasToDisplay){
        this.canvasToDisplay=canvasToDisplay;

        this.cbOnStateChanged=function(){};
        // With this two methods one can know the progress value at any time
        this.cbOnTickProgress=function(){};//triggered when progress is updated by the loop, meaning the animation is playing
        this.cbOnNewProgress=function(){}; // triggered when progress is setted explicitly, by an external entity

        this.objectsToAnimate=[];
        this.totalDuration=9000;
        this.totalProgress=0;

        this.animStartTime;
        this.animFinishTime;
        this.flagDoLastUpdate;

        this.requestAnimFrameID=null;

        this.state=global.ControllerAnimatorState.paused; //playing, paused,
    },
    setListObjectsToAnimate:function(list){
        this.objectsToAnimate=list;
    },
    setTotalDuration:function(valDuration){
        this.totalDuration=valDuration;
    },
    _setState:function(state){
        this.state=state;
        this.cbOnStateChanged(this.state);
    },

    setTotalProgress:function(valProgress){
        if(valProgress>this.totalDuration){
            valProgress=this.totalDuration;
            //alert("Advertancia: valor pasado mayor a la duracion total");
        }else if(valProgress<0){
            valProgress=0;
            //alert("Advertencia: valor pasado menor a 0");
        }
        this.totalProgress=valProgress;
        this._updateObjectsAccordAnims(this);
        this.canvasToDisplay.renderAll();
        this.cbOnNewProgress(valProgress);
    },
    playAnimation:function(){
        if(this.requestAnimFrameID!=null){alert("SE LLAMO CUANDO YA ESTABA EN APLAY EL ANIMATOR");return;}
        this._setState(global.ControllerAnimatorState.playing);
        this._calcTimingValuesForLoop();
        this._loop();
    },
    _calcTimingValuesForLoop:function(){
        this.animStartTime= +new Date();
        this.animFinishTime= this.animStartTime + (this.totalDuration-this.totalProgress);
        this.flagDoLastUpdate=true;

        this.animStartTime-=this.totalProgress;
    },
    stopAnimation:function(){
        if(this.requestAnimFrameID!=null){
            this._setState(global.ControllerAnimatorState.paused);
            fabric.util.cancelAnimFrame(this.requestAnimFrameID);
            this.requestAnimFrameID=null;
        }
    },
    _loop:function(){
        let self=this;
        (function tick(){
            let time= +new Date();
            self.totalProgress=time>self.animFinishTime?self.totalDuration:time-self.animStartTime;
            if(!(time>self.animFinishTime) || self.flagDoLastUpdate){
                self._updateObjectsAccordAnims(self);
                self.canvasToDisplay.renderAll();
                if(time>self.animFinishTime){self.flagDoLastUpdate=false;}
                self.requestAnimFrameID=fabric.util.requestAnimFrame(tick)
            }
            else{
                //termino animacion
                self.stopAnimation();
            }
            self.cbOnTickProgress(self.totalProgress);

        }())

    },
    _updateObjectsAccordAnims:function(self){
        for(var i=0;i<this.objectsToAnimate.length;i++){
            this.objectsToAnimate[i].animator.executeAnimations(self.totalProgress);
        }
    },
    /*methods for suscribing callbacks*/
    onTick:function(callback){
        this.cbOnTickProgress=callback;
    },
    onStateChanged:function(callback){
        this.cbOnStateChanged=callback;
    },
    onNewProgress:function(callback){
        this.cbOnNewProgress=callback;
    }
})