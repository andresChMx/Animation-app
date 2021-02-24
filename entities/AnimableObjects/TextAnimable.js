var TextAnimable=fabric.util.createClass(fabric.IText, {// NO heredamos de imageAnimable porque solo podemos heredar de una clase
    //drawn y text_draw NO son lo mismo, ya que su logica es diferente
    applicableEntranceModes: [EntranceName.text_drawn,EntranceName.none/*,EntranceName.dragged,EntranceName.text_typed**/],//FOR UI

    type:"TextAnimable",
    initialize:function(text,options){
        /*exact copy of animable object*/
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask];

            this.name="Text";
        this.originX="custom";
        this.originY="custom";
        this.fontFamily=options.fontFamily;
        this.callSuper('initialize', text,options);
        this.centeredRotation=false;
        this.fill="#000000";

        this.cbOnThumbnailStateChanged=function(){};
        this.thumbnailImage=StaticResource.images.textThumbnail;
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
    }
});
