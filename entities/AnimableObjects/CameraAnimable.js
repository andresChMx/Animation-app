var CameraAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntranceModes:[EntranceName.none],//FOR UI
    applicableMenuOptions:[],
    applicableAnimationProperties:["position","scale","rotation","opacity"],
    applicableCanvasManagerCollections:[
        EnumCollectionsNames.animObjs,
        EnumCollectionsNames.animObjsWithEntrance,
    ],
    type:"CameraAnimable",
    initialize:function(element,options){
        if(!options){options={};}
        if(!element){element=null;}
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
    toObject:function(){
        var object = fabric.util.object.extend(
            fabric.Object.prototype.toObject.call(this)
            ,{
                name:this.name,
                entranceBehaviour:this.entranceBehaviour.toObject(),
                animator:this.animator.toObject()
            });

        return object;
    }
});

CameraAnimable.fromObject=function(object,callback){
    let newCameraAnimable=CameraAnimable.createInstance(0,0)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

    /*hack to avoid overwritting entraceBehaviour and animator once these are initialized with object initialization*/
    let entranceBehaviourObject=object.entranceBehaviour;
    let animatorObject=object.animator;
    delete object.entranceBehaviour;
    delete object.animator;

    newCameraAnimable.setOptions(object);//suposed to set object state
    newCameraAnimable.entranceBehaviour.fromObject(entranceBehaviourObject);
    newCameraAnimable.animator.fromObject(animatorObject);

    callback(newCameraAnimable,false);
},
/*====================================*/
/*======== Object creation ===========*/
/*====================================*/
/*these next two methods are called separetely if object is cloned or loaded*/
CameraAnimable.createInstance=function(left,top){
    let newObjectAnimable=new CameraAnimable(StaticResource.images.camera,{
        left:left,
        top:top,
        width:1400,
        height:800,
    });
    return newObjectAnimable;
};
CameraAnimable.instanceSetupInCanvasManager=function(instance,collectionName){
    let contains=this.prototype.applicableCanvasManagerCollections.indexOf(collectionName);
    if(contains>-1){
        CanvasManager.collections[collectionName].add(instance);
    }
}
CameraAnimable.removeInstance=function(instance){
    this.prototype.applicableCanvasManagerCollections.forEach(function(elem){
        CanvasManager.collections[elem].remove(instance)
    })
}
