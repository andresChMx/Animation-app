let EnumAnimableLoadingState={
    "loading":"loading",
    "error":"error",
    "ready":"ready"
}
var ImageAnimable=fabric.util.createClass(fabric.Image,{
    applicableEntranceModes:[EntranceName.image_drawn,EntranceName.none],
    type:'ImageAnimable',
    initialize:function(options){
        this.applicableMenuOptions=[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete,AnimObjectOptionMenu.addMask],
            /*fabric.Object setting*/
        this.left=options.left;
        this.top=options.top;
        this.padding=20;                   //
        this.transparentCorners= false;    //
        this.cornerColor="rgb(0,0,0)";     //
        this.name="ObjectX";               //New fabric property (fabricCustom.js)
        this.centeredRotation=false;       //
        this.originX='custom';             //New fabric property (fabricCustom.js)
        this.originY='custom';             //New fabric property (fabricCustom.js)
        /*FIN -- fabric.Object setting*/


        /*images loading*/
        this.listObserversOnImageStateChanged=[];
        this.imageAssetModel=options.imageAssetModel;           //New Class Property, de aqui solo usamod thumbnail_url, y image_url. Solo las urls
        this.thumbnailImage=options.thumbnailImage;             //New Class Property /*for ui, when appears in lists*/
        this.largeImage=StaticResource.images.loading;          //New Class Property
        this.loadingState=EnumAnimableLoadingState.loading;//New Class Property
        // this.thumbnailLoadingState=EnumAnimableLoadingState.loading;
        this.cbOnThumbnailReady=function(){};
        this.loadImages();
        this.callSuper("initialize",this.largeImage,{})
        /*fin -- images loading*/

        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        this.animator=new Animator(this);           //New fabric property

        //el entranceMode debe estar establecido a drawn antes de generar la imagen final mascarada (la siguiente funcion invocada)

    },
    /*Used by path design editor*/
    getDrawingData:function(){
        return this.entranceBehaviour.dictEntranceModes[EntranceName.image_drawn].drawingData;
    },
    generateFinalMaskedImage:function(){ //called after path editor design is saved
        this.entranceBehaviour.dictEntranceModes[EntranceName.image_drawn].generateFinalMaskedImage();
    },
    /*state images loading methods*/
    loadImages:function(){
        let largeImageSuccessfulLoading=false;
        NetworkManager.loadImage(this.imageAssetModel.url_image).then(function(img){
            this.largeImage=img;
            largeImageSuccessfulLoading=true;
            ready()
        }.bind(this)).catch(function(){
            this.largeImage=StaticResource.images.loadingError;
            ready()
        }.bind(this))

        let self=this;
        function ready(){
            if(largeImageSuccessfulLoading){
                self._setImageLoadingState(EnumAnimableLoadingState.ready);
            }else{
                self._setImageLoadingState(EnumAnimableLoadingState.error);
            }

            self.setElement(self.largeImage);
            self.setCoords();
            self.canvas.renderAll();
        }
    },
    listenOnThumbnailReady:function(callback){
        this.cbOnThumbnailReady=callback;
        if(this.loadingState===EnumAnimableLoadingState.ready){
            this.cbOnThumbnailReady();
        }
    },
    _setImageLoadingState:function(state){
        this.loadingState=state;
        // if(this.loadingState===EnumAnimableLoadingState.ready){
        //     this.cbOnThumbnailReady();
        // }
        this.notifyOnImageStateChanged();
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
    /*fabric overwritten methods*/
    render:function(ctx){
        fabric.Object.prototype.customRenderOffScreen.bind(this)(ctx);
    },
    _render:function(ctx){
        this.entranceBehaviour.renderEntranceEffect(ctx);
    },
    /*observer pattern*/
    registerOnImageStateChanged:function(obj){
        this.listObserversOnImageStateChanged.push(obj);
    },
    notifyOnImageStateChanged:function(){
        for(let i in this.listObserversOnImageStateChanged){
            this.listObserversOnImageStateChanged[i].notificationOnImageStateChanged();
        }
    }
})
let EntranceEffectBehaviour=fabric.util.createClass({
    initialize:function(parentObject,applicableEntranceModes){
        this.parentObject=parentObject;
        this.applicableEntranceModes=applicableEntranceModes;

        this.isActive=false;
        this.entranceModeName=null;       //holds the object's current entrance mode name
        this.entranceMode=null;
        this.dictEntranceModes={};
        this._initApplicableEntranceModes();
        this.setEntranceModeName(this.applicableEntranceModes[0])
    },
    _initApplicableEntranceModes:function(){
        for(let i=0;i<this.applicableEntranceModes.length;i++){
            let entranceModeName=this.applicableEntranceModes[i];
            let classTmp=window[entranceModeName + "EntranceMode"];
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
})








let EntranceMode=fabric.util.createClass({
    initialize:function(parentObject){
        this.parentObject=parentObject;
        /*configuration attributes*/
        this.config={};
        /*fin*/
    },
    /*abstract methods to implement*/
    generateEntranceData:function(callback){},
    clearEntranceData:function(){},
    renderEntranceEffect:function(ctx){}
})

var NoneEntranceMode=fabric.util.createClass(EntranceMode,{
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
    },
    /*implementing abstract methods*/
    generateEntranceData:function(callback){
    },
    clearEntranceData:function(){

    },
    renderEntranceEffect:function(ctx){
        this.parentObject.callSuper("_render",ctx);
    }
})
var DrawnEntranceMode=fabric.util.createClass(EntranceMode,{
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
        this.parentObject.registerOnImageStateChanged(this);

        this.cacheManager=EntranceEffectManagerMap.DrawnEntranceMode;
        this.drawingData=this.generateInitialImageDrawingData();//new Class Property: Holds drawind data for 'drawn' entrance mode

        this.isMyTurnToCopyCache=false;
        this.baseImage=this.parentObject.largeImage;
        this.meanWhileImage=new Image();

    },
    /*implemented inherited methods*/
    renderEntranceEffect:function(ctx){
        if(this.isMyTurnToCopyCache){
            ctx.drawImage(this.cacheManager.canvas,-this.parentObject.width/2,-this.parentObject.height/2);
        }else{
            ctx.drawImage(this.meanWhileImage,-this.parentObject.width/2,-this.parentObject.height/2);
        }
    },
    /*fin*/
    getWidthInDrawingCache:function(){
        return this.baseImage.naturalWidth;
    },
    getHeightInDrawingCache:function(){
        return this.baseImage.naturalHeight;
    },
    generateInitialImageDrawingData:function(){
        return {
            points:[],
            linesWidths:[],
            pathsNames:[],
            strokesTypes:[],
            ctrlPoints:[],
            type:DrawingDataType.CREATED_NOPATH
        }
    },
    setTurnToCopyCache:function(turn,meanwhileImage){
        if(!turn){
            this.meanWhileImage=meanwhileImage;
        }
        this.isMyTurnToCopyCache=turn;
    },
    notificationOnImageStateChanged:function(){
        this.baseImage=this.parentObject.largeImage;
    },
    /* New abstract methods (to be implemented)*/
    getDrawingBaseImage:function(){},
    getDrawingFinalImage:function(){},
    illustrationFunctionOnCache:function(){},
});
var TextDrawnEntranceMode=fabric.util.createClass(DrawnEntranceMode,{
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
        this.dataGenerator=new TextDrawingDataGenerator();
        this.config={
            showHand:true,
        }
    },
    /*Implementing inherited abstract methods*/
    generateEntranceData:function(callback){
        /*meanWhileImage has to be a new image,since it will be set to baseImage or masked image after drawing completion
* And if we just change src attribute, we would be altering baseImage or maskedImage
* We have to set the meanwhileImage var to the empty canvas because we need that while
* it is not its drawing turn this should be rendering an empy transparent image.
* */
        this.meanWhileImage=new Image();
        this.meanWhileImage.src=this.cacheManager.canvas.toDataURL();
        this.isMyTurnToCopyCache=false;

        let pathOpenTypeObjects=[] //for each line we need the path to generate the image
        let result=this.dataGenerator.generateTextDrawingData(this.parentObject,this.getWidthInDrawingCache(),this.getHeightInDrawingCache(),pathOpenTypeObjects);
        this.drawingData = result;
        this.drawingData.type=DrawingDataType.CREATED_NOPATH;

        this.dataGenerator.generateTextBaseImage(this.parentObject,pathOpenTypeObjects,function(image){
            this.baseImage=image;
            callback();
        }.bind(this));

        this.parentObject.objectCaching=false;
    },
    clearEntranceData:function(){
        this.drawingData.points=[];
        this.drawingData.linesWidths=[];
        this.drawingData.ctrlPoints=[];
        this.drawingData.strokesTypes=[];
        this.drawingData.pathsNames=[];

        this.parentObject.objectCaching=true;
    },
    getDrawingBaseImage:function(){
        return this.baseImage;
    },
    getDrawingFinalImage:function(){
        return this.baseImage;
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(baseImage,0,0,canvas.width,canvas.height);
        ctx.globalCompositeOperation="source-in";
        ctx.fill();
        ctx.globalCompositeOperation="source-over";
        ctx.drawImage(prevPathSnapshot,0,0);
    },
    notificationOnImageStateChanged:function(){
        //NOTHING
    },
    /*overwritten methods*/
    getWidthInDrawingCache:function(){
        return this.parentObject.width
    },
    getHeightInDrawingCache:function(){
        return this.parentObject.height;
    },
})
var ImageDrawnEntranceMode=fabric.util.createClass(DrawnEntranceMode,{
    type:"ImageDrawn",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);

        this.maskedImage=this.baseImage;//New Class Property
        this.dataGenerator=new ImageDrawingDataGenerator();
        /*auxiliary attributes*/

        /*configuration attributes*/
        this.config={
            showHand:true,
            finalDrawingAppearance:'masked',  // masked || original
        }
        /*fin*/
    },
    /*overwritten methods*/
    notificationOnImageStateChanged:function(){
        this.baseImage=this.parentObject.largeImage;
        if(this.parentObject.loadingState===EnumAnimableLoadingState.ready){
            this.generateFinalMaskedImage();
        }
    },
    /*Implementing inherited abstract methods*/
    generateEntranceData:function(callback){
        /*meanWhileImage has to be a new image,since it will be set to baseImage or masked image after drawing completion
        * And if we just change src attribute, we would be altering baseImage or maskedImage
        * We have to set the meanwhileImage var to the empty canvas because we need that while
        * it is not its drawing turn this should be rendering an empy transparent image.
        * */

        this.meanWhileImage=new Image();
        this.meanWhileImage.src=this.cacheManager.canvas.toDataURL();
        this.isMyTurnToCopyCache=false;

        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            this.dataGenerator.generateDefaultDrawingPointsAndLineWidth(
                this.baseImage.naturalWidth,
                this.baseImage.naturalHeight,
                this.drawingData,//OUT
                35);

            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
            this.dataGenerator.generateStrokesTypesFromPoints(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
        }
        /*setting up object*/

        callback();
    },
    clearEntranceData:function(){
        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            this.drawingData.points=[];
            this.drawingData.linesWidths=[];
            this.drawingData.ctrlPoints=[];
            this.drawingData.strokesTypes=[];
            this.drawingData.pathsNames=[];
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.drawingData.ctrlPoints=[];
        }
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(baseImage,0,0,canvas.width,canvas.height)
        ctx.globalCompositeOperation="destination-in";
        ctx.stroke();
        ctx.globalCompositeOperation="source-over";
        ctx.drawImage(prevPathSnapshot,0,0);
    },
    getDrawingBaseImage:function(){
        return this.baseImage;
    },
    getDrawingFinalImage:function(){
        if(this.config.finalDrawingAppearance==="masked"){
            return this.maskedImage;
        }else{
            return this.baseImage;
        }

    },

    /* new custom methods*/
    generateFinalMaskedImage:function(){

        let canvas=document.createElement("canvas");
        let ctx=canvas.getContext("2d");
        // Generating drawing data if necessary, se estan limpiando los ctrlPoints al final, en caso fueron generados
        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            // canvas.width=this.baseImage.naturalWidth;
            // canvas.height=this.baseImage.naturalHeight;
            // ctx.drawImage(this.baseImage,0,0);
            // this.maskedImage=new Image();
            // this.maskedImage.src=canvas.toDataURL();
            // canvas.remove();
            this.maskedImage=this.baseImage.cloneNode();
            return;
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
        }
        // lo siguiente es porque se puede invocar a esta funcion aun estando en otro entrance mode diferente a uno de tipo drawn, ya que se puede entrar al editor de paths desde cualquier modo
        // pero obviamente al final de ejecutar el pathIllustrator debemos devolverlo a como estaba
        let tmpCurrentEntranceMode=this.parentObject.entranceBehaviour.getCurrentEntranceModeName();
        if(tmpCurrentEntranceMode!==this.type){
            this.parentObject.entranceBehaviour.setEntranceModeName(this.type);
        }

        let illustratorDataAdapterCache=new IllustratorDataAdapterCache([this.parentObject]);
        let pathIllustrator=new PathIllustrator(canvas,ctx,illustratorDataAdapterCache,false);
        pathIllustrator.generateFinalImage(function(dataUrl){
            /*  DEBUGGIN PURPOSES*/
            // var link = document.createElement("a");
            // link.download = name;
            // link.href = dataUrl;
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            // delete link;

            this.maskedImage=new Image();
            this.maskedImage.src=dataUrl;
            //CLEANING
            canvas.remove();
            this.drawingData.ctrlPoints=[];
            this.parentObject.entranceBehaviour.setEntranceModeName(tmpCurrentEntranceMode); // restoring animable object entrance mode
        }.bind(this))
    }
})
var SVGDrawnEntranceMode=fabric.util.createClass(ImageDrawnEntranceMode,{
    type:"SVGDrawn",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);

        this.dataGenerator=new ImageDrawingDataGenerator();
        this.dataGeneratorForSVG=new SVGAnimableDataGenerator(); /*used in case of "fillRevealMode"==="drawn_fill"*/
        //auxiliary variables (not storing)
        this.auxEntranceDuration=0; // stores entrance effect duration value temporarily
        this.lastIndexTruePath=0;   //  used for fill reveal mode "fill_drawn"
        //
        // /*configuration parameters*/
        this.config={
            showHand:true,
            forceStrokeDrawing:true,
            fillRevealMode:'fadein',  // // fadein || drawn_fill || no-fill
        }
    },
    /*Implementing inherited abstract methods*/
    generateEntranceData:function(callback){
        this.meanWhileImage=new Image();
        this.meanWhileImage.src=this.cacheManager.canvas.toDataURL();
        this.isMyTurnToCopyCache=false;
        this.parentObject.fadeInTransitionOpacity=0;

        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            this.dataGeneratorForSVG.generateDrawingData(
                this.parentObject.svgString,
                this.parentObject.width,
                this.parentObject.height,
                this.config.forceStrokeDrawing,
                function(svgDrawingData,indexFinalTrueLayer){
                    //indexFinalTruelayer sera -1 si no hubo ningun true path, es decir todos son reveal paths. O si estubo en modo no-force y no encontro true paths
                    this.lastIndexTruePath=indexFinalTrueLayer;

                    if(this.config.fillRevealMode==="drawn_fill"){
                        if(this.lastIndexTruePath===svgDrawingData.points.length-1){
                            this.dataGenerator.generateDefaultDrawingPointsAndLineWidth(
                                this.baseImage.naturalWidth,
                                this.baseImage.naturalHeight,
                                svgDrawingData,//OUT
                                35);
                            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                                svgDrawingData.points,
                                svgDrawingData /*OUT*/
                            );
                            this.dataGenerator.generateStrokesTypesFromPoints(
                                svgDrawingData.points,
                                svgDrawingData /*OUT*/
                            );
                            this.dataGenerator.generateMissingLinesColors(
                                indexFinalTrueLayer,
                                svgDrawingData/*OUT*/
                            );
                        }
                    }else{// in case config.fillRevealMode !== drawn_fill we do not need revealing paths
                        this.lastIndexTruePath=this.lastIndexTruePath===-1?0:this.lastIndexTruePath//FIX BUG, -1 index, causo un bucle infino en el siguiente loop
                        for(let i=this.lastIndexTruePath;i<svgDrawingData.points.length;i++){
                            for(let j in svgDrawingData){
                                svgDrawingData[j].splice(i,1);
                            }
                            i--;
                        }

                        if(this.config.fillRevealMode==="fadein"){
                            this._addFadeinAnimationToObject();
                        }
                        if(this.config.fillRevealMode==="no-fill"){

                        }
                    }

                    svgDrawingData.type=this.drawingData.type;/*CREATED_NOPATH*/
                    this.drawingData=svgDrawingData;

                    callback();
                }.bind(this)
            );
        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
            callback();
        }
    },
    clearEntranceData:function(){/*in addition */
        if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            this.drawingData.points=[];
            this.drawingData.linesWidths=[];
            this.drawingData.ctrlPoints=[];
            this.drawingData.strokesTypes=[];
            this.drawingData.pathsNames=[];

            /*this is the addicional block, cleaning aditional data related to svganimables only*/
            if(this.config.fillRevealMode==="drawn_fill"){}
            else if(this.config.fillRevealMode==="fadein"){
                this._removeFadeInAnimationOfObject();
            }else if(this.config.fillRevealMode==="no-fill"){}

        }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            this.drawingData.ctrlPoints=[];
        }

    },
    renderEntranceEffect:function(ctx){/*it has severely more funcionalities */
        if(this.isMyTurnToCopyCache){
            if(this.parentObject.fadeInTransitionOpacity!==0){
                let currentGlobalAlpha=ctx.globalAlpha;
                ctx.globalAlpha=currentGlobalAlpha*this.parentObject.fadeInTransitionOpacity;
                ctx.drawImage(this.baseImage,-this.parentObject.width/2,-this.parentObject.height/2)

                let negativeAlpha=1-this.parentObject.fadeInTransitionOpacity;

                ctx.globalAlpha=currentGlobalAlpha*negativeAlpha;
                ctx.drawImage(this.cacheManager.canvas,-this.parentObject.width/2,-this.parentObject.height/2);
                ctx.globalAlpha=currentGlobalAlpha;
            }else{
                ctx.drawImage(this.cacheManager.canvas,-this.parentObject.width/2,-this.parentObject.height/2);
            }
        }else{
            ctx.drawImage(this.meanWhileImage,-this.parentObject.width/2,-this.parentObject.height/2);
        }
    },
    getDrawingFinalImage:function(){/*insted of returning one or the other regarding one configuration varible, now it is done regarding the image has a path designed or not*/
        if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            return this.maskedImage;
        }else if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
            return this.baseImage;
        }
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
        if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
            ImageDrawnEntranceMode.prototype.illustrationFunctionOnCache(canvas,ctx,baseImage,prevPathSnapshot,indexLayer);
        }else if(indexLayer<=this.lastIndexTruePath){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.stroke();
            ctx.drawImage(prevPathSnapshot,0,0);
        }
        else if(this.config.fillRevealMode==="drawn_fill"){
            ctx.strokeStyle="red";
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(baseImage,0,0,canvas.width,canvas.height);
            ctx.globalCompositeOperation="destination-in";
            ctx.stroke();
            ctx.globalCompositeOperation="source-over";
            ctx.drawImage(prevPathSnapshot,0,0);
        }
    },
    // /*new Custom methods*/
    _addFadeinAnimationToObject:function(){
        this.auxEntranceDuration=this.parentObject.animator.entranceTimes.duration;
        let fadeinDuration=this.parentObject.animator.entranceTimes.duration*0.2;
        let newEntranceDuration=this.parentObject.animator.entranceTimes.duration-fadeinDuration;
        this.parentObject.animator.entranceTimes.duration=newEntranceDuration;
        this.parentObject.animator.entranceTimes.transitionDelay=fadeinDuration;
        let startMoment=this.parentObject.animator.entranceTimes.startTime+this.parentObject.animator.entranceTimes.delay+newEntranceDuration;
        let endMoment=startMoment+fadeinDuration;
        if(this.parentObject.animator.dictHiddenAnimations["fadeInTransitionOpacity"].length>0){alert("ERROR: SE INTENTO REGISTRAR ANIMMACION DE FADEIN CUANDO YA HABIA UNA");return;}
        this.parentObject.animator.addHiddenAnimation("fadeInTransitionOpacity",0,1,startMoment,endMoment,EnumAnimationEasingType.InOut,EnumAnimationTweenType.Sine);
    },
    _removeFadeInAnimationOfObject:function(){
        this.parentObject.animator.entranceTimes.transitionDelay=0;
        this.parentObject.animator.entranceTimes.duration=this.auxEntranceDuration;
        this.parentObject.animator.removeHiddenAnimation("fadeInTransitionOpacity",0);
    },

    // generateFinalMaskedImage:function(){/*este metodo es exactamente igual al de imagedrawnentrancemode*/
    //     let tmpCurrentEntranceMode=this.parentObject.entranceBehaviour.getCurrentEntranceModeName();
    //     if(tmpCurrentEntranceMode!==this.type){
    //         this.parentObject.entranceBehaviour.setEntranceModeName(this.type);
    //     }
    //
    //     let canvas=document.createElement("canvas");
    //     let ctx=canvas.getContext("2d");
    //     // Generating drawing data if necessary, se estan limpiando los ctrlPoints al final, en caso fueron generados
    //     if(this.drawingData.type===DrawingDataType.CREATED_NOPATH){
    //         canvas.width=this.baseImage.naturalWidth;
    //         canvas.height=this.baseImage.naturalHeight;
    //         ctx.drawImage(this.baseImage,0,0);
    //         this.maskedImage=new Image();
    //         this.maskedImage.src=canvas.toDataURL();
    //         canvas.remove();
    //         return;
    //     }else if(this.drawingData.type===DrawingDataType.CREATED_PATHDESIGNED){
    //         this.dataGeneratorImage.generateCrtlPointsFromPointsMatrix(
    //             this.drawingData.points,
    //             this.drawingData /*OUT*/
    //         );
    //     }
    //     let illustratorDataAdapterCache=new IllustratorDataAdapterCache([this.parentObject]);
    //     let pathIllustrator=new PathIllustrator(canvas,ctx,illustratorDataAdapterCache,false);
    //     pathIllustrator.generateFinalImage(function(dataUrl){
    //         this.maskedImage=new Image();
    //         this.maskedImage.src=dataUrl;
    //         //CLEANING
    //         canvas.remove();
    //         this.drawingData.ctrlPoints=[];
    //         this.parentObject.entranceBehaviour.setEntranceModeName(tmpCurrentEntranceMode); // restoring animable object entrance mode
    //     }.bind(this))    }
})


/*--------save upload state---------*/
ImageAnimable.toObject = (function(toObject) {

    return function() {
        return fabric.util.object.extend(toObject.call(this), {
            name: this.name,

        });
    };
})(ImageAnimable.toObject);