var Animation=fabric.util.createClass({
    startValue:-1,
    endValue:-1,
    byValue:-1,

    startMoment:-1,
    endMoment:-1,
    
    property:"",
    initialize:function(property,startValue,endValue,startMoment,endMoment){
        this.property=property;
        this.startValue=startValue;
        this.endValue=endValue;
        
        this.startMoment=startMoment;
        this.endMoment=endMoment;
        this.onKeyMoved(startValue,endValue,this.startMoment,this.endMoment)
        //console.log(this.property,this.startValue,this.endValue,this.startMoment,this.endMoment);
    },
    onKeyMoved:function(startValue,endValue,startMoment,endMoment){
        this.startValue=startValue;
        this.endValue=endValue;
        this.startMoment=startMoment;
        this.endMoment=endMoment;

        this.localDuration=this.endMoment-this.startMoment;
        this.byValue=this.endValue-this.startValue;
    },
    tick:function(currentTime){
        if(currentTime>=this.startMoment && currentTime<=this.endMoment){
            let currentTimeLocalAnim=currentTime-this.startMoment;
            let currentValue = fabric.util.ease.easeInSine(currentTimeLocalAnim, this.startValue, this.byValue, this.localDuration);
            return currentValue;
        }else{
            return -1;
        }
    },
    hasTwoKeys:function(){
        return this.endMoment!=-1 && this.endValue!=-1;
    }
});

var ImageAnimable=fabric.util.createClass(fabric.Image,{
    type:'ImageAnimable',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
        this.dictAnimations={
            "left":[],
            "top":[],
            "scaleX":[],
            "scaleY":[],
            "angle":[],
            "opacity":[]
        };
    },
    addAnimation:function(property,startValue,endValue,startMoment,endMoment){//string,number,number
        this.dictAnimations[property].push(new Animation(property,startValue,endValue,startMoment,endMoment));
        console.log("TOTAL CANT ANIMACIONES EN PROPEIDAD : " + property + this.dictAnimations[property].length);
    },
    executeAnimations:function(currentTime){
        for(const prop in this.dictAnimations){
            let anims=this.dictAnimations[prop]
            for(var i=0;i<anims.length;i++){
                let anim=anims[i];
                if(anim.hasTwoKeys()){
                    let value=anim.tick(currentTime)
                    if(value!=-1){
                        this.set(anim.property,value);
                    }
                }else{
                    this.set(anim.property,anim.startValue);
                }
            }
        }
    },
    hasAnimations:function(){
        for(const prop in this.dictAnimations){
            if(this.dictAnimations[prop].length>0){
                return true;
            }
            
        }

        return false;
    },
    hasPropertyAnimations:function(prop){
        return (this.dictAnimations[prop].length>0);
    }
    //TODO: update animation handler
})

fabric.util.object.extend(fabric.Image,{
    fromURLCustom:function(url, callback, imgOptions){
      fabric.util.loadImage(url, function(img) {
        callback && callback(new ImageAnimable(img, imgOptions));
      }, null, imgOptions && imgOptions.crossOrigin);
    }
})
