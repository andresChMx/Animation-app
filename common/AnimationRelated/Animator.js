
var Animator=fabric.util.createClass({
    initialize:function(animableObject){
        this.dictAnimations={
            "left":[],
            "top":[],
            "scaleX":[],
            "scaleY":[],
            "angle":[],
            "opacity":[]
        };
        this.entranceDuration=3000; //objects with entrace effect
        this.entranceDelay=0;       //objects with entrace effect
        this.animableObject=animableObject;
    },
    setAnimableObject:function(obj){
        this.animableObject=obj;
    },
    executeAnimations:function(currentTime){

        for(const prop in this.dictAnimations){
            let anims=this.dictAnimations[prop]
            for(var i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value==="tiempoMenor"){
                        if(this.isFirstIndex(i)){
                            this.animableObject.set(anim.property,anim.startValue);
                            break;
                        }
                    }else if (value==="tiempoMayor"){
                        if(this.isLastIndex(i,anims.length)){
                            this.animableObject.set(anim.property,anim.endValue);
                            break;
                        }
                    }
                    else{
                        this.animableObject.set(anim.property,value);
                        break;
                    }
                }else{
                    this.animableObject.set(anim.property,anim.startValue);
                }
            }
        }
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
    addAnimation:function(property,startValue,endValue,startMoment,endMoment){//string,number,number
        this.dictAnimations[property].push(new Animation(property,startValue,endValue,startMoment,endMoment));
        console.log("TOTAL CANT ANIMACIONES EN PROPEIDAD : " + property + this.dictAnimations[property].length);
    },
    addAnimations:function(properties,startValues,endValues,startMoment,endMoment){
        for(let i in properties){
            this.addAnimation(properties[i],startValues[i],endValues[i],startMoment,endMoment)
        }
    },
    updateAnimation:function(animIndex,property,startValue,endValue,startMoment,endMoment){
        this.dictAnimations[property][animIndex].initParameters(startValue,endValue,startMoment,endMoment);
    },
    updateAnimations:function(animIndex,properties,startValues,endValues,startMoment,endMoment){
        for (let i in properties){
            this.updateAnimation(animIndex,properties[i],startValues[i],endValues[i],startMoment,endMoment);
        }
    },
    /*
    updateAnimation:function(property,indexAnimation, startValue,endValue,startMoment,endMoment){
        this.dictAnimations[property][indexAnimation].updateValues(startValue,endValue,startMoment,endMoment);
    },*/

    hasPropertyAnimations:function(prop){
        return (this.dictAnimations[prop].length>0);
    },
    onDurationChange:function(durationBefore,durationAfter){
        if(this.hasAnimations() && durationBefore>durationAfter){
            for(const prop in this.dictAnimations){
                if(this.hasPropertyAnimations(prop)) {
                    for (let i = 0; i < this.dictAnimations[prop].length; i++) {
                        let listAnims = this.dictAnimations[prop];
                        if (listAnims[0].hasTwoKeys()) {
                            let percentStartMoment = listAnims[i].startMoment / durationBefore;
                            let percentEndMoment = listAnims[i].endMoment / durationBefore;
                            listAnims[i].updateMoments(durationAfter * percentStartMoment, durationAfter * percentEndMoment)
                        } else {
                            let percentStartTime = listAnims[0].startMoment / durationBefore;
                            listAnims[0].updateMoments(durationAfter * percentStartTime, -1)
                            break;
                        }

                    }
                }
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
        this.canvasCamera.viewportTransform=this.invertTransform(newReferenceMatrix);
        this.canvasCamera.viewportTransform[4]+=this.animableObject.width/2;
        this.canvasCamera.viewportTransform[5]+=this.animableObject.height/2;
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