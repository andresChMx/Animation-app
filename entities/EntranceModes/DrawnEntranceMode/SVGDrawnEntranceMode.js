global.SVGDrawnEntranceMode=fabric.util.createClass(global.ImageDrawnEntranceMode,{
    type:"SVGDrawn",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);

        this.dataGenerator=new ImageDrawingDataGenerator();
        this.dataGeneratorForSVG=new SVGAnimableDataGenerator(); /*used in case of "fillRevealMode"==="drawn_fill"*/
        //auxiliary variables (not storing)
        this.auxEntranceDuration=0; // stores entrance effect duration value temporarily
        this.lastIndexTruePath=0;   //  used for fill reveal mode "fill_drawn"
        this.finalImageBitmap=null; // (baseImage replacement)TEMPORAL SOLUTION TO ABRUPT CHANGE FROM BITMAP TO VECTOS AT THE END OF SVG AUTOMATIC DRAWING. stores the bitmap version of the base vector image. Used when drawing and no paths were crated
        this.cachesScalerFactor=2.5; // solution for pixeled svg images,

        this.cacheWidth=0;
        this.cacheHeight=0;
        // /*configuration parameters*/
        let self=this;
        this.config={
            drawingHandName:self.cacheManager.drawingHand.defaultDrawingHandName,
            showHand:true,
            forceStrokeDrawing:true,
            fillRevealMode:'fadein',  // // fadein || drawn_fill || no-fill
        }


    },
    /*overwritten methods*/
    notificationOnAssetStateReady:function(){
        this.baseImage=this.parentObject.largeImage;
        if(this.parentObject.imageLoadingState===global.EnumAssetLoadingState.ready){
            //the finalMasked iamge will be generated if paths are created. But now the need
            //to have a pixels version of the image to avoid gross behavious al the end of drawing
            //in no-paths version of the drawing(pasaba de pixeles a vectores)
            this._calcCacheWidth();
            this._calcCacheHeight()
            this.generateBitmapSVGFinalImage();
            this.generateFinalMaskedImage(); /*necesary then this object is a clone*/
        }
    },
    generateBitmapSVGFinalImage:function(){ //
        let canvas=fabric.util.createCanvasElement();
        let ctx=canvas.getContext("2d");

        canvas.width=this.getWidthInDrawingCache();
        canvas.height=this.getHeightInDrawingCache();
        ctx.drawImage(this.baseImage,0,0,this.getWidthInDrawingCache(),this.getHeightInDrawingCache());
        this.finalImageBitmap=new Image();
        this.finalImageBitmap.src=canvas.toDataURL();
        canvas.remove();
    },
    getWidthInDrawingCache:function(){
        return this.cacheWidth;
    },
        _calcCacheWidth:function(){
            if(this.baseImage.naturalWidth<1000){
                this.cacheWidth=this.baseImage.naturalWidth*3;
            }else if(this.baseImage.naturalWidth<2000){
                this.cacheWidth=this.baseImage.naturalWidth*2;
            }else{
                this.cacheWidth=this.baseImage.naturalWidth;
            }
        },
    getHeightInDrawingCache:function(){
        return this.cacheHeight;
    },
        _calcCacheHeight:function(){
            if(this.baseImage.naturalWidth<1000){
                this.cacheHeight=this.baseImage.naturalHeight*3;
            }else if(this.baseImage.naturalWidth<2000){
                this.cacheHeight=this.baseImage.naturalHeight*2;
            }else{
                this.cacheHeight=this.baseImage.naturalHeight;
            }
        },
    getWidthInMainCanvas:function(){
        return this.baseImage.naturalWidth;
    },
    getHeightInMainCanvas:function(){
        return this.baseImage.naturalHeight;
    },
    convertPathLeftCoordToHandCoord:function(coordX){
        return (coordX/(this.getWidthInDrawingCache()/this.getWidthInMainCanvas()))-this.getWidthInMainCanvas()/2;
    },
    convertPathTopCoordToHandCoord:function(coordY){
        return (coordY/(this.getHeightInDrawingCache()/this.getHeightInMainCanvas()))-this.getHeightInMainCanvas()/2;
    },
    /*Implementing inherited abstract methods*/
    generateEntranceData:function(callback){
        let meanWhileImageLoaded=false;
        let drawingPathsLoaded=false;
        let flagCallbackCalled=false;

        this.meanWhileImage=fabric.util.createImage();
        this.meanWhileImage.onload=function(){meanWhileImageLoaded=true;attemptFinish();}
        this.meanWhileImage.src=this.cacheManager.canvas.toDataURL();

        this.isMyTurnToCopyCache=false;
        this.parentObject.fadeInTransitionOpacity=0;

        if(this.drawingData.type===global.DrawingDataType.CREATED_NOPATH){
            this.dataGeneratorForSVG.generateDrawingData(
                this.parentObject.svgString,
                this.getWidthInMainCanvas(),
                this.getHeightInMainCanvas(),
                this.config.forceStrokeDrawing,
                function(svgDrawingData,indexFinalTrueLayer){
                    //indexFinalTruelayer sera -1 si no hubo ningun true path, es decir todos son reveal paths. O si estubo en modo no-force y no encontro true paths
                    this.lastIndexTruePath=indexFinalTrueLayer;

                    if(this.config.fillRevealMode==="drawn_fill"){
                        if(this.lastIndexTruePath===svgDrawingData.points.length-1){
                            this.dataGenerator.generateDefaultDrawingPointsAndLineWidth(
                                this.getWidthInDrawingCache(),
                                this.getHeightInDrawingCache(),
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

                    drawingPathsLoaded=true;
                    attemptFinish();
                }.bind(this)
            );
        }else if(this.drawingData.type===global.DrawingDataType.CREATED_PATHDESIGNED){
            this.dataGenerator.generateCrtlPointsFromPointsMatrix(
                this.drawingData.points,
                this.drawingData /*OUT*/
            );
            drawingPathsLoaded=true;
            attemptFinish();
        }
        function attemptFinish(){
            if(!flagCallbackCalled && meanWhileImageLoaded&&drawingPathsLoaded){
                flagCallbackCalled=true;
                callback();
            }
        }
    },
    generateFinalMaskedImage:function(){
        this.cacheWidth=this.parentObject.largeImage.naturalWidth;
        this.cacheHeight=this.parentObject.largeImage.naturalHeight;
        this.callSuper("generateFinalMaskedImage");
        this._calcCacheWidth();
        this._calcCacheHeight();
    },
    clearEntranceData:function(){/*in addition */
        if(this.drawingData.type===global.DrawingDataType.CREATED_NOPATH){
            this.drawingData.points=[];
            this.drawingData.linesWidths=[];
            this.drawingData.ctrlPoints=[];
            this.drawingData.strokesTypes=[];
            this.drawingData.pathsNames=[];
            this.drawingData.linesColors=[];

            /*this is the addicional block, cleaning aditional data related to svganimables only*/
            if(this.config.fillRevealMode==="drawn_fill"){}
            else if(this.config.fillRevealMode==="fadein"){
                this._removeFadeInAnimationOfObject();
            }else if(this.config.fillRevealMode==="no-fill"){}

        }else if(this.drawingData.type===global.DrawingDataType.CREATED_PATHDESIGNED){
            this.drawingData.ctrlPoints=[];
        }

    },
    renderEntranceEffect:function(ctx){/*it has severely more funcionalities */
        if(this.isMyTurnToCopyCache){
            if(this.parentObject.fadeInTransitionOpacity!==0){
                let currentGlobalAlpha=ctx.globalAlpha;
                ctx.globalAlpha=currentGlobalAlpha*this.parentObject.fadeInTransitionOpacity;
                ctx.drawImage(this.getDrawingFinalImage(),-this.parentObject.width/2,-this.parentObject.height/2,this.parentObject.width,this.parentObject.height);

                let negativeAlpha=1-this.parentObject.fadeInTransitionOpacity;

                ctx.globalAlpha=currentGlobalAlpha*negativeAlpha;
                ctx.drawImage(this.cacheManager.canvas,-this.parentObject.width/2,-this.parentObject.height/2,this.parentObject.width,this.parentObject.height);
                ctx.globalAlpha=currentGlobalAlpha;
            }else{
                ctx.drawImage(this.cacheManager.canvas,-this.parentObject.width/2,-this.parentObject.height/2,this.parentObject.width,this.parentObject.height);
            }
        }else{
            ctx.drawImage(this.meanWhileImage,-this.parentObject.width/2,-this.parentObject.height/2,this.parentObject.width,this.parentObject.height);
        }
    },
    getDrawingFinalImage:function(){/*insted of returning one or the other regarding one configuration varible, now it is done regarding the image has a path designed or not*/
        if(this.drawingData.type===global.DrawingDataType.CREATED_PATHDESIGNED){
            return this.maskedImage;
        }else if(this.drawingData.type===global.DrawingDataType.CREATED_NOPATH){
            // return this.baseImage;
            return this.finalImageBitmap;
        }
    },
    illustrationFunctionOnCache:function(canvas,ctx,baseImage,prevPathSnapshot,indexLayer/*Used For SVGAnimable*/){
        if(this.drawingData.type===global.DrawingDataType.CREATED_PATHDESIGNED){
            global.ImageDrawnEntranceMode.prototype.illustrationFunctionOnCache(canvas,ctx,baseImage,prevPathSnapshot,indexLayer);
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
        this.parentObject.animator.addHiddenAnimation("fadeInTransitionOpacity",0,1,startMoment,endMoment,global.EnumAnimationEasingType.InOut,global.EnumAnimationTweenType.Sine);
    },
    _removeFadeInAnimationOfObject:function(){
        this.parentObject.animator.entranceTimes.transitionDelay=0;
        this.parentObject.animator.entranceTimes.duration=this.auxEntranceDuration;
        this.parentObject.animator.removeHiddenAnimation("fadeInTransitionOpacity",0);
    },

})
