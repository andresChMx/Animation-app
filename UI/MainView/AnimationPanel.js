var TIMELINE_TIMESTEPS=100;
var TIMELINE_MIN_LONGITUDE_STEPS=40;
var TIMELINE_PADDING=16;
var SectionProperties={
    HTMLElement:null,
    listObserversOnBtnAddKey:[],
    listObserversOnFieldInput:[],
    init:function(){
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
        CanvasManager.registerOnSelectionUpdated(this);
        CanvasManager.registerOnObjModified(this);
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
        for(let i in this.listObserversOnBtnAddKey){
            this.listObserversOnBtnAddKey[i].notificationOnBtnKeyAddKey(propName);
        }
    },
    notifyOnFieldPropertyInput:function(propName,propNewValue){
        for(let i in this.listObserversOnFieldInput){
            this.listObserversOnFieldInput[i].notificationOnFieldPropertyInput(propName,propNewValue);
        }
    },
    registerOnBtnAddKey:function(obj){
        this.listObserversOnBtnAddKey.push(obj);
    },
    registerOnFieldPropertyInput:function (obj){
        this.listObserversOnFieldInput.push(obj);
    }
}
var SectionActionEditorMenu={
    HTMLBtnDeleteKeyFrame:null,
    HTMLSelectFunctions:null,

    listObserversOnDurationInput:[],
    listObserversOnBtnDeleteKeyFrame:[],
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
        for(let i=0;i<this.listObserversOnDurationInput.length;i++){
            this.listObserversOnDurationInput[i].notificationOnDurationInput(intInputValue);
        }
    },
    notifyOnBtnDeleteKeyFrame:function(){
        for(let i=0;i<this.listObserversOnBtnDeleteKeyFrame.length;i++){
            this.listObserversOnBtnDeleteKeyFrame[i].notificationOnBtnDeleteKeyFrame();
        }
    },
    notificationOnKeyEnterUp:function(){
        let documentActiveElement=document.activeElement;
        if(documentActiveElement===this.HTMLdurationFormInput){
            documentActiveElement.blur();
            this.onDurationInput({target:documentActiveElement});
        }
    },
    registerOnDurationInput:function(obj){
        this.listObserversOnDurationInput.push(obj);
    },
    registerOnBtnDeleteKeyFrame:function(obj){
        this.listObserversOnBtnDeleteKeyFrame.push(obj);
    }
}
/*=================================================================
var Marker=function(selector,HTMLtimeline_timeBar,HTMLtimeline){
    this.HTMLElement=null;
    this.HTMLtimeline_timeBar=null;
    this.HTMLtimeline=null;
    var self=this;
    this.isPressed=false;
    this.htmlTimeline_timeBarcoordX;

    this.listObserversOnDragged=[];
    this.listObserversOnDragEnded=[];
    this.init=function(){
        this.HTMLtimeline_timeBar=HTMLtimeline_timeBar;
        this.HTMLtimeline=HTMLtimeline;
        this.HTMLElement=document.querySelector(selector);

        this.leftCoordHtmlTimeline_timeBar=this.HTMLtimeline_timeBar.getBoundingClientRect().left;
        this._setupMarketElement();

        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseMove(this);
        this.HTMLElement.children[0].addEventListener("mousedown",this.onMouseDown);
    },
        this._setupMarketElement=function(){
            this.HTMLElement.children[0].style.width=TIMELINE_PADDING*2 + "px";
            this.HTMLElement.children[0].style.height=this.HTMLtimeline_timeBar.clientHeight + "px";

            let needleWidth=3;
            this.HTMLElement.children[1].style.left=this.HTMLElement.offsetWidth/2 -needleWidth/2 + "px";
            this.HTMLElement.children[1].style.width=needleWidth + "px";
            this.HTMLElement.children[1].style.height=this.HTMLtimeline.clientHeight-this.HTMLtimeline_timeBar.clientHeight + "px";
        }
    this.moveMe=function(location){
        let tmpMarkWidth=self.HTMLElement.clientWidth;
        let localLimitLeft= TIMELINE_PADDING-tmpMarkWidth/2;
        let localLimitRight=self.HTMLtimeline_timeBar.clientWidth-TIMELINE_PADDING-(tmpMarkWidth/2);
        let localNewPosition=(location-self.leftCoordHtmlTimeline_timeBar + self.HTMLtimeline.scrollLeft )-(tmpMarkWidth/2);
        localNewPosition=localNewPosition<localLimitLeft?localLimitLeft:localNewPosition;
        localNewPosition=localNewPosition>localLimitRight?localLimitRight:localNewPosition;
        this.HTMLElement.style.left=localNewPosition + "px";
        this.notifyOnMarkerDragged(localNewPosition);
    }
    this.registerOnDragged=function(obj){
        self.listObserversOnDragged.push(obj);
    }
    this.registerOnDragEnded=function(obj){
        self.listObserversOnDragEnded.push(obj);
    }
    this.notificationOnMouseUp=function(){
        if(self.isPressed){
            self.notifyOnMarkerDragEnded();
        }
        self.isPressed=false;
    }
    this.notificationOnMouseMove=function(){
        if(self.isPressed){
            self.moveMe(WindowManager.mouse.x);
        }
    }
    this.notifyOnMarkerDragEnded=function(){
        for(let i=0;i<self.listObserversOnDragEnded.length;i++){
            self.listObserversOnDragEnded[i].notificationOnMarkerDragEnded();
        }
    }
    this.notifyOnMarkerDragged=function(globalNewPosition){
        for(let i=0;i<self.listObserversOnDragged.length;i++){
            self.listObserversOnDragged[i].notificationOnMarkerDragged(globalNewPosition);
        }
    }
    this.onMouseDown=function(e){
        self.isPressed=true;

    }
    this.init();
}

var Key=function(values,time,laneParent,HTMLTimeLineArea,timelineController){
    this.HTMLElement=null;
    this.RECTBoundings=null;
    this.laneParent=null;
    this.HTMLTimeLineArea=null;
    this.timelineController=null;

    this.leftCoordHtmlTimeline_timeBar

    this.isPressed=false;
    this.isDragged=false;

    this.values=[];
    this.time=0;
    this.timelineLocation=0;

    this.listObserversOnDragged=[];
    this.listObserversOnDeleted=[];
    this.listObserversOnDraggingEnded=[];
    var self=this;
    this.init=function(){
        this.values=values;
        this.time=time;
        this.laneParent=laneParent;
        this.HTMLTimeLineArea=HTMLTimeLineArea
        this.timelineController=timelineController;
        this.leftCoordHtmlTimeline=this.HTMLTimeLineArea.getBoundingClientRect().left;

        this.HTMLElement=document.createElement("div");
        this.HTMLElement.classList.add("property-lane__key");
        this.laneParent.HTMLElement.appendChild(this.HTMLElement);
        this.timelineLocation=this.getLocationInTimeline(this.time);

        this.HTMLElement.addEventListener("mousedown",this.OnMouseDown)
        this.HTMLElement.style.left=this.timelineLocation + "px";

        WindowManager.registerOnMouseUp(this);
    }
    this.desable=function(){
        this.HTMLElement.style.display="none";
    }
    this.registerOnDragged=function(obj){
        self.listObserversOnDragged.push(obj);
    }
    this.registerOnDraggingEnded=function(obj){
        self.listObserversOnDraggingEnded.push(obj);
    }
    this.registerOnDeleted=function(obj){
        self.listObserversOnDeleted.push(obj);
    }
    this.notifyOnDragged=function(newPosition){
        for(let i=0;i<self.listObserversOnDragged.length;i++){
            self.listObserversOnDragged[i].notificationOnKeyDragged(newPosition);
        }
    }
    this.notifyOnDraggingEnded=function(){
        for(let i=0;i<self.listObserversOnDraggingEnded.length;i++){
            self.listObserversOnDraggingEnded[i].notificationOnKeyDraggingEnded(self);
        }
    }
    this.notifyOnDeleted=function(){
        for(let i=0;i<self.listObserversOnDeleted.length;i++){
            self.listObserversOnDeleted[i].notificationOnKeyDeleted();
        }
    }
    this.notificationOnMouseUp=function(){
        if(self.isPressed){
            self.notifyOnDraggingEnded();
        }
        self.isPressed=false;
    }
    this.notificationOnMouseMove=function(){
        if(self.isPressed){
            let limitLeft= TIMELINE_PADDING-(self.HTMLElement.clientWidth/2);
            let limitRight=self.laneParent.HTMLElement.clientWidth-TIMELINE_PADDING-(self.HTMLElement.clientWidth/2);
            let newPosition=(WindowManager.mouse.x-(self.leftCoordHtmlTimeline) + self.HTMLTimeLineArea.scrollLeft)-self.HTMLElement.clientWidth/2;
            newPosition=newPosition<limitLeft?limitLeft:newPosition;
            newPosition=newPosition>limitRight?limitRight:newPosition;
            self.HTMLElement.style.left=newPosition + "px";
            self.time=this.getTimeFromLocation(newPosition);
            self.notifyOnDragged(newPosition);
        }
    }
    this.OnMouseDown=function(){
        self.isPressed=true;
    }
    this.desable=function(){
        this.HTMLElement.style.display="none";
    }
    this.enable=function(values,time){
        this.values=values;
        this.time=time;
        this.HTMLElement.style.display="block";
        this.timelineLocation=this.getLocationInTimeline(this.time);

        this.HTMLElement.style.left=this.timelineLocation + "px";
    }
    this.getLocationInTimeline=function(moment){

        let leftLimit =TIMELINE_PADDING-(self.HTMLElement.clientWidth/2);
        let rightLimit = self.laneParent.HTMLElement.clientWidth-TIMELINE_PADDING-(self.HTMLElement.clientWidth/2);;
        let totalDisplacementArea=rightLimit-leftLimit;

        let percentMoment2TotalDuration=moment/self.timelineController.animator.totalDuration;
        console.log(percentMoment2TotalDuration);
        return leftLimit+totalDisplacementArea*percentMoment2TotalDuration;

    }
    this.getTimeFromLocation=function(globalLocation){
        let leftLimit=TIMELINE_PADDING-(self.HTMLElement.clientWidth/2);
        let rightLimit=self.laneParent.HTMLElement.clientWidth-TIMELINE_PADDING-(self.HTMLElement.clientWidth/2);
        let totalDisplacementArea=rightLimit-leftLimit;

        let localLocation=globalLocation-leftLimit;
        let percent=localLocation/totalDisplacementArea;
        return percent*self.timelineController.animator.totalDuration;
    }
    this.init();
}
var PropertyLane=function(properties,HTMLElement,HTMLTimeLineArea,timelineController){
    this.HTMLElement=null;
    this.HTMLTimeLineArea=null; //lo usan los keysframes
    this.timelineController=null;
    this.listKeyFrames=[];
    this.numbActiveKeyFrames=0;
    var self=this;
    this.properties=[];

    this.currentAnimableSelectedObj;
    this.isPressed=false;
    this.init=function(){
        this.properties=properties;
        this.HTMLElement=HTMLElement;
        this.HTMLTimeLineArea=HTMLTimeLineArea;
        this.timelineController=timelineController;
        this.HTMLElement.addEventListener("mousedown",this.OnMouseDown);
        CanvasManager.registerOnSelectionUpdated(this);
        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseMove(this);
    }
    this._disableAllKeyframes=function(){
        this.numbActiveKeyFrames=0;
        for(let i=0;i<this.listKeyFrames.length;i++){
            this.listKeyFrames[i].desable();
        }
    }
    this._createKeyFrame=function(values,time){//UNICA VEZ QUE SE ALTERA ANIMACION ENTERNAMEINTE
        let key=new Key(values,time,this,this.HTMLTimeLineArea,this.timelineController)

        this.listKeyFrames.push(key);
        key.registerOnDraggingEnded(this);
        key.registerOnDeleted(this);
    }
    this._retriveKeyFromPool=function(values,time){
        if(this.numbActiveKeyFrames>=this.listKeyFrames.length){
            this.numbActiveKeyFrames++;
            this._createKeyFrame(values,time);
        }else{
            this.numbActiveKeyFrames++;
            this.listKeyFrames[this.numbActiveKeyFrames-1].enable(values,time);
        }
    }
    this.generateKeyFrame=function(totalProgress){
        if(this.currentAnimableSelectedObj==null){return;}
        let values=[]
        for(let i in this.properties){
            values.push(this.currentAnimableSelectedObj.get(this.properties[i]));
        }
        this._retriveKeyFromPool(values,totalProgress);
        this._regenerateAnimations()
    }

    this.notificationOnKeyDraggingEnded=function(obj){
        if(self.currentAnimableSelectedObj==null){return;}
        this._regenerateAnimations();
    }
    this.notificationOnKeyDeleted=function(){

    }
    this.notificationOnSelectionUpdated=function(obj){
        let newSelectedObject=CanvasManager.getSelectedAnimableObj();
        if(newSelectedObject!=null){
            if(self.currentAnimableSelectedObj===newSelectedObject){
                return;
            }else{
                self.currentAnimableSelectedObj=newSelectedObject;
                self._regenerateKeyFrames();
            }
        }else{
            self._disableAllKeyframes();
            self.currentAnimableSelectedObj=null;
        }
    }
    this._regenerateAnimations=function(){
        insertionSort(this.listKeyFrames,this.numbActiveKeyFrames)
        for(let i in this.properties ){self.currentAnimableSelectedObj.animator.dictAnimations[self.properties[i]]=[];}
        if(self.numbActiveKeyFrames>0){
            if(self.numbActiveKeyFrames===1){
                for(let i in this.properties ){
                    self.currentAnimableSelectedObj.animator.addAnimation(self.properties[i],self.listKeyFrames[0].values[i],-1,self.listKeyFrames[0].time,-1);
                }
            }else{
                for(let i=0;i<self.numbActiveKeyFrames-1;i++){
                    let key=self.listKeyFrames;
                    for(let j in this.properties ) {
                        self.currentAnimableSelectedObj.animator.addAnimation(self.properties[j], key[i].values[j], key[i + 1].values[j], key[i].time, key[i + 1].time);
                    }
                }
            }

        }
    }
    this._regenerateKeyFrames=function(){
        self._disableAllKeyframes();
        let selectedObject=self.currentAnimableSelectedObj;
        //verificando solo la primer propiedad, porque si la tiene es porque las demas tambien lsa tiene
        let firstOroperty=self.properties[0];
        if(selectedObject.animator.hasPropertyAnimations(firstOroperty)){
            if(!(selectedObject.animator.dictAnimations[firstOroperty][0].hasTwoKeys())){
                let values=[];
                for (let k in self.properties){
                    values.push(selectedObject.animator.dictAnimations[self.properties[k]][0].startValue);
                }
                let firstPropertyAnim=selectedObject.animator.dictAnimations[self.properties[0]][0];
                this._retriveKeyFromPool(values,firstPropertyAnim.startMoment);
            }else{
                for(let i=0;i<selectedObject.animator.dictAnimations[self.properties[0]].length;i+=2){
                    let firstPropertyAnim=selectedObject.animator.dictAnimations[self.properties[0]][i];
                    let startValues=[];
                    let endValues=[];
                    for (let k in self.properties){
                        startValues.push(selectedObject.animator.dictAnimations[self.properties[k]][i].startValue);
                        endValues.push(selectedObject.animator.dictAnimations[self.properties[k]][i].endValue)
                    }
                    this._retriveKeyFromPool(startValues,firstPropertyAnim.startMoment);
                    this._retriveKeyFromPool(endValues,firstPropertyAnim.endMoment);
                }

                let animsLength=selectedObject.animator.dictAnimations[self.properties[0]].length;
                if(animsLength%2===0){
                    let values=[];
                    for(let k in self.properties){
                        values.push(selectedObject.animator.dictAnimations[self.properties[k]][animsLength-1].endValue)
                    }
                    let firstPropertyAnim=selectedObject.animator.dictAnimations[self.properties[0]][animsLength-1];
                    this._retriveKeyFromPool(values,firstPropertyAnim.endMoment);
                }
            }
        }


    }
    this.notificationOnMouseUp=function(){
        self.isPressed=false;
    }
    this.notificationOnMouseMove=function(){
        if(self.isPressed){
            for(let i=0;i<self.listKeyFrames.length;i++){
                self.listKeyFrames[i].notificationOnMouseMove();
            }
        }
    }
    this.OnMouseDown=function(){
        self.isPressed=true;
    }
    this.init();
}
*/
let SectionTimeLine={
    HTMLElement:null,

    timeLineComponent:null,
    MODELLanesProperties:{"position":["left","top"],"scale":["scaleX","scaleY"],"rotation":["angle"],"opacity":["opacity"]},
    currentSelectedAnimableObject:null,

    listObserversOnMarkerDragging:[],
    listObserversOnMarkerDragEnded:[],
    parentClass:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".action-editor__timeline-area");
        this.timeLineComponent=new TimeLineProxy(WindowManager,"#cTimeLine",Object.keys(this.MODELLanesProperties));

        CanvasManager.registerOnSelectionUpdated(this);
        this.timeLineComponent.registerOnKeyFrameDragging(this);
        this.timeLineComponent.registerOnKeyFrameDragEnded(this);
        this.timeLineComponent.registerOnMarkerDragging(this);
        this.timeLineComponent.registerOnMarkerDragEnded(this);
        this.parentClass.SectionActionEditorMenu.registerOnBtnDeleteKeyFrame(this);
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
    notifyOnMarkerDragging:function(time){
        for(let i=0;i<this.listObserversOnMarkerDragging.length;i++){
            this.listObserversOnMarkerDragging[i].notificationOnMarkerDragging(time);
        }
    },
    notifyOnMarkerDragEnded:function(time){
        for(let i=0;i<this.listObserversOnMarkerDragEnded.length;i++){
            this.listObserversOnMarkerDragEnded[i].notificationOnMarkerDragEnded(time);
        }
    },
    parentNotificationOnBtnKeyAddKey:function(laneName){
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
    parentNotificationOnDurationChange:function(durationBefore,durationAfter){
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
        this.notifyOnMarkerDragEnded(time);
    },
    notificationOnMarkerDragging:function(time){
        this.notifyOnMarkerDragging(time);
    },
    notificationOnBtnDeleteKeyFrame:function(){
        let dictCantLaneKeyFrames=this.timeLineComponent.discartSelectedKeyFrames();
        for(let key in dictCantLaneKeyFrames){
            if(dictCantLaneKeyFrames[key]>0){
                this.generateObjectPropertiesAnimationsFromKeyFrames(key);
            }
        }
    },
    registerOnMarkerDragging:function(obj){
      this.listObserversOnMarkerDragging.push(obj);
    },
    registerOnMarkerDragEnded:function(obj){
        this.listObserversOnMarkerDragEnded.push(obj);
    }

}
let PanelActionEditor={ // EL PANEL ACTION EDITOR, DONDE SE ANIMAN PROPIEDADES
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

    listObserversOnMarkerDragged:[],
    listObserversOnMarkerDragEnded:[],

    listObserversOnDurationInput:[],
    init:function(){
        this.SectionProperties.init();
        this.SectionTimeLine.init(this);
        this.SectionActionEditorMenu.init(this);
        this.HTMLdurationFormInput=document.querySelector(".editors-options__action-editor-options__form-duration__input");
        this.HTMLdurationForm=document.querySelector(".action-editor-options__form-duration");
        this.HTMLElement=document.querySelector(".action-editor");//todo el panel
        this.HTMLtimeline=document.querySelector(".action-editor__timeline-area");

        this.setDuration(3000,3000);
        //this._setupFormDuration();


        WindowManager.registerObserverOnResize(this);
        this.SectionProperties.registerOnBtnAddKey(this);
        this.SectionActionEditorMenu.registerOnDurationInput(this);
        this.SectionTimeLine.registerOnMarkerDragging(this);
        this.SectionTimeLine.registerOnMarkerDragEnded(this);
    },
    setTimelineController:function(obj){
        this.timelineController=obj;
    },
    setDuration:function(durationBefore,durationAfter){
        this.timelineController.animator.setTotalDuration(durationAfter);
        this.SectionTimeLine.parentNotificationOnDurationChange(durationBefore,durationAfter);
        this.timeLineDuration=durationAfter;
    },

    getTimeLineDuration:function(){
        return this.timeLineDuration;
    },
    notifyOnDurationInput:function(durationBefore,durationAfter){
        for(let i=0;i<this.listObserversOnDurationInput.length;i++){
            this.listObserversOnDurationInput[i].notificationOnDurationInput(durationBefore,durationAfter);
        }
    },
    registerOnDurationInput:function(obj){
        this.listObserversOnDurationInput.push(obj);
    },
    registerOnMarkerDragged:function(obj){
        this.listObserversOnMarkerDragged.push(obj);
    },
    registerOnMarkerDragEnded:function(obj){
        this.listObserversOnMarkerDragEnded.push(obj);
    },
    notificationOnMarkerDragging:function(time){
        //console.log(progress);
        for(let i=0;i<this.listObserversOnMarkerDragged.length;i++){
            this.listObserversOnMarkerDragged[i].notificationOnMarkerDragged(time);
        }
    },
    notificationOnMarkerDragEnded:function(){
        this.notifyOnMarkerDragEnded();
    },
    notificationOnResize:function(){
        this._UIupdateSizes_timelineComponents();
    },
    /*
    notificationOnOptionClicked:function(property){//del menu keyframes
        //use the correct dictionary (according to selectoed object)
        this.dictPropertyLanes[property].generateKeyFrame(this.timelineController.animator.totalProgress);
    },*/
    notificationOnBtnKeyAddKey:function(btnNameAttr){
        this.SectionTimeLine.parentNotificationOnBtnKeyAddKey(btnNameAttr)
    },
    notificationOnDurationInput:function(newDuration){
        this.setDuration(this.timeLineDuration,newDuration);
        this.notifyOnDurationInput(this.timeLineDuration,newDuration);
    },
    notifyOnMarkerDragEnded:function(){
        let self=PanelActionEditor;
        for(let i=0;i<self.listObserversOnMarkerDragEnded.length;i++){
            self.listObserversOnMarkerDragEnded[i].notificationOnMarkerDragEnded();
        }
    }

}

var PanelAnimation={//LA VENTANA COMPLETA
    HTMLElement:null,
    PanelActionEditor:PanelActionEditor,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-animation");
        this.HTMLElement.style.width=window.innerWidth + "px";
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnSettingActionClicked:function(){
        let self=PanelAnimation;
        this.HTMLElement.style.display="block";
    },
    notificationOnItemsMenu_designPaths:function(data){
        let self=PanelAnimation;
        self.HTMLElement.style.display="none";
    }
}





