var Lane=function(parentClass,name){
    this.name=name;
    this.element=null;
    this.btnAddKey=null;
    this.label=null;
    this.parentClass=parentClass;
    //this.btnDelete=this.element.querySelector("btn-delete");

    this.init=function(){
        this.element=document.createElement("div");
        this.label=document.createElement("p");
        this.btnAddKey=document.createElement("span");
        this.element.appendChild(this.label);
        this.element.appendChild(this.btnAddKey);
        this.parentClass.HTMLElement.children[0].appendChild(this.element);

        this.element.classList.add("action-editor__properties-area__list__item");
        this.label.classList.add("action-editor__properties-area__list__item__label");
        this.btnAddKey.classList.add("btn-add-keyframe");

        this.label.textContent=name;
        this.btnAddKey.textContent="+";

        this.btnAddKey.addEventListener("click",this.OnBtnAddKeyClicked.bind(this))
    }
    this.enable=function(){
        this.element.style.display="block";
    };
    this.disable=function(){
        this.element.style.display="none";
    };
    this.OnBtnAddKeyClicked=function(e){
        this.parentClass.OnBtnAddKeyClicked(this.name);
    }
    this.init();
}
var SectionLanes={
    HTMLElement:null,
    listObserversOnBtnAddKey:[],
    listObserversOnFieldInput:[],
    MODELLanesNames:["position","scale","rotation","opacity"],
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".action-editor__properties-area");

        this.lanes=[];

        this.initLanes();
    },
    initLanes:function(){
        for(let i in this.MODELLanesNames){
            this.lanes.push(new Lane(this,this.MODELLanesNames[i]));
        }
    },
    desableLanes:function(){
        for(let i in this.lanes){
            this.lanes[i].disable();
        }
    },
    enableFields:function(){
        for(let i in this.lanes){
            this.lanes[i].enable();
        }
    },
    OnBtnAddKeyClicked:function(propertyName){
        this.notifyOnBtnAddKey(propertyName);
    },
    notificationOnSelectionUpdated:function(){
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(selectedAnimObj){
            for(let i in this.lanes){
                this.lanes[i].enable();
            }
        }else{
            for(let i in this.lanes){
                this.lanes[i].disable();
            }
        }
    },
    notifyOnBtnAddKey:function(propName){
        this.parentClass.childNotificationOnBtnKeyAddKey(propName);
    },
}
var SectionActionEditorMenu={
    HTMLBtnDeleteKeyFrame:null,
    HTMLSelectFunctions:null,

    MODELMenuTweenTypes:Object.keys(EnumAnimationTweenType),
    MODELMenuEasingTypes:Object.keys(EnumAnimationEasingType),
    selectedOptionInTweenTypeMenu:null,
    selectedOptionInEasingTypeMenu:null,

    listSelectedKeyFramesAnimations:[],
    listSelectedKeyFrames:[],

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLBtnDeleteKeyFrame= document.querySelector(".action-editor-menu__keyframes-options .keyframes-options__delete");
        this.HTMLTweensMenu=     document.querySelector(".action-editor-menu__keyframes-options .keyframes-options__list-functions");
        this.HTMLEasingsMenu=        document.querySelector('.action-editor-menu__keyframes-options .keyframes-options__tween-type-menu')

        this.HTMLBtnZoomInTimeline= document.querySelector(".action-editor-menu__timeline-options__zoom-in");
        this.HTMLBtnZoomOutTimeline=document.querySelector(".action-editor-menu__timeline-options__zoom-out");

        this.HTMLdurationFormInput=document.querySelector(".editors-options__action-editor-options__form-duration__input");
        this.initHTMLTweenMenu();
        this.initHTMLEasingsMenu();
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLBtnDeleteKeyFrame.addEventListener("click",this.onBtnDeleteKeyFrame.bind(this));
        this.HTMLTweensMenu.querySelector('ul').addEventListener("mouseup",this.OnListTweenItemClicked.bind(this));
        this.HTMLEasingsMenu.addEventListener("click",this.OnEasingMenuItemClicked.bind(this))
        this.HTMLBtnZoomInTimeline.addEventListener("click",function (){});
        this.HTMLBtnZoomOutTimeline.addEventListener("click",function(){})
        this.HTMLdurationFormInput.addEventListener("focusout",this.onDurationInput.bind(this))
        WindowManager.registerOnKeyEnterPressed(this);
    },
    initHTMLTweenMenu:function(){
        let list=this.HTMLTweensMenu.querySelector('ul');
        for(let i=0;i<this.MODELMenuTweenTypes.length;i++){
            let li=document.createElement('li');
            li.textContent=this.MODELMenuTweenTypes[i];
            li.setAttribute('name',this.MODELMenuTweenTypes[i]);
            li.setAttribute('index',i);
            li.className='list-functions__option'
            list.appendChild(li);
        }
    },
    initHTMLEasingsMenu:function(){
        for(let i=0;i<this.MODELMenuEasingTypes.length;i++){
            let button=document.createElement('button');
            button.textContent=this.MODELMenuEasingTypes[i];
            button.setAttribute("name",this.MODELMenuEasingTypes[i]);
            button.className='tween-type-menu__option';
            this.HTMLEasingsMenu.appendChild(button);
        }
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
    OnListTweenItemClicked:function(e){
        if(this.listSelectedKeyFramesAnimations.length===0){return;}
        if(e.target.className==="list-functions__option"){
            let newFunctionName=e.target.getAttribute("name");
            for(let i=0;i<this.listSelectedKeyFramesAnimations.length;i++){
                this.listSelectedKeyFramesAnimations[i].setTweenType(newFunctionName);
            }
            for(let i=0;i<this.listSelectedKeyFrames.length;i++){
                this.listSelectedKeyFrames[i].data.tweenType=newFunctionName;
            }
            this.activateMenuTweensOption(newFunctionName);
        }
    },
    OnEasingMenuItemClicked:function(e){
        if(this.listSelectedKeyFramesAnimations.length===0){return;}
        if(e.target.className==='tween-type-menu__option'){
            let easingTypeName=e.target.getAttribute('name');
            for(let i=0;i<this.listSelectedKeyFramesAnimations.length;i++){
                this.listSelectedKeyFramesAnimations[i].setEasingType(easingTypeName);
            }
            for(let i=0;i<this.listSelectedKeyFrames.length;i++){
                this.listSelectedKeyFrames[i].data.easingType=easingTypeName;
            }
            this.activateMenuEasingOption(easingTypeName);
        }
    },
    activateMenuTweensOption:function(TweenType){
        if(this.selectedOptionInTweenTypeMenu){
            this.selectedOptionInTweenTypeMenu.classList.remove('active');
        }
        if(TweenType !== ''){
            let liIndex=this.MODELMenuTweenTypes.indexOf(TweenType);
            console.log(liIndex);
            this.selectedOptionInTweenTypeMenu=this.HTMLTweensMenu.querySelector('ul').children[liIndex];
            this.selectedOptionInTweenTypeMenu.classList.add('active');
            this.HTMLTweensMenu.querySelector(".current-selection").textContent=TweenType;
        }else{
            this.selectedOptionInTweenTypeMenu=null;
            this.HTMLTweensMenu.querySelector(".current-selection").textContent='----------';

        }
    },
    activateMenuEasingOption:function(easingTypeName){
        if(this.selectedOptionInEasingTypeMenu){
            this.selectedOptionInEasingTypeMenu.classList.remove('active');
        }
        if(easingTypeName!==''){
            let optIndex=this.MODELMenuEasingTypes.indexOf(easingTypeName);
            this.selectedOptionInEasingTypeMenu=this.HTMLEasingsMenu.children[optIndex];
            this.selectedOptionInEasingTypeMenu.classList.add('active');
        }else{
            this.selectedOptionInEasingTypeMenu=null;
        }
    },
    updateUIFromAnimations:function(){
        if(this.listSelectedKeyFramesAnimations.length>0){
            let firstAnimationFunction=this.listSelectedKeyFramesAnimations[0].tweenType;
            let firstAnimationTween=this.listSelectedKeyFramesAnimations[0].easingType;
            let flagMoreThanOneType=false;
            let flagMoreThanOneTween=false;
            for(let i=0;i<this.listSelectedKeyFramesAnimations.length;i++){
                if(this.listSelectedKeyFramesAnimations[i].tweenType!==firstAnimationFunction){
                    flagMoreThanOneType=true;
                }
                if(this.listSelectedKeyFramesAnimations[i].easingType!==firstAnimationTween){
                    flagMoreThanOneTween=true;
                }
            }
            if(flagMoreThanOneType){
                this.activateMenuTweensOption('')

            }else{
                this.activateMenuTweensOption(firstAnimationFunction);
            }
            if(flagMoreThanOneTween){
                this.activateMenuEasingOption('');
            }else{
                this.activateMenuEasingOption(firstAnimationTween);
            }
        }else{
            this.activateMenuTweensOption('');
            this.activateMenuEasingOption('');
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
    },
    notificationOnKeyBarSelectionUpdated:function (listAnimations,listSelectedKeyFrames){
        this.listSelectedKeyFramesAnimations=listAnimations;
        this.listSelectedKeyFrames=listSelectedKeyFrames;
        this.updateUIFromAnimations(listAnimations);
    },
    notificationOnKeyframeDragEnded:function(listAnimations,listSelectedKeyFrames){
        this.listSelectedKeyFramesAnimations=listAnimations;
        this.listSelectedKeyFrames=listSelectedKeyFrames;
        this.updateUIFromAnimations(listAnimations);
    }
}
let SectionTimeLine={
    HTMLElement:null,

    timeLineComponent:null,
    MODELLanesProperties:{"position":["left","top"],"scale":["scaleX","scaleY"],"rotation":["angle"],"opacity":["opacity"]},
    currentSelectedAnimableObjects:null,

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".action-editor__timeline-area");
        this.timeLineComponent=new TimeLineProxy(WindowManager,"#cTimeLine",Object.keys(this.MODELLanesProperties),this);


    },
    generateKeyFramesForNewObject:function(){
        let tmplistDictsPropertyLanes=[];
        for(let objectIndex=0;objectIndex<this.currentSelectedAnimableObjects.length;objectIndex++){
            tmplistDictsPropertyLanes.push({});
            for(let keyModel in this.MODELLanesProperties){
                tmplistDictsPropertyLanes[objectIndex][keyModel]=[];
            }
            for(let keyModel in this.MODELLanesProperties){
                let properties=this.MODELLanesProperties[keyModel];
                let masterProperty=properties[0];
                if(this.currentSelectedAnimableObjects[objectIndex].animator.hasPropertyAnimations(masterProperty)){
                    if(!this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][0].hasTwoKeys()){
                        let values=[];
                        for(let k in properties){
                            values.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][0].startValue);
                        }
                        let masterAnimation=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][0];
                        tmplistDictsPropertyLanes[objectIndex][keyModel].push({data:{values:values,easingType:masterAnimation.easingType,tweenType:masterAnimation.tweenType},time:masterAnimation.startMoment});
                    }else{
                        for(let i=0;i<this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty].length;i+=2){
                            let firstPropertyAnim=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][i];
                            let startValues=[];
                            let endValues=[];
                            for(let k in properties){
                                startValues.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][i].startValue);
                                endValues.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][i].endValue);
                            }
                            let animation=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][i];
                            let nextAnimation=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][i+1];

                            tmplistDictsPropertyLanes[objectIndex][keyModel].push({data:{values:startValues,easingType:animation.easingType,tweenType:animation.tweenType},time:firstPropertyAnim.startMoment});
                            if(nextAnimation !== undefined){
                                tmplistDictsPropertyLanes[objectIndex][keyModel].push({data:{values:endValues,easingType:nextAnimation.easingType,tweenType:nextAnimation.tweenType},time:firstPropertyAnim.endMoment});
                            }else{
                                tmplistDictsPropertyLanes[objectIndex][keyModel].push({data:{values:endValues,easingType:EnumAnimationEasingType.In,tweenType:EnumAnimationTweenType.Sine},time:firstPropertyAnim.endMoment});
                            }
                        }

                        let animationsLength=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty].length;
                        if(animationsLength%2===0){
                            let values=[];
                            for(let k in properties){
                                values.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][animationsLength-1].endValue);
                            }
                            let firstPropertyAnim=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][animationsLength-1];
                            tmplistDictsPropertyLanes[objectIndex][keyModel].push({data:{values:values,easingType:EnumAnimationEasingType.In,tweenType:EnumAnimationTweenType.Sine},time:firstPropertyAnim.endMoment});
                        }
                    }
                }
            }
        }

        this.timeLineComponent.addKeyFramesInBatch(tmplistDictsPropertyLanes);
    },
    generateObjectPropertiesAnimationsFromKeyFrames:function(laneName){
        let lanePropeties=this.MODELLanesProperties[laneName];
        this.timeLineComponent.sortLaneKeyFramesByTime(laneName);
        for(let i in lanePropeties){
            for(let objectIndex=0;objectIndex<this.currentSelectedAnimableObjects.length;objectIndex++){
                this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[this.MODELLanesProperties[laneName][i]]=[];
            }
        }
        let listListlaneActiveKeyFrames=this.timeLineComponent.getLaneActiveKeyFramesByIds(laneName);
        for(let objectIndex=0;objectIndex<listListlaneActiveKeyFrames.length;objectIndex++){
            if(listListlaneActiveKeyFrames[objectIndex]===undefined){continue;}
            if(listListlaneActiveKeyFrames[objectIndex].length===1){
                for(let i in lanePropeties){
                    this.currentSelectedAnimableObjects[objectIndex].animator.addAnimation(lanePropeties[i],listListlaneActiveKeyFrames[objectIndex][0].data.values[i],-1,listListlaneActiveKeyFrames[objectIndex][0].timeLineTime,-1,listListlaneActiveKeyFrames[objectIndex][0].data.easingType,listListlaneActiveKeyFrames[objectIndex][0].tweenType);
                }
            }else{
                for(let i=0;i<listListlaneActiveKeyFrames[objectIndex].length-1;i++){
                    let keys=listListlaneActiveKeyFrames[objectIndex];
                    this.currentSelectedAnimableObjects[objectIndex].animator.addAnimations(lanePropeties,keys[i].data.values,keys[i+1].data.values,keys[i].timeLineTime,keys[i+1].timeLineTime,keys[i].data.easingType,keys[i].data.tweenType);
                }
            }

        }
    },
    updateObjectPropertiesAnimationsFromKeyFrames:function(laneName){//antes asegurarse que el numero de keyframes y las animaciones del object son compatibles
        let lanePropeties=this.MODELLanesProperties[laneName];
        let laneActiveKeyFramesById=this.timeLineComponent.getLaneActiveKeyFramesByIds(laneName);
        for(let objectIndex=0;objectIndex<laneActiveKeyFramesById.length;objectIndex++){
            if(laneActiveKeyFramesById[objectIndex]===undefined){continue;}
            if(laneActiveKeyFramesById[objectIndex].length===1){
                for(let j in lanePropeties){
                    this.currentSelectedAnimableObjects[objectIndex].animator.updateAnimation(0,lanePropeties[j],laneActiveKeyFramesById[objectIndex][0].data.values[j],-1,laneActiveKeyFramesById[objectIndex][0].timeLineTime,-1,laneActiveKeyFramesById[objectIndex][0].data.easingType,laneActiveKeyFramesById[objectIndex][0].data.tweenType);
                }
            }else{
                for(let j=0;j<laneActiveKeyFramesById[objectIndex].length-1;j++){
                    let keyframes=laneActiveKeyFramesById[objectIndex];
                    this.currentSelectedAnimableObjects[objectIndex].animator.updateAnimations(j,lanePropeties,keyframes[j].data.values,keyframes[j+1].data.values,keyframes[j].timeLineTime,keyframes[j+1].timeLineTime,keyframes[j].data.easingType,keyframes[j].data.tweenType);
                }
            }

        }

    },
    _addObjectAnimationsByLane:function(laneName,animableObject){
        let lanePropeties=this.MODELLanesProperties[laneName];
        for(let i in lanePropeties){
            animableObject.animator.addAnimation(lanePropeties[i],0,0,0,0,EnumAnimationEasingType.In,EnumAnimationTweenType.Sine);
        }
    },

    extractAnimationsFromSelectedKeyFrames:function(listSelectedKeyFrames){
        let listAnimations=[];
        for(let i=0;i<listSelectedKeyFrames.length;i++){
            let indexInParentList=listSelectedKeyFrames[i].indexInParentList;
            let objectIdentifier=listSelectedKeyFrames[i].identifier;
            let laneName=listSelectedKeyFrames[i].laneName;
            let propertiesForLaneName=this.MODELLanesProperties[laneName];
            if(this.currentSelectedAnimableObjects[objectIdentifier].animator.dictAnimations[propertiesForLaneName[0]][indexInParentList]===undefined){
                //the current keyframe is the last one, so it has no animation related to it
                continue;
            }
            for(let k=0;k<propertiesForLaneName.length;k++){
                let anim=this.currentSelectedAnimableObjects[objectIdentifier].animator.dictAnimations[propertiesForLaneName[k]][indexInParentList];
                listAnimations.push(anim);
            }
        }
        return listAnimations;
    },
    notificationOnBtnKeyAddKey:function(laneName){
        if(this.currentSelectedAnimableObjects){
            let listListpropertiesValues=[];
            //collecting values
            for(let objectIndex=0;objectIndex<this.currentSelectedAnimableObjects.length;objectIndex++){
                listListpropertiesValues.push({values:[],easingType:EnumAnimationEasingType.In,tweenType:EnumAnimationTweenType.Sine});

                for(let i in this.MODELLanesProperties[laneName]){
                    let propertyValue=this.currentSelectedAnimableObjects[objectIndex].getCustom(this.MODELLanesProperties[laneName][i]);
                    listListpropertiesValues[objectIndex].values.push(propertyValue);
                }

            }
            //adding animations and keyframes
            for(let objectIndex=0;objectIndex<this.currentSelectedAnimableObjects.length;objectIndex++) {
                let masterProperty = this.MODELLanesProperties[laneName][0];
                let animableObject=this.currentSelectedAnimableObjects[objectIndex];
                if (!animableObject.animator.hasPropertyAnimations(masterProperty) ||
                    animableObject.animator.dictAnimations[masterProperty][0].hasTwoKeys()) {
                    this._addObjectAnimationsByLane(laneName,animableObject);
                }
            }
            //Adding keyframes (not in batch) entails sorting of keyframes of the lane in question
            this.timeLineComponent.addKeyFrameOnMarker(laneName,listListpropertiesValues);

            //updating animations based on the keyframes
            this.updateObjectPropertiesAnimationsFromKeyFrames(laneName)
        }

    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        this.timeLineComponent.setDuration(durationBefore,durationAfter);
    },
    notificationOnSelectionUpdated:function(obj){
        let newSelectedObject=CanvasManager.getSelectedAnimableObj();
        if(newSelectedObject!=null){
            if(newSelectedObject.type==="activeSelection"){
                this.currentSelectedAnimableObjects=newSelectedObject.getObjects();
            }
            else if(this.currentSelectedAnimableObjects===newSelectedObject){
                return;
            }else{
                this.currentSelectedAnimableObjects=[newSelectedObject];
            }
            this.timeLineComponent.discartAllKeyFrames();
            this.generateKeyFramesForNewObject();
        }else{
            this.timeLineComponent.discartAllKeyFrames();
            this.currentSelectedAnimableObjects=null;
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
                //sorting by time the keyframes of the lane affected considering the new keyframe
                this.timeLineComponent.sortLaneKeyFramesByTime(key);

                this.updateObjectPropertiesAnimationsFromKeyFrames(key);
            }
        }
        //from this point similar pipeline than when keyframes selection updated, because of the menu, then a keyframe is drawgged it points to a different animation
        this.timeLineComponent.updateKeyFramesIndexByObject();
        let listSelectedKeyFrames=this.timeLineComponent.getSelectedKeyFrames();
        let listAnimations = this.extractAnimationsFromSelectedKeyFrames(listSelectedKeyFrames);
        this.parentClass.childNotificationOnKeyframeDragEnded(listAnimations,listSelectedKeyFrames);

    },
    notificationOnKeyBarSelectionUpdated:function() {
        this.timeLineComponent.updateKeyFramesIndexByObject();
        let listSelectedKeyFrames=this.timeLineComponent.getSelectedKeyFrames();
        let listAnimations = this.extractAnimationsFromSelectedKeyFrames(listSelectedKeyFrames);
        this.parentClass.childNotificationOnKeyBarSelectionUpdated(listAnimations,listSelectedKeyFrames);
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

    SectionLanes:SectionLanes,
    SectionTimeLine:SectionTimeLine,
    SectionActionEditorMenu:SectionActionEditorMenu,

    timelineController:null,
    timeLineDuration:3000,
    totalProgress:0,

    timeBar_numSegments:0,
    timeBar_segmentLongitude:0,

    dictPropertyLanes:{},

    init:function(){

        this.SectionLanes.init(this);
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
    childNotificationOnKeyBarSelectionUpdated:function(listAnimations,listSelectedKeyFrames){
        this.SectionActionEditorMenu.notificationOnKeyBarSelectionUpdated(listAnimations,listSelectedKeyFrames);
    },
    childNotificationOnKeyframeDragEnded:function(listAnimations,listSelectedKeyFrames){
        this.SectionActionEditorMenu.notificationOnKeyframeDragEnded(listAnimations,listSelectedKeyFrames);
        },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.SectionLanes.notificationOnSelectionUpdated();
        this.SectionTimeLine.notificationOnSelectionUpdated();
    },
    notificationCanvasManagerOnObjModified:function(){

    },

}

var PanelAnimation={//LA VENTANA COMPLETA
    HTMLElement:null,
    PanelActionEditor:PanelActionEditor,
    timelineController:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-animation");
        this.HTMLElement.style.width=window.innerWidth + "px";
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
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
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        let self=PanelAnimation;
        self.HTMLElement.style.display="none";
    }
}





