var EnumAnimationTweenType={
    Sine:'Sine',
    Cubic:'Cubic',
    Quint:'Quint',
    Circ:'Circ',
    Back:'Back',
    Elastic:'Elastic',
    Bounce:'Bounce',
}
var EnumAnimationEasingType={
    In:'In',
    Out:'Out',
    InOut:'InOut',
}
fabric.util.ease.Linear=function(t,b,c,d){
    return (t/d)*c + b;
}
var Animation=fabric.util.createClass({
    type:"Animation",
    startValue:-1,
    endValue:-1,
    byValue:-1,

    startMoment:-1,
    endMoment:-1,


    property:"",
    functionName:'easeInSine', // found from the next two variables
    tweenType:'Sine', // sine,quart, etc...
    easingType:'In',  // In | Out | InOut | linear
    initialize:function(property,startValue,endValue,startMoment,endMoment,easingType=EnumAnimationEasingType.In,tweenType=EnumAnimationTweenType.Sine){
        this.property=property;
        this.initParameters(startValue,endValue,startMoment,endMoment,easingType,tweenType)
    },
    initParameters:function(startValue,endValue,startMoment,endMoment,easingType,tweenType){
        this.startValue=startValue;
        this.endValue=endValue;

        this.startMoment=startMoment;
        this.endMoment=endMoment;

        this.localDuration=endMoment-startMoment;
        this.byValue=endValue-startValue;


        this.easingType=easingType;
        this.tweenType=tweenType;
        this.assembleFunctionName();
    },
    updateMoments:function(startMoment,endMoment){
        this.startMoment=startMoment;
        this.endMoment=endMoment;
        this.localDuration=this.endMoment-this.startMoment;
    },
    set:function(property,value){

    },
    setTweenType:function(tweenType){
        let name=EnumAnimationTweenType[tweenType];
        if(name===undefined){
            name=EnumAnimationTweenType.Sine;
        }
        this.tweenType=name;
        this.assembleFunctionName();
    },
    setEasingType:function(easingType){
        let type=EnumAnimationEasingType[easingType];
        if(type===undefined){
            type=EnumAnimationEasingType.In;
        }
        this.easingType=type;
        this.assembleFunctionName();
    },
    assembleFunctionName:function(){
        if(this.easingType===EnumAnimationEasingType.Linear){
            this.functionName='Linear';
        }else{
            this.functionName='ease' + this.easingType + this.tweenType;
        }
    },
    tick:function(currentTime){
        if(currentTime<this.startMoment){
            return "tiempoMenor";
        }else if(currentTime>this.endMoment){
            return "tiempoMayor";
        }else{
            let currentTimeLocalAnim=currentTime-this.startMoment;
            let currentValue = fabric.util.ease[this.functionName](currentTimeLocalAnim, this.startValue, this.byValue, this.localDuration);
            return currentValue;
        }
    },
    hasTwoKeys:function(){
        return this.endMoment!=-1 && this.endValue!=-1;
    }
});
var AnimationRotation=fabric.util.createClass(Animation,{
    type:"AnimationRotation",
    initialize:function(property,startValue,endValue,startMoment,endMoment){
        this.callSuper("initialize",property,startValue,endValue,startMoment,endMoment);
        this.directionChanged=false;
    },
    toggleDirection:function(){
        this.directionChanged=!this.directionChanged;
        this.startValue=startValue;
        this.endValue=endValue;
        this.endValue=-(360-Math.abs(this.endValue))*(this.endValue/this.endValue);
        this.byValue=endValue-startValue;
    },
    set:function(property,value){
        this.callSuper("set",property.value);
        if(property==="rotationDirection"){
            this.toggleDirection();
        }
    }
});

var FactoryAnimation=fabric.util.createClass({
    createAnimation:function(property,startValue,endValue,startMoment,endMoment){
        switch (property){
            case "angle":
                return new AnimationRotation(property,startValue,endValue,startMoment,endMoment);
            default:
                return new Animation(property,startValue,endValue,startMoment,endMoment);
        }
    }
});