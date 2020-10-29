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

let PanelActionEditor={ // EL PANEL ACTION EDITOR, DONDE SE ANIMAN PROPIEDADES
    HTMLElement:null,
    HTMLtimeline:null,
    HTMLtimeline_timeBar:null,
    HTMLtimeline_keyframesBar:null,

    HTMLdurationFormInput:null,
    HTMLdurationForm:null,
    marker:null,

    SectionProperties:SectionProperties,

    timelineController:null,
    totalDuration:0,
    totalProgress:0,

    timeBar_numSegments:0,
    timeBar_segmentLongitude:0,

    dictPropertyLanes:{},

    listObserversOnMarkerDragged:[],
    listObserversOnMarkerDragEnded:[],

    listObserversOnDurationForm:[],
    init:function(){
        this.SectionProperties.init();
        this.HTMLdurationFormInput=document.querySelector(".panel-animation__top-menu__form-duration__input");
        this.HTMLdurationForm=document.querySelector(".panel-animation__top-menu__form-duration");
        this.HTMLElement=document.querySelector(".action-editor");//todo el panel
        this.HTMLtimeline=document.querySelector(".action-editor__timeline-area");
        this.HTMLtimeline_timeBar=document.querySelector(".action-editor__timeline-area__time-bar");
        this.HTMLtimeline_keyframesBar=document.querySelector(".action-editor__timeline-area__keyframes-bar");
        this.HTMLmarker=document.querySelector(".action-editor .marker");

        this.setDuration(3000);
        this._setupMarker();
        this._setupPropertyLanes();

        this._setupFormDuration();

        WindowManager.registerObserverOnResize(this);
        // PanelInspector.SectionMenuAddKey.registerOnOptionClicked(this);
        this.SectionProperties.registerOnBtnAddKey(this);
        this.marker.registerOnDragged(this);
        this.marker.registerOnDragEnded(this);
    },
    setTimelineController:function(obj){
        this.timelineController=obj;
    },
    setDuration:function(duration){
        if(this.marker){
            this.marker.moveMe(0);
        }
        this.totalDuration=duration;
        this.timelineController.animator.setTotalDuration(duration);
        this._updateUI_timeline();
    },
    _setupFormDuration:function(){
        //this.HTMLdurationForm.addEventListener("submit",this.OnDurationForm.bind(this));
        this.HTMLdurationFormInput.addEventListener("focusout",this.OnDurationForm.bind(this));
    },
    _setupMarker:function(){
        this.marker=new Marker(".action-editor .marker",this.HTMLtimeline_timeBar,this.HTMLtimeline)
    },
    _setupPropertyLanes:function(){
        let HTMLPropertyLanes=document.querySelectorAll(".keyframes-bar__property-lane");
        this.dictPropertyLanes["position"]=new PropertyLane(["left","top"],HTMLPropertyLanes[0],this.HTMLtimeline,this.timelineController);
        this.dictPropertyLanes["scale"]=new PropertyLane(["scaleX","scaleY"],HTMLPropertyLanes[1],this.HTMLtimeline,this.timelineController);
        this.dictPropertyLanes["angle"]=new PropertyLane(["angle"],HTMLPropertyLanes[2],this.HTMLtimeline,this.timelineController);
        this.dictPropertyLanes["opacity"]=new PropertyLane(["opacity"],HTMLPropertyLanes[3],this.HTMLtimeline,this.timelineController);
    },
    _updateUI_timeline:function(){
        this._UIupdateSizes_timelineComponents(true);
        this._UIupdate_timeline_timebar_labels();
        this._UIupdateSizes_timelineComponents(false);
    },
    _UIupdate_timeline_timebar_labels:function(){
        this.HTMLtimeline_timeBar.children[1].innerHTML="";

        this.timeBar_numSegments=this.totalDuration/TIMELINE_TIMESTEPS;
        this.timeBar_segmentLongitude=(this.HTMLtimeline_timeBar.clientWidth-(TIMELINE_PADDING*2))/this.timeBar_numSegments;
        if(this.timeBar_segmentLongitude<TIMELINE_MIN_LONGITUDE_STEPS){
            this.timeBar_segmentLongitude=TIMELINE_MIN_LONGITUDE_STEPS;
        }

        console.log("segment longitude: " + this.timeBar_segmentLongitude);
        let timeLabelTmp=document.createElement("span");
        timeLabelTmp.textContent="0";
        timeLabelTmp.classList.add("timelabel");
        this.HTMLtimeline_timeBar.children[1].append(timeLabelTmp);
        timeLabelTmp.style.left=TIMELINE_PADDING-(timeLabelTmp.offsetWidth/2)+"px";
        for(let i=1;i<=this.timeBar_numSegments;i++){
            let timeLabel=document.createElement("span");
            timeLabel.textContent=TIMELINE_TIMESTEPS*i/10;
            timeLabel.classList.add("timelabel");
            this.HTMLtimeline_timeBar.children[1].append(timeLabel);
            timeLabel.style.left=i*this.timeBar_segmentLongitude+TIMELINE_PADDING-(timeLabel.offsetWidth/2)+"px";
        }
    },

    _UIupdateSizes_timelineComponents:function(resetSizes){
        let self=PanelActionEditor;
        let masterWidth;
        if(resetSizes){
            masterWidth=self.HTMLtimeline.clientWidth;

        }else{
            masterWidth=self.HTMLtimeline.scrollWidth;
        }
        console.log("onresize: " +self.HTMLtimeline_timeBar.clientLeft );
        let margins=document.querySelectorAll(".action-editor__timeline-area > .margin");
        margins[0].style.left=0+"px";
        margins[1].style.left=masterWidth-TIMELINE_PADDING + "px";
        //console.log("scrollwidth:" +self.HTMLtimeline.scrollWidth);
        margins[0].style.width=TIMELINE_PADDING + "px";
        margins[1].style.width=TIMELINE_PADDING+ "px";

        self.HTMLtimeline_timeBar.style.width=masterWidth + "px";
        self.HTMLtimeline_keyframesBar.style.width=masterWidth+ "px";

        //self.HTMLtimeline.calcBoundings();
        //self.HTMLtimeline_timeBar.calcBoundings();
        //self.HTMLtimeline_keyframesBar.calcBoundings();
    },
    OnDurationForm:function(e){
        e.preventDefault();
        let duration;
        let target;
        if(e.target.className=="panel-animation__top-menu__form-duration"){
            target=e.target.children[1].value;
            duration=parseInt(e.target.children[1].value);
        }else{
            target=e.target;
            duration=parseInt(e.target.value);
        }
        console.log(duration);
        if(!isNaN(duration)){
            this.setDuration(duration);
            this.notifyOnDurationForm(duration);
        }else{
            target.value=3000;
        }
    },
    registerOnDurationForm:function(obj){
        this.listObserversOnDurationForm.push(obj);
    },
    registerOnMarkerDragged:function(obj){
        this.listObserversOnMarkerDragged.push(obj);
    },
    registerOnMarkerDragEnded:function(obj){
        this.listObserversOnMarkerDragEnded.push(obj);
    },
    notificationOnMarkerDragged:function(markerPosition){

        let progress=(markerPosition/(this.timeBar_numSegments*this.timeBar_segmentLongitude))*this.totalDuration;
        //console.log(progress);
        for(let i=0;i<this.listObserversOnMarkerDragged.length;i++){
            this.listObserversOnMarkerDragged[i].notificationOnMarkerDragged(progress);
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
    notificationOnBtnKeyAddKey:function(propertyName){
      this.dictPropertyLanes[propertyName].generateKeyFrame(this.timelineController.animator.totalProgress)
    },
    notificationOnObjSelected:function(obj){
        let selectedObject=CanvasManager.getSelectedAnimableObj();
        if(selectedObject!=null){

        }else{

        }
    },
    notifyOnDurationForm:function(duration){
        for(let i=0;i<this.listObserversOnDurationForm.length;i++){
            this.listObserversOnDurationForm[i].notificationOnDurationForm(duration);
        }
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





