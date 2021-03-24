global.EntranceEffectBehaviour=fabric.util.createClass({
    initialize:function(parentObject,applicableEntranceModes){
        this.parentObject=parentObject;
        this.applicableEntranceModes=applicableEntranceModes;

        this.isActive=false;               //indicates whether should start rendering effect
        this.entranceModeName=null;       //holds the object's current entrance mode name
        this.entranceMode=null;
        this.dictEntranceModes={};
        this._initApplicableEntranceModes();
        this.setEntranceModeName(this.applicableEntranceModes[0])
    },
    _initApplicableEntranceModes:function(){
        for(let i=0;i<this.applicableEntranceModes.length;i++){
            let entranceModeName=this.applicableEntranceModes[i];
            let classTmp=global[entranceModeName + "EntranceMode"];
            this.dictEntranceModes[entranceModeName]=new classTmp(this.parentObject);
        }
    },
    setEntranceModeName:function(mode){
        this.entranceModeName=mode;
        this.entranceMode=this.dictEntranceModes[mode];
    },
    getCurrentEntranceModeName:function(){
        return this.entranceModeName;
    },
    getEntranceModeConfigByName:function(entranceModeName){
        return this.dictEntranceModes[entranceModeName].config;
    },
    renderEntranceEffect:function(ctx){
        if(this.isActive){
            this.entranceMode.renderEntranceEffect(ctx);
        }else{
            this.parentObject.callSuper("_render",ctx);
        }
    },
    wakeup:function(callback){
        this.isActive=true;
        this.entranceMode.generateEntranceData(callback);
    },
    sleep:function(){
        this.isActive=false;
        this.entranceMode.clearEntranceData();
    },
    toObject:function(){
        let self=this;
        let dictEntranceModes={};
        for(let key in this.dictEntranceModes){
            dictEntranceModes[key]=this.dictEntranceModes[key].toObject();
        }
        return {
            entranceModeName:self.entranceModeName,
            dictEntranceModes:dictEntranceModes
        }
    },
    fromObject:function(object){
        for(let key in this.dictEntranceModes){
            this.dictEntranceModes[key].fromObject(object.dictEntranceModes[key]);
        }
        this.setEntranceModeName(object.entranceModeName);
    }
})




