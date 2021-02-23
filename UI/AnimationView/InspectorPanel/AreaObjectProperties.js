
var SectionTransformObject={
    HTMLElement:null,
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.currentSelectedAnimableObjects=null;
        this.HTMLElement=document.querySelector(".panel-inspector__area-object-properties")
        let me=this;
        this.widgetsObjectProperties={
            left:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-left .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,5);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"left");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            top:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-top .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,5);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"top");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            scaleX:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-scaleX .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,0.1);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"scaleX");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}
            },
            scaleY:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-scaleY .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,0.1);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"scaleY");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            angle:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-angle .property-input"),
                buttonedField:null,
                initEvents:function(){
                    this.buttonedField=new ButtonedField(this.htmlElem,"",-Infinity,Infinity,5);
                    this.buttonedField.addListenerOnNewValue(this.OnNumericFieldNewValue.bind(this));
                },
                OnNumericFieldNewValue:function(val,e){
                    me.OnWidgetChanged(val,"angle");
                },
                getInputFieldElem:function(){return this.buttonedField.htmlInput},
                setVal:function(val){this.buttonedField.setValue(val,false);},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}

            },
            opacity:{
                htmlElem:document.querySelector(".panel-inspector__area-object-properties .widget-property-opacity .property-input"),
                field:null,
                initEvents:function(){
                    this.htmlElem.children[0].addEventListener("change",this.OnRangeChanged.bind(this));
                    this.field=new NumericField(this.htmlElem.children[1],"",0,100)
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this))
                },
                OnFieldNewValue:function(value,e){
                    me.OnWidgetChanged(value/100.0,"opacity");
                    this.htmlElem.children[0].value=value;
                },
                OnRangeChanged:function(e){
                    this.field.setValue(e.target.value);
                },
                getInputFieldElem:function(){return this.htmlElem.children[1];},
                setVal:function(val){this.field.setValue(val*100,false);this.htmlElem.children[0].value=val*100;},
                disable:function(){this.htmlElem.parentElement.classList.add("disable");},
                enable:function(){this.htmlElem.parentElement.classList.remove("disable");}
            }
        }
        this.initEvents();
    },
    initEvents:function(){
        for(let i in this.widgetsObjectProperties){
            this.widgetsObjectProperties[i].initEvents();
        }
    },
    OnWidgetChanged:function(val,property){
        if(this.currentSelectedAnimableObjects!==null){
            let tmpDict={};tmpDict[property]=val;
            for(let i in this.currentSelectedAnimableObjects){
                this.currentSelectedAnimableObjects[i].setBatch(tmpDict);
                this.currentSelectedAnimableObjects[i].setCoords();
            }
            CanvasManager.canvas.renderAll();
            this.parentClass.childNotificationOnObjectTransformPropertyWidgetChanged();
        }
    },
    populateWidgetsWithObjectProperties:function(){

        for(let key in this.widgetsObjectProperties){
            this.widgetsObjectProperties[key].setVal(this.currentSelectedAnimableObjects[0].getCustom(key));
        }
    },
    disableWidgets:function(){
        for(let key in this.widgetsObjectProperties){
            this.widgetsObjectProperties[key].disable();
        }
    },
    enableWidgets:function(){
        for(let key in this.widgetsObjectProperties){
            this.widgetsObjectProperties[key].enable();
        }
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        if(this.currentSelectedAnimableObjects){this.performWidgetChangeOnSelectionUpdate();} // HACK FOR WHEN THE SELECITION IS UPDATED WHITE ONE FIELD IS BEEN EDITED
        let currentAnimableObject=CanvasManager.getSelectedAnimableObj();
        if(currentAnimableObject!==undefined){
            if(currentAnimableObject.type==="activeSelection"){
                this.currentSelectedAnimableObjects=currentAnimableObject.getObjects();
            }else{
                this.currentSelectedAnimableObjects=[currentAnimableObject];
            }
            this.enableWidgets();
            this.populateWidgetsWithObjectProperties();
        }else{
            this.disableWidgets();
        }
    },
    notificationCanvasManagerOnObjModified:function(){
        this.populateWidgetsWithObjectProperties();
    },
    notificationPanelActionEditorOnMarkerDragEnded:function(){
        if(this.currentSelectedAnimableObjects!==null && this.currentSelectedAnimableObjects!==undefined){
            this.populateWidgetsWithObjectProperties();
        }
    },
    performWidgetChangeOnSelectionUpdate:function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement){if(documentActiveElement.getAttribute("tag")!=="NumericField"){return;}}

        for(let i in this.widgetsObjectProperties){
            if(documentActiveElement===this.widgetsObjectProperties[i].getInputFieldElem()){
                documentActiveElement.blur();
                this.widgetsObjectProperties[i].buttonedField.numericField.OnInputFocusOut({target:documentActiveElement})
            }
        }
    },
}

var AdapterSetValue={
    set:function(object,property,value){
        if(object.type==="TextAnimable") {
            if(property==="fontFamily"){
                object.setFontFamily(value);
            }else{
                object[property]=value;
            }
        }else{
            object[property]=value;
        }


        if(object.type==="TextAnimable"){
            if(property==="fill"){
                object.dirty=true;
            }else{
                object.exitEditing();
            }
        }
        CanvasManager.canvas.renderAll();
    }
}
var SectionStylingObject={
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;

        this.HTMLCollectionFloatingPanels=document.querySelectorAll(".area-objects-properties__zone-styles__box-floating-panels .floating-panel");

        this.currentSelectedAnimableObject=null;
        let me=this;
        this.widgetsShapeAnimable={
            strokeWidth:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.stroke-width .property-input"),
                field:null,
                initEvent:function(){
                    this.field=new ButtonedField(this.htmlElem,"",1,1000,4)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"strokeWidth")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            fill:{htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.fill input"),
                initEvent:function(){this.htmlElem.addEventListener("input",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.value,"fill")},
                setVal:function(val){this.htmlElem.value=val},
                getInputFieldElem:function(){return this.htmlElem},
            },
            transparentFill:{
            htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.transparent-fill input"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
            OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.checked,"transparentFill")},
            setVal:function(val){this.htmlElem.checked=val},
            getInputFieldElem:function(){return this.htmlElem}
            },
            stroke:{htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.stroke input"),
                initEvent:function(){this.htmlElem.addEventListener("input",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.value,"stroke")},
                setVal:function(val){this.htmlElem.value=val},
                getInputFieldElem:function(){return this.htmlElem},
            },
            transparentStroke:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.transparent-stroke input"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.checked,"transparentStroke")},
                setVal:function(val){this.htmlElem.checked=val},
                getInputFieldElem:function(){return this.htmlElem}
            },
            startRenderingPoint:{
                field:null,
                slider:null,
                initEvent:function(){
                    this.field=new NumericField(document.querySelector(".styling-widget__start-rendering-point__field"),"%",0,100);
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this));
                    this.slider=document.querySelector(".styling-widget__start-rendering-point__slider");
                    this.slider.addEventListener("change",this.OnSliderChanged.bind(this));
                    },
                OnFieldNewValue:function(value,e){
                    this.slider.value=value;
                    me.OnWidgetChanged(value,"startRenderingPoint");
                },
                OnSliderChanged:function(){
                    this.field.setValue(this.slider.value);
                },
                setVal:function(value,triggering=false){this.field.setValue(value,triggering); this.slider.value=value;},
                getInputFieldElem:function(){return this.field.htmlElement},

            },
            endRenderingPoint:{
                field:null,
                slider:null,
                initEvent:function(){
                    this.field=new NumericField(document.querySelector(".styling-widget__end-rendering-point__field"),"%",0,100);
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this));
                    this.slider=document.querySelector(".styling-widget__end-rendering-point__slider");
                    this.slider.addEventListener("change",this.OnSliderChanged.bind(this));
                },
                OnFieldNewValue:function(value,e){
                    this.slider.value=value;
                    me.OnWidgetChanged(value,"endRenderingPoint");
                },
                OnSliderChanged:function(){
                    this.field.setValue(this.slider.value);
                },
                setVal:function(value,triggering=false){this.field.setValue(value,triggering); this.slider.value=value;},
                getInputFieldElem:function(){return this.field.htmlElement},

            },
            inverted:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.inverted input"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.checked,"inverted")},
                setVal:function(val){this.htmlElem.checked=val},
                getInputFieldElem:function(){return this.htmlElem}
            },
            clipBorder:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.clip-border input"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.checked,"clipBorder")},
                setVal:function(val){this.htmlElem.checked=val},
                getInputFieldElem:function(){return this.htmlElem}
            }
        };
        this.widgetsTextAnimable={
            fontFamily:{
                htmlElem:document.querySelector(".styling-widget.font-family select"),
                initEvent:function(){this.htmlElem.addEventListener("change",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.removeEventListener("change",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.value,"fontFamily")},
                setVal:function(val){this.htmlElem.value=val},
                getInputFieldElem:function(){return this.htmlElem},
            },
            textAlign:{
                value:"",
                htmlElem:document.querySelector(".styling-widget.text-alignment .text-alignment__options"),
                initEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].addEventListener("click",this.OnTriggered.bind(this))}
                },
                removeEvent:function(){
                    for(let i=0;i<this.htmlElem.children.length;i++){this.htmlElem.children[i].removeEventListener("click",this.OnTriggered.bind(this))}
                },
                OnTriggered:function(e){
                    me.OnWidgetChanged(e.target.id,"textAlign");
                    this.setVal(e.target.id);
                },
                setVal:function(val){
                    this.value=val;
                    for(let i=0;i< this.htmlElem.children.length;i++){this.htmlElem.children[i].classList.remove("active")};
                    this.htmlElem.querySelector("#" + val).classList.add("active");
                },
                getInputFieldElem:function(){return this.htmlElem},
            },
            fontSize:{
                htmlElem:document.querySelector(".styling-widget.font-size .property-input"),
                field:null,
                initEvent:function(){
                    this.field=new ButtonedField(this.htmlElem,"",1,1000,4)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                removeEvent:function(){
                },
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"fontSize")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            lineHeight:{
                htmlElem:document.querySelector(".styling-widget.line-height .property-input"),
                field:null,
                initEvent:function(){
                    this.field=new ButtonedField(this.htmlElem,"",1,1000,2);
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                removeEvent:function(){
                },
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"lineHeight")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput;},
            },
            fill:{htmlElem:document.querySelector(".styling-widget.fill-color input"),
                initEvent:function(){this.htmlElem.addEventListener("input",this.OnTriggered.bind(this))},
                removeEvent:function(){this.htmlElem.removeEventListener("input",this.OnTriggered.bind(this))},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlElem.value,"fill")},
                setVal:function(val){this.htmlElem.value=val},
                getInputFieldElem:function(){return this.htmlElem},
            },
        }

        this.generateHTMLFontFamilyWidget();
        this.initWidgets();

    },
    initWidgets:function(){
        for(let key in this.widgetsTextAnimable){
            this.widgetsTextAnimable[key].initEvent();
        }
        for(let key in this.widgetsShapeAnimable){
            this.widgetsShapeAnimable[key].initEvent();
        }
    },
    generateHTMLFontFamilyWidget:function(){
        //text animable widgets
        //- font family
        let select=document.querySelector(".styling-widget #font-family");
        for(let i in FontsNames){
            let option=document.createElement("option");
            option.textContent=i;
            option.value=FontsNames[i];
            select.appendChild(option);
        }
    },
    OnWidgetChanged:function(value,property){
        AdapterSetValue.set(this.currentSelectedAnimableObject,property,value);
    },
    activateFloatingPanelForObject:function(animableObj){
        if(animableObj){
            for(let i=0;i<this.HTMLCollectionFloatingPanels.length;i++){
                let idName=animableObj.type + "-styling-panel";
                if(this.HTMLCollectionFloatingPanels[i].id===idName) {
                    this.HTMLCollectionFloatingPanels[i].style.display="block";
                }
                else{
                    this.HTMLCollectionFloatingPanels[i].style.display="none";
                }
            }
        }
    },
    deactivateFloatingPanel:function(){
        for(let i=0;i<this.HTMLCollectionFloatingPanels.length;i++){
            this.HTMLCollectionFloatingPanels[i].style.display="none";
        }

    },
    populateTextAnimableFloatingPanelData:function (animableObj){
        for(let key in this.widgetsTextAnimable){
            this.widgetsTextAnimable[key].setVal(animableObj[key]);
        }
    },
    populateImageAnimableFloatingPanelData:function(animableObj){

    },
    populateShapeAnimableFloatingPanelData:function(animableObj){
        for(let key in this.widgetsShapeAnimable){
            this.widgetsShapeAnimable[key].setVal(animableObj[key]);
        }
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        if(this.currentSelectedAnimableObject){
            this.performWidgetChangeOnSelectionUpdate();
        }
        let currentAnimableObject=CanvasManager.getSelectedAnimableObj();
        if(currentAnimableObject!==undefined){
            if(currentAnimableObject.type==="activeSelection"){
                currentAnimableObject=currentAnimableObject.getObjects()[0];
            }
            this.activateFloatingPanelForObject(currentAnimableObject);

            if(currentAnimableObject.type==="TextAnimable"){
                this.populateTextAnimableFloatingPanelData(currentAnimableObject);
            }else if(currentAnimableObject.type==="ImageAnimable"){
                this.populateImageAnimableFloatingPanelData(currentAnimableObject);
            }else if(currentAnimableObject.type==="ShapeAnimable"){
                this.populateShapeAnimableFloatingPanelData(currentAnimableObject);
            }
        }else{

            this.deactivateFloatingPanel();
        }
        this.currentSelectedAnimableObject=currentAnimableObject;

    },
    performWidgetChangeOnSelectionUpdate:function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement){if(documentActiveElement.getAttribute("tag")!=="NumericField"){return;}}
        if(this.currentSelectedAnimableObject.type==="ImageAnimable"){

        }else if(this.currentSelectedAnimableObject.type==="TextAnimable"){
            for(let i in this.widgetsTextAnimable){
                if(documentActiveElement===this.widgetsTextAnimable[i].getInputFieldElem()){
                    documentActiveElement.blur();
                    this.widgetsTextAnimable[i].setVal(documentActiveElement.value,true);
                }
            }
        }else if(this.currentSelectedAnimableObject.type==="ShapeAnimable"){
            for(let i in this.widgetsShapeAnimable){
                if(documentActiveElement===this.widgetsShapeAnimable[i].getInputFieldElem()){
                    documentActiveElement.blur();
                    this.widgetsShapeAnimable[i].setVal(documentActiveElement.value,true);
                }
            }
        }
    },

}

/*El manejo de el envio de la informacion de los inputs, al hacer enter, lo hace el Objecto mayor (AreaObjectPropperties), en caso de focusout lo hace cada widged en widgetsObjectProperties*/
var AreaObjectProperties={
    parentClass:null,
    SectionStylingObject:SectionStylingObject,
    SectionTransformObject:SectionTransformObject,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.SectionStylingObject.init(this);
        this.SectionTransformObject.init(this);
    },
    childNotificationOnObjectTransformPropertyWidgetChanged:function(){
        this.parentClass.childNotificationOnObjectTransformPropertyWidgetChanged();
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.SectionTransformObject.notificationCanvasManagerOnSelectionUpdated();
        this.SectionStylingObject.notificationCanvasManagerOnSelectionUpdated();
    },
    notificationCanvasManagerOnObjModified:function(){
        this.SectionTransformObject.notificationCanvasManagerOnObjModified();
    },
    notificationPanelActionEditorOnMarkerDragEnded:function(){
        this.SectionTransformObject.notificationPanelActionEditorOnMarkerDragEnded();
    },
    notificationOnKeyEnterUp:function(){
    },
}