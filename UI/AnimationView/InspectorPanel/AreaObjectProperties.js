
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
        if(this.currentSelectedAnimableObjects){//BUG SOLUTION: for some reason when canvas is loaded this event is fired, and since there is no selected object, causes a error inside the funcion in the next line
            this.populateWidgetsWithObjectProperties();
        }
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
        object[property]=value;

        if(object.type==="TextAnimable") {
            if(property==="fontFamily"){
                object.setFontFamily(value);
                object.exitEditing();
            }else if(property==="fill"){
                object.dirty=true;
            }else{
                object.exitEditing();
            }
        }

        if(object.type==="ShapeAnimable"){
            /*for rectShapes*/
            if(property==="width"){
                object.setWidth(value);
            }else if(property==="height"){
                object.setHeight(value);
            }
            if(property==="borderRadius"){
                object.setBorderRadius(value);
            }
            /*for Circleshapes*/
            if(property==="radius"){
                object.set("radius",value);
            }

        }
    }
}
var SectionStylingObject={
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;

        this.HTMLCollectionFloatingPanels=document.querySelectorAll(".area-objects-properties__zone-styles__box-floating-panels .floating-panel");

        this.currentSelectedAnimableObjects=null; // list containing objects of the same type
        let me=this;
        this.widgetsShapeAnimable={
            strokeWidth:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.stroke-width"),
                field:null,
                initEvent:function(){
                    let fieldHTML=this.htmlElem.querySelector(".property-input");
                    this.field=new ButtonedField(fieldHTML,"",1,1000,4)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"strokeWidth")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            fill:{htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.fill"),
                htmlInput:null,
                initEvent:function(){
                    this.htmlInput=this.htmlElem.querySelector("input");
                    this.htmlInput.addEventListener("input",this.OnTriggered.bind(this))
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlInput.value,"fill")},
                setVal:function(val){this.htmlInput.value=val},
                getInputFieldElem:function(){return this.htmlInput},
            },
            transparentFill:{
            htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.transparent-fill"),
                htmlInput:null,
                initEvent:function(){
                    this.htmlInput=this.htmlElem.querySelector("input");
                    this.htmlInput.addEventListener("change",this.OnTriggered.bind(this))
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlInput.checked,"transparentFill")},
                setVal:function(val){this.htmlInput.checked=val},
                getInputFieldElem:function(){return this.htmlInput}
            },
            stroke:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.stroke"),
                htmlInput:null,
                initEvent:function(){
                    this.htmlInput=this.htmlElem.querySelector("input");
                    this.htmlInput.addEventListener("input",this.OnTriggered.bind(this))
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlInput.value,"stroke")},
                setVal:function(val){this.htmlInput.value=val},
                getInputFieldElem:function(){return this.htmlInput},
            },
            transparentStroke:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.transparent-stroke"),
                htmlInput:null,
                initEvent:function(){
                    this.htmlInput=this.htmlElem.querySelector("input");
                    this.htmlInput.addEventListener("change",this.OnTriggered.bind(this))
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlInput.checked,"transparentStroke")},
                setVal:function(val){this.htmlInput.checked=val},
                getInputFieldElem:function(){return this.htmlInput}
            },
            startRenderingPoint:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.start-point"),
                field:null,
                slider:null,
                initEvent:function(){
                    this.field=new NumericField(document.querySelector(".styling-widget__start-rendering-point__field"),"%",0,100);
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this));
                    this.slider=document.querySelector(".styling-widget__start-rendering-point__slider");
                    this.slider.addEventListener("change",this.OnSliderChanged.bind(this));
                    },
                activate:function(){this.htmlElem.style.display="block"},
                deactivate:function(){this.htmlElem.style.display="none"},
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
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.end-point"),
                field:null,
                slider:null,
                initEvent:function(){
                    this.field=new NumericField(document.querySelector(".styling-widget__end-rendering-point__field"),"%",0,100);
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this));
                    this.slider=document.querySelector(".styling-widget__end-rendering-point__slider");
                    this.slider.addEventListener("change",this.OnSliderChanged.bind(this));
                },
                activate:function(){this.htmlElem.style.display="block"},
                deactivate:function(){this.htmlElem.style.display="none"},
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
            /*properties of rectanimables*/
            width:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.width"),
                field:null,
                initEvent:function(){
                    let fieldHTML=this.htmlElem.querySelector(".property-input");
                    this.field=new ButtonedField(fieldHTML,"",0,1000,10)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"width")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            height:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.height"),
                field:null,
                initEvent:function(){
                    let fieldHTML=this.htmlElem.querySelector(".property-input");
                    this.field=new ButtonedField(fieldHTML,"",0,1000,10)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"height")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            borderRadius:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.borderRadius"),
                field:null,
                initEvent:function(){
                    let fieldHTML=this.htmlElem.querySelector(".property-input");
                    this.field=new ButtonedField(fieldHTML,"",1,1000,10)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"borderRadius")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            /*properties of circleShapes*/
            radius:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.radius"),
                field:null,
                initEvent:function(){
                    let fieldHTML=this.htmlElem.querySelector(".property-input");
                    this.field=new ButtonedField(fieldHTML,"",1,1000,10)
                    this.field.addListenerOnNewValue(this.OnTriggered.bind(this));
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(value,e){
                    me.OnWidgetChanged(value,"radius")
                },
                setVal:function(val,triggering=false){
                    this.field.setValue(val,triggering);
                },
                getInputFieldElem:function(){return this.field.htmlInput},
            },
            /*masking properties (general to all shapes)*/
            inverted:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.inverted"),
                htmlInput:null,
                initEvent:function(){
                    this.htmlInput=this.htmlElem.querySelector("input");
                    this.htmlInput.addEventListener("change",this.OnTriggered.bind(this))
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlInput.checked,"inverted")},
                setVal:function(val){this.htmlInput.checked=val},
                getInputFieldElem:function(){return this.htmlInput}
            },
            clipBorder:{
                htmlElem:document.querySelector("#ShapeAnimable-styling-panel .styling-widget.clip-border"),
                htmlInput:null,
                initEvent:function(){
                    this.htmlInput=this.htmlElem.querySelector("input");
                    this.htmlInput.addEventListener("change",this.OnTriggered.bind(this))
                },
                activate:function(){this.htmlElem.style.display="flex"},
                deactivate:function(){this.htmlElem.style.display="none"},
                OnTriggered:function(e){me.OnWidgetChanged(this.htmlInput.checked,"clipBorder")},
                setVal:function(val){this.htmlInput.checked=val},
                getInputFieldElem:function(){return this.htmlInput}
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
        for(let i in global.FontsNames){
            let option=document.createElement("option");
            option.textContent=i;
            option.value=global.FontsNames[i];
            select.appendChild(option);
        }
    },
    OnWidgetChanged:function(value,property){
        for(let i=0;i<this.currentSelectedAnimableObjects.length;i++){
            AdapterSetValue.set(this.currentSelectedAnimableObjects[i],property,value);
        }
        CanvasManager.canvas.renderAll();
    },
    activateFloatingPanelForObjects:function(){
        if(this.currentSelectedAnimableObjects){
            for(let i=0;i<this.HTMLCollectionFloatingPanels.length;i++){
                let idName=this.currentSelectedAnimableObjects[0].type + "-styling-panel";
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
    /*widgets activation/deactivation*/
    deactivateAllObjectWidgets:function(animableObj){
        for(let key in this["widgets" + animableObj.type]){
            this["widgets" + animableObj.type][key].deactivate();
        }
    },
    activateObjectWidgets:function(animableObj){
        for(let i=0;i<animableObj.listEditableStylingProperties.length;i++){
            let property=animableObj.listEditableStylingProperties[i];
            this["widgets" + animableObj.type][property].activate();
        }
    },
    /*activated widgets population*/
    populateTextAnimableFloatingPanelData:function (){
        for(let key in this.widgetsTextAnimable){
            this.widgetsTextAnimable[key].setVal(this.currentSelectedAnimableObjects[0][key]);
        }
    },
    populateImageAnimableFloatingPanelData:function(){

    },
    populateShapeAnimableFloatingPanelData:function(animableObj){
        for(let i=0;i<animableObj.listEditableStylingProperties.length;i++){
            let property=animableObj.listEditableStylingProperties[i];
            this["widgets" + animableObj.type][property].setVal(animableObj[property])
        }
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        if(this.currentSelectedAnimableObjects){
            this.performWidgetChangeOnSelectionUpdate();
        }
        let currentSelectedObject=CanvasManager.getSelectedAnimableObj();
        if(currentSelectedObject){
            if(currentSelectedObject.type==="activeSelection"){
                currentSelectedObject=currentSelectedObject.getObjects();
            }else{
                currentSelectedObject=[currentSelectedObject];
            }
            if(this.isMoreThanOneObjectTypeInList(currentSelectedObject)){
                this.currentSelectedAnimableObjects=[currentSelectedObject[0]];
            }else{
                this.currentSelectedAnimableObjects=currentSelectedObject;
            }
            this.activateFloatingPanelForObjects();

            if(this.currentSelectedAnimableObjects[0].type==="TextAnimable"){
                this.populateTextAnimableFloatingPanelData();
            }else if(this.currentSelectedAnimableObjects[0].type==="ImageAnimable"){
                this.populateImageAnimableFloatingPanelData();
            }else if(this.currentSelectedAnimableObjects[0].type==="ShapeAnimable"){
                this.deactivateAllObjectWidgets(this.currentSelectedAnimableObjects[0]);
                if(this.isMoreThanOneObjectSubTypeInList(this.currentSelectedAnimableObjects)){
                    this.activateObjectWidgets({type:"ShapeAnimable",listEditableStylingProperties:CommonShapeAnimableStylingProperties});
                }else{
                    this.activateObjectWidgets(this.currentSelectedAnimableObjects[0]);//Podrian popularese widgets que no fueron activados, pero eso no causa error
                }
                this.populateShapeAnimableFloatingPanelData(this.currentSelectedAnimableObjects[0]);
            }
        }else{

            this.deactivateFloatingPanel();
        }
        this.currentSelectedAnimableObjects=currentSelectedObject;

    },
    isMoreThanOneObjectTypeInList:function(listAnimableObjects){
        let firstObjectType=listAnimableObjects[0].type;
        let moreThanOneObjectType=false;
        for(let i=0;i<listAnimableObjects.length;i++){
            if(firstObjectType!==listAnimableObjects[i].type){
                moreThanOneObjectType=true;
                break
            }
        }
        return moreThanOneObjectType;
    },
    isMoreThanOneObjectSubTypeInList:function(listAnimableObjects){
        let firstObjectSubtype=listAnimableObjects[0].subtype;
        let moreThanOneObjectSubtype=false;
        for(let i=0;i<listAnimableObjects.length;i++){
            if(firstObjectSubtype!==listAnimableObjects[i].subtype){
                moreThanOneObjectSubtype=true;
                break
            }
        }
        return moreThanOneObjectSubtype;
    },
    performWidgetChangeOnSelectionUpdate:function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement){if(documentActiveElement.getAttribute("tag")!=="NumericField"){return;}}
        if(this.currentSelectedAnimableObjects[0].type==="ImageAnimable"){

        }else if(this.currentSelectedAnimableObjects[0].type==="TextAnimable"){
            for(let i in this.widgetsTextAnimable){
                if(documentActiveElement===this.widgetsTextAnimable[i].getInputFieldElem()){
                    documentActiveElement.blur();
                    this.widgetsTextAnimable[i].setVal(documentActiveElement.value,true);
                }
            }
        }else if(this.currentSelectedAnimableObjects[0].type==="ShapeAnimable"){
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