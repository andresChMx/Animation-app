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
        this.parentClass.HTMLElement.children[1].appendChild(this.element);

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

    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;

        let me=this;
        this.widgetsKeyframeTools={
            deleteKeyframe:{
                htmlElem:document.querySelector(".action-editor__properties-area__toolbar .btn-delete-keyframe"),
                enable:function(){this.htmlElem.classList.remove("disabled");},
                desable:function(){this.htmlElem.classList.add("disabled")},
                initEvents:function (){this.htmlElem.addEventListener("click",this.OnTrigger.bind(this))},
                OnTrigger:function(){me.OnWidgetChanged("delete-keyframe");}
            },
            menuFunctions:{
                htmlElem:document.querySelector(".action-editor__properties-area__toolbar .menu-functions"),
                val:{listKeyframes:[],listAnimations:[]},
                htmlEasingItemSelected:null,
                htmlTweenItemSelected:null,
                auxBtnOpenMouseDown:false,
                auxMouseOverMenu:false,
                enable:function(){this.htmlElem.classList.remove("disabled");},
                desable:function(){this.htmlElem.classList.add("disabled")},
                initEvents:function(){
                    this.htmlElem.addEventListener("mouseover",function(){this.auxMouseOverMenu=true;}.bind(this))
                    this.htmlElem.addEventListener("mouseout",function(){this.auxMouseOverMenu=false;}.bind(this))

                    this.htmlElem.children[0].addEventListener("click",this.OnTrigger.bind(this));
                    this.htmlElem.children[0].addEventListener("mousedown",function(){this.auxBtnOpenMouseDown=true;}.bind(this));

                    let easingList=this.htmlElem.querySelector(".menu-functions__dropdown__easing-list");
                    let tweenList=this.htmlElem.querySelector(".menu-functions__dropdown__tween-list");
                    for(let i=0;i<easingList.children.length;i++){
                        easingList.children[i].addEventListener("click",this.OnTrigger.bind(this));
                    }
                    for(let i=0;i<tweenList.children.length;i++){
                        tweenList.children[i].addEventListener("click",this.OnTrigger.bind(this));
                    }

                },
                OnTrigger:function(e){
                    if(this.val.listAnimations.length===0){return;}
                    if(e.target.className==="menu-functions__trigger"){
                        this.htmlElem.children[1].classList.toggle("active");
                        this.auxBtnOpenMouseDown=false;
                    }else if(e.target.className==="item-tween-list"){
                        let newEasingName=e.target.getAttribute("name");
                        for(let i=0;i<this.val.listAnimations.length;i++){this.val.listAnimations[i].setTweenType(newEasingName);}
                        for(let i=0;i<this.val.listKeyframes.length;i++){this.val.listKeyframes[i].data.tweenType=newEasingName;}
                        this.activateMenuTweensOption(newEasingName);
                    }else if(e.target.className==="item-easing-list"){
                        let easingTypeName=e.target.getAttribute('name');
                        for(let i=0;i<this.val.listAnimations.length;i++){this.val.listAnimations[i].setEasingType(easingTypeName);}
                        for(let i=0;i<this.val.listKeyframes.length;i++){this.val.listKeyframes[i].data.easingType=easingTypeName;}
                        this.activateMenuEasingOption(easingTypeName);
                    }
                },
                activateMenuTweensOption:function(TweenType){
                    if(this.htmlTweenItemSelected){this.htmlTweenItemSelected.classList.remove('active');}

                    let tweenList=this.htmlElem.querySelector(".menu-functions__dropdown__tween-list");
                    if(TweenType !== ''){
                        let liIndex=me.MODELMenuTweenTypes.indexOf(TweenType);
                        this.htmlTweenItemSelected=tweenList.children[liIndex];
                        this.htmlTweenItemSelected.classList.add('active');
                    }else{this.htmlTweenItemSelected=null;}
                },
                activateMenuEasingOption:function(easingTypeName){
                    if(this.htmlEasingItemSelected){this.htmlEasingItemSelected.classList.remove('active');}

                    let easingList=this.htmlElem.querySelector(".menu-functions__dropdown__easing-list");
                    if(easingTypeName!==''){
                        let optIndex=me.MODELMenuEasingTypes.indexOf(easingTypeName);
                        this.htmlEasingItemSelected=easingList.children[optIndex];
                        this.htmlEasingItemSelected.classList.add('active');
                    }else{this.htmlEasingItemSelected=null;}
                },

                notificationOnWindowMouseDown:function(){
                    setTimeout(function(){
                        if(this.auxBtnOpenMouseDown || this.auxMouseOverMenu){return;}
                        this.htmlElem.children[1].classList.remove("active");
                        }.bind(this),10);
                    },
                setVal:function(listAnimations,listKeyframes){
                    this.val.listKeyframes=listKeyframes;
                    this.val.listAnimations=listAnimations;

                    if(this.val.listAnimations.length>0){
                        let firstAnimationFunction=this.val.listAnimations[0].tweenType;
                        let firstAnimationTween=this.val.listAnimations[0].easingType;
                        let flagMoreThanOneType=false;
                        let flagMoreThanOneTween=false;
                        for(let i=0;i<this.val.listAnimations.length;i++){
                            if(this.val.listAnimations[i].tweenType!==firstAnimationFunction){flagMoreThanOneType=true;}
                            if(this.val.listAnimations[i].easingType!==firstAnimationTween){flagMoreThanOneTween=true;}
                        }
                        if(flagMoreThanOneType){this.activateMenuTweensOption('')}
                        else{this.activateMenuTweensOption(firstAnimationFunction);}
                        if(flagMoreThanOneTween){this.activateMenuEasingOption('');}
                        else{this.activateMenuEasingOption(firstAnimationTween);}
                    }else{
                        this.activateMenuTweensOption('');
                        this.activateMenuEasingOption('');
                    }
                }
            }
        }
        this.widgetsTimelineTools={ //always actives
            btnReset:{
                htmlElem:document.querySelector(".action-editor__properties-area__toolbar .btn-reset-timeline"),
                initEvents:function(){
                    this.htmlElem.addEventListener("click",this.OnTrigger.bind(this))
                },
                OnTrigger:function(){
                    me.OnWidgetChanged("reset-timeline");
                }
            },
            btnPlay:{
                val:ControllerAnimatorState.paused, //possible values equal to ControllerAnimatorStates
                htmlElem:document.querySelector('.action-editor__properties-area__toolbar .btn-play-timeline'),
                initEvents:function(){
                    this.htmlElem.addEventListener("click",this.OnTrigger.bind(this))
                },
                OnTrigger:function(e){
                    if(this.val===ControllerAnimatorState.paused){
                        me.OnWidgetChanged("play-timeline");
                    }
                    else{
                        me.OnWidgetChanged("pause-timeline");
                    }
                },
                notificationControllerOnAnimatorStateChanged:function(newState){
                    this.setVal(newState);
                },
                setVal:function(val){
                    this.val=val;
                    let classList=this.htmlElem.classList;
                    if(this.val===ControllerAnimatorState.playing){
                        classList.remove("icon-play");classList.add("icon-pause");
                    }else if(this.val===ControllerAnimatorState.paused){
                        classList.remove("icon-pause");classList.add("icon-play");
                    }

                }
            },
            displayProgress:{
                htmlElem:document.querySelector(".panel-animation__top-bar__area-editors-menus__action-editor-menu .display-timeline-progress"),
                initEvents:function(){
                },
                notificationControllerOnAnimatorNewProgress:function(progress){
                    this.htmlElem.textContent=this._calcTimeString(progress);
                },
                notificationControllerOnAnimatorTick:function(progress){
                    this.htmlElem.textContent=this._calcTimeString(progress);
                },
                _calcTimeString:function(timeInMiliSeconds){
                    let minutes=Math.floor(timeInMiliSeconds/60000);
                    timeInMiliSeconds=timeInMiliSeconds%60000;
                    let seconds=Math.floor(timeInMiliSeconds/1000);
                    timeInMiliSeconds=timeInMiliSeconds%1000;
                    let miliseconds=Math.floor(timeInMiliSeconds/10);

                    let strMinutes=minutes<=9?"0"+minutes: minutes;
                    let strSeconds=seconds<=9?"0"+seconds: seconds;
                    let strMiliseconds=miliseconds<=9?"0"+miliseconds:miliseconds;
                    return strMinutes + ":" + strSeconds + ":" + strMiliseconds;
                }
            },
            durationField:{
                htmlElem:document.querySelector(".panel-animation__top-bar__area-editors-menus__action-editor-menu .duration-form .property-input"),
                prevValue:0,
                field:null,
                initEvents:function(){
                    this.field=new TimeButtonedField(this.htmlElem,"s",3,15000,0.5);
                    this.field.addListenerOnNewValue(this.OnFieldNewValue.bind(this));
                    this.field.setValue(10000);
                },
                OnFieldNewValue:function(value,e){
                    me.OnWidgetChanged("update-duration", {before:this.prevValue,after:value});
                    this.prevValue=value;
                },
                setVal:function(val){
                    this.field.setValue(val);
                },
                // getVal:function(){return this.field},
            }
        }
        this.initHTMLTweenMenu();
        this.initHTMLEasingsMenu();
        this.initEvents();

        this.widgetsTimelineTools.btnPlay.setVal(this.widgetsTimelineTools.btnPlay.val);
        },
    initHTMLTweenMenu:function(){
        let list=this.widgetsKeyframeTools.menuFunctions.htmlElem.querySelector('.dropdown').children[1];
        for(let i=0;i<this.MODELMenuTweenTypes.length;i++){
            let item=document.createElement('p');
            item.textContent=this.MODELMenuTweenTypes[i];
            item.setAttribute('name',this.MODELMenuTweenTypes[i]);
            item.setAttribute('index',i);
            item.className='item-tween-list'
            list.appendChild(item);
        }
    },
    initHTMLEasingsMenu:function(){
        let list=this.widgetsKeyframeTools.menuFunctions.htmlElem.querySelector('.dropdown').children[0];
        for(let i=0;i<this.MODELMenuEasingTypes.length;i++){
            let item=document.createElement('p');
            item.textContent=this.MODELMenuEasingTypes[i];
            item.setAttribute("name",this.MODELMenuEasingTypes[i]);
            item.className='item-easing-list';
            list.appendChild(item);
        }
    },
    initEvents:function(){
        for(let i in this.widgetsKeyframeTools){this.widgetsKeyframeTools[i].initEvents();}
        for(let i in this.widgetsTimelineTools){this.widgetsTimelineTools[i].initEvents();}
    },
    OnWidgetChanged:function(action,value){
        switch(action){
            case "delete-keyframe":
                this.notifyOnBtnDeleteKeyFrame();
                break;
            case "update-duration":
                this.notifyOnDurationInput(value.before,value.after);
                break;
            case "reset-timeline":
                this.notifyOnBtnResetTimeline();
                break;
            case "play-timeline":
                this.notifyOnBtnPlayTimeline();
                break;
            case "pause-timeline":
                this.notifyOnBtnPauseTimeline();
                break;
        }
    },
    notifyOnDurationInput:function(durationBefore,newDuration){
        this.parentClass.childNotificationOnDurationInput(durationBefore,newDuration);
    },
    notifyOnBtnDeleteKeyFrame:function(){
        this.parentClass.childNotificationOnBtnDeleteKeyFrame();
    },
    notifyOnBtnResetTimeline:function(){
        this.parentClass.childNotificationOnBtnResetTimeline();
    },
    notifyOnBtnPlayTimeline:function(){
        this.parentClass.childNotificationOnBtnPlayTimeline();
    },
    notifyOnBtnPauseTimeline:function(){
        this.parentClass.childNotificationOnBtnPauseTimeline();
    },
    notificationOnKeyBarSelectionUpdated:function (listAnimations,listSelectedKeyFrames){
        this.widgetsKeyframeTools.menuFunctions.setVal(listAnimations,listSelectedKeyFrames);
    },
    notificationOnKeyframeDragEnded:function(listAnimations,listSelectedKeyFrames){
        this.widgetsKeyframeTools.menuFunctions.setVal(listAnimations,listSelectedKeyFrames);
    },
    notificationOnWindowMouseDown:function(){
        this.widgetsKeyframeTools.menuFunctions.notificationOnWindowMouseDown();
    },
    notificationControllerOnAnimatorStateChanged:function(state){
        this.widgetsTimelineTools.btnPlay.notificationControllerOnAnimatorStateChanged(state);
    },
    notificationControllerOnAnimatorTick:function(progress){
        this.widgetsTimelineTools.displayProgress.notificationControllerOnAnimatorTick(progress);
    },
    notificationControllerOnAnimatorNewProgress:function(progress){
        this.widgetsTimelineTools.displayProgress.notificationControllerOnAnimatorNewProgress(progress);
    },
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
    notificationControllerOnAnimatorTick:function(progress){
        this.timeLineComponent.setMarkerTime(progress);

    },
    notificationOnBtnResetTimeline:function(){
        this.timeLineComponent.setMarkerTime(0);
    },
    notificationOnWindowResize:function(propertiesAreaWidth){
        let newTimelineWidth=window.innerWidth-propertiesAreaWidth;
        this.timeLineComponent.onWindowResize(newTimelineWidth);
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
    notificationOnMarkerDragStarted:function(time){
    },
    notificationOnMarkerDragEnded:function(time){
        this.parentClass.childNotificationOnMarkerDragEnded(time);
    },
    notificationOnMarkerDragging:function(time){
        this.parentClass.childNotificationOnMarkerDragging(time);
    },

}
let PanelActionEditor={ // EL PANEL ACTION EDITOR, DONDE SE ANIMAN PROPIEDADES. // esta clase es tan grande que se considera como el master, en cuando a susbripcion a emisores de eventos. Por eso el nombre (Panel)
    name:'PanelActionEditor',
    events:{
        OnDurationInput:'OnDurationInput',
        OnMarkerDragStarted:'OnMarkerDragStarted',
        OnMarkerDragged:'OnMarkerDragged',
        OnMarkerDragEnded:'OnMarkerDragEnded',
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

        MainMediator.registerObserver(this.timelineController.name,this.timelineController.events.OnAnimatorTick,this);
        MainMediator.registerObserver(this.timelineController.name,this.timelineController.events.OnAnimatorStateChanged,this);
        MainMediator.registerObserver(this.timelineController.name,this.timelineController.events.OnAnimatorNewProgress,this);


        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnSelectionUpdated,this);
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnObjModified,this);
        WindowManager.registerObserverOnResize(this);
        WindowManager.registerOnMouseDown(this);
    },
    setController:function(obj){
        this.timelineController=obj;
    },
    childNotificationOnMarkerDragging:function(time){
        MainMediator.notify(this.name,this.events.OnMarkerDragged,[time]);
    },
    childNotificationOnMarkerDragEnded:function(){
        MainMediator.notify(this.name,this.events.OnMarkerDragEnded);
    },
    notificationOnResize:function(){
        this.SectionTimeLine.notificationOnWindowResize(this.SectionLanes.HTMLElement.offsetWidth);
    },
    /*
    notificationOnOptionClicked:function(property){//del menu keyframes
        //use the correct dictionary (according to selectoed object)
        this.dictPropertyLanes[property].generateKeyFrame(this.timelineController.animator.totalProgress);
    },*/
    childNotificationOnBtnResetTimeline:function(){
        this.timelineController.animator.setTotalProgress(0);
        if(this.timelineController.animator.state===ControllerAnimatorState.playing){
            this.timelineController.animator._calcTimingValuesForLoop();
        }
        this.SectionTimeLine.notificationOnBtnResetTimeline();
    },
    childNotificationOnBtnPlayTimeline:function(){
        this.timelineController.animator.playAnimation();
    },
    childNotificationOnBtnPauseTimeline:function(){
        this.timelineController.animator.stopAnimation();
    },
    childNotificationOnBtnKeyAddKey:function(btnNameAttr){
        this.SectionTimeLine.notificationOnBtnKeyAddKey(btnNameAttr)
    },
    childNotificationOnDurationInput:function(durationBefore,newDuration){
        this.SectionTimeLine.notificationOnDurationChange(durationBefore,newDuration);
        this.timelineController.animator.setTotalDuration(newDuration); // se notifica directamente a este elemento porque es su controller, los componentes se pueden comunicar con libertar directamente con sus controllers
        MainMediator.notify(this.name,this.events.OnDurationInput,[durationBefore,newDuration]);
    },
    childNotificationOnBtnDeleteKeyFrame:function(){
        this.SectionTimeLine.notificationOnBtnDeleteKeyFrame();
    },
    childNotificationOnKeyBarSelectionUpdated:function(listAnimations,listSelectedKeyFrames){
        this.SectionActionEditorMenu.notificationOnKeyBarSelectionUpdated(listAnimations,listSelectedKeyFrames);
    },
    childNotificationOnKeyframeDragEnded:function(listAnimations,listSelectedKeyFrames){
        this.SectionActionEditorMenu.notificationOnKeyframeDragEnded(listAnimations,listSelectedKeyFrames);

        },
    notificationAnimationControllerOnAnimatorTick:function(args){
        let progress=args[0];
        console.log(progress);
        this.SectionTimeLine.notificationControllerOnAnimatorTick(progress);
        this.SectionActionEditorMenu.notificationControllerOnAnimatorTick(progress);
    },
    notificationAnimationControllerOnAnimatorNewProgress:function(args){
        let progress=args[0];
        this.SectionActionEditorMenu.notificationControllerOnAnimatorNewProgress(progress);
    },
    notificationAnimationControllerOnAnimatorStateChanged:function(args){
        let state=args[0];
        this.SectionActionEditorMenu.notificationControllerOnAnimatorStateChanged(state);
    },
    notificationCanvasManagerOnSelectionUpdated:function(){
        this.SectionLanes.notificationOnSelectionUpdated();
        this.SectionTimeLine.notificationOnSelectionUpdated();
    },
    notificationCanvasManagerOnObjModified:function(){

    },
    notificationOnMouseDown:function(){
        this.SectionActionEditorMenu.notificationOnWindowMouseDown();
    }

}

var PanelAnimation={//LA VENTANA COMPLETA
    name:'PanelAnimation',
    events:{
        OnPanelToggle:"OnPanelToggle"
    },
    HTMLElement:null,
    PanelActionEditor:PanelActionEditor,
    timelineController:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-animation");
        this.HTMLBtnToggle=this.HTMLElement.querySelector(".btn-toggle-panel-bottom");

        // this.HTMLElement.style.width=window.innerWidth + "px";
        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);
        this.initEvents();
        },
    initEvents:function(){
        this.HTMLBtnToggle.addEventListener("click",this.toggle.bind(this))
    },
    toggle:function(){
        let opened;
        if(this.HTMLElement.classList.contains("closed")){
            //this.HTMLBtnToggle.children[0].className=""
            this.HTMLElement.classList.remove("closed");
            this.HTMLElement.style.bottom=0;
            opened=true;
        }else{
            //this.HTMLBtnToggle.children[0].className=""
            this.HTMLElement.classList.add("closed");
            this.HTMLElement.style.bottom=-this.HTMLElement.offsetHeight + "px";
            opened=false;
        }
        MainMediator.notify(this.name,this.events.OnPanelToggle,[opened])
    },
    setController:function(obj){
        this.timelineController=obj;
        this.PanelActionEditor.setController(obj);
    },
    notificationPanelDesignerOptionsOnActionClicked:function(){
        let self=PanelAnimation;
        this.HTMLElement.style.display="block";
    },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        let self=PanelAnimation;
        self.HTMLElement.style.display="none";
    }
}





