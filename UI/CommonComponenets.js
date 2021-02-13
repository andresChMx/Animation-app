/*FIELDS*/
var NumericField=fabric.util.createClass({
    initialize:function(element,sufix,minVal,maxVal,observerType=ObserverType.main){
        this.windowObserverType=observerType;
        this.value=0;
        this.minVal=minVal;
        this.maxVal=maxVal;
        this.sufix=sufix;

        this.refFuncOnInputFocusIn=this.OnInputFocusIn.bind(this);
        this.refFuncOnInputFocusOut=this.OnInputFocusOut.bind(this);
        WindowManager.registerOnKeyEnterPressed(this,this.windowObserverType);
        this.setupDOMComponents(element)
    },
    setupDOMComponents:function(htmlElem){
        this.htmlElement=htmlElem;

        this.htmlElement.removeEventListener("focusin",this.refFuncOnInputFocusIn);
        this.htmlElement.removeEventListener("focusout",this.refFuncOnInputFocusOut);

        this.htmlElement.addEventListener("focusin",this.refFuncOnInputFocusIn);
        this.htmlElement.addEventListener("focusout",this.refFuncOnInputFocusOut);

    },
    OnInputFocusIn:function(){
        this.htmlElement.value=this.value;
        this.htmlElement.select();
    },
    OnInputFocusOut:function(e){
        this.setValue(e.target.value);
    },
    setValue:function(value,invokeCallBack=true){
        let tmpValue=parseFloat(value);
        if(!isNaN(tmpValue)){
            if(tmpValue<this.minVal){this.value=this.minVal}
            else if(tmpValue>this.maxVal){this.value=this.maxVal}
            else{this.value=tmpValue}
        }else if(value===""){this.value=this.minVal;}

        this.htmlElement.value=this.value + this.sufix;
        if(invokeCallBack){
            this.cbOnNewValue(this.value,this.htmlElement)
        }
    },
    getValue:function(){
        return this.value;
    },
    remove:function(){
        this.htmlElement.removeEventListener("focusin",this.refFuncOnInputFocusIn);
        this.htmlElement.removeEventListener("focusout",this.refFuncOnInputFocusOut);
        WindowManager.unregisterOnKeyEnterPressed(this,this.windowObserverType);
    },
    notificationOnKeyEnterUp:function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement===this.htmlElement){
            this.htmlElement.blur(); // this will invoke OnInputFocusOut
        }
    },
    addListenerOnNewValue:function(callback){
        this.cbOnNewValue=callback;
    }
})

var ButtonedField=fabric.util.createClass({
    initialize:function(containerElem,fieldPrefix,minVal,maxVal,incrementValue){
        this.cbOnNewValue=function(){};
        this.increment=incrementValue;
        this.htmlBtnDicrease=containerElem.children[0];
        this.htmlInput=containerElem.children[1];
        this.htmlBtnIncrease=containerElem.children[2];

        this.refFuncOnBtnClicked=this.OnBtnClicked.bind(this);

        this.numericField=new NumericField(this.htmlInput,fieldPrefix,minVal,maxVal)
        this.numericField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));

        this.htmlBtnDicrease.addEventListener("click",this.refFuncOnBtnClicked);
        this.htmlBtnIncrease.addEventListener("click",this.refFuncOnBtnClicked);
    },
    OnBtnClicked:function(e){
        if(e.target.className==="btn-decrease"){
            this.numericField.setValue(this.numericField.value-this.increment);
        }else if(e.target.className==="btn-increase"){
            this.numericField.setValue(this.numericField.value+this.increment);}
    },
    OnNumericFieldNewValue:function(value,e){
        this.cbOnNewValue(value,e);
    },
    setValue:function(value,inkoveCallBack=true){
        this.numericField.setValue(value,inkoveCallBack);
    },
    getValue:function(){
        return this.numericField.getValue();
    },
    addListenerOnNewValue:function(callback){
        this.cbOnNewValue=callback;
    },
    remove:function(){
        this.htmlBtnDicrease.removeEventListener("click",this.refFuncOnBtnClicked);
        this.htmlBtnIncrease.removeEventListener("click",this.refFuncOnBtnClicked);
        this.numericField.remove();
    }
})
var TimeButtonedField=fabric.util.createClass(ButtonedField,{
    initialize:function(containerElem,fieldPrefix,minVal,maxVal,incrementValue){
        this.callSuper("initialize",containerElem,fieldPrefix,minVal,maxVal,incrementValue);
    },
    OnNumericFieldNewValue:function(value,e){
        let millisec=this._convertSectToMiliSec(value);
        this.cbOnNewValue(millisec,e);
    },
    setValue:function(value,inkoveCallBack=true){
        let sec=this._convertMiliSecToSec(value);
        this.numericField.setValue(sec,inkoveCallBack);
    },
    _convertSectToMiliSec:function(val){
        return val*1000;
    },
    _convertMiliSecToSec:function(val){
        return val/1000;
    },
})