
var Animator=fabric.util.createClass({
    initialize:function(animableObject){
        this.dictAnimations={
        };
        this.dictHiddenAnimations={};

        this.entranceTimes={    //objects with entrace effect
            startTime:0,
            delay:0,
            duration:3000,
            transitionDelay:0, /*for now only used by SVGAnimables that have "fadein" fillRevealMode*/
        };

        this.animableObject=animableObject;
    },
    setAnimableObject:function(obj){
        this.animableObject=obj;
    },
    executeAnimations:function(currentTime){
        let dictNewPropertysValues={}
        for(const prop in this.dictAnimations){
            let anims=this.dictAnimations[prop]
            for(var i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value==="tiempoMenor"){
                        if(this.isFirstIndex(i)){
                            dictNewPropertysValues[anim.property]=anim.startValue;
                            break;
                        }
                    }else if (value==="tiempoMayor"){
                        if(this.isLastIndex(i,anims.length)){
                            dictNewPropertysValues[anim.property]=anim.endValue;
                            break;
                        }
                    }
                    else{
                        dictNewPropertysValues[anim.property]=value;

                        break;
                    }
                }else{
                    dictNewPropertysValues[anim.property]=anim.startValue;
                }
            }
        }
        /*For now only been used by fadein effect of svg imges in fillRevelaMode="fadein"*/
        for(const prop in this.dictHiddenAnimations){
            let anims=this.dictHiddenAnimations[prop]
            for(let i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value==="tiempoMenor"){
                        if(this.isFirstIndex(i)){
                            this.animableObject[anim.property]=anim.startValue;
                            break;
                        }
                    }else if (value==="tiempoMayor"){
                        if(this.isLastIndex(i,anims.length)){
                            this.animableObject[anim.property]=anim.endValue;
                            break;
                        }
                    }
                    else{
                        this.animableObject[anim.property]=value;
                        break;
                    }
                }else{
                    this.animableObject[anim.property]=anim.startValue;
                }
            }
        }

        this.animableObject.setBatch(dictNewPropertysValues);
    },

    isLastIndex:function(index,listLength){
        return index===listLength-1;
    },
    isFirstIndex:function(index){
        return index===0;
    },
    hasAnimations:function(){
        for(const prop in this.dictAnimations){
            if(this.dictAnimations[prop].length>0){
                return true;
            }
        }
        return false;
    },
    addAnimation:function(property,startValue,endValue,startMoment,endMoment,easingType,tweenType){//string,number,number
        this.dictAnimations[property].push(new Animation(property,startValue,endValue,startMoment,endMoment,easingType,tweenType));
        console.log("TOTAL CANT ANIMACIONES EN PROPEIDAD : " + property + this.dictAnimations[property].length);
    },
    addAnimations:function(properties,startValues,endValues,startMoment,endMoment,easingType,tweenType){
        for(let i in properties){
            this.addAnimation(properties[i],startValues[i],endValues[i],startMoment,endMoment,easingType,tweenType)
        }
    },
    updateAnimation:function(animIndex,property,startValue,endValue,startMoment,endMoment,easingType,tweenType){
        this.dictAnimations[property][animIndex].initParameters(startValue,endValue,startMoment,endMoment,easingType,tweenType);
    },
    // a veces al keyframe de un lane le correcponden mas de una animacion en diferentes lanes (keyframe en position -> animation en left y top)
    updateAnimations:function(animIndex,properties,startValues,endValues,startMoment,endMoment,easingType,tweenType){
        for (let i in properties){
            this.updateAnimation(animIndex,properties[i],startValues[i],endValues[i],startMoment,endMoment,easingType,tweenType);
        }
    },
    /*
    updateAnimation:function(property,indexAnimation, startValue,endValue,startMoment,endMoment){
        this.dictAnimations[property][indexAnimation].updateValues(startValue,endValue,startMoment,endMoment);
    },*/
    addHiddenAnimationsLane:function(property){
        this.dictHiddenAnimations[property]=[];
    },
    addHiddenAnimation:function(property,startValue,endValue,startMoment,endMoment,easingType,tweenType){
        if(!this.dictHiddenAnimations[property]){alert("ERROR: Trataste de agregar una HIDDEN ANIMATION a un carril que no existe");return;}
        this.dictHiddenAnimations[property].push(new Animation(property,startValue,endValue,startMoment,endMoment,easingType,tweenType));
        },
    updateHiddenAnimation:function(){

    },
    removeHiddenAnimation:function(property,index){
        this.dictHiddenAnimations[property].splice(index,1);
    },

    addPropertyLane:function(propertyName){
        this.dictAnimations[propertyName]=[];
    },
    hasPropertyLane:function(propertyName){
        return this.dictAnimations[propertyName]!==undefined;
    },

    hasPropertyAnimations:function(prop){
        return (this.dictAnimations[prop].length>0);
    },
    onDurationChange:function(durationBefore,durationAfter){
        if(this.hasAnimations() && durationBefore>durationAfter){
            // for(const prop in this.dictAnimations){
            //     if(this.hasPropertyAnimations(prop)) {
            //         for (let i = 0; i < this.dictAnimations[prop].length; i++) {
            //             let listAnims = this.dictAnimations[prop];
            //             if (listAnims[0].hasTwoKeys()) {
            //                 let percentStartMoment = listAnims[i].startMoment / durationBefore;
            //                 let percentEndMoment = listAnims[i].endMoment / durationBefore;
            //                 listAnims[i].updateMoments(durationAfter * percentStartMoment, durationAfter * percentEndMoment)
            //             } else {
            //                 let percentStartTime = listAnims[0].startMoment / durationBefore;
            //                 listAnims[0].updateMoments(durationAfter * percentStartTime, -1)
            //                 break;
            //             }
            //
            //         }
            //     }
            // }
        }
    },
    toObject:function(){
        let object={};
        object.entranceTimes=fabric.util.object.clone(this.entranceTimes);
        let dictAnimations={};
        for(let key in this.dictAnimations){
            dictAnimations[key]=this.dictAnimations[key].map(function(anim,index){
                return anim.toObject();
            })
        }
        object.dictAnimations=dictAnimations;
        return object;
    },
    fromObject:function(object){
        this.entranceTimes=object.entranceTimes;

        for(let key in object.dictAnimations){
            this.dictAnimations[key]=[];
            for(let i in object.dictAnimations[key]){
                let animationObj=object.dictAnimations[key][i];
                this.addAnimation(animationObj.property,
                    animationObj.startValue,
                    animationObj.endValue,
                    animationObj.startMoment,
                    animationObj.endMoment,
                    animationObj.easingType,
                    animationObj.tweenType,
                    )
            }
        }
    }
});
var AnimatorCamera=fabric.util.createClass(Animator,{
    initialize:function(animableObject,canvasCamera){
        this.callSuper("initialize",animableObject);
        this.canvasCamera=canvasCamera;
        this.startCameraAnimation=false;
    },
    executeAnimations:function(currentTime){
        this.callSuper("executeAnimations",currentTime);
        if(this.startCameraAnimation){
            this.updateCanvastWithOwnState();
        }
    },
    updateCanvastWithOwnState:function(){
        let matrix=this.animableObject.calcOwnMatrix();
        let newReferenceMatrix=matrix.slice(0);
        newReferenceMatrix=this.invertTransform(newReferenceMatrix);
        newReferenceMatrix[4]+=this.animableObject.width/2;
        newReferenceMatrix[5]+=this.animableObject.height/2;
        newReferenceMatrix=fabric.util.multiplyTransformMatrices([PanelPreviewer.scalerFactorX,0,0,PanelPreviewer.scalerFactorX,0,0],newReferenceMatrix,false)
        this.canvasCamera.setViewportTransform(newReferenceMatrix);
        
        this.canvasCamera.opacity=this.animableObject.opacity;
    },
    invertTransform: function(t) {
        var a = 1 / (t[0] * t[3] - t[1] * t[2]),
            r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
            o = fabric.util.transformPoint({ x: t[4], y: t[5] }, r, true);
        r[4] = -o.x;
        r[5] = -o.y;
        return r;
    },
    start:function(camera){
        this.startCameraAnimation=true;
        this.canvasCamera=camera;
    },
    stop:function(){
        this.startCameraAnimation=false;
    },
});