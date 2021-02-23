var CameraAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntranceModes:[EntranceName.none],//FOR UI
    applicableMenuOptions:[],
    type:"CameraAnimable",
    initialize:function(element,options){
        this.name="Camera";
        this.callSuper("initialize",element,options);

        /*fabric.Object selection appearance configuration*/
        this.lockUniScaling=true;
        this.setControlsVisibility({"pivot":false});
        this.cornerStyle="rect";
        this.cornerColor="rgba(200,100,0,0.9)"
        this.cornerSize=20;


        //entrace animaction related
        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);


        //preview canvas animation related
        this.started=false;
        this.canvasCamera=null;

        this.animator=new AnimatorCamera(this,this.canvasCamera);
    },

    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },
    /*Inspector main Object list, items options actions*/
    setLockState:function(val){
        this.selectable=!val;
        this.evented=!val;
    },
    getLockState:function(){
        return !this.selectable;
    },
    setVisibilityState:function(val){
        this.visible=val;
        this.selectable=val;
        this.evented=val;
    },
    getVisibilityState:function(){
        return this.visible;
    },

})