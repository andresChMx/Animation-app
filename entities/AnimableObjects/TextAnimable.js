var TextAnimable=fabric.util.createClass(fabric.IText, {// NO heredamos de imageAnimable porque solo podemos heredar de una clase
    //drawn y text_draw NO son lo mismo, ya que su logica es diferente
    applicableEntranceModes: [EntranceName.text_drawn,EntranceName.none/*,EntranceName.dragged,EntranceName.text_typed**/],//FOR UI
    applicableAnimationProperties:["position","scale","rotation","opacity"],
    applicableCanvasManagerCollections:[
        EnumCollectionsNames.renderingObjs,
        EnumCollectionsNames.animObjs,
        EnumCollectionsNames.animObjsWithEntrance,
    ],
    type:"TextAnimable",
    initialize:function(text,options){
        if(!options){options={}}
        if(!text){text=""}
        /*exact copy of animable object*/
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];
        /*selection,transforming styling*/
        this.padding=10;
        this.transparentCorners= false;    //
        this.cornerColor="rgb(0,0,0)";     //
        this.name="Text";               //New fabric property (fabricCustom.js)
        this.centeredRotation=false;       //

        this.fontFamily=options.fontFamily;
        this.callSuper('initialize', text,options);

        this.fill="#000000";

        this.cbOnThumbnailStateChanged=function(){};
        this.thumbnailImage=StaticResource.images.textThumbnail.cloneNode();
        this.thumbnailLoadingState=EnumAnimableLoadingState.ready;
        // this.largeImage=null;

        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        this.animator=new Animator(this);

        this.setFontSize(72);
        this.setFontFamily(options.fontFamily);
        /*---------------------------*/
    },//exitEditing

    setFontFamily:function(fontname){ //Cargando Font Object y guardandolo, solo si aun no esta cargado
        if(!FontsFileName[fontname]){fontname=Object.keys(FontsFileName)[0];} //validando que nombre sea uno valido

        this.fontFamily=fontname;
        OpenTypeFontManager.LoadOpenTypeFont(FontsFileName[fontname]);
    },
    setFontSize:function(size){
        this.fontSize=size;
        //this.exitEditing();
        if(this.canvas){//en cuanto es inicializado aun no tiene asignado un canvas, hasta que se llame a add en su canvas padre
            this.canvas.renderAll();
        }
    },

    render:function(ctx){
        fabric.Object.prototype.customRenderOffScreen.bind(this)(ctx);
    },
    _render:function(ctx){
        this.entranceBehaviour.renderEntranceEffect(ctx);
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
    applyClipping:function(animObject){
        this.clipPath=animObject;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===AnimObjectOptionMenu.addMask){
                this.applicableMenuOptions[i]=AnimObjectOptionMenu.removeMask;
                break;
            }
        }
    },
    removeClipping:function(){
        this.clipPath=null;
        this.dirty=true;
        for(let i=0;i<this.applicableMenuOptions.length;i++){
            if(this.applicableMenuOptions[i]===AnimObjectOptionMenu.removeMask){
                this.applicableMenuOptions[i]=AnimObjectOptionMenu.addMask;
                break;
            }
        }
    },
    /*observer pattern*/
    registerOnImageStateChanged:function(obj){

    },
    listenOnThumbnailStateChanged:function(callback){
        this.cbOnThumbnailStateChanged=callback;
        if(this.thumbnailLoadingState!==EnumAnimableLoadingState.loading){
            this.cbOnThumbnailStateChanged(this.thumbnailLoadingState,this.thumbnailImage);
        }
    },
    toObject:function(){
        var object = fabric.util.object.extend(
            this.callSuper("toObject")
            , {
                applicableMenuOptions:this.applicableMenuOptions,
                name:this.name,

                pivotX:this.pivotX,
                pivotY:this.pivotY,
                pivotCornerX:this.pivotCornerX,
                pivotCornerY:this.pivotCornerY,

                entranceBehaviour:this.entranceBehaviour.toObject(),
                animator:this.animator.toObject()
            });

        delete object.clipPath; // temporal, ya que Object.toObject lo igualara al toObject de clipPath, si es que hay
        if(this.clipPath){
            object.clipPath=CanvasManager.getListIndexClipperObjects(this.clipPath);
            if(object.clipPath===-1){alert("BUGGGy7543");}// si es que tienes un clippath este tiene que estar en la lista del canvasManager si o sii, algo anda mall
        }

        return object;
    },
    clone:function(callback){
        let object=this.toObject();
        TextAnimable.cloneFromObject(
            object,
            callback)
    }
});
/*===============================*/
/*=====  Static functions  ======*/
/*===============================*/
/*Object loading*/
TextAnimable.cloneFromObject = function(_object, callback) {
    var object = fabric.util.object.clone(_object,true);
    /*initializing with no state*/
    let fakeModel={fontFamily:object.fontFamily}
    let newTextShapeAnimable=TextAnimable.createInstance(0,0,fakeModel)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

    newTextShapeAnimable.setOptions(object)

    if(object.hasOwnProperty("clipPath")){
        newTextShapeAnimable.clipPath=CanvasManager.collections.animObjsClippers.list[object.clipPath];
    }

    newTextShapeAnimable.entranceBehaviour=new EntranceEffectBehaviour(newTextShapeAnimable,newTextShapeAnimable.applicableEntranceModes);
    newTextShapeAnimable.animator=new Animator(newTextShapeAnimable);           //New fabric property
    newTextShapeAnimable.entranceBehaviour.fromObject(object.entranceBehaviour);
    newTextShapeAnimable.animator.fromObject(object.animator);

    callback(newTextShapeAnimable);
};
TextAnimable.fromObject=function(object,callback){
    let fakeModel={fontFamily:object.fontFamily}
    /*initializing with no state*/
    let newInstance=TextAnimable.createInstance(0,0,fakeModel)//ya no pasamos nada, ya que setOptions(mas abajo) setteara todas las propiedades

    let entranceBehaviourObject=object.entranceBehaviour;
    let animatorObject=object.animator;
    delete object.entranceBehaviour;
    delete object.animator;

    newInstance.setOptions(object);//suposed to set object state

    newInstance.entranceBehaviour.fromObject(entranceBehaviourObject);
    newInstance.animator.fromObject(animatorObject);

    if(object.hasOwnProperty("clipPath")){
        newInstance.indexUnresolvedClipPath=object.clipPath;
    }

    callback(newInstance,false);
}
/*====================================*/
/*======== Object creation ===========*/
/*====================================*/
/*the next two methods are called separetely if object is cloned or loaded*/
TextAnimable.createInstance=function(left,top,assetModel){/*fake model, since it will only contain fontFamily*/
    let newObjectAnimable=new TextAnimable("Sample Text",{
        left:left,
        top:top,
        fontFamily:assetModel.fontFamily,
    });

    newObjectAnimable.setCoords();
    newObjectAnimable.exitEditing();

    return newObjectAnimable;
}
TextAnimable.instanceSetupInCanvasManager=function(instance,collectionName){
    let contains=this.prototype.applicableCanvasManagerCollections.indexOf(collectionName);
    if(contains>-1){
        CanvasManager.collections[collectionName].add(instance);
    }
}
TextAnimable.removeInstance=function(instance){
    this.prototype.applicableCanvasManagerCollections.forEach(function(elem){
        CanvasManager.collections[elem].remove(instance)
    })
}
