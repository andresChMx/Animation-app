var SVGDrawnEntranceMode=fabric.util.createClass(ImageDrawnEntranceMode,{
    type:"SVGDrawn",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);

        this.dataGenerator=new ImageDrawingDataGenerator();
        this.dataGeneratorForSVG=new SVGAnimableDataGenerator(); /*used in case of "fillRevealMode"==="drawn_fill"*/
        //auxiliary variables (not storing)
        this.auxEntranceDuration=0; // stores entrance effect duration value temporarily
        this.lastIndexTruePath=0;   //  used for fill reveal mode "fill_drawn"
        this.finalImageBitmap=null; // TEMPORAL SOLUTION TO ABRUPT CHANGE FROM BITMAP TO VECTOS AT THE END OF SVG AUTOMATIC DRAWING. stores the bitmap version of the base vector image. Used when drawing and no paths were crated
        // /*configuration parameters*/
        this.config={
            showHand:true,
            forceStrokeDrawing:true,
            fillRevealMode:'fadein',  // // fadein || drawn_fill || no-fill
        }
    },
    /*overwritten methods*/
    notificationOnImageStateChanged:function(){
        this.baseImage=this.parentObject.largeImage;
        if(this.parentObject.imageLoadingState===EnumAnimableLoadingState.ready){
            //the finalMasked iamge will be generated if paths are created. But now the need
            //to have a pixels version of the image to avoid grows behavious al the end of drawing
            //in no-paths version of the drawing(pasaba de pixeles a vectores)
            this.generateBitmapSVGFinalImage();
        }
    },
    generateBitmapSVGFinalImage:function(){ //
        let canvas=document.createElement("canvas");
        let ctx=canvas.getContext("2d");

        canvas.width=this.baseImage.naturalWidth;
        canvas.height=this.baseImage.naturalHeight;
        ctx.drawImage(this.baseImage,0,0);
        this.finalImageBitmap=new Image();
        this.finalImageBitmap.src=canvas.toDataURL();
        canvas.remove();
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
            // return this.finalImageBitmap;
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
})
