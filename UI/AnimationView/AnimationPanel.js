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
            fieldHTML.value=selectedAnimObj.getCustom(fieldHTML.getAttribute("property"));
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

    MODELFunctionsMenu:Object.keys(EnumAnimationFunctionTypes),
    MODELMenuTweenTypes:Object.keys(EnumAnimationTweenType),
    selectedOptionInFunctionsMenu:null,
    selectedOptionInTweenTypesMenu:null,

    listSelectedKeyFramesAnimations:[],
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLBtnDeleteKeyFrame= document.querySelector(".action-editor-menu__keyframes-options .keyframes-options__delete");
        this.HTMLFunctionsMenu=     document.querySelector(".action-editor-menu__keyframes-options .keyframes-options__list-functions");
        this.HTMLTweensMenu=        document.querySelector('.action-editor-menu__keyframes-options .keyframes-options__tween-type-menu')

        this.HTMLBtnZoomInTimeline= document.querySelector(".action-editor-menu__timeline-options__zoom-in");
        this.HTMLBtnZoomOutTimeline=document.querySelector(".action-editor-menu__timeline-options__zoom-out");

        this.HTMLdurationFormInput=document.querySelector(".editors-options__action-editor-options__form-duration__input");
        this.initHTMLFunctionsMenu();
        this.initHTMLMenuTweenTypes();
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLBtnDeleteKeyFrame.addEventListener("click",this.onBtnDeleteKeyFrame.bind(this));
        this.HTMLFunctionsMenu.querySelector('ul').addEventListener("mouseup",this.onListFunctionsClicked.bind(this));
        this.HTMLTweensMenu.addEventListener("click",this.OnTweensMenuClicked.bind(this))
        this.HTMLBtnZoomInTimeline.addEventListener("click",function (){});
        this.HTMLBtnZoomOutTimeline.addEventListener("click",function(){})
        this.HTMLdurationFormInput.addEventListener("focusout",this.onDurationInput.bind(this))
        WindowManager.registerOnKeyEnterPressed(this);
    },
    initHTMLFunctionsMenu:function(){
        let list=this.HTMLFunctionsMenu.querySelector('ul');
        for(let i=0;i<this.MODELFunctionsMenu.length;i++){
            let li=document.createElement('li');
            li.textContent=this.MODELFunctionsMenu[i];
            li.setAttribute('name',this.MODELFunctionsMenu[i]);
            li.setAttribute('index',i);
            li.className='list-functions__option'
            list.appendChild(li);
        }
    },
    initHTMLMenuTweenTypes:function(){
        for(let i=0;i<this.MODELMenuTweenTypes.length;i++){
            let button=document.createElement('button');
            button.textContent=this.MODELMenuTweenTypes[i];
            button.setAttribute("name",this.MODELMenuTweenTypes[i]);
            button.className='tween-type-menu__option';
            this.HTMLTweensMenu.appendChild(button);
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
    onListFunctionsClicked:function(e){
        if(this.listSelectedKeyFramesAnimations.length===0){return;}
        if(e.target.className==="list-functions__option"){
            let newFunctionName=e.target.getAttribute("name");
            for(let i=0;i<this.listSelectedKeyFramesAnimations.length;i++){
                this.listSelectedKeyFramesAnimations[i].setEaseFunctionType(newFunctionName);
            }
            this.activateMenuFunctionsOption(newFunctionName);
        }
    },
    OnTweensMenuClicked:function(e){
        if(this.listSelectedKeyFramesAnimations.length===0){return;}
        if(e.target.className==='tween-type-menu__option'){
            let tweenTypeName=e.target.getAttribute('name');
            for(let i=0;i<this.listSelectedKeyFramesAnimations.length;i++){
                this.listSelectedKeyFramesAnimations[i].setTweenType(tweenTypeName);
            }
            this.activateMenuTweenTypesOption(tweenTypeName);
        }
    },
    activateMenuFunctionsOption:function(functionName){
        if(this.selectedOptionInFunctionsMenu){
            this.selectedOptionInFunctionsMenu.classList.remove('active');
        }
        if(functionName !== ''){
            let liIndex=-1;
            for(let i in this.MODELFunctionsMenu){
                if(this.MODELFunctionsMenu[i]===functionName){liIndex=i;break}
            }
            this.selectedOptionInFunctionsMenu=this.HTMLFunctionsMenu.querySelector('ul').children[liIndex];
            this.selectedOptionInFunctionsMenu.classList.add('active');
            this.HTMLFunctionsMenu.querySelector(".current-selection").textContent=functionName;
        }else{
            this.selectedOptionInFunctionsMenu=null;
            this.HTMLFunctionsMenu.querySelector(".current-selection").textContent='----------';

        }
    },
    activateMenuTweenTypesOption:function(tweenTypeName){
        if(this.selectedOptionInTweenTypesMenu){
            this.selectedOptionInTweenTypesMenu.classList.remove('active');
        }
        if(tweenTypeName!==''){
            let optIndex=-1;
            for(let i in this.MODELMenuTweenTypes){
                if(this.MODELMenuTweenTypes[i]===tweenTypeName){optIndex=i;break}
            }
            this.selectedOptionInTweenTypesMenu=this.HTMLTweensMenu.children[optIndex];
            this.selectedOptionInTweenTypesMenu.classList.add('active');
        }else{
            this.selectedOptionInTweenTypesMenu=null;
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
    notificationOnKeyBarSelectionUpdated:function (listAnimations){
        this.listSelectedKeyFramesAnimations=listAnimations;
        console.log(listAnimations);
        if(this.listSelectedKeyFramesAnimations.length>0){
            let firstType=this.listSelectedKeyFramesAnimations[0].easeFunctionType;
            let firstTween=this.listSelectedKeyFramesAnimations[0].tweenType;
            let flagMoreThanOneType=false;
            let flagMoreThanOneTween=false;
            for(let i=0;i<this.listSelectedKeyFramesAnimations.length;i++){
                if(this.listSelectedKeyFramesAnimations[i].easeFunctionType!==firstType){
                    flagMoreThanOneType=true;
                }
                if(this.listSelectedKeyFramesAnimations[i].tweenType!==firstTween){
                    flagMoreThanOneTween=true;
                }
            }
            if(flagMoreThanOneType){
                this.activateMenuFunctionsOption('')

            }else{
                this.activateMenuFunctionsOption(firstType);
            }
            if(flagMoreThanOneTween){
                this.activateMenuTweenTypesOption('');
            }else{
                this.activateMenuTweenTypesOption(firstTween);
            }
        }else{
            this.activateMenuFunctionsOption('');
            this.activateMenuTweenTypesOption('');
        }
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

                        tmplistDictsPropertyLanes[objectIndex][keyModel].push({values:values,time:this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][0].startMoment});
                    }else{
                        for(let i=0;i<this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty].length;i+=2){
                            let firstPropertyAnim=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][i];
                            let startValues=[];
                            let endValues=[];
                            for(let k in properties){
                                startValues.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][i].startValue);
                                endValues.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][i].endValue);
                            }
                            tmplistDictsPropertyLanes[objectIndex][keyModel].push({values:startValues,time:firstPropertyAnim.startMoment});
                            tmplistDictsPropertyLanes[objectIndex][keyModel].push({values:endValues,time:firstPropertyAnim.endMoment});
                        }

                        let animationsLength=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty].length;
                        if(animationsLength%2===0){
                            let values=[];
                            for(let k in properties){
                                values.push(this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[properties[k]][animationsLength-1].endValue);
                            }
                            let firstPropertyAnim=this.currentSelectedAnimableObjects[objectIndex].animator.dictAnimations[masterProperty][animationsLength-1];

                            tmplistDictsPropertyLanes[objectIndex][keyModel].push({values:values,time:firstPropertyAnim.endMoment});

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
        let listListlaneActiveKeyFrames=this.timeLineComponent.getLaneActiveKeyFrames(laneName);
        for(let objectIndex=0;objectIndex<listListlaneActiveKeyFrames.length;objectIndex++){
            if(listListlaneActiveKeyFrames[objectIndex]!==undefined){
                if(listListlaneActiveKeyFrames[objectIndex].length===1){
                    for(let i in lanePropeties){
                        this.currentSelectedAnimableObjects[objectIndex].animator.addAnimation(lanePropeties[i],listListlaneActiveKeyFrames[objectIndex][0].values[i],-1,listListlaneActiveKeyFrames[objectIndex][0].timeLineTime,-1);
                    }
                }else{
                    for(let i=0;i<listListlaneActiveKeyFrames[objectIndex].length-1;i++){
                        let keys=listListlaneActiveKeyFrames[objectIndex];
                        this.currentSelectedAnimableObjects[objectIndex].animator.addAnimations(lanePropeties,keys[i].values,keys[i+1].values,keys[i].timeLineTime,keys[i+1].timeLineTime);
                    }
                }
            }
        }
    },
    updateObjectPropertiesAnimationsFromKeyFrames:function(laneName){//antes asegurarse que el numero de keyframes y las animaciones del object son compatibles
        let lanePropeties=this.MODELLanesProperties[laneName];
        let laneActiveKeyFramesById=this.timeLineComponent.getLaneActiveKeyFrames(laneName);
        for(let objectIndex=0;objectIndex<laneActiveKeyFramesById.length;objectIndex++){
            if(laneActiveKeyFramesById[objectIndex]!==undefined){
                if(laneActiveKeyFramesById[objectIndex].length===1){
                    for(let j in lanePropeties){
                        this.currentSelectedAnimableObjects[objectIndex].animator.updateAnimation(0,lanePropeties[j],laneActiveKeyFramesById[objectIndex][0].values[j],-1,laneActiveKeyFramesById[objectIndex][0].timeLineTime,-1)
                    }
                }else{
                    for(let j=0;j<laneActiveKeyFramesById[objectIndex].length-1;j++){
                        let keyframes=laneActiveKeyFramesById[objectIndex];
                        this.currentSelectedAnimableObjects[objectIndex].animator.updateAnimations(j,lanePropeties,keyframes[j].values,keyframes[j+1].values,keyframes[j].timeLineTime,keyframes[j+1].timeLineTime)
                    }
                }
            }
        }

    },
    _addObjectAnimationsByLane:function(laneName,animableObject){
        let lanePropeties=this.MODELLanesProperties[laneName];
        for(let i in lanePropeties){
            animableObject.animator.addAnimation(lanePropeties[i],0,0,0,0);
        }
    },

    extractAnimationsFromSelectedKeyFrames:function(listSelectedKeyFrames,listDictsPropertiesLanesKeysLengths){
        let listAnimations=[];
        for(let i=0;i<listSelectedKeyFrames.length;i++){
            let indexInParentList=listSelectedKeyFrames[i].indexInParentList;
            let objectIdentifier=listSelectedKeyFrames[i].identifier;
            let laneName=listSelectedKeyFrames[i].laneName;
            let propertiesForLaneName=this.MODELLanesProperties[laneName];
            for(let k=0;k<propertiesForLaneName.length;k++){
                if(indexInParentList < (listDictsPropertiesLanesKeysLengths[objectIdentifier][laneName]-1)){
                let anim=this.currentSelectedAnimableObjects[objectIdentifier].animator.dictAnimations[propertiesForLaneName[k]][indexInParentList];
                listAnimations.push(anim);
                }
            }
        }
        return listAnimations;
    },
    notificationOnBtnKeyAddKey:function(laneName){
        if(this.currentSelectedAnimableObjects){
            let listListpropertiesValues=[];
            //collecting values
            for(let objectIndex=0;objectIndex<this.currentSelectedAnimableObjects.length;objectIndex++){
                listListpropertiesValues.push([]);

                for(let i in this.MODELLanesProperties[laneName]){
                    let propertyValue=this.currentSelectedAnimableObjects[objectIndex].getCustom(this.MODELLanesProperties[laneName][i]);
                    listListpropertiesValues[objectIndex].push(propertyValue);
                }

            }
            console.log(listListpropertiesValues);
            //adding animations and keyframes
            for(let objectIndex=0;objectIndex<this.currentSelectedAnimableObjects.length;objectIndex++) {
                let masterProperty = this.MODELLanesProperties[laneName][0];
                let animableObject=this.currentSelectedAnimableObjects[objectIndex];
                if (!animableObject.animator.hasPropertyAnimations(masterProperty) ||
                    animableObject.animator.dictAnimations[masterProperty][0].hasTwoKeys()) {
                    this._addObjectAnimationsByLane(laneName,animableObject);
                }
            }
            this.timeLineComponent.addKeyFrameOnMarker(laneName,listListpropertiesValues);
            //sorting by time the keyframes of the lane affected considering the new keyframe
            this.timeLineComponent.sortLaneKeyFramesByTime(laneName);
            //updateing animations based on the keyframes
            this.updateObjectPropertiesAnimationsFromKeyFrames(laneName)
        }

    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        this.timeLineComponent.setDuration(durationBefore,durationAfter);
    },
    notificationOnSelectionUpdated:function(obj){
        let newSelectedObject=CanvasManager.getSelectedAnimableObj();
        console.log(newSelectedObject);
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
    },
    notificationOnKeyBarSelectionUpdated:function(listSelectedKeyFrames,listDictsPropertiesLanesKeysLengths) {
        let listAnimations = this.extractAnimationsFromSelectedKeyFrames(listSelectedKeyFrames, listDictsPropertiesLanesKeysLengths);
        this.parentClass.childNotificationOnKeyBarSelectionUpdated(listSelectedKeyFrames,listAnimations);
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
    childNotificationOnKeyBarSelectionUpdated:function(listKeyFrames,listAnimations){
        this.SectionActionEditorMenu.notificationOnKeyBarSelectionUpdated(listAnimations);
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





