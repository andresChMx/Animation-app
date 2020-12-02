var TIMELINE_TIMESTEPS=100;
var TIMELINE_MIN_LONGITUDE_STEPS=40;
var TIMELINE_PADDING=16;
var SectionProperties={
    HTMLElement:null,
    listObserversOnBtnAddKey:[],
    listObserversOnFieldInput:[],
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".action-editor__properties-area");
        this.HTMLListProperties=document.querySelectorAll(".action-editor__properties-area__list__item");
        this.HTMLInputsPropertyEditors=document.querySelectorAll(".action-editor__properties-area__list__item__box-inputs input");
        this.initEvents();
    },
    initEvents:function(){
        for(let i=0;i<this.HTMLListProperties.length;i++){
            let btnAddKey=this.HTMLListProperties[i].querySelector(".action-editor__properties-area__list__item__btn-add");
            btnAddKey.addEventListener("click",this.OnBtnAddKeyClicked.bind(this));
        }
        for(let i=0;i<this.HTMLInputsPropertyEditors.length;i++){
            this.HTMLInputsPropertyEditors[i].addEventListener("input",this.OnFieldInput.bind(this));

        }

    },
    _desableFields:function(){
        for(let i=0;i<this.HTMLInputsPropertyEditors.length;i++){
            this.HTMLInputsPropertyEditors[i].value="a";
            this.HTMLInputsPropertyEditors[i].setAttribute("disabled","")
        }
    },
    _enableFields:function(){
        for(let i=0;i<this.HTMLInputsPropertyEditors.length;i++){
            this.HTMLInputsPropertyEditors[i].removeAttribute("disabled")
        }
    },
    _populateFields:function(selectedAnimObj){
        for(let i=0;i<this.HTMLInputsPropertyEditors.length;i++){
            let fieldHTML=this.HTMLInputsPropertyEditors[i];
            fieldHTML.value=selectedAnimObj.get(fieldHTML.getAttribute("property"));
        }
    },
    OnBtnAddKeyClicked:function(e){
        let attrPropName=e.target.parentNode.getAttribute("property");
        this.notifyOnBtnAddKey(attrPropName);
    },
    OnFieldInput:function(e){
        let attrPropName=e.target.getAttribute("property");
        let propertyNewValue=e.target.value;
        this.notifyOnFieldPropertyInput(attrPropName,propertyNewValue);
    },
    notificationOnSelectionUpdated:function(){
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(!selectedAnimObj){
            this._desableFields();
        }else{
            this._enableFields();
            this._populateFields(selectedAnimObj);
        }
    },
    notificationOnObjModified:function(){
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(!selectedAnimObj){
            this._desableFields();
        }else{
            this._enableFields();
            this._populateFields(selectedAnimObj);
        }
    },
    notifyOnBtnAddKey:function(propName){
        this.parentClass.childNotificationOnBtnKeyAddKey(propName);
    },
    notifyOnFieldPropertyInput:function(propName,propNewValue){
        this.parentClass.childNotificationOnFieldPropertyInput(propName,propNewValue);
    },
}
var SectionActionEditorMenu={
    HTMLBtnDeleteKeyFrame:null,
    HTMLSelectFunctions:null,

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLBtnDeleteKeyFrame=document.querySelector(".action-editor-menu__keyframes-options .keyframes-options__delete");
        this.HTMLSelectFunctions=document.querySelector(".action-editor-menu__keyframes-options .keyframes-options__select");

        this.HTMLBtnZoomInTimeline=document.querySelector(".action-editor-menu__timeline-options__zoom-in");
        this.HTMLBtnZoomOutTimeline=document.querySelector(".action-editor-menu__timeline-options__zoom-out");

        this.HTMLdurationFormInput=document.querySelector(".editors-options__action-editor-options__form-duration__input");
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLBtnDeleteKeyFrame.addEventListener("click",this.onBtnDeleteKeyFrame.bind(this));
        this.HTMLSelectFunctions.addEventListener("onchange",function(){});

        this.HTMLBtnZoomInTimeline.addEventListener("click",function (){});
        this.HTMLBtnZoomOutTimeline.addEventListener("click",function(){})
        this.HTMLdurationFormInput.addEventListener("focusout",this.onDurationInput.bind(this))
        WindowManager.registerOnKeyEnterPressed(this);
    },
    onBtnDeleteKeyFrame:function(){
        this.notifyOnBtnDeleteKeyFrame();
    },
    onDurationInput:function(e){
        let intInputValue=parseInt(e.target.value);
        if(!isNaN(intInputValue)){
            this.notifyOnDurationInput(intInputValue);
        }else{
            e.target.value=this.parentClass.getTimeLineDuration();
        }
    },
    notifyOnDurationInput:function(intInputValue){
        this.parentClass.childNotificationOnDurationInput(intInputValue);
    },
    notifyOnBtnDeleteKeyFrame:function(){
        this.parentClass.childNotificationOnBtnDeleteKeyFrame();
    },
    notificationOnKeyEnterUp:function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement===this.HTMLdurationFormInput){
            documentActiveElement.blur();
            this.onDurationInput({target:documentActiveElement});
        }
    }
}
let SectionTimeLine={
    HTMLElement:null,

    timeLineComponent:null,
    MODELLanesProperties:{"position":["left","top"],"scale":["scaleX","scaleY"],"rotation":["angle"],"opacity":["opacity"]},
    currentSelectedAnimableObject:null,

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".action-editor__timeline-area");
        this.timeLineComponent=new TimeLineProxy(WindowManager,"#cTimeLine",Object.keys(this.MODELLanesProperties),this);


    },
    generateKeyFramesForNewObject:function(){
        for(let keyModel in this.MODELLanesProperties){
            let properties=this.MODELLanesProperties[keyModel];
            let masterProperty=properties[0];
            if(this.currentSelectedAnimableObject.animator.hasPropertyAnimations(masterProperty)){
                if(!this.currentSelectedAnimableObject.animator.dictAnimations[masterProperty][0].hasTwoKeys()){
                    let values=[];
                    for(let k in properties){
                        values.push(this.currentSelectedAnimableObject.animator.dictAnimations[properties[k]][0].startValue);
                    }
                    this.timeLineComponent.addKeyFrameOn(keyModel,values,this.currentSelectedAnimableObject.animator.dictAnimations[masterProperty][0].startMoment)
                }else{
                    for(let i=0;i<this.currentSelectedAnimableObject.animator.dictAnimations[masterProperty].length;i+=2){
                        let firstPropertyAnim=this.currentSelectedAnimableObject.animator.dictAnimations[masterProperty][i];
                        let startValues=[];
                        let endValues=[];
                        for(let k in properties){
                            startValues.push(this.currentSelectedAnimableObject.animator.dictAnimations[properties[k]][i].startValue);
                            endValues.push(this.currentSelectedAnimableObject.animator.dictAnimations[properties[k]][i].endValue);
                        }
                        this.timeLineComponent.addKeyFrameOn(keyModel,startValues,firstPropertyAnim.startMoment);
                        this.timeLineComponent.addKeyFrameOn(keyModel,endValues,firstPropertyAnim.endMoment);
                    }

                    let animationsLength=this.currentSelectedAnimableObject.animator.dictAnimations[masterProperty].length;
                    if(animationsLength%2===0){
                        let values=[];
                        for(let k in properties){
                            values.push(this.currentSelectedAnimableObject.animator.dictAnimations[properties[k]][animationsLength-1].endValue);
                        }
                        let firstPropertyAnim=this.currentSelectedAnimableObject.animator.dictAnimations[masterProperty][animationsLength-1];
                        this.timeLineComponent.addKeyFrameOn(keyModel,values,firstPropertyAnim.endMoment);
                    }
                }
            }
        }
    },
    generateObjectPropertiesAnimationsFromKeyFrames:function(laneName){
        let lanePropeties=this.MODELLanesProperties[laneName];
        this.timeLineComponent.sortLaneKeyFramesByTime(laneName);
        for(let i in this.MODELLanesProperties[laneName]){this.currentSelectedAnimableObject.animator.dictAnimations[this.MODELLanesProperties[laneName][i]]=[];}
        let laneActiveKeyFrames=this.timeLineComponent.getLaneActiveKeyFrames(laneName);
        console.log(laneActiveKeyFrames);
        if(laneActiveKeyFrames.length>0){
            if(laneActiveKeyFrames.length===1){
                for(let i in lanePropeties){
                    this.currentSelectedAnimableObject.animator.addAnimation(lanePropeties[i],laneActiveKeyFrames[0].values[i],-1,laneActiveKeyFrames[0].timeLineTime,-1);
                }
            }else{
                for(let i=0;i<laneActiveKeyFrames.length-1;i++){
                    let key=laneActiveKeyFrames;
                    this.currentSelectedAnimableObject.animator.addAnimations(lanePropeties,key[i].values,key[i+1].values,key[i].timeLineTime,key[i+1].timeLineTime);
                }
            }
        }
    },
    updateObjectPropertiesAnimationsFromKeyFrames:function(laneName){
        let lanePropeties=this.MODELLanesProperties[laneName];
        this.timeLineComponent.sortLaneKeyFramesByTime(laneName);
        let laneActiveKeyFrames=this.timeLineComponent.getLaneActiveKeyFrames(laneName);
        if(laneActiveKeyFrames.length>0){
            if(laneActiveKeyFrames.length===1){
                for(let i in lanePropeties){
                    this.currentSelectedAnimableObject.animator.updateAnimation(0,lanePropeties[i],laneActiveKeyFrames[0].values[i],-1,laneActiveKeyFrames[0].timeLineTime,-1)
                }
            }else{
                for(let i=0;i<laneActiveKeyFrames.length-1;i++){
                    let keyframe=laneActiveKeyFrames;
                    this.currentSelectedAnimableObject.animator.updateAnimations(i,lanePropeties,keyframe[i].values,keyframe[i+1].values,keyframe[i].timeLineTime,keyframe[i+1].timeLineTime)
                }
            }
        }
    },
    _addDummyObjectPropertiesAnimation:function(laneName){
        let lanePropeties=this.MODELLanesProperties[laneName];
        for(let i in lanePropeties){
            this.currentSelectedAnimableObject.animator.addAnimation(lanePropeties[i],0,0,0,0);
        }
    },
    discartAllKeyFrames:function(){
        this.timeLineComponent.discartAllKeyFrames();
    },
    notificationOnBtnKeyAddKey:function(laneName){
        if(this.currentSelectedAnimableObject){
            let propertiesValues=[];
            for(let i=0;i<this.MODELLanesProperties[laneName].length;i++){
                let propertyValue=this.currentSelectedAnimableObject.get(this.MODELLanesProperties[laneName][i]);
                propertiesValues.push(propertyValue);
            }
            if(this.timeLineComponent.getLaneKeyFramesLength(laneName)!==1){
                this._addDummyObjectPropertiesAnimation(laneName);
            }
            this.timeLineComponent.addKeyFrameOnMarker(laneName,propertiesValues);
            this.updateObjectPropertiesAnimationsFromKeyFrames(laneName)
        }

    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        this.timeLineComponent.setDuration(durationBefore,durationAfter);
    },
    notificationOnSelectionUpdated:function(obj){
        let newSelectedObject=CanvasManager.getSelectedAnimableObj();
        if(newSelectedObject!=null){
            if(this.currentSelectedAnimableObject===newSelectedObject){
                return;
            }else{
                this.currentSelectedAnimableObject=newSelectedObject;
                this.timeLineComponent.discartAllKeyFrames();
                this.generateKeyFramesForNewObject();
            }
        }else{
            this.discartAllKeyFrames();
            this.currentSelectedAnimableObject=null;
        }
    },
    notificationOnBtnDeleteKeyFrame:function(){
        let dictCantLaneKeyFrames=this.timeLineComponent.discartSelectedKeyFrames();
        for(let key in dictCantLaneKeyFrames){
            if(dictCantLaneKeyFrames[key]>0){
                this.generateObjectPropertiesAnimationsFromKeyFrames(key);
            }
        }
    },
    /*notificaciones de componentes HIJOS*/
    notificationOnKeyFrameDragging:function(laneName){

    },
    notificationOnKeyFrameDragEnded:function(dictLanesNames){
        for(let key in dictLanesNames){
            if(dictLanesNames[key]>0){
                this.updateObjectPropertiesAnimationsFromKeyFrames(key);
            }
        }
    },
    notificationOnMarkerDragEnded:function(time){
        this.parentClass.childNotificationOnMarkerDragEnded(time);
    },
    notificationOnMarkerDragging:function(time){
        this.parentClass.childNotificationOnMarkerDragging(time);
    },

}
let PanelActionEditor={ // EL PANEL ACTION EDITOR, DONDE SE ANIMAN PROPIEDADES
    name:'PanelActionEditor',
    events:{
        OnDurationInput:'OnDurationInput',
        OnFieldPropertyInput:'OnFieldPropertyInput',
        OnMarkerDragged:'OnMarkerDragged',
        OnMarkerDragEnded:'OnMarkerDragEnded'
    },
    HTMLElement:null,
    HTMLtimeline:null,
    HTMLtimeline_timeBar:null,
    HTMLtimeline_keyframesBar:null,

    HTMLdurationFormInput:null,
    HTMLdurationForm:null,
    marker:null,

    SectionProperties:SectionProperties,
    SectionTimeLine:SectionTimeLine,
    SectionActionEditorMenu:SectionActionEditorMenu,

    timelineController:null,
    timeLineDuration:3000,
    totalProgress:0,

    timeBar_numSegments:0,
    timeBar_segmentLongitude:0,

    dictPropertyLanes:{},

    init:function(){

        this.SectionProperties.init(this);
        this.SectionTimeLine.init(this);
        this.SectionActionEditorMenu.init(this);
        this.HTMLdurationFormInput=document.querySelector(".editors-options__action-editor-options__form-duration__input");
        this.HTMLdurationForm=document.querySelector(".action-editor-options__form-duration");
        this.HTMLElement=document.querySelector(".action-editor");//todo el panel
        this.HTMLtimeline=document.querySelector(".action-editor__timeline-area");

        this.setDuration(3000,3000);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjModified,this);

        //this._setupFormDuration();
        WindowManager.registerObserverOnResize(this);
    },
    setController:function(obj){
        this.timelineController=obj;
    },
    setDuration:function(durationBefore,durationAfter){
        this.timelineController.animator.setTotalDuration(durationAfter);
        this.SectionTimeLine.notificationOnDurationChange(durationBefore,durationAfter);
        this.timeLineDuration=durationAfter;
    },
    getTimeLineDuration:function(){
        return this.timeLineDuration;
    },
    childNotificationOnMarkerDragging:function(time){
        MainMediator.notify(this.name,this.events.OnMarkerDragged,[time]);
    },
    childNotificationOnMarkerDragEnded:function(){
        MainMediator.notify(this.name,this.events.OnMarkerDragEnded);
    },
    notificationOnResize:function(){
        this._UIupdateSizes_timelineComponents();
    },
    /*
    notificationOnOptionClicked:function(property){//del menu keyframes
        //use the correct dictionary (according to selectoed object)
        this.dictPropertyLanes[property].generateKeyFrame(this.timelineController.animator.totalProgress);
    },*/
    childNotificationOnBtnKeyAddKey:function(btnNameAttr){
        this.SectionTimeLine.notificationOnBtnKeyAddKey(btnNameAttr)
    },
    childNotificationOnDurationInput:function(newDuration){
        this.setDuration(this.timeLineDuration,newDuration);
        MainMediator.notify(this.name,this.events.OnDurationInput,[this.timeLineDuration,newDuration]);
    },
    childNotificationOnBtnDeleteKeyFrame:function(){
        this.SectionTimeLine.notificationOnBtnDeleteKeyFrame();
    },
    childNotificationOnFieldPropertyInput:function(propName,propNewValue){
        MainMediator.notify(this.name,this.events.OnFieldPropertyInput,[propName,propNewValue]);
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.SectionProperties.notificationOnSelectionUpdated();
        this.SectionTimeLine.notificationOnSelectionUpdated();
    },
    notificationCanvasManagerOnObjModified:function(){
        this.SectionProperties.notificationOnObjModified();
    }
}

var PanelAnimation={//LA VENTANA COMPLETA
    HTMLElement:null,
    PanelActionEditor:PanelActionEditor,
    timelineController:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-animation");
        this.HTMLElement.style.width=window.innerWidth + "px";
        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDesignPathsClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);
    },
    setController:function(obj){
        this.timelineController=obj;
        this.PanelActionEditor.setController(obj);
    },
    notificationPanelDesignerOptionsOnSettingActionClicked:function(){
        let self=PanelAnimation;
        this.HTMLElement.style.display="block";
    },
    notificationPanelAssetsOnImageAssetDesignPathsClicked:function(args){
        let self=PanelAnimation;
        self.HTMLElement.style.display="none";
    }
}





