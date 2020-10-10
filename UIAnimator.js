var TIMELINE_TIMESTEPS=100;
var TIMELINE_MIN_LONGITUDE_STEPS=40;
var TIMELINE_PADDING=16;
var HTMLElement=function(elem){
    this.htmlElement=null;
    this.RECTBoundings=null;
    this.init=function(){
        this.htmlElement=document.querySelector(elem); 
        this.calcBoundings();
    }
    this.calcBoundings=function(){
        this.RECTBoundings=this.htmlElement.getBoundingClientRect();
    }
    this.init();
}
var Marker=function(selector,HTMLParent,HTMLTimeLineArea){
    this.HTMLElement=null;
    this.RECTBoundings=null;
    this.HTMLParent=null;
    this.HTMLTimeLineArea=null;
    var self=this;
    this.isPressed=false;
    
    this.listObserversOnDragged=[];
    this.listObserversOnDragEnded=[];
    this.init=function(){
        this.HTMLParent=HTMLParent;
        this.HTMLTimeLineArea=HTMLTimeLineArea;
        this.HTMLElement=document.querySelector(selector);
        this.RECTBoundings=this.HTMLElement.getBoundingClientRect();
        this._setupMarketElement();

        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseMove(this);
        this.HTMLElement.children[0].addEventListener("mousedown",this.onMouseDown);
    },
    this._setupMarketElement=function(){
        this.HTMLElement.children[0].style.width=TIMELINE_PADDING*2 + "px";
        this.HTMLElement.children[0].style.height=this.HTMLParent.RECTBoundings.height + "px";

        let needleWidth=3;
        this.HTMLElement.children[1].style.left=this.HTMLElement.offsetWidth/2 -needleWidth/2 + "px";
        this.HTMLElement.children[1].style.width=needleWidth + "px";
        this.HTMLElement.children[1].style.height=this.HTMLTimeLineArea.RECTBoundings.height-this.HTMLParent.htmlElement.offsetHeight + "px";
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
            let tmpMarkWidth=self.HTMLElement.offsetWidth;
            let localLimitLeft= TIMELINE_PADDING-tmpMarkWidth/2;
            let localLimitRight=self.HTMLParent.RECTBoundings.width-TIMELINE_PADDING-(tmpMarkWidth/2);
            let localNewPosition=(WindowManager.mouse.x-self.HTMLParent.RECTBoundings.left + self.HTMLTimeLineArea.htmlElement.scrollLeft )-(tmpMarkWidth/2);
            localNewPosition=localNewPosition<localLimitLeft?localLimitLeft:localNewPosition;
            localNewPosition=localNewPosition>localLimitRight?localLimitRight:localNewPosition;
            this.HTMLElement.style.left=localNewPosition + "px";
            this.notifyOnMarkerDragged(localNewPosition);
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

var Key=function(value,time,HTMLParent,HTMLTimeLineArea){
    this.HTMLElement=null;
    this.RECTBoundings=null;
    this.HTMLParent=null;
    this.HTMLTimeLineArea=null;

    this.isPressed=false;
    this.isDragged=false;

    this.value=0;
    this.time=0;
    this.timelineLocation=0;

    this.listObserversOnDragged=[];
    this.listObserversOnDeleted=[];
    this.listObserversOnDraggingEnded=[];
    var self=this;
    this.init=function(){
        this.value=value;
        this.time=time;
        this.HTMLParent=HTMLParent;
        this.HTMLTimeLineArea=HTMLTimeLineArea

        this.HTMLElement=document.createElement("div");
        this.HTMLElement.classList.add("property-lane__key");
        this.HTMLParent.HTMLElement.appendChild(this.HTMLElement);
        this.timelineLocation=this.getLocationInTimeline(this.time);
        this.RECTBoundings=this.HTMLElement.getBoundingClientRect();
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
            let limitLeft= TIMELINE_PADDING-(self.HTMLElement.offsetWidth/2);
            let limitRight=self.HTMLParent.RECTBoundings.width-TIMELINE_PADDING-(self.HTMLElement.offsetWidth/2);
            let newPosition=(WindowManager.mouse.x-self.HTMLParent.RECTBoundings.left + self.HTMLTimeLineArea.htmlElement.scrollLeft)-self.HTMLElement.offsetWidth/2;
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
    this.enable=function(value,time){
        this.value=value;
        this.time=time;
        this.HTMLElement.style.display="block";   
        this.timelineLocation=this.getLocationInTimeline(this.time);
        this.HTMLElement.style.left=this.timelineLocation + "px";
    }
    this.getLocationInTimeline=function(moment){
        let ancestor=PanelActionEditor;

        let leftLimit =TIMELINE_PADDING-(self.HTMLElement.offsetWidth/2);
        let rightLimit = self.HTMLParent.RECTBoundings.width-TIMELINE_PADDING-(self.HTMLElement.offsetWidth/2);;
        let totalDisplacementArea=rightLimit-leftLimit;

        let percentMoment2TotalDuration=moment/ancestor.timelineController.totalDuration;
        return leftLimit+totalDisplacementArea*percentMoment2TotalDuration;

    }
    this.getTimeFromLocation=function(globalLocation){
        let ancestor=PanelActionEditor;
        let leftLimit=TIMELINE_PADDING-(self.HTMLElement.offsetWidth/2);
        let rightLimit=self.HTMLParent.RECTBoundings.width-TIMELINE_PADDING-(self.HTMLElement.offsetWidth/2);
        let totalDisplacementArea=rightLimit-leftLimit;
        
        let localLocation=globalLocation-leftLimit;
        let percent=localLocation/totalDisplacementArea;
        return percent*ancestor.timelineController.totalDuration;
    }
    this.init();
}
var PropertyLane=function(property,HTMLElement,HTMLTimeLineArea){
    this.HTMLElement=null;
    this.RECTBoundings=null;
    this.HTMLTimeLineArea=null; //lo usan los keysframes
    this.listKeyFrames=[];
    this.numbActiveKeyFrames=0;
    var self=this;
    this.property="";
    
    this.currentAnimableSelectedObj;
    this.isPressed=false;
    this.init=function(){
        this.HTMLElement=HTMLElement;
        this.HTMLTimeLineArea=HTMLTimeLineArea;
        this.property=property;
        this.RECTBoundings=this.HTMLElement.getBoundingClientRect();
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
    this._createKeyFrame=function(value,time){//UNICA VEZ QUE SE ALTERA ANIMACION ENTERNAMEINTE
        let key=new Key(value,time,this,this.HTMLTimeLineArea)
        
        this.listKeyFrames.push(key);
        key.registerOnDraggingEnded(this);
        key.registerOnDeleted(this);
    }
    this._retriveKeyFromPool=function(value,time){
        if(this.numbActiveKeyFrames>=this.listKeyFrames.length){
            this.numbActiveKeyFrames++;
            this._createKeyFrame(value,time);
        }else{
            this.numbActiveKeyFrames++;
            this.listKeyFrames[this.numbActiveKeyFrames-1].enable(value,time);
        }
    }
    this.generateKeyFrame=function(totalProgress){
        if(this.currentAnimableSelectedObj==null){return;}
        this._retriveKeyFromPool(this.currentAnimableSelectedObj.get(this.property),totalProgress);
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
        self.currentAnimableSelectedObj.dictAnimations[self.property]=[];
        if(self.numbActiveKeyFrames>0){
            if(self.numbActiveKeyFrames==1){
                
                self.currentAnimableSelectedObj.addAnimation(self.property,self.listKeyFrames[0].value,-1,self.listKeyFrames[0].time,-1);
            }else{
                for(let i=0;i<self.numbActiveKeyFrames-1;i++){
                    let key=self.listKeyFrames;
                    self.currentAnimableSelectedObj.addAnimation(self.property,key[i].value,key[i+1].value,key[i].time,key[i+1].time);
                }
            }

        }
    }
    this._regenerateKeyFrames=function(){
        self._disableAllKeyframes();
        let selectedObject=self.currentAnimableSelectedObj;
        if(selectedObject.hasPropertyAnimations(self.property)){
            if(!(selectedObject.dictAnimations[self.property][0].hasTwoKeys())){
                let anim=selectedObject.dictAnimations[self.property][0]
                this._retriveKeyFromPool(anim.startValue,anim.startMoment);
            }else{
                for(let i=0;i<selectedObject.dictAnimations[self.property].length;i+=2){
                    let anim=selectedObject.dictAnimations[self.property][i]
                    this._retriveKeyFromPool(anim.startValue,anim.startMoment);
                    this._retriveKeyFromPool(anim.endValue,anim.endMoment);
                }
                
                let animsLength=selectedObject.dictAnimations[self.property].length;
                if(animsLength%2==0){
                    let anim=selectedObject.dictAnimations[self.property][animsLength-1];
                    this._retriveKeyFromPool(anim.endValue,anim.endMoment);
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
    
    marker:null,

    timelineController:null,
    totalDuration:0,
    totalProgress:0,

    timeBar_numSegments:0,
    timeBar_segmentLongitude:0,

    dictPropertyLanes:{},

    listObserversOnMarkerDragged:[],
    listObserversOnMarkerDragEnded:[],
    init:function(){
        
        this.HTMLElement=new HTMLElement(".action-editor");
        this.HTMLtimeline=new HTMLElement(".action-editor__timeline-area");
        this.HTMLtimeline_timeBar=new HTMLElement(".action-editor__timeline-area__time-bar");
        this.HTMLtimeline_keyframesBar=new HTMLElement(".action-editor__timeline-area__keyframes-bar");
        this.HTMLmarker=new HTMLElement(".action-editor .marker");

        this.setDuration(3000);
        this._setupTimeLine();
        this._setupMarker();
        this._setupPropertyLanes();

        WindowManager.registerObserverOnResize(this);
        PanelInspector.SectionMenuAddKey.registerOnOptionClicked(this);
        this.marker.registerOnDragged(this);
        this.marker.registerOnDragEnded(this);
    },
    setTimelineController:function(obj){
        this.timelineController=obj;
    },
    setDuration:function(duration){
        this.totalDuration=duration;
        this._updateUI_timeline();
    },
    _setupMarker:function(){
        this.marker=new Marker(".action-editor .marker",this.HTMLtimeline_timeBar,this.HTMLtimeline)
    },
    _setupTimeLine:function(){
        this.notificationOnResize();
    },
    _setupPropertyLanes:function(){
        let HTMLPropertyLanes=document.querySelectorAll(".keyframes-bar__property-lane");
        let listProperties=['left','top','scaleX',"scaleY","angle","opacity"]
        for(let i=0;i<HTMLPropertyLanes.length;i++){
            let propertyLane=new PropertyLane(listProperties[i],HTMLPropertyLanes[i],this.HTMLtimeline);
            this.dictPropertyLanes[listProperties[i]]=propertyLane;
        }
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
        let self=PanelActionEditor;
        console.log("onresize: " +self.HTMLtimeline_timeBar.RECTBoundings.left );
        let margins=document.querySelectorAll(".action-editor__timeline-area > .margin");
        margins[0].style.left=0+"px";
        margins[1].style.left=self.HTMLtimeline.htmlElement.scrollWidth-TIMELINE_PADDING + "px";
        console.log("scrollwidth:" +self.HTMLtimeline.htmlElement.scrollWidth);
        margins[0].style.width=TIMELINE_PADDING + "px";
        margins[1].style.width=TIMELINE_PADDING+ "px";
        
        self.HTMLtimeline_timeBar.htmlElement.style.width=self.HTMLtimeline.htmlElement.scrollWidth + "px";
        self.HTMLtimeline_keyframesBar.htmlElement.style.width=self.HTMLtimeline.htmlElement.scrollWidth + "px";

        self.HTMLtimeline.calcBoundings();
        self.HTMLtimeline_timeBar.calcBoundings();
        self.HTMLtimeline_keyframesBar.calcBoundings();
    },
    notificationOnOptionClicked:function(property){
        //use the correct dictionary (according to selectoed object)
        this.dictPropertyLanes[property].generateKeyFrame(this.timelineController.totalProgress);
    },
    notificationOnObjSelected:function(obj){
        let selectedObject=CanvasManager.getSelectedAnimableObj();
        if(selectedObject!=null){

        }else{

        }
    },
    _updateUI_timeline:function(){
        this.HTMLtimeline_timeBar.htmlElement.children[1].innerHTML="";

        this.timeBar_numSegments=this.totalDuration/TIMELINE_TIMESTEPS;
        this.timeBar_segmentLongitude=(this.HTMLtimeline_timeBar.RECTBoundings.width-(TIMELINE_PADDING*2))/this.timeBar_numSegments;
        if(this.timeBar_segmentLongitude<TIMELINE_MIN_LONGITUDE_STEPS){
            this.timeBar_segmentLongitude=TIMELINE_MIN_LONGITUDE_STEPS;
        }

        console.log("segment longitude: " + this.timeBar_segmentLongitude);
        let timeLabelTmp=document.createElement("span");
        timeLabelTmp.textContent="0";
        timeLabelTmp.classList.add("timelabel");
        this.HTMLtimeline_timeBar.htmlElement.children[1].append(timeLabelTmp);
        timeLabelTmp.style.left=TIMELINE_PADDING-(timeLabelTmp.offsetWidth/2)+"px";
        for(let i=1;i<=this.timeBar_numSegments;i++){
            let timeLabel=document.createElement("span");
            timeLabel.textContent=TIMELINE_TIMESTEPS*i/10;
            timeLabel.classList.add("timelabel");
            this.HTMLtimeline_timeBar.htmlElement.children[1].append(timeLabel);
            timeLabel.style.left=i*this.timeBar_segmentLongitude+TIMELINE_PADDING-(timeLabel.offsetWidth/2)+"px";
            console.log(timeLabel.offsetWidth);
        }
        this.notificationOnResize();
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

let SectionPropertiesEditor={
    HTMLElement:null,
    HTMLFields:null,
    listObserversOnFieldInput:[],
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector__properties-editor");
        this.HTMLFields=document.querySelectorAll(".properties-editor__properties-container input");
        for(let i=0;i<this.HTMLFields.length;i++){
            this.HTMLFields[i].addEventListener("input",this.OnFieldsInput)
        }
        CanvasManager.registerOnSelectionUpdated(this);
        CanvasManager.registerOnObjModified(this);
    },
    _desableFields:function(){
        for(let i=0;i<this.HTMLFields.length;i++){
            this.HTMLFields[i].setAttribute("disabled","");
        }
    },
    _enableFields:function(){
        for(let i=0;i<this.HTMLFields.length;i++){
            this.HTMLFields[i].removeAttribute("disabled");
        }
    },
    _populateFields:function(selectedAnimObj){
        this.HTMLFields[0].value=selectedAnimObj.get("left");
        this.HTMLFields[1].value=selectedAnimObj.get("top");
        this.HTMLFields[2].value=selectedAnimObj.get("scaleX");
        this.HTMLFields[3].value=selectedAnimObj.get("scaleY");
        this.HTMLFields[4].value=selectedAnimObj.get("angle");
        this.HTMLFields[5].value=selectedAnimObj.get("opacity");
    },
    registerOnFieldInput:function(obj){
        let self=SectionPropertiesEditor;

        self.listObserversOnFieldInput.push(obj);
        
    },
    notificationOnSelectionUpdated:function(){
        let self=SectionPropertiesEditor;
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(!selectedAnimObj){
            self._desableFields();
        }else{
            self._enableFields();
            self._populateFields(selectedAnimObj);
        }
    },
    notificationOnObjModified:function(){
        let self=SectionPropertiesEditor;
        let selectedAnimObj=CanvasManager.getSelectedAnimableObj();
        if(!selectedAnimObj){ 
            self._desableFields();
        }else{
            self._enableFields();
            self._populateFields(selectedAnimObj);
        }

    },
    notifyOnFieldInput:function(target){
        let self=SectionPropertiesEditor;
        for(let i=0;i<self.listObserversOnFieldInput.length;i++){
            self.listObserversOnFieldInput[i].notificationOnFieldInput(target);
        }  
    },
     OnFieldsInput:function(e){
        let self=SectionPropertiesEditor;
        self.notifyOnFieldInput(e.target);
     },
}
let SectionMenuAddKey={
    HTMLElement:null,
    HTMLButton:null,
    HTMLOptions:null,

    listObserversOnOptionClicked:[],
    init:function(){
        this.HTMLElement=document.querySelector(".menu-add-keyframe__inner-container");
        this.HTMLButton=document.querySelector(".menu-add-keyframe__label");
        this.HTMLOptions=document.querySelector(".menu-add-keyframe__options-list");
        for(let i=0;i<this.HTMLOptions.children.length;i++){
            this.HTMLOptions.children[i].addEventListener("click",this.OnOptionClicked)
        }

    },
    registerOnOptionClicked:function(obj){
        this.listObserversOnOptionClicked.push(obj);
    },
    OnOptionClicked:function(e){
        let self=SectionMenuAddKey;
        self.notifyOnOptionClicked(e.target.getAttribute("name"));
    },
    notifyOnOptionClicked:function(property){
        let self=SectionMenuAddKey;
        for(let i=0;i<self.listObserversOnOptionClicked.length;i++){
            self.listObserversOnOptionClicked[i].notificationOnOptionClicked(property);
        }
    }

}
var PanelInspector={
    HTMLElement:null,
    htmlElementNormalHeight:0,


    SectionMenuAddKey:SectionMenuAddKey,
    SectionPropertiesEditor:SectionPropertiesEditor,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-inspector");
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnItemsMenu_designPaths:function(data){
        this.HTMLElement.style.display="none";
    },
    notificationOnSettingActionClicked:function(data){
        this.HTMLElement.style.display="block"
    }
}

let SectionImageAssets={
    HTMLElement:null,
    HTMLDummyAssetDrag:null,
    HTMLItemMenu:null,

    isItemPressed:false,
    isItemBtnActive:false,

    lastModelOnItemMenuBtnClicked:null,
    lastModelOnItemDragged:null,

    listObserversOnDummyDraggingEnded:[],
    listObserversOnItemsMenu_designPaths:[],

    MODELItemAssets:[{url:"http://localhost:3000/img.jpg",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}},/*paths:{points:[[]],lineWidth:10}}*/
    {url:"http://localhost:3000/mock.png",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}},
    {url:"http://localhost:3000/text.png",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}},
    {url:"http://localhost:3000/character.jpg",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}},
    {url:"http://localhost:3000/dragon.jpg",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}},
    {url:"http://localhost:3000/monster.jpg",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}},
    {url:"http://localhost:3000/woman.jpg",paths:{points:[],linesWidths:[],pathsNames:[],duration:3000}}],
    MODELItemMenuOptions:[
        {
            label:"Design Drawing path",
            action:function(modelItem){
                let self=SectionImageAssets;
                self.notifyOnItemsMenu_designPaths(modelItem);
                
            }
        },
        {
            label:"Delete Asset",
            action:function(){
                let self=SectionImageAssets;
                console.log("de elimino asert");
            }
        }
    ],
    listAssets:[],
    init:function(){
        this.HTMLElement=document.querySelector(".panel-assets__sections-container__section-image-assets");
        this.HTMLDummyAssetDrag=document.querySelector(".section-image-assets__dummy-drag-asset");
        this.HTMLItemMenu=document.querySelector(".section-image-assets__item__menu-options");
        //this.generateHTMLItemsCollection(this.MODELItemAssets);
        this.generateImageAssets(this.MODELItemAssets);
        this.generateHTMLMenuOptionsCollection(this.MODELItemMenuOptions);

        this.HTMLDummyAssetDrag.style.width=this.HTMLElement.children[0].offsetWidth + "px";
        this.HTMLDummyAssetDrag.style.height=this.HTMLElement.children[0].offsetWidth + "px";

        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseDown(this);
        WindowManager.registerOnMouseMove(this);
    },
    generateHTMLMenuOptionsCollection:function(MODEL){
        for(var i=0;i<MODEL.length;i++){
            let btnOpt=document.createElement("div");
            btnOpt.classList.add("section-image-assets__item__menu-options__option");
            btnOpt.setAttribute("name",i);
            btnOpt.textContent=MODEL[i].label;
            this.HTMLItemMenu.append(btnOpt);
            btnOpt.addEventListener("mouseup",this.OnItemMenuOptionMouseUp);
        }
    },
    generateImageAssets:function(MODEL){
        for(var i=0;i<MODEL.length;i++){
            let asset=new AssetImage(MODEL[i]);
            asset.registerOnDraggingStarted(this);
            asset.registerOnMenuPressed(this);
            asset.appendAsset(this.HTMLElement);
        }
    },
    setPositionHTMLDummyAsset:function(x,y){
        let self=SectionImageAssets;
        self.HTMLDummyAssetDrag.style.left=x-self.HTMLDummyAssetDrag.offsetWidth/2 + "px";
        self.HTMLDummyAssetDrag.style.top=y-self.HTMLDummyAssetDrag.offsetWidth/2+ "px";
    },
    setPositionHTMLItemMenu:function(x,y){
        let self=SectionImageAssets;
        self.HTMLItemMenu.style.left=x+ 10 + "px";
        self.HTMLItemMenu.style.top=y+10 + "px";
    },
    hiddeHTMLItemMenu:function(){
        let self=SectionImageAssets;
        self.HTMLItemMenu.style.display="none";
        self.setPositionHTMLItemMenu(-200,-200);
    },
    hiddeHTMLDummyAsset:function(){
        let self=SectionImageAssets;
        self.setPositionHTMLDummyAsset(-200,-200);
        self.HTMLDummyAssetDrag.style.display="none";
    },
    OnItemMenuOptionMouseUp:function(e){
        let self=SectionImageAssets;
        let indexModelOptions=parseInt(e.target.getAttribute("name"));
        self.MODELItemMenuOptions[indexModelOptions].action(self.lastModelOnItemMenuBtnClicked);

        self.hiddeHTMLItemMenu();
    }, 
    notificationOnMouseUp:function(){
        let self=SectionImageAssets;

        if(self.isItemPressed){
            self.hiddeHTMLDummyAsset();
            self.notifyOnDummyDraggingEnded();
        }
        self.isItemPressed=false;
    },
    notificationOnMouseMove:function(){
        let self=SectionImageAssets;
        if(self.isItemPressed){
            self.setPositionHTMLDummyAsset(WindowManager.mouse.x,WindowManager.mouse.y);
        }
    },
    notificationOnMouseDown:function(e){
        let self=SectionImageAssets;
        let classAssetMenuOption="section-image-assets__item__menu-options__option"
        if(e.target.className!=classAssetMenuOption){
            if(self.isItemBtnActive){
                self.hiddeHTMLItemMenu();
            }
        }

    },
    notificationOnAssetDraggingStarted:function(model){
        let self=SectionImageAssets;
        self.lastModelOnItemDragged=model;
        self.isItemPressed=true;
        self.HTMLDummyAssetDrag.style.display="block";
    },
    notificationOnAssetMenuPressed:function(model){
        let self=SectionImageAssets;
        self.lastModelOnItemMenuBtnClicked=model
        self.isItemBtnActive=false;//lock
        setTimeout(()=>{self.isItemBtnActive=true},100);
        self.HTMLItemMenu.style.display="block";
        self.setPositionHTMLItemMenu(WindowManager.mouse.x,WindowManager.mouse.y);
    },
    notifyOnDummyDraggingEnded:function(){
        let self=SectionImageAssets;
        for(let i=0;i<self.listObserversOnDummyDraggingEnded.length;i++){
            self.listObserversOnDummyDraggingEnded[i].notificationOnDummyDraggingEnded(self.lastModelOnItemDragged);
        }
    },
    notifyOnItemsMenu_designPaths:function(modelItem){
        let self=SectionImageAssets;
        for(let i=0;i<self.listObserversOnItemsMenu_designPaths.length;i++){
            self.listObserversOnItemsMenu_designPaths[i].notificationOnItemsMenu_designPaths(modelItem);
        }
    },
    registerOnDummyDraggingEnded:function(obj){
        let self=SectionImageAssets;
        self.listObserversOnDummyDraggingEnded.push(obj);
    },
    registerOnItemsMenu_designPaths:function(obj){
        let self=SectionImageAssets;
        self.listObserversOnItemsMenu_designPaths.push(obj);
    }

}
var PanelAssets={
    HTMLElement:null,
    htmlElementNormalHeight:0,
    SectionImageAssets:SectionImageAssets,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-assets");
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;

        this.SectionImageAssets.registerOnItemsMenu_designPaths(this);

        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnSettingActionClicked:function(){
        this.HTMLElement.style.height=this.htmlElementNormalHeight;
    },
    notificationOnItemsMenu_designPaths:function(data){
        let self=PanelAssets;
        self.HTMLElement.style.height=window.innerHeight + "px";
    }

}
var AssetImage=function(model){
    this.HTMLElement=null;
    this.HTMLDraggable=null;
    this.HTMLBtnMenu=null;

    this.model=null;

    this.listObserversOnDraggingStarted=[];
    this.listObserversOnMenuPressed=[];

    this.init=function(){
        this.model=model;

        this.HTMLElement=this.generateHTML();
        this.HTMLDraggable=this.HTMLElement.children[0];
        this.HTMLBtnMenu=this.HTMLElement.children[0].children[1];

        this.model.imgHTML=this.HTMLDraggable.children[0];
        this.HTMLDraggable.children[0].ondragstart=function(){return false;}
        this.HTMLDraggable.addEventListener("mousedown",this.OnMouseDown.bind(this));
    }
    this.generateHTML=function(){
        console.log("FROM ASET : " + this.model.url);
        let btnOpts=document.createElement("button");
        btnOpts.classList.add("panel-assets__section-image-assets__item__btn-options");
        let innerContainer=document.createElement("div");
        innerContainer.classList.add("panel-assets__section-image-assets__item__inner-container");
        let img=document.createElement("img");
        img.classList.add("panel-assets__section-image-assets__item__inner-container__image");
        img.setAttribute("src",this.model.url + '?' + new Date().getTime());
        img.setAttribute('crossOrigin', '');
        let container=document.createElement("div");
        container.classList.add("panel-assets__section-image-assets__item");
        innerContainer.append(img);
        innerContainer.append(btnOpts);
        container.append(innerContainer);
        container.style.height=container.offsetWidth + "px";
        return container;
    }
    this.appendAsset=function(parentNode){
        parentNode.append(this.HTMLElement);
        this.HTMLElement.style.height=this.HTMLElement.offsetWidth + "px";
    }
    this.OnMouseDown=function(e){
        if(e.target===this.HTMLDraggable || e.target==this.HTMLDraggable.children[0]){
            this.notifyOnDraggingStarted();
        }
        else if(e.target===this.HTMLBtnMenu){
            this.notifyOnMenuPressed();
        }
    }
    this.notifyOnDraggingStarted=function(){
        
        for(let i=0;i<this.listObserversOnDraggingStarted.length;i++){
            this.listObserversOnDraggingStarted[i].notificationOnAssetDraggingStarted(this.model);
        }
    }
    this.notifyOnMenuPressed=function(){
        for(let i=0;i<this.listObserversOnMenuPressed.length;i++){
            this.listObserversOnMenuPressed[i].notificationOnAssetMenuPressed(this.model);
        }
    }
    this.registerOnMenuPressed=function(obj){
        this.listObserversOnMenuPressed.push(obj);
    }
    this.registerOnDraggingStarted=function(obj){
        this.listObserversOnDraggingStarted.push(obj);
    }

    this.init();
}
var AssetAudio=function(){

}

var CanvasManager={
    canvas:null,
    listAnimableObjects:[],

    listObserversOnObjSelected:[],
    listObserversOnObjModified:[],
    listObserversOnObjDeleted:[],
    init:function(){
        this.canvas=new fabric.Canvas('c',{ width: window.innerWidth, height: window.innerHeight ,backgroundColor: 'rgb(0,0,0)'});
        this.canvas.preserveObjectStacking=true;
        this.canvas.on('selection:updated',this.notifyOnObjSelected)
        this.canvas.on('selection:created',this.notifyOnObjSelected)
        this.canvas.on('selection:cleared',this.notifyOnObjSelected)
        this.canvas.on('object:removed',this.notifyOnObjDeleted)
        this.canvas.on('object:modified',this.notifyOnObjModified)
        PanelInspector.SectionPropertiesEditor.registerOnFieldInput(this);
        PanelAssets.SectionImageAssets.registerOnDummyDraggingEnded(this);
        PanelActionEditor.registerOnMarkerDragEnded(this);
        /*
        let self=this;
        window.addEventListener("keydown",function(e){
            if(e.keyCode==32){
                self.canvas.remove(self.canvas.getActiveObject());
            }
        });
        */
    },
    getSelectedAnimableObj:function(){
        let activeObj=this.canvas.getActiveObject()
        if(activeObj && activeObj.type==="ImageAnimable"){
            return activeObj
        }else{
            return null;
        }
        //switch(case obj.)

    },
    createAnimableObject:function(model){
        let self=CanvasManager;
        let oImg=new ImageAnimable(model.imgHTML,{
            "originX":"center",
            "originY":"center",
            "left":WindowManager.mouse.x,
            "top":WindowManager.mouse.y
        })
        oImg.setCoords();
        self.canvas.add(oImg);
        self.listAnimableObjects.push(oImg);
    },
    registerOnSelectionUpdated:function(obj){
        this.listObserversOnObjSelected.push(obj);
    },
    registerOnObjDeleted:function(obj){
        this.listObserversOnObjDeleted.push(obj);
    },
    registerOnObjModified:function(obj){
        this.listObserversOnObjModified.push(obj);
    },
    notifyOnObjSelected:function(opt){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjSelected.length;i++){
            self.listObserversOnObjSelected[i].notificationOnSelectionUpdated(opt.target);
        }
    },
    notifyOnObjDeleted:function(opt){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjDeleted.length;i++){
            self.listObserversOnObjDeleted[i].notificationOnObjDeleted(opt.target);
        }
    },
    notifyOnObjModified:function(){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjModified.length;i++){
            self.listObserversOnObjModified[i].notificationOnObjModified();
        }
    },
    notificationOnFieldInput:function(target){
        console.log(target.getAttribute("name") + " + " + target.value);
        let self=CanvasManager;
        let activeAnimObj=self.getSelectedAnimableObj();
        if(activeAnimObj){
            activeAnimObj.set(target.getAttribute("name"),parseFloat(target.value));
            activeAnimObj.setCoords();
            self.canvas.renderAll();
        }
    },
    notificationOnDummyDraggingEnded:function(model){
        let self=CanvasManager;
        self.createAnimableObject(model);
    },
    notificationOnMarkerDragEnded:function(){
        console.log("se termino de arrastrar marker");
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i].setCoords();
        }
    }
}
var ObserverType={
    temp:"temp",
    main:"main",
};
var WindowManager={
    mouse:{
        x:0,y:0,click:false,
    },

    listObservers:{
        temp:{
            onLoad:[],
            onResize:[],
            onMouseUp:[],
            onMouseMove:[],
            onMouseDown:[],
        },
        main:{
            onLoad:[],
            onResize:[],
            onMouseUp:[],
            onMouseMove:[],
            onMouseDown:[],
        }
    },

    activeObserverType:ObserverType.main,

    init:function(){
        window.addEventListener("load",initUI);
        window.addEventListener("resize",this.onWindowResize);
        window.addEventListener("mouseup",this.onWindowMouseUp);
        window.addEventListener("mousemove",this.onWindowMouseMove);
        window.addEventListener("mousedown",this.onWindowMouseDown);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
    },
    notificationOnSettingActionClicked:function(actionId){
        let self=WindowManager;
        for(var obsListTmp in self.listObservers[ObserverType.temp] ){
            self.listObservers[ObserverType.temp][obsListTmp]=[];
        }
        self.activeObserverType=ObserverType.main;
    },
    /*PanelAssets.SectionImageAssets*/
    notificationOnItemsMenu_designPaths:function(){
        let self=WindowManager;
        self.activeObserverType=ObserverType.temp;
    },
    registerObserverOnResize:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onResize.push(obj)
    },
    registerOnMouseDown:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onMouseDown.push(obj);
    },
    registerOnMouseUp:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onMouseUp.push(obj);
    },
    registerOnMouseMove:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onMouseMove.push(obj);
    },
    onWindowResize:function(){
        let self=WindowManager;
        for(var i=0;i<self.listObservers[self.activeObserverType].onResize.length;i++){
            //self.listObserversOnResize[i].notificationOnResize();
        }
        //PanelActionEditor.onWindowResize();
    },
    onWindowMouseUp:function(){
        let self=WindowManager;
        console.log("mouse up");
        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseUp.length;i++){
            self.listObservers[self.activeObserverType].onMouseUp[i].notificationOnMouseUp();
        }
    },
    onWindowMouseMove:function(e){
        let self=WindowManager;
        self.mouse.x=e.clientX;
        self.mouse.y=e.clientY;

        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseMove.length;i++){
            self.listObservers[self.activeObserverType].onMouseMove[i].notificationOnMouseMove();
        }
    },
    onWindowMouseDown:function(e){
        let self=WindowManager;
        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseDown.length;i++){
            self.listObservers[self.activeObserverType].onMouseDown[i].notificationOnMouseDown(e);
        }
    }
}
function initUI(){
    document.body.style.width=window.innerWidth + "px";
    document.body.style.height=window.innerHeight + "px";
    
    /*ANIMATOR*/
    PanelAnimation.init();
    PanelAnimation.PanelActionEditor.init();
    
    PanelInspector.init();
    PanelInspector.SectionPropertiesEditor.init();
    PanelInspector.SectionMenuAddKey.init();
    
    PanelAssets.init();
    PanelAssets.SectionImageAssets.init();


    /*paths desginer*/
    PanelDesignerOptions.init();
    PanelDesignerOptions.SectionSettings.init();
    PanelDesignerOptions.SectionPaths.init();

    PanelPathsDesigner.init();

}