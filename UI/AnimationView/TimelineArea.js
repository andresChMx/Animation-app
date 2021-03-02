let PADDING_WITH=25;
var Component = fabric.util.createClass({
    localState: null,
    mouseState: null,
    isPressed: false,
    hasBeenDragged: false,
    initialize: function (mouseState) {
        this.mouseState = mouseState;

        this.isPressed = false;
        this.hasBeenDragged = false;

        this.isActive = true;


    },
    setLocalCoords: function (x, y, w, h) {
        this.localState.coords = {};
        this.localState.coords.left = x;
        this.localState.coords.top = y;
        this.localState.coords.width = w;
        this.localState.coords.height = h;
        this.onLocalCoordsSettled();
    },
    _mouseInBoundingBox: function () {
        return this.mouseState.inWorldX >= this.localState.coords.left &&
            this.mouseState.inWorldX <= this.localState.coords.left + this.localState.coords.width &&
            this.mouseState.inWorldY >= this.localState.coords.top &&
            this.mouseState.inWorldY <= this.localState.coords.top + this.localState.coords.height;
    },
    onLocalCoordsSettled: function () {

    },
    onMouseDragStarted: function (e) {

    },
    onMouseDragging: function (e) {
    },
    onMouseClick: function (e) {
    },
    onMouseFixedClick: function (e) {/*click without dragging*/

    },
    onMouseDown: function (e) {

    },
    onMouseDragEnded: function (e) {
    },

    notificationOnMouseMove: function (e) {
        if (!this.isActive) {
            return false;
        }
        if (this.isPressed) {
            if (!this.hasBeenDragged) {
                this.onMouseDragStarted(e);
            }
            this.hasBeenDragged = true;
            this.onMouseDragging(e);
        }
    },
    notificationOnMouseDown: function (e) {
        if (!this.isActive) {
            return false;
        }
        if (this._mouseInBoundingBox()) {
            this.isPressed = true;
            this.onMouseDown(e);
            return true;
        }
        return false;
    },
    notificationOnMouseUp: function (e) {
        if (!this.isActive) {
            return false;
        }
        if (this._mouseInBoundingBox()) {
            if (this.isPressed) {
                this.onMouseClick(e);
                if (!this.hasBeenDragged) {
                    this.onMouseFixedClick(e);
                }
            }
        }
        if (this.isPressed && this.hasBeenDragged) {
            this.onMouseDragEnded(e);
        }

        this.hasBeenDragged = false;
        this.isPressed = false;
    },

});
let Marker = fabric.util.createClass(Component, {
    type: "marker_component",
    HTMLElement: null,
    localState: {colors: {idle: "#29a3d2"}},
    isPressed: false,
    mouseState: {},
    initialize: function (canvas, mouseState,labelingParams,scrollParams,globalState) {
        this.callSuper("initialize",mouseState);
        this.globalState=globalState
        this.parentState={
            labelingParams:labelingParams,
            scrollParams:scrollParams,
        }
        this.labelingParams=labelingParams;
        this.scrollParams=scrollParams;
        this.canvas = canvas;
        this.timeLineTime = 0;

        this.listObserversOnDragging=[];
        this.listObserversOnDragEnded=[];
        this.listObserversOnDragStarted=[];
        this.canvas.addComponent(this);
    },
    calcTimelineLocationFromTime: function (time) {
        let segmentNum = time / this.parentState.labelingParams.segmentWidthTimeVal;
        let location = segmentNum * this.parentState.labelingParams.segmentWidth;
        this.localState.coords.left = location + PADDING_WITH - this.localState.coords.width / 2;
        this.movementConstraints();
    },
    calcTimelineTimeFromLocation: function (locationInUsableArea) {
        let percentInUsableArea = locationInUsableArea / this.parentState.scrollParams.usableScrollWidth;
        this.timeLineTime = this.globalState.animatorDuration * percentInUsableArea;
    },
    movementConstraints: function () {
        if (this.localState.coords.left < PADDING_WITH - (this.localState.coords.width / 2)) {
            this.localState.coords.left = PADDING_WITH - (this.localState.coords.width / 2)
        }
        if (this.localState.coords.left > this.scrollParams.scrollWidth - PADDING_WITH - this.localState.coords.width / 2) {
            this.localState.coords.left = this.scrollParams.scrollWidth - PADDING_WITH - this.localState.coords.width / 2
        }
        //SNAPPING WITH MARKS
        //haciendo que haya el cuadruple de markers que segmenttimesvalues en 1 segundo (BORROWED from TimeBarComponent)
        let timeBarMarksDistance=this.labelingParams.segmentWidth/4,
            leftInUsableArea=this.localState.coords.left-PADDING_WITH + this.localState.coords.width/2,
            timeBarMarksSnappingRange=3;
        if(leftInUsableArea%timeBarMarksDistance>timeBarMarksDistance-timeBarMarksSnappingRange || leftInUsableArea%timeBarMarksDistance<timeBarMarksSnappingRange){
            this.localState.coords.left=Math.round(leftInUsableArea/timeBarMarksDistance)*timeBarMarksDistance + PADDING_WITH- this.localState.coords.width/2;
        }
    },
    render: function (ctx) {//no se tranlada y se permite el uso de left y top ya que no tiene sub elementos (cuestion de hacerñps mas simple)
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.strokeStyle=this.localState.colors.idle;
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height/2);
        ctx.moveTo(this.localState.coords.left,this.localState.coords.top + this.localState.coords.height/2);
        ctx.lineTo(this.localState.coords.left+this.localState.coords.width,this.localState.coords.top + this.localState.coords.height/2);
        ctx.lineTo(this.localState.coords.left+this.localState.coords.width/2, this.localState.coords.top+this.localState.coords.height);
        ctx.lineTo(this.localState.coords.left+this.localState.coords.width/2,this.localState.coords.top+this.localState.coords.height+this.canvas.keysBarComponent.localState.coords.height);
        ctx.lineTo(this.localState.coords.left+this.localState.coords.width/2, this.localState.coords.top+this.localState.coords.height);
        ctx.stroke();
        ctx.fill();
    },
    onLocalCoordsSettled: function () {
        this.calcTimelineTimeFromLocation(0);
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.inWorldX - this.localState.coords.left;
        this.offsetMouseY = this.mouseState.inWorldY - this.localState.coords.top;
        this.notifyOnDragStarted();
    },
    onMouseDragging: function () {
        this.localState.coords.left = this.mouseState.inWorldX - this.offsetMouseX;
        this.movementConstraints();
        this.calcTimelineTimeFromLocation(this.localState.coords.left - PADDING_WITH + this.localState.coords.width / 2);
        this.notifyOnDragging();

        this.canvas.requestRenderAll();
    },
    onMouseClick: function () {

    },
    onMouseDragEnded: function () {
        this.notifyOnDragEnded();
    },
    /*
    * Establece un numero tiempo, y actualiza la ubicacion en timeline, Usado para cuando se da play
    * */
    setTime:function(newTime){
        this.timeLineTime=newTime;
        this.calcTimelineLocationFromTime(this.timeLineTime);
        this.canvas.requestRenderAll();
    },
    notifyOnDragStarted:function(){
        for (let i = 0; i < this.listObserversOnDragStarted.length; i++) {
            this.listObserversOnDragStarted[i].notificationOnMarkerDragStarted(this.timeLineTime);
        }
    },
    notifyOnDragging:function(){
        for(let i=0;i<this.listObserversOnDragging.length;i++){
            this.listObserversOnDragging[i].notificationOnMarkerDragging(this.timeLineTime);
        }
    },
    notifyOnDragEnded:function(){
        for(let i=0;i<this.listObserversOnDragEnded.length;i++){
            this.listObserversOnDragEnded[i].notificationOnMarkerDragEnded(this.timeLineTime);
        }
    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        if(durationBefore>durationAfter){
            let markerTimePercent=this.timeLineTime/durationBefore;
            this.timeLineTime=durationAfter*markerTimePercent;
        }
        this.calcTimelineLocationFromTime(this.timeLineTime)
    },
    notificationOnScrollBarResize: function (scrollWidth) {
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    notificationOnTimeBarClicked: function (e) {
        //Por si se preciono una perte que correponde al espacio de padding
        let locationInUsableArea=this.mouseState.inWorldX-PADDING_WITH;
        if(locationInUsableArea>this.parentState.scrollParams.usableScrollWidth){
            locationInUsableArea=this.parentState.scrollParams.usableScrollWidth;
        }else if(locationInUsableArea<0){
            locationInUsableArea=0;
        }
        //calculando nuevo tiempo y ubicacion de playhead
        this.calcTimelineTimeFromLocation(locationInUsableArea);
        this.calcTimelineLocationFromTime(this.timeLineTime);

        this.canvas.requestRenderAll();

        this.notifyOnDragging(); // De forma que el animator actualize los eleentos del canvas al haer lick en el timebar, (sin esto, no pasara nada, solo se actualizara el timeline)
    },
    registerOnDragStarted:function(obj){
        this.listObserversOnDragStarted.push(obj);
    },
    registerOnDragging:function(obj){
        this.listObserversOnDragging.push(obj);
    },
    registerOnDragEnded:function (obj){
        this.listObserversOnDragEnded.push(obj);
    },

});
let ScrollBarButton = fabric.util.createClass(Component, {

    initialize: function (canvas,mouseState,scrollParams) {
        this.callSuper("initialize", mouseState)
        this.parentState={
            scrollParams:scrollParams
        }
        this.localState = {colors: {idle: "#3B3A39",innerCircle:"#29a3d2"}};
        this.observerOnDragged = null;
        this.offsetMouseX = 0;
        this.offsetMouseY = 0;
        this.name = "";
        this.canvas = canvas;

        this.canvas.addComponent(this);
    },
    _mouseInBoundingBox: function () {
        return this.mouseState.x > this.localState.coords.left &&
            this.mouseState.x < this.localState.coords.left + this.localState.coords.width &&
            this.mouseState.y > this.localState.coords.top &&
            this.mouseState.y < this.localState.coords.top + this.localState.coords.height;
    },
    render: function (ctx) {
        ctx.save();
        //Al igual que en el XScrollBar component aqui solo estamos deshaciendo la transformacion de parte de los scrolls del padre, mas no de la transformacion de coordenadas
        ctx.transform(1,0,0,1,this.parentState.scrollParams.scrollLeft,this.parentState.scrollParams.scrollTop);
        ctx.beginPath();
        ctx.moveTo(this.localState.coords.left+this.localState.coords.width/2, this.localState.coords.top + this.localState.coords.height/2);
        ctx.fillStyle = this.localState.colors.idle;
        ctx.arc(this.localState.coords.left+this.localState.coords.width/2, this.localState.coords.top + this.localState.coords.height/2,this.localState.coords.width/2,0,Math.PI*2,false);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle =this.localState.colors.innerCircle;
        ctx.arc(this.localState.coords.left+this.localState.coords.width/2, this.localState.coords.top + this.localState.coords.height/2,this.localState.coords.width/3,0,Math.PI*2,false);
        ctx.fill();

        ctx.restore();
    },
    onLocalCoordsSettled: function () {
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.x - this.localState.coords.left;
        this.offsetMouseY = this.mouseState.y - this.localState.coords.top;
    },
    onMouseDragging: function () {
        this.localState.coords.left = this.mouseState.x - this.offsetMouseX;
        this.notifyOnDragged();
    },
    onMouseClick: function () {

    },
    onMouseDragEnded: function () {

    },
    registerOnDragged: function (obj) {
        this.observerOnDragged = obj;
    },
    notifyOnDragged: function () {
        this.observerOnDragged.notificationOnButtonDragged(this);
    }
})

let ScrollBarComponent = fabric.util.createClass(Component, {

    initialize: function (canvas, mouseState, coords,scrollParams) {
        this.callSuper("initialize", mouseState)
        /*parent State*/
        this.parentState={
            coords:coords,
            scrollParams:scrollParams
        };

        this.canvas = canvas;
        this.canvas.addComponent(this);

        this.localState = {colors: {idle: "#3B3A39"}};

        this.offsetMouseX = 0;
        this.offsetMouseY = 0;
        this.minWidth = 100;

        this.buttonA = new ScrollBarButton(canvas,mouseState,scrollParams);
        this.buttonB = new ScrollBarButton(canvas,mouseState,scrollParams);
        this.buttonA.name = "buttonA";
        this.buttonB.name = "buttonB";
        this.buttonA.registerOnDragged(this);
        this.buttonB.registerOnDragged(this);

        this.listObserversOnScroll = [];
        this.listObserversOnScrollBarResize = [];

        this.timelineTotalLength = 0;


    },
    _leftCoordToScrollLeft:function(){
        return (this.localState.coords.left / this.parentState.coords.width) * (this.parentState.scrollParams.usableScrollWidth)
    },
    _scrollWidthToWidthCoord:function(){

    },
    constraintMovement:function(){
        if (this.localState.coords.left < 0) {
            this.localState.coords.left = 0
        }
        if (this.localState.coords.left > this.parentState.coords.width - this.localState.coords.width) {
            this.localState.coords.left = this.parentState.coords.width - this.localState.coords.width
        }
    },
    _mouseInBoundingBox: function () {
        return this.mouseState.x > this.localState.coords.left &&
            this.mouseState.x < this.localState.coords.left + this.localState.coords.width &&
            this.mouseState.y > this.localState.coords.top &&
            this.mouseState.y < this.localState.coords.top + this.localState.coords.height;
    },
    calcWidth: function () {
        let percentInViewport = (this.parentState.coords.width) /
                                (this.parentState.scrollParams.scrollWidth);
        this.localState.coords.width = this.parentState.coords.width * percentInViewport;
    },
    setComponentsCoords: function () {
        let buttonsWidth = this.localState.coords.height;
        //A estos componentes si los ubicamos usando left y top ya que en si no son sub componentes de este objecto, solo se ubicaron como hijos ya que estan muy relacionados
        this.buttonA.setLocalCoords(this.localState.coords.left, this.localState.coords.top, buttonsWidth, this.localState.coords.height);
        this.buttonB.setLocalCoords(this.localState.coords.left + this.localState.coords.width - buttonsWidth, this.localState.coords.top, buttonsWidth, this.localState.coords.height);
    },
    render: function (ctx) {
        ctx.save();
        //Impliando el translate de los scrolls del padre, mas no de las posiciones del componente padre
        ctx.transform(1,0,0,1,this.parentState.scrollParams.scrollLeft,this.parentState.scrollParams.scrollTop);
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left +(this.buttonA.localState.coords.width/2), this.localState.coords.top, this.localState.coords.width - (this.buttonB.localState.coords.width), this.localState.coords.height);
        ctx.restore();
    },
    onLocalCoordsSettled: function () {
        this.calcWidth();
        this.setComponentsCoords();
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.x - this.localState.coords.left;
        this.offsetMouseY = this.mouseState.y - this.localState.coords.top;
    },
    onMouseDragging: function () {
        this.localState.coords.left = this.mouseState.x - this.offsetMouseX;
        this.constraintMovement();

        this.setComponentsCoords();
        this.notifyOnScroll(this._leftCoordToScrollLeft());
        this.canvas.requestRenderAll();
    },
    onMouseClick: function () {
    },
    onMouseDragEnded: function () {

    },
    notifyOnScroll: function (scrollLeft) {
        for (let i = 0; i < this.listObserversOnScroll.length; i++) {
            this.listObserversOnScroll[i].notificationOnScroll(scrollLeft);
        }
    },
    notifyOnScrollBarResize: function (scrollWidth) {
        for (let i = 0; i < this.listObserversOnScrollBarResize.length; i++) {
            this.listObserversOnScrollBarResize[i].notificationOnScrollBarResize(scrollWidth);
        }
    },
    notificationOnButtonDragged: function (who) {
        if (who.name === "buttonA") {
            this._constraintButtonAAfterDragging()
        } else if (who.name === "buttonB") {
            this._constraintButtonBAfterDragging();
        }
        this.notifyOnScrollBarResize(this.localState.coords.width);
        this.notifyOnScroll(this._leftCoordToScrollLeft());
        this.canvas.requestRenderAll();
    },
            _constraintButtonAAfterDragging:function(){
                let buttonACoords = this.buttonA.localState.coords;
                let buttonBCoords = this.buttonB.localState.coords;
                if (buttonACoords.left < 0) {
                    buttonACoords.left = 0
                }
                if (buttonACoords.left > buttonBCoords.left + buttonBCoords.width-buttonACoords.width - this.minWidth) {
                    buttonACoords.left = buttonBCoords.left + buttonBCoords.width-buttonACoords.width - this.minWidth
                }

                let newWidth = (buttonBCoords.left + buttonBCoords.width) - buttonACoords.left;
                this.localState.coords.width = newWidth;
                this.localState.coords.left = buttonACoords.left;
            },
            _constraintButtonBAfterDragging:function(){
                let buttonACoords = this.buttonA.localState.coords;
                let buttonBCoords = this.buttonB.localState.coords;
                if (buttonBCoords.left + buttonBCoords.width > this.parentState.coords.width) {
                    buttonBCoords.left = this.parentState.coords.width - buttonBCoords.width
                }
                if (buttonBCoords.left < buttonACoords.left + this.minWidth) {
                    buttonBCoords.left = buttonACoords.left + this.minWidth;
                }

                let newWidth = (this.buttonB.localState.coords.left + this.buttonB.localState.coords.width) - this.buttonA.localState.coords.left;
                this.localState.coords.width = newWidth;
            },
    registerOnScroll: function (obj) {
        this.listObserversOnScroll.push(obj);
    },
    registerOnScrollBarResize: function (obj) {
        this.listObserversOnScrollBarResize.push(obj);
    },
    onWindowResize:function(){/*Called by ancestor*/
        //calculating width with then given new with and scrollWidth
        this.calcWidth();
        //constraining movement after altering width
        this.constraintMovement();

        //altering buttons and constraining their movements
        this.setComponentsCoords();
        this._constraintButtonAAfterDragging();//TODO: me parece que esto esta de mas
        this._constraintButtonBAfterDragging();//TODO: me parece que esto esta de mass

        //notifing about the scroll values change
        this.notifyOnScrollBarResize(this.localState.coords.width);
        this.notifyOnScroll(this._leftCoordToScrollLeft());

    }

})
let Padding = fabric.util.createClass(Component, {

    initialize: function (canvas,mouseState,scrollParams, name) {
        this.callSuper("initialize", mouseState);
        this.parentState={
            scrollParams:scrollParams
        }
        this.localState = {"colors": {"idle": "rgba(0,0,0,.1)"}}
        this.name = name;
        this.canvas = canvas;

        this.canvas.addComponent(this);
    },
    render: function (ctx) {
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, PADDING_WITH, this.localState.coords.height);
    },
    notificationOnScrollBarResize: function () {
        if (this.name === "paddingRight") {
            this.localState.coords.left = this.parentState.scrollParams.scrollWidth - PADDING_WITH;
        }
    }
})
let TimeLineProxy=fabric.util.createClass({
    initialize:function (WindowManager,htmlElementSelector,propertyLanesNames,classParent){
        this.timeLineComponent=new TimeLineActions(WindowManager,htmlElementSelector,propertyLanesNames);

        this.timeLineComponent.keysBarComponent.registerOnKeyFrameDragEnded(classParent);
        this.timeLineComponent.keysBarComponent.registerOnKeyFrameDragging(classParent);
        this.timeLineComponent.markerComponent.registerOnDragStarted(classParent);
        this.timeLineComponent.markerComponent.registerOnDragging(classParent);
        this.timeLineComponent.markerComponent.registerOnDragEnded(classParent);
        this.timeLineComponent.keysBarComponent.registerOnSelectionUpdated(classParent);
        this.timeLineComponent.keysBarComponent.registerOnInnerScroll(classParent);
    },
    setDuration:function(durationBefore,durationAfter){
        this.timeLineComponent.notificationOnDurationChange(durationBefore,durationAfter);
    },
    addKeyFrameOnMarker:function(laneName,listListValues){
        this.timeLineComponent.keysBarComponent.addKeyFrame(laneName,this.timeLineComponent.markerComponent.timeLineTime,listListValues);
    },
    generateLanes:function(listLanesNames){
        this.timeLineComponent.keysBarComponent.generateLanes(listLanesNames);
    },
    discardAllLanes:function(){
        this.timeLineComponent.keysBarComponent.discardAllLanes();
    },
    addKeyFramesInBatch:function(listDictsKeyFramesByProperties){
        this.timeLineComponent.keysBarComponent.addKeyFramesInBatch(listDictsKeyFramesByProperties);
    },
    getLaneKeyFramesLength:function(laneName){
        return this.timeLineComponent.keysBarComponent.dictPropertiesLanes[laneName].counterActiveKeyFrames;
    },
    discartSelectedKeyFrames:function(){
        return this.timeLineComponent.keysBarComponent.discartSelectedKeyFrames();
    },
    discartAllKeyFrames:function(){
        this.timeLineComponent.keysBarComponent.discartAllKeyFrames();
    },
    sortLaneKeyFramesByTime:function(laneName){
        this.timeLineComponent.keysBarComponent.dictPropertiesLanes[laneName].sortKeyFramesByTime();
    },
    getLaneActiveKeyFramesByIds:function(laneName){
        let tmp =this.timeLineComponent.keysBarComponent.dictPropertiesLanes[laneName].getActiveKeyFramesByIds();
        return tmp;
    },
    /*
    Updates keyframes by lane, and by object, given that in uno lane there could be keyframes for more than one object
     */
    updateKeyFramesIndexByObject:function(){
      this.timeLineComponent.keysBarComponent.updateKeyFramesIndexByObject();
    },
    getSelectedKeyFrames:function(){
        return this.timeLineComponent.keysBarComponent.getSelectedKeyFrames();
    },
    /*setters*/
    setMarkerTime:function(time){
        this.timeLineComponent.markerComponent.setTime(time);
    },
    onWindowResize:function(newWidth){
        this.timeLineComponent.notificationOnWindowResize(newWidth);

    },
    notificationPanelAnimationOnPanelToggle:function(opened){
        this.timeLineComponent.notificationPanelAnimationOnPanelToggle(opened);
    }

})
let TimeLineActions = fabric.util.createClass({
    HTMLElement: null,
    ctx: null,

    /*Subcomponents*/
    timeBarComponent: null,
    keysBarComponent: null,
    markerComponent: null,
    scrollBarComponent: null,
    scrollBarBtnA: null,
    scrollBarBtnB: null,
    components: [],

    /*Component state*/
    localState:{
        coords:{
            left:0,//Pos respecto a padre
            top:0, //Pos respecto a padre
            width:null, // Ancho viewport (ancho respecto a padre)
            height:null, // Alto de viewport (alto respecto a padre)
        },
        scrollParams:{
            scrollWidth:0,
            scrollHeight:0,
            scrollLeft:0,
            scrollTop:0,
            usableScrollWidth:0,

        },
        labelingParams:{
            segmentWidth:0,
            segmentWidthTimeVal:0,
            baseSegmentWidthTimeVal:250,
            minSegmentWidth:100,
            maxSegmentWidth: 100,
            cantSegments:0
        }
    },
    globalState:{
        animatorDuration:0,
    },
    // globalState: {
    //     coords: {left: 0, // cood x desde la esquina superior izquierda desde el origen del canvas a partir de donde empieza todo
    //         top: 0, // coor y desde la esquina superior izquierda desde el origen del canvas a partir de donde empieza todo
    //         width: null, // alto del viewport,
    //         height: null,}, // ancho del viewport
    //     time: {segmentTimeValue: 250, baseSegmentTimeValue: 250, duration: 60000},
    //     timingDistances: {
    //         minSegmentDistance: 100,    // longitud en px minima, a partir de la cual el segmentDistance y segmentTimeValue se  doblegan en tamaño
    //         maxSegmentDistance: 200,   // longitud en px maxima a partir de la cual el segmentDistance y segmentTimeValue se dividen / 2 en tamaño
    //         segmentDistance: 0, // longitud en px de un segmento, que representa (time.segmentTimeValue) de timpo
    //         scrollWidth: 0, // ancho total (areas ocultas scroleables)
    //         usableScrollWidth:0, // scrollWidth - padding.width * 2
    //         cantSegments:0, // cantidad de segmentos
    //         scrollLeft: 0  // tamaño de porcion oculta de la izquierda por scroll ( 0 es que 0px estan ocultos)
    //     },
    //     padding: {width: 25}
    // },
    localMouseState: {x: 0, y: 0, click: false, inWorldX: 0, inWorldY: 0},
    windowEventsManager:null,
    initialize: function (WindowEventsManager, selector, MODELPropertyLanes) {

        this.HTMLElement = document.querySelector(selector);
        this.ctx = this.HTMLElement.getContext("2d");
        this.HTMLElement.width = this.HTMLElement.parentNode.clientWidth;
        this.HTMLElement.height = this.HTMLElement.parentNode.clientHeight;
        this.windowEventsManager=WindowEventsManager;

        /*----setup-----*/
        this.setupGlobalStateCoords();
        this.setupGlobalStateTimingDistances((this.localState.coords.width - PADDING_WITH*2));
        //los demas campos del global state no son necesarios configurarse en timpo de ejecucion
        this.initComponents(MODELPropertyLanes);
        this.setupComponentsCoords();
        /*----events-----*/
        this.initEvents();

        this.renderAll();
    },
    setupGlobalStateCoords: function () {
        let boundingRect = this.HTMLElement.getBoundingClientRect();
        this.localState.coords.left =boundingRect.left;
        this.localState.coords.top = boundingRect.top;
        this.localState.coords.width = this.HTMLElement.clientWidth;
        this.localState.coords.height = this.HTMLElement.clientHeight;
        this.localState.scrollParams.scrollWidth=this.HTMLElement.clientWidth;
        this.localState.scrollParams.scrollHeight=this.HTMLElement.clientHeight;
    },
    setupGlobalStateTimingDistances: function (newUsableScrollWidth) {//debe ser el scrollWidth USABLE (sin contar los paddings)
        let numSegmentsWithBaseSegmentTimeValue = this.globalState.animatorDuration / this.localState.labelingParams.baseSegmentWidthTimeVal;
        let segmentLongitude = newUsableScrollWidth/ numSegmentsWithBaseSegmentTimeValue;

        let newSegmentDistance;
        let newSegmentTimeValue;
        /**/
        if (segmentLongitude < this.localState.labelingParams.minSegmentWidth) {
            /*segmentLongitudeWidthBaseSegmentTimeValue[100<] * 2^x = minSegmentDistance[100]       : x: expotente para elevar las distancias de segmento y el valor temporal de cada segmento*/
            /*necestiamos sober la cantidad de veces que reduciremos el segmento de distancia y valor temporal de cada segmento*/
            /*igualamos a minSegmentDistance porque queremos que nos de ese valor, minimamente(por eso se hace ceil())*/
            let auxExponent = Math.ceil(Math.log2(this.localState.labelingParams.minSegmentWidth / segmentLongitude));
            newSegmentDistance = segmentLongitude * Math.pow(2, auxExponent);
            newSegmentTimeValue = this.localState.labelingParams.baseSegmentWidthTimeVal * Math.pow(2, auxExponent);
        } else if (segmentLongitude > this.localState.labelingParams.maxSegmentWidth) {
            /*maxSegmentDistance[200] / 2^x = segmentoLongitudeWithBaseSegmentTimeValue[>200] se invistieron los valores porque salia negativo*/
            let auxExponent = Math.ceil(Math.log2(segmentLongitude / this.localState.labelingParams.minSegmentWidth));
            newSegmentDistance = segmentLongitude / Math.pow(2, auxExponent);
            newSegmentTimeValue = this.localState.labelingParams.baseSegmentWidthTimeVal / Math.pow(2, auxExponent);
        } else {
            newSegmentDistance = segmentLongitude;
            newSegmentTimeValue = this.localState.labelingParams.baseSegmentWidthTimeVal;
        }
        /**/
        this.localState.labelingParams.segmentWidth=newSegmentDistance;
        this.localState.labelingParams.segmentWidthTimeVal=newSegmentTimeValue;
        this.localState.labelingParams.cantSegments=this.globalState.animatorDuration / newSegmentTimeValue;

        this.localState.scrollParams.usableScrollWidth=newUsableScrollWidth;
        this.localState.scrollParams.scrollWidth=newUsableScrollWidth + PADDING_WITH*2;
        },
    initComponents: function (MODELPropertyLanes) {
        this.keysBarComponent = new TimeLineKeysBar(this,this.localMouseState, this.localState.labelingParams,this.localState.coords,this.localState.scrollParams, MODELPropertyLanes,this.globalState);
        this.timeBarComponent = new TimeLineTimeBar(this,this.localMouseState, this.localState.labelingParams,this.localState.scrollParams);
        this.markerComponent = new Marker(this, this.localMouseState,this.localState.labelingParams,this.localState.scrollParams,this.globalState);
        this.paddingLeft = new Padding(this, this.localMouseState, this.localState.scrollParams, "paddingLeft");
        //this.paddingRight = new Padding(this, this.localMouseState,this.localState.scrollParams, "paddingRight");
        this.scrollBarComponent = new ScrollBarComponent(this,this.localMouseState, this.localState.coords,this.localState.scrollParams);
    },
    setupComponentsCoords: function () {
        let timeBarHeight = 30;
        let scrollBarHeight = 18;
        this.timeBarComponent.setLocalCoords(0, 0, this.localState.coords.width, timeBarHeight);
        this.keysBarComponent.setLocalCoords(0, timeBarHeight, this.localState.coords.width, this.localState.coords.height - timeBarHeight);
        this.markerComponent.setLocalCoords(0, 0, 20, timeBarHeight);//posiciones seran actualizadas a otras al inicio del componente
        this.scrollBarComponent.setLocalCoords(0, this.localState.coords.height - scrollBarHeight, 100, scrollBarHeight);//estas coords seran sobreescritas al inicnio

        this.paddingLeft.setLocalCoords(0, timeBarHeight, PADDING_WITH, this.localState.coords.height-timeBarHeight);
        // this.paddingRight.setLocalCoords(this.localState.scrollParams.scrollWidth - PADDING_WITH, timeBarHeight, PADDING_WITH, this.localState.coords.height-timeBarHeight);
    },
    initEvents:function(){
        this.scrollBarComponent.registerOnScroll(this);
        this.scrollBarComponent.registerOnScrollBarResize(this);
        this.timeBarComponent.registerOnClick(this.markerComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.markerComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.timeBarComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.keysBarComponent);
        this.scrollBarComponent.registerOnScroll(this.keysBarComponent);

        //this.scrollBarComponent.registerOnScrollBarResize(this.paddingRight);

        this.windowEventsManager.registerOnMouseDown(this);
        this.windowEventsManager.registerOnMouseUp(this);
        this.windowEventsManager.registerOnMouseMove(this);
    },
    addComponent: function (component) {
        this.components.push(component);
    },

    notificationOnScroll: function (scrollLeft) {
        this.localState.scrollParams.scrollLeft = scrollLeft;
    },
    notificationOnScrollBarResize: function (scrollBarWidth) {
        let percentViewport = scrollBarWidth / this.localState.coords.width;
        let usableScrollWidth = (this.localState.coords.width - PADDING_WITH * 2) / percentViewport;

        this.setupGlobalStateTimingDistances(usableScrollWidth);
    },
    requestRenderAll: function () {
        this.renderAll();
    },
    renderAll: function () {
        this.ctx.save();
        // En la translacion no incluimos coords left ni top porque se podria decir que ya se hizo, ya que las coordenadas ordegen de este componente coinciden con el origen absoluto
        this.ctx.setTransform(1,0,0,1,-this.localState.scrollParams.scrollLeft,-this.localState.scrollParams.scrollTop);
        this._clearCanvas();
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].render(this.ctx);
        }
        this.ctx.restore();
    },
    _clearCanvas: function () {
        this.ctx.clearRect(0, 0, this.localState.scrollParams.scrollWidth, this.localState.coords.height);
        this.ctx.beginPath();
    },
    /*notificationes exteriores*/
    notificationOnMouseMove: function (e) {
        this.localMouseState.x = e.clientX - this.localState.coords.left;
        this.localMouseState.y = e.clientY - this.localState.coords.top;
        this.localMouseState.inWorldX = this.localMouseState.x + this.localState.scrollParams.scrollLeft;
        this.localMouseState.inWorldY = this.localMouseState.y +this.localState.scrollParams.scrollTop;
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].notificationOnMouseMove(e);
        }
    },

    notificationOnMouseDown: function (e) {
        if(!this._localMouseInViewportComponent()){return;}
        for (let i = this.components.length - 1; i >= 0; i--) {
            let clicked = this.components[i].notificationOnMouseDown(e);
            if (clicked) {
                break;
            }
        }
    },
        _localMouseInViewportComponent: function () {
            return this.localMouseState.x >= 0 &&
                this.localMouseState.x <= this.localState.coords.width &&
                this.localMouseState.y >= 0 &&
                this.localMouseState.y <= this.localState.coords.height;
        },
    notificationOnMouseUp: function (e) {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].notificationOnMouseUp(e);
        }
    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        this.globalState.animatorDuration=durationAfter;
        this.setupGlobalStateTimingDistances(this.localState.scrollParams.scrollWidth-PADDING_WITH*2);
        this.markerComponent.notificationOnDurationChange(durationBefore,durationAfter);
        this.keysBarComponent.notificationOnDurationChange(durationBefore,durationAfter);
        this.renderAll();
    },
    notificationOnWindowResize:function(newWidth){
        //These two properties are used to find the mouse position relative to the canvas, since at window resizing those values can be changed we update them.
        let boundingRect = this.HTMLElement.getBoundingClientRect();
        this.localState.coords.left = boundingRect.left;
        this.localState.coords.top = boundingRect.top;
        // alteramos el ancho del elemento html canvas
        this.HTMLElement.width = newWidth;

        // establecemos el nuevo ancho, que es lo que en si esta cambiando al hacer resize al window
        this.localState.coords.width=newWidth;
        // El "width" normal, nunca puede ser mas grande que el scrollwidth, que es el ancho real(partes ocultas), Por ello, si se da el caso, automaticamente debemos establecer el scrollwidth a la misma dimencion que el width y dejar que el componente scroll haga sus calculos
        if(newWidth>this.localState.scrollParams.scrollWidth){
            //Aqui solo modificamos esto ya que lo que necesita el scrollbar, quien ya mediante sus notifcaiones cambia los demas valroes necesarios
            this.localState.scrollParams.usableScrollWidth=newWidth-PADDING_WITH*2;
        }
        //Updating the scroll bar
        this.scrollBarComponent.onWindowResize();
        this.keysBarComponent.notificationOnWindowResize();//para el inner scroll
        this.requestRenderAll();
    },
    notificationPanelAnimationOnPanelToggle:function(opened){
        setTimeout(function(){
            let boundingRect = this.HTMLElement.getBoundingClientRect();
            this.localState.coords.left = boundingRect.left;
            this.localState.coords.top = boundingRect.top;
        }.bind(this),700); //this time has to be geater than the toggle tansition duration
    }

});

let TimeLineTimeBar = fabric.util.createClass(Component, {
    type: "time-bar_component",
    ctx: null,
    globalState: {},
    localState: {
        coords: {left: 0, top: 0, width: 0, height: 0},
        colors: {idle: "#242323", onMouseOver: "yellow", onMouseClick: "green", text: "rgba(255,255,255,.6)"}
    },
    mouseState: {},
    snapshotLastState: null,
    initialize: function (canvas, mouseState, labelingParams,scrollParams) {
        this.callSuper('initialize', mouseState);
        this.parentState={
            scrollParams:scrollParams,
        }
        this.labelingParams=labelingParams;
        this.listObserversOnClick = [];
        this.canvas = canvas;

        this.canvas.addComponent(this);
    },
    onMouseDragging: function () {
    },
    onMouseClick: function (e) {
        this.notifyOnClick(e);
    },
    onMouseDragEnded: function () {

    },
    _drawContainer: function (ctx) {
        //console.log(this.localState,this.parentState);
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(0,0, this.localState.coords.width, this.localState.coords.height);
        ctx.moveTo(0,this.localState.coords.height);
        ctx.lineTo(this.localState.coords.width,this.localState.coords.height);
        ctx.stroke();
        },
    _drawLabels: function (ctx) {
        let fontSize=11;
        ctx.beginPath();
        ctx.font = fontSize + "px Arial";
        ctx.textBaseline = "top";
        ctx.fillStyle = this.localState.colors.text;
        //marks are all the little lines
        let cantLabels=Math.ceil(this.labelingParams.cantSegments);
        let timesTimeValueIn1Second=(1000/(this.labelingParams.segmentWidthTimeVal)); //simbre data un valor entero, ya que segmentTimeValue esta en base a 250 (125,250,500,...)
        let timeBarMarksDistance=this.labelingParams.segmentWidth / 4; // 4 para cuadruplicar los marks por segundo
        //haciendo que haya el cuadruple de markers que segmenttimesvalues en 1 segundo
        timesTimeValueIn1Second=timesTimeValueIn1Second<1?1/timesTimeValueIn1Second*4:timesTimeValueIn1Second*4;

        for (let i = 0; i <=cantLabels ; i++) {
            let timeMS = this.labelingParams.segmentWidthTimeVal * i;
            if(timeMS%1000===0){
                let text=(timeMS/1000) + "s";
                let textMeassures = ctx.measureText(text);
                let labelLeftPos=this.labelingParams.segmentWidth * i + PADDING_WITH;
                for(let j=0;j<timesTimeValueIn1Second;j++){
                    if(j%(timesTimeValueIn1Second/4)===0){
                        ctx.moveTo(labelLeftPos + (timeBarMarksDistance * j), this.localState.coords.height -10);
                    }else {
                        ctx.moveTo(labelLeftPos + (timeBarMarksDistance * j), this.localState.coords.height - 6);
                    }
                    ctx.lineTo(labelLeftPos + (timeBarMarksDistance * j),this.localState.coords.height);
                }
                ctx.fillText(text,labelLeftPos - (textMeassures.width/2) , 2 );
            }
        }

        ctx.stroke();

        ctx.closePath();
    },
    updateLogic: function () {
    },
    render: function (ctx) {
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.strokeStyle=this.localState.colors.text;
        this._drawContainer(ctx);
        this._drawLabels(ctx);
        ctx.beginPath();
        // this.snapshotLastState = ctx.getImageData(this.localState.coords.left,
        //     this.localState.coords.top, 
        //     this.localState.coords.width,
        //     this.localState.coords.height)
    },
    drawSnapshot: function (ctx) {
        ctx.putImageData(this.snapshotLastState, 0, 0)
    },
    notifyOnClick: function (e) {
        for (let i = 0; i < this.listObserversOnClick.length; i++) {
            this.listObserversOnClick[i].notificationOnTimeBarClicked(e);
        }
    },
    registerOnClick: function (obj) {
        this.listObserversOnClick.push(obj);
    },
    notificationOnScrollBarResize: function () {
        this.localState.coords.width = this.parentState.scrollParams.scrollWidth;
    }
});
var YScrollBarComponent=fabric.util.createClass(Component,{
    initialize:function(canvas,mouseState,coords,scrollParams){
        this.callSuper('initialize', mouseState);
        this.parentState={
            coords:coords,
            scrollParams:scrollParams
        };

        this.canvas = canvas;//in a subcomponent we only need this to invoke renderAll() to refresh in case something happend here

        this.localState = {colors: {idle: "#3B3A39"}};

        this.offsetMouseX = 0;
        this.offsetMouseY = 0;

        this.fixedLeftCoord=0;
        this.maxHeightCoord=0;

        this.listObserversOnScroll = [];
    },
    _topCoordToScrollTop:function(){
        return (this.localState.coords.top / this.maxHeightCoord) * (this.parentState.scrollParams.scrollHeight)
    },
    constraintMovement:function(){
        if (this.localState.coords.top < 0) {
            this.localState.coords.top = 0
        }
        if (this.localState.coords.top > this.maxHeightCoord - this.localState.coords.height) {
            this.localState.coords.top = this.maxHeightCoord - this.localState.coords.height;
        }
    },
    _mouseInBoundingBox: function () {
        return this.mouseState.x > this.localState.coords.left &&
            this.mouseState.x < this.localState.coords.left + this.localState.coords.width &&
            this.mouseState.y > this.localState.coords.top &&
            this.mouseState.y < this.localState.coords.top + this.localState.coords.height;
    },
    onLocalCoordsSettled:function(){
        this.fixedLeftCoord=this.localState.coords.left;
        this.maxHeightCoord=this.localState.coords.height;
        this.calcHeight();
    },
    calcHeight: function () {
        let percentInViewport = (this.parentState.coords.height) /
            (this.parentState.scrollParams.scrollHeight);
        this.localState.coords.height = this.maxHeightCoord * percentInViewport;
    },
    render: function (ctx) {
        if(this.localState.coords.height===this.maxHeightCoord){return};
        ctx.save();
        ctx.beginPath();
        //Impliando el translate de los scrolls del padre, mas no de las posiciones del componente padre
        ctx.transform(1,0,0,1,this.parentState.scrollParams.scrollLeft,this.parentState.scrollParams.scrollTop);
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
        ctx.restore();
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.x - this.localState.coords.left;
        this.offsetMouseY = this.mouseState.y - this.localState.coords.top;
    },
    onMouseDragging: function () {
        this.localState.coords.top = this.mouseState.y - this.offsetMouseY;
        this.constraintMovement();

        this.notifyOnScroll(this._topCoordToScrollTop());
        this.canvas.requestRenderAll();
    },
    onMouseClick: function () {
    },
    onMouseDragEnded: function () {

    },
    notifyOnScroll: function (scrollTop) {
        for (let i = 0; i < this.listObserversOnScroll.length; i++) {
            this.listObserversOnScroll[i].notificationOnInnerScroll(scrollTop);
        }
    },
    registerOnScroll: function (obj) {
        this.listObserversOnScroll.push(obj);
    },
    onWindowResize:function(){/*Called by ancestor*/
        //calculating width with then given new with and scrollWidth
        this.calcWidth();
        //constraining movement after altering width
        this.constraintMovement();


        //notifing about the scroll values change
        this.notifyOnScrollBarResize(this.localState.coords.width);
        this.notifyOnScroll(this._leftCoordToScrollLeft());

    },
    notificationOnScroll:function(scrollLeft){
        this.localState.coords.left=this.fixedLeftCoord+scrollLeft;
    },
    notificationOnWindowResize:function(newFixedLeft){
        console.log("asdf");
        this.fixedLeftCoord=newFixedLeft;
        this.localState.coords.left=this.fixedLeftCoord;
    }
})
var TimeLineKeysBar = fabric.util.createClass(Component, {
    type: "keys-bar_component",
    localState: {
        coords: {left: 0, top: 0, width: 0, height: 0},
        colors: {idle: "#1A161D", selection: "yellow", onMouseClick: "green", text: "white",guidelines:"rgba(255,255,255,0.1)"},
        scrollParams:{}
        },
    initialize: function (canvas, mouseState,labelingParams,coords, scrollParams, listLanesName,globalState) {
        this.callSuper('initialize', mouseState);
        this.globalState=globalState;
        this.parentState={
            coords:coords,
            scrollParams:scrollParams,
        }
        this.localMouseState={
            x:0,y:0,inWorldX:0,inWorldY:0
        }
        this.labelingParams=labelingParams;
        this.canvas = canvas;
        this.snapshotLastState = null;
        this.mousePosXOnDragStated = 0;
        this.mousePosYOnDragStated = 0;
        this.selectionWidth = 0;
        this.selectionHeight = 0;
        this.selecting = false;

        this.scrollBarComponent;

        this.dictKeyFramesBySeconds={};
        this.dictPropertiesLanes = {};
        this.listLanesName = listLanesName;
        this.listPoolLanes=[];
        this.counterActiveLanes=0;

        this.selectedKeyframes = [];

        this.listObserversOnKeyFrameDragging=[];
        this.listObserversOnKeyFrameDragEnded=[];
        this.observerOnSelectionUpdated=[];
        this.observerOnInnerScroll=null;
        this.canvas.addComponent(this);

    },
    initScrollBarComponent:function(){
        this.scrollBarComponent = new YScrollBarComponent(this.canvas,this.localMouseState, this.localState.coords,this.localState.scrollParams);
        this.scrollBarComponent.registerOnScroll(this);
    },
    setupComponentsCoords:function(){
        this.scrollBarComponent.setLocalCoords(this.localState.coords.width-12-3,0,12,this.localState.coords.height*0.85);
    },
    generateLanes:function(listLanesNames){
        this.listLanesName=listLanesNames;
        let i=0;
        for (i=0;i<this.listLanesName.length;i++) {
            this._retrieveLane(listLanesNames[i],i);
        }
        let newScrollHeight=i*25;
        this.updateScrollParamsScrollHeight(newScrollHeight);
    },
        _retrieveLane:function(laneName,topPositionFactor){
            if(this.counterActiveLanes>=Object.keys(this.dictPropertiesLanes).length){
                let lane = new KeyBarPropertyLane(this.canvas,this.localMouseState,this.localState.scrollParams, this.labelingParams,this.globalState);
                lane.registerOnKeyframeFixedClick(this);
                lane.registerOnKeyframeMouseDown(this);
                lane.registerOnKeyframeDragStarted(this);
                lane.registerOnKeyframeDragging(this);
                lane.registerOnKeyframeDragEnded(this);

                lane.setLocalCoords(0,topPositionFactor*25,this.localState.coords.width,25);//lane height=24;
                lane.name=laneName;
                this.dictPropertiesLanes[laneName] = lane;
                this.listPoolLanes.push(lane);
            }else{
                let lane=this.listPoolLanes[this.counterActiveLanes];
                lane.setLocalCoords(0,topPositionFactor*25,this.localState.coords.width,25);
                this.dictPropertiesLanes[laneName]=lane;
            }
            this.counterActiveLanes++;
        },
    updateScrollParamsScrollHeight:function(scrollHeight){
        if(scrollHeight<this.localState.coords.height){
            scrollHeight=this.localState.coords.height;
        }else{
            scrollHeight+=25; // padding bottom of 30px
        }
        this.localState.scrollParams.scrollHeight=scrollHeight;
        this.scrollBarComponent.calcHeight();

        this.localState.scrollParams.scrollTop=0;
        this.scrollBarComponent.localState.coords.top=0;
        this.canvas.requestRenderAll();
    },
    deselectCurrentSelection: function () {
        if (this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                this.selectedKeyframes[i].deselect();
            }
            this.selectedKeyframes = [];
        }

    },
    findKeyframesInsideBoxSelection: function () {
        for (let i in this.dictPropertiesLanes) {
                this.dictPropertiesLanes[i].getActiveKeyFramesInSelection(this.mousePosXOnDragStated,this.mousePosYOnDragStated,this.selectionWidth, this.selectionHeight,function(keyFrame){
                    this.selectedKeyframes.push(keyFrame);
                    keyFrame.select();
                }.bind(this));

        }
    },

    _countSelectedKeyFramesByLane:function(){
        let tmpDictLanesNames={};
        if (this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                let cantLaneKeyFrames=tmpDictLanesNames[this.selectedKeyframes[i].laneName];
                tmpDictLanesNames[this.selectedKeyframes[i].laneName]=cantLaneKeyFrames!==undefined?cantLaneKeyFrames+1:1;
            }
        }
        return tmpDictLanesNames;
    },
    discartSelectedKeyFrames: function () {
        let tmpDictCantLanesKeyFrames=this._countSelectedKeyFramesByLane();
        if (this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                let keyframe=this.dictPropertiesLanes[this.selectedKeyframes[i].laneName].discartKeyFrame(this.selectedKeyframes[i]);
                this._removeKeyFrameFromDictBySeconds(keyframe);
            }
            this.selectedKeyframes = [];
        }
        this.canvas.requestRenderAll();
        this.notifyOnKeyframeSelectionUpdated();
        return tmpDictCantLanesKeyFrames;
    },
    discartLaneKeyFrames:function(laneName){
        this.dictPropertiesLanes[laneName].discartAllKeyFrames(function(keyframe){
            this._removeKeyFrameFromDictBySeconds(keyframe);
        }.bind(this));
        this.canvas.requestRenderAll();
    },
    discartAllKeyFrames:function(){
        this.deselectCurrentSelection();
        for(let i in this.dictPropertiesLanes){
            this.dictPropertiesLanes[i].discartAllKeyFrames(function(keyframe){
                this._removeKeyFrameFromDictBySeconds(keyframe);
            }.bind(this));
        }

        this.canvas.requestRenderAll();
        this.notifyOnKeyframeSelectionUpdated();
    },
    discardAllLanes:function(){
        this.discartAllKeyFrames();
        for(let key in this.dictPropertiesLanes){
            delete this.dictPropertiesLanes[key]
        }
        this.counterActiveLanes=0;
        this.updateScrollParamsScrollHeight(0);
    },
    /*
    Updates keyframes by lane, and by object, given that in uno lane there could be keyframes for more than one object
     */
    updateKeyFramesIndexByObject:function(){
        for(let prop in this.dictPropertiesLanes){
            this.dictPropertiesLanes[prop].updateKeyFramesIndexByObject();
        }
    },
    addKeyFrame: function (laneName, markerTimeLineTime, listListValues) {
        this.deselectCurrentSelection();
        for(let i=0;i<listListValues.length;i++){
            let keyframe=this.dictPropertiesLanes[laneName].retrieveKeyFrame(markerTimeLineTime,listListValues[i], i);
            this._addkeyframeToDictBySeconds(keyframe);
        }
        this.dictPropertiesLanes[laneName].sortKeyFramesByTime();

        this.notifyOnKeyframeSelectionUpdated();
        this.canvas.requestRenderAll();
    },
    /*
    @param listDictsKeyFramesByProperties lista de diccionarios con propiedades: time:float, values:array
     */
    addKeyFramesInBatch:function(listDictsKeyFramesByProperties){ //helpful when adding keyframes in batch (generating keyframes from object animations)
        this.deselectCurrentSelection();

        for(let p=0;p<listDictsKeyFramesByProperties.length;p++){
            for(let key in listDictsKeyFramesByProperties[p]){
                for(let i=0;i<listDictsKeyFramesByProperties[p][key].length;i++){
                    let data=listDictsKeyFramesByProperties[p][key][i];
                    let keyframe=this.dictPropertiesLanes[key].retrieveKeyFrame(data.time, data.data, p);

                    this._addkeyframeToDictBySeconds(keyframe);
                }
            }
        }
        this.notifyOnKeyframeSelectionUpdated();
        this.canvas.requestRenderAll();
    },
    _addkeyframeToDictBySeconds:function(keyframe){
        let second=Math.ceil(keyframe.timeLineTime/1000)
        if(!this.dictKeyFramesBySeconds[second]) {
            this.dictKeyFramesBySeconds[second] = [];
        }
        this.dictKeyFramesBySeconds[second].push(keyframe);
    },
    _removeKeyFrameFromDictBySeconds:function(keyframe){
            let second=Math.ceil(keyframe.timeLineTime/1000);
            let index=this.dictKeyFramesBySeconds[second].indexOf(keyframe);
            if(index!==-1){this.dictKeyFramesBySeconds[second].splice(index,1);}
            else{alert("ERRORRR: UN KEYFRAME DESCARTADO NO ESTABA EN EL DICCOINARIO DE SEGUNDOS");}
    },
    onLocalCoordsSettled: function () {
        this.localState.scrollParams.scrollWidth=this.localState.coords.width;
        this.localState.scrollParams.scrollHeight=this.localState.coords.height
        this.localState.scrollParams.usableScrollWidth=this.localState.coords.width-PADDING_WITH*2
        this.localState.scrollParams.scrollLeft=0;
        this.localState.scrollParams.scrollTop=0;

        this.initScrollBarComponent();
        this.setupComponentsCoords(); //el scrollbar, ya que los lanes se establecen al vuelo, cuando cambia la seleccion de objetos
    },
    onMouseDragStarted: function (e) {
        this.selecting = true;
        this.mousePosXOnDragStated = this.localMouseState.inWorldX;
        this.mousePosYOnDragStated = this.localMouseState.inWorldY;
    },
    onMouseDragging: function () {
        if (this.selecting) {
            this.selectionWidth = this.localMouseState.inWorldX - this.mousePosXOnDragStated;
            this.selectionHeight = this.localMouseState.inWorldY - this.mousePosYOnDragStated;
            this.canvas.requestRenderAll();
        }
    },
    onMouseFixedClick: function () {
        this.deselectCurrentSelection();
        this.notifyOnKeyframeSelectionUpdated();
        this.canvas.requestRenderAll();
    },
    onMouseDragEnded: function () {
        this.deselectCurrentSelection();
        this.findKeyframesInsideBoxSelection();
        this.selecting = false;
        this.notifyOnKeyframeSelectionUpdated();
        this.canvas.requestRenderAll();
    },
    _drawContainer: function (ctx) {
        ctx.beginPath();
        ctx.strokeStyle=this.localState.colors.guidelines;
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(0, 0, this.localState.coords.width, this.localState.scrollParams.scrollHeight);
        for(let i=0;i<this.labelingParams.cantSegments;i++){
            let leftPos=i*this.labelingParams.segmentWidth + PADDING_WITH;
            ctx.moveTo(leftPos,0);
            ctx.lineTo(leftPos,this.localState.scrollParams.scrollHeight);
        }
        ctx.stroke();
    },
    _drawSelection: function (ctx) {
        if (this.selecting) {
            ctx.beginPath();
            ctx.strokeStyle="white";
            ctx.setLineDash([5,5]);
            ctx.fillStyle = this.localState.colors.selection;
            ctx.rect(this.mousePosXOnDragStated, this.mousePosYOnDragStated, this.selectionWidth, this.selectionHeight);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    },
    render: function (ctx) {
        ctx.save();
        ctx.transform(1,0,0,1,this.localState.coords.left-this.localState.scrollParams.scrollLeft,this.localState.coords.top-this.localState.scrollParams.scrollTop);
        this._drawContainer(ctx);
        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].render(ctx);
        }
        this._drawSelection(ctx);
        this.scrollBarComponent.render(ctx);
        //this.snapshotLastState = ctx.getImageData(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height)
        ctx.restore();
    },
    drawSnapshot: function (ctx) {
        ctx.putImageData(this.snapshotLastState, 0, 0);
    },
    getSelectedKeyFrames:function(){
      return this.selectedKeyframes;
    },
    notifyOnKeyframeSelectionUpdated: function () {
        this.observerOnSelectionUpdated.notificationOnKeyBarSelectionUpdated();
    },
    notifyOnKeyFrameDragging:function(laneName){
      for(let i=0;i<this.listObserversOnKeyFrameDragging.length;i++){
          this.listObserversOnKeyFrameDragging[i].notificationOnKeyFrameDragging(laneName);
      }
    },
    notifyOnKeyFrameDragEnded:function(laneName){
        for(let i=0;i<this.listObserversOnKeyFrameDragEnded.length;i++){
            this.listObserversOnKeyFrameDragEnded[i].notificationOnKeyFrameDragEnded(laneName);
        }
    },
    notifyOnInnerScroll:function(){
        this.observerOnInnerScroll.notificationOnKeyBarInnerScroll(this.localState.scrollParams.scrollTop);
    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        if(durationBefore>durationAfter){
            for(let key in this.dictPropertiesLanes){
                this.dictPropertiesLanes[key].notificationOnDurationChange(
                    durationBefore,
                    durationAfter,
                    function(keyFrame){
                        this._removeKeyFrameFromDictBySeconds(keyFrame);
                    }.bind(this),
                    function(keyFrame){
                        this._addkeyframeToDictBySeconds(keyFrame);
                    }.bind(this));
            }
        }else{
            for(let key in this.dictPropertiesLanes){
                this.dictPropertiesLanes[key].notificationOnDurationChange(
                    durationBefore,
                    durationAfter,
                    function(keyFrame){
                    }.bind(this),
                    function(keyFrame){
                    }.bind(this));
            }
        }

    },
    notificationOnGlobalStateChange: function (args) {
        //this.render();
    },
    notificationOnWindowResize:function(){
        let newFixedLeft=this.parentState.coords.width-12-3;
        this.scrollBarComponent.notificationOnWindowResize(newFixedLeft);
    },
    notificationOnScrollBarResize: function (scrollWidth) {
        this.localState.coords.width = this.parentState.scrollParams.scrollWidth;
        this.localState.scrollParams.scrollWidth=this.parentState.scrollParams.scrollWidth;
        this.localState.scrollParams.usableScrollWidth=this.localState.scrollParams.scrollWidth-PADDING_WITH*2

        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].notificationOnScrollBarResize(scrollWidth);
        }
    },
    notificationOnScroll:function(scrollLeft){
        this.scrollBarComponent.notificationOnScroll(scrollLeft);
    },
    notificationOnKeyframeMouseDown: function (keyframe) {
        // si el target es parte de la seleccion, no se hace nada en este metodo, solo se renderiza todo.
        if ( (this.selectedKeyframes.length === 1 && this.selectedKeyframes[0]!==keyframe) || this.selectedKeyframes.length===0 ) {
            if (this.selectedKeyframes.length === 1) {
                this.selectedKeyframes[0].deselect();
                this.selectedKeyframes[0]=keyframe;
            }else{
                this.selectedKeyframes.push(keyframe);
            }
            keyframe.select();
            this.notifyOnKeyframeSelectionUpdated();
        } else {
            if (!keyframe.isSelected) {// si hay seleccion multiple antra al if
                this.deselectCurrentSelection();
                keyframe.select();
                this.selectedKeyframes.push(keyframe);
                this.notifyOnKeyframeSelectionUpdated();
            }
        }

        this.canvas.requestRenderAll();

    },
    notificationOnKeyframeDragStarted: function (keyframe) {
        keyframe.setDictKeyFramesBySecondsForSnapping(this.dictKeyFramesBySeconds);
        if (keyframe.isSelected && this.selectedKeyframes.length > 1) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                if (this.selectedKeyframes[i] !== keyframe) {
                    this.selectedKeyframes[i].simulateDragStarted(keyframe.localState.coords.left);

                    this._removeKeyFrameFromDictBySeconds(this.selectedKeyframes[i]);
                }
            }
        }
        this._removeKeyFrameFromDictBySeconds(keyframe);
    },
    notificationOnKeyframeDragging: function (keyframe) {
        if (keyframe.isSelected && this.selectedKeyframes.length > 1) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                if (this.selectedKeyframes[i] !== keyframe) {
                    this.selectedKeyframes[i].simulateDragging(keyframe.localState.coords.left)
                }
            }
        }
        this.notifyOnKeyFrameDragging(keyframe.laneName)
    },
    notificationOnKeyframeDragEnded: function (keyframe) {
        let dictLaneNames={};
        for(let i in this.listLanesName){dictLaneNames[this.listLanesName[i]]=0;}
        if (keyframe.isSelected && this.selectedKeyframes.length > 1) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                if (this.selectedKeyframes[i] !== keyframe) {
                    this.selectedKeyframes[i].simulateDragEnded();
                    dictLaneNames[this.selectedKeyframes[i].laneName]++;

                    this._addkeyframeToDictBySeconds(this.selectedKeyframes[i]);
                }
            }
        }
        this._addkeyframeToDictBySeconds(keyframe);

        dictLaneNames[keyframe.laneName]++;
        this.notifyOnKeyFrameDragEnded(dictLaneNames);
        this.canvas.requestRenderAll();
    },
    notificationOnKeyframeFixedClick: function (keyframe,laneName) {//click sin dragging, si se hizo dragging no se notifica
        if (this.selectedKeyframes.length > 1) {
            this.deselectCurrentSelection();
            keyframe.select();
            this.selectedKeyframes.push(keyframe);
            this.notifyOnKeyframeSelectionUpdated();
            this.canvas.requestRenderAll();
        }
    },
    notificationOnInnerScroll:function(scrollTop){
        this.localState.scrollParams.scrollTop=scrollTop;
        this.notifyOnInnerScroll();
    },
    notificationOnMouseMove: function (e) {
        this.localMouseState.x=this.mouseState.inWorldX-this.localState.coords.left;
        this.localMouseState.y=this.mouseState.inWorldY-this.localState.coords.top;
        this.localMouseState.inWorldX=this.localMouseState.x+this.localState.scrollParams.scrollLeft;
        this.localMouseState.inWorldY=this.localMouseState.y+this.localState.scrollParams.scrollTop;

        this.scrollBarComponent.notificationOnMouseMove(e);
        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].notificationOnMouseMove(e);
        }
        this.callSuper("notificationOnMouseMove", e);
    },
    notificationOnMouseDown: function (e) {
        let pressed=this.scrollBarComponent.notificationOnMouseDown(e);
        if(pressed){return true}

        for (let key in this.dictPropertiesLanes) {
            let pressed = this.dictPropertiesLanes[key].notificationOnMouseDown(e);
            if (pressed) {
                return true;
            }
        }

        return this.callSuper("notificationOnMouseDown", e);
    },
    notificationOnMouseUp: function (e) {
        this.scrollBarComponent.notificationOnMouseUp(e);
        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].notificationOnMouseUp(e);
        }
        this.callSuper("notificationOnMouseUp", e);
    },
    registerOnKeyFrameDragging:function(obj){
        this.listObserversOnKeyFrameDragging.push(obj);
    },
    registerOnKeyFrameDragEnded:function(obj){
        this.listObserversOnKeyFrameDragEnded.push(obj);
    },
    registerOnSelectionUpdated:function(obj){
        this.observerOnSelectionUpdated=obj;
    },
    registerOnInnerScroll:function(obj){
        this.observerOnInnerScroll=obj;
    }
});
var KeyBarPropertyLane = fabric.util.createClass(Component, {
    initialize: function (canvas,mouseState, scrollParams, labelingParams,globalState) {
        this.callSuper("initialize", mouseState);
        this.globalState=globalState;
        this.parentState={
            scrollParams:scrollParams
        }
        this.localMouseState={
            x:0,y:0,inWorldX:0,inWorldY:0,
        };
        this.localState = {colors: {idle: "orange", stroke: "yellow", guidelines:"rgb(230,230,230)"}}
        this.labelingParams=labelingParams;
        this.name = "";
        this.canvas = canvas;

        // Estas variables tienen que ver con el manejo de keyframes activos en escena. Los primeros dos, son para el el pooling, y el ultmo clasifica los keyframes por identifier
        this.keyFrames = [];
        this.counterActiveKeyFrames = 0;
        this.listListActiveKeyFramesByIds=[];

        this.observerOnKeyframeFixedClick = null;
        this.observerOnKeyframeMouseDown = null;
        this.observerOnKeyframeDragging = null;
        this.observerOnKeyframeDragEnded = null;
        this.observerOnKeyframeDragStarted = null;

    },
    onLocalCoordsSettled: function () {
        this.localState.scrollParams={
            scrollWidth:this.localState.coords.width,
            scrollHeight:this.localState.coords.height,
            usableScrollWidth:this.localState.coords.width-PADDING_WITH*2,
            scrollLeft:0,
            scrollTop:0,
        };
    },
    activate:function(name,index){
        this.name=name;
        this.localState.coords.top=index*this.localState.coords.height;
    },
    retrieveKeyFrame: function (markerTimeLineTime,data,keyframeIdentifier) {
        let retrievedKey=null;
        if (this.counterActiveKeyFrames >= this.keyFrames.length) {
            retrievedKey = new KeyFrame(this.canvas,this.localMouseState, this.localState.scrollParams,this.labelingParams,this.name, markerTimeLineTime,data,keyframeIdentifier,this.globalState);
            this.keyFrames.push(retrievedKey);
            retrievedKey.registerOnMouseDown(this);
            retrievedKey.registerOnFixedClick(this);
            retrievedKey.registerOnDragStarted(this);
            retrievedKey.registerOnDragging(this);
            retrievedKey.registerOnDragEnded(this);

            retrievedKey.setLocalCoords(0, 0,this.localState.coords.height , this.localState.coords.height)

        } else {
            retrievedKey=this.keyFrames[this.counterActiveKeyFrames];
            retrievedKey.activate(markerTimeLineTime,data,keyframeIdentifier,this.name)
        }

        if(this.listListActiveKeyFramesByIds[retrievedKey.identifier]===undefined)
        {this.listListActiveKeyFramesByIds[retrievedKey.identifier]=[]}
        this.listListActiveKeyFramesByIds[retrievedKey.identifier].push(retrievedKey);

        this.counterActiveKeyFrames++;
        return retrievedKey;
    },
    discartKeyFrame: function (keyframe) {
        let index = this.keyFrames.indexOf(keyframe);
        let tmp;
        if (index !== -1) {
            tmp = this.keyFrames[index];
            tmp.deactivate();
            this.keyFrames.splice(index, 1);
            this.keyFrames.push(tmp);
            this.counterActiveKeyFrames--;
        }

        let indexInListById=this.listListActiveKeyFramesByIds[keyframe.identifier].indexOf(keyframe);
        if(indexInListById!== -1){
            this.listListActiveKeyFramesByIds[keyframe.identifier].splice(indexInListById,1);
        }else{
            alert("NOOO ERRORRR: NO SE CONTRO EL KEYFRAME, PERO SE SUPONDE QUE DEBE ESTAR siempre");
        }

        return tmp;
    },
    discartAllKeyFrames: function (callback) {
        for (let i = 0; i < this.counterActiveKeyFrames; i++) {
            callback(this.keyFrames[i]);
            this.keyFrames[i].deactivate();
        }

        this.listListActiveKeyFramesByIds=[];

        this.counterActiveKeyFrames=0;
    },
    getActiveKeyFramesInSelection:function(selectionStartX,selectionStartY,selectionWidth,selectionHeight,callback){// usado por keybarComp, para saber que keyframes activos de este lane estan dentro de la selccion
        let localSelectionStartX=selectionStartX-this.localState.coords.left;
        let localSelectionStartY=selectionStartY-this.localState.coords.top;
        for(let i=0;i<this.counterActiveKeyFrames;i++){
            let isInSelection=this.keyFrames[i].isInsideSelection(localSelectionStartX,localSelectionStartY,selectionWidth,selectionHeight);
            if(isInSelection){callback(this.keyFrames[i])}
        }
    },
    sortKeyFramesByTime:function(){
        Utils.insertionSort(this.keyFrames,this.counterActiveKeyFrames);
        for(let i=0;i<this.listListActiveKeyFramesByIds.length;i++){
            if(this.listListActiveKeyFramesByIds[i]===undefined){continue;}
            Utils.insertionSort(this.listListActiveKeyFramesByIds[i],this.listListActiveKeyFramesByIds[i].length);
        }
    },
    updateKeyFramesIndexByObject:function(){
        for(let i=0;i<this.listListActiveKeyFramesByIds.length;i++){
            if(this.listListActiveKeyFramesByIds[i]===undefined){continue;}
            for(let j=0;j<this.listListActiveKeyFramesByIds[i].length;j++){
                this.listListActiveKeyFramesByIds[i][j].indexInParentList=j;
            }
        }
    },
    getActiveKeyFramesByIds:function(){
        return this.listListActiveKeyFramesByIds;
    },
    _renderAnimationsBoxes:function(ctx){
        for(let i=0;i<this.listListActiveKeyFramesByIds.length;i++){
            if(this.listListActiveKeyFramesByIds[i]===undefined){continue;}
            let identifier=i;
            let r=100+(((identifier+1)*10)%100);
            let g=100+(((identifier+1)*160)%100);
            let b=100+(((identifier+1)*170)%100);
            for(let j=0;j<this.listListActiveKeyFramesByIds[i].length-1;j++){

                let firstKeyCoords=this.listListActiveKeyFramesByIds[identifier][j].localState.coords;
                let secondKeyCoords=this.listListActiveKeyFramesByIds[identifier][j+1].localState.coords;
                let diff=0;
                if(this.listListActiveKeyFramesByIds[identifier][j].isSelected){
                    let mayor;
                    if(g>r && g>b){mayor=g}else if(r>g &&  r>b){mayor=r}
                    else {mayor=b;}

                    diff=255-mayor;
                    ctx.fillStyle =  "rgb(" + (r+diff)+"," +(g+diff) + ","+ (b+diff) +")";
                }else{
                    ctx.fillStyle="rgb(" + r+"," +g + ","+ b+")";
                }
                ctx.fillRect(firstKeyCoords.left + firstKeyCoords.width/2
                    ,firstKeyCoords.top
                    ,secondKeyCoords.left-firstKeyCoords.left
                    ,firstKeyCoords.height
                );
                this.listListActiveKeyFramesByIds[identifier][j].render(ctx,r+diff,g+diff,b+diff);
            }
            if(this.listListActiveKeyFramesByIds[identifier].length>0){
                this.listListActiveKeyFramesByIds[identifier][this.listListActiveKeyFramesByIds[identifier].length-1].render(ctx,r,g,b);
            }
        }
    },
    render: function (ctx) {
        ctx.save();
        ctx.transform(1,0,0,1,this.localState.coords.left-this.localState.scrollParams.scrollLeft,this.localState.coords.top-this.localState.scrollParams.scrollTop);
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.strokeStyle=this.localState.colors.guidelines;
        //ctx.fillStyle = this.localState.colors.idle;
        //ctx.strokeStyle = this.localState.colors.stroke
        //ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);

        // ctx.moveTo(this.localState.coords.left,this.localState.coords.top+this.localState.coords.height);
        // ctx.lineTo(this.localState.coords.left+this.localState.coords.width,this.localState.coords.top+this.localState.coords.height);
        // ctx.stroke();

        this._renderAnimationsBoxes(ctx);

        // for (let i = 0; i < this.counterActiveKeyFrames; i++) {
        //     this.keyFrames[i].render(ctx);
        // }
        ctx.restore();
    },

    notificationOnScrollBarResize: function () {
        this.localState.coords.width = this.parentState.scrollParams.scrollWidth;
        this.localState.scrollParams.scrollWidth=this.parentState.scrollParams.scrollWidth;
        this.localState.scrollParams.usableScrollWidth=this.localState.scrollParams.scrollWidth-PADDING_WITH*2

        for (let i = 0; i < this.keyFrames.length; i++) {
            this.keyFrames[i].notificationOnScrollBarResize();
        }
    },
    notificationOnKeyframeFixedClick: function (keyframe) {
        this.observerOnKeyframeFixedClick.notificationOnKeyframeFixedClick(keyframe);
    },
    notificationOnKeyframeMouseDown: function (keyframe) {
        this.observerOnKeyframeMouseDown.notificationOnKeyframeMouseDown(keyframe);

    },
    notificationOnKeyframeDragging: function (keyframe) {
        this.observerOnKeyframeDragging.notificationOnKeyframeDragging(keyframe);
    },
    notificationOnKeyframeDragEnded: function (keyframe) {
        this.observerOnKeyframeDragEnded.notificationOnKeyframeDragEnded(keyframe);
    },
    notificationOnKeyframeDragStarted: function (keyframe) {
        this.observerOnKeyframeDragStarted.notificationOnKeyframeDragStarted(keyframe);
    },
    notificationOnMouseMove: function (e) {
        this.localMouseState.x=this.mouseState.inWorldX-this.localState.coords.left;
        this.localMouseState.y=this.mouseState.inWorldY-this.localState.coords.top;
        this.localMouseState.inWorldX=this.localMouseState.x+this.localState.scrollParams.scrollLeft;
        this.localMouseState.inWorldY=this.localMouseState.y+this.localState.scrollParams.scrollTop;

        for(let i =this.listListActiveKeyFramesByIds.length-1;i>=0;i--){
            if(this.listListActiveKeyFramesByIds[i]===undefined){continue;}
            for(let j=this.listListActiveKeyFramesByIds[i].length-1;j>=0;j--){
                this.listListActiveKeyFramesByIds[i][j].notificationOnMouseMove(e);
            }
        }
        this.callSuper("notificationOnMouseMove", e);
    },
    notificationOnMouseDown: function (e) {
        for(let i =this.listListActiveKeyFramesByIds.length-1;i>=0;i--){
            if(this.listListActiveKeyFramesByIds[i]===undefined){continue;}
            for(let j=this.listListActiveKeyFramesByIds[i].length-1;j>=0;j--){

                let pressed=this.listListActiveKeyFramesByIds[i][j].notificationOnMouseDown(e);
                if (pressed) {
                    return true;
                }
            }
        }
        this.callSuper("notificationOnMouseDown", e);
        return false;
    },
    notificationOnMouseUp: function (e) {
        for(let i =this.listListActiveKeyFramesByIds.length-1;i>=0;i--){
            if(this.listListActiveKeyFramesByIds[i]===undefined){continue;}
            for(let j=this.listListActiveKeyFramesByIds[i].length-1;j>=0;j--){
                let pressed=this.listListActiveKeyFramesByIds[i][j].notificationOnMouseUp(e);
                if (pressed) {
                    return true;
                }
            }
        }
        this.callSuper("notificationOnMouseUp", e);
    },
    notificationOnDurationChange:function(durationBefore,durationAfter,callbackBefore,callbackAfter){
        for (let i =0;i<this.counterActiveKeyFrames;i++){
            callbackBefore(this.keyFrames[i]);
            this.keyFrames[i].notificationOnDurationChange(durationBefore,durationAfter);
            callbackAfter(this.keyFrames[i]);
        }
    },
    registerOnKeyframeMouseDown: function (obj) {
        this.observerOnKeyframeMouseDown = obj;
    },
    registerOnKeyframeFixedClick: function (obj) {
        this.observerOnKeyframeFixedClick = obj;
    },
    registerOnKeyframeDragging: function (obj) {
        this.observerOnKeyframeDragging = obj;
    },
    registerOnKeyframeDragEnded: function (obj) {
        this.observerOnKeyframeDragEnded = obj;
    },
    registerOnKeyframeDragStarted: function (obj) {
        this.observerOnKeyframeDragStarted = obj;
    }
})
var KeyFrame = fabric.util.createClass(Component, {
    initialize: function (canvas,mouseState,scrollParams,labelingParams,laneName, time,data,identifier,globalState) {
        this.callSuper("initialize", mouseState);
        this.globalState=globalState;
        this.parentState={
            scrollParams:scrollParams
        }
        this.labelingParams=labelingParams;
        this.data=data; //{values:[100,100],easingType:"In",TweenType:"Sine"}
        this.localState = {colors: {idle: "#0D263D", selected: "#AEB6BE"}}
        this.laneName=laneName;
        this.canvas = canvas;
        this.isActive = true;
        this.timeLineTime = time;
        this.offsetMouseX;
        this.offsetMouseY;

        this.observerOnFixedClick = null;
        this.observerOnMouseDown = null;
        this.observerOnDragging = null;
        this.observerOnDragEnded = null;
        this.observerOnDragStarted = null;
        this.isSelected = false;

        this.dictKeyFramesBySecondsForSnapping=null; //setted when drag started by the KeybarComponent.Used for snapping with other keyframes

        this.identifier=identifier;        //identifica al animable object que le corresponde, solo se actualiza cuando cambia la seleccion de ojectos del canvas

        this.indexInParentList=-1; //solo se actualiza cuando se actualizo la seleccion en el KeyBar component, se actualiza al index que ocupa en la lista del PropertyLane al que pertenece, teniendo en cuenta el objeto al que pertenece. Esto con el fin de hacer match con la animacion a la que corresponde modificar.

    },
    activate: function (timeLineTime,data,identifier,laneName) {
        this.identifier=identifier;
        this.isActive = true;
        this.timeLineTime = timeLineTime;
        this.data=data;
        this.laneName=laneName
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    deactivate: function () {
        this.isActive = false;
        this.isSelected = false;
    },
    calcTimelineLocationFromTime: function (time) {
        let timePercent = time / this.globalState.animatorDuration;
        let location = this.parentState.scrollParams.usableScrollWidth*timePercent;
        this.localState.coords.left = location + PADDING_WITH - this.localState.coords.width / 2;
        this.movementConstraints();
    },
    calcTimelineTimeFromLocation: function (locationInUsableArea) {
        let percentInUsableArea = locationInUsableArea / this.parentState.scrollParams.usableScrollWidth;
        this.timeLineTime = this.globalState.animatorDuration * percentInUsableArea;
    },
    movementConstraints: function (applySnappingContraints) {
        if (this.localState.coords.left < PADDING_WITH - (this.localState.coords.width / 2)) {
            this.localState.coords.left = PADDING_WITH - (this.localState.coords.width / 2)
        }
        if (this.localState.coords.left > this.parentState.scrollParams.scrollWidth - PADDING_WITH - this.localState.coords.width / 2) {
            this.localState.coords.left = this.parentState.scrollParams.scrollWidth - PADDING_WITH - this.localState.coords.width / 2
        }
        //----------SNAP WITH MARKS
        if(applySnappingContraints){
            //haciendo que haya el cuadruple de markers que segmenttimesdata en 1 segundo (BORROWED from Maker component)
            let timeBarMarksDistance = this.labelingParams.segmentWidth / 4,
                leftInUsableArea = this.localState.coords.left - PADDING_WITH + this.localState.coords.width / 2,
                timeBarMarksSnappingRange = 3;
            if(leftInUsableArea%timeBarMarksDistance>timeBarMarksDistance-timeBarMarksSnappingRange || leftInUsableArea%timeBarMarksDistance<timeBarMarksSnappingRange){
                this.localState.coords.left=Math.round(leftInUsableArea/timeBarMarksDistance)*timeBarMarksDistance + PADDING_WITH - this.localState.coords.width/2;
            }
        }

        //---------SNAP WITH OTHER KEYFRAMES
        if(applySnappingContraints && this.dictKeyFramesBySecondsForSnapping!==null){
            let range=5;
            let myTimeInSeconds=Math.ceil(this.timeLineTime/1000);
            if(this.dictKeyFramesBySecondsForSnapping[myTimeInSeconds]!==undefined){
                for(let i=0;i<this.dictKeyFramesBySecondsForSnapping[myTimeInSeconds].length;i++){
                    let otherKeyFramePos=this.dictKeyFramesBySecondsForSnapping[myTimeInSeconds][i].localState.coords.left;
                    if(this.localState.coords.left>otherKeyFramePos-range && this.localState.coords.left<otherKeyFramePos+range){
                        this.localState.coords.left=otherKeyFramePos;
                    }
                }
            }
        }
    },
    isInsideSelection: function (startX, startY, width, height) {
        let localCoordsLeft = this.localState.coords.left + this.localState.coords.width / 2;
        let localCoordsTop = this.localState.coords.top + this.localState.coords.height / 2;
        let endX = startX + width;
        let endY = startY + height;
        let xInside = false;
        let yInside = false;
        if (width > 0) {
            if (localCoordsLeft > startX && localCoordsLeft < endX) {
                xInside = true
            }
        } else {
            if (localCoordsLeft > endX && localCoordsLeft < startX) {
                xInside = true
            }
        }

        if (height > 0) {
            if (localCoordsTop > startY && localCoordsTop < endY) {
                yInside = true
            }
        } else {
            if (localCoordsTop > endY && localCoordsTop < startY) {
                yInside = true
            }
        }
        return xInside && yInside;
    },
    hasBeenSelected: function () {
    },
    select: function () {
        this.isSelected = true;
    },
    deselect: function () {
        this.isSelected = false;
    },
    render: function (ctx,r,g,b) {
        ctx.beginPath();
        ctx.lineWidth=3;
        let radio=6;
        if (!this.isActive) {
            return false;
        }
        if (this.isSelected) {
            ctx.fillStyle =  "rgb(" + r+"," +g + ","+ b +")";
            ctx.strokeStyle=this.localState.colors.selected;
        } else {
            ctx.fillStyle = "rgb(" + r+"," +g + ","+ b+")";
            ctx.strokeStyle=this.localState.colors.idle;
        }
        let center={x:this.localState.coords.left+this.localState.coords.width/2,y:this.localState.coords.top+ this.localState.coords.height/2}
        ctx.moveTo(center.x,center.y-radio);
        ctx.lineTo(center.x+radio, center.y);
        ctx.lineTo(center.x,center.y+radio);
        ctx.lineTo(center.x-radio,center.y);
        ctx.lineTo(center.x,center.y-radio);
        // ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
        ctx.stroke();
        ctx.fill();
    },
    onLocalCoordsSettled: function () {
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.inWorldX - this.localState.coords.left;
        this.notifyOnDragStarted();
    },
    onMouseDragging: function () {
        this.localState.coords.left = this.mouseState.inWorldX - this.offsetMouseX;
        this.movementConstraints(true);

        this.calcTimelineTimeFromLocation(this.localState.coords.left - PADDING_WITH + this.localState.coords.width / 2);

        this.notifyOnDragging();

        this.canvas.requestRenderAll();

    },
    onMouseDragEnded: function () {
        this.calcTimelineTimeFromLocation(this.localState.coords.left - PADDING_WITH + this.localState.coords.width / 2);
        this.notifyOnDragEnded()
    },
    onMouseDown: function () {
        this.notifyOnMouseDown()
    },
    onMouseFixedClick: function (e) {
        this.notifyOnMouseFixedClick();
    },
    /*Funciones para cuando un miembro de la seleccion de la que este objeto es parte, es arrastrado, se llamara estos metodos en cada miembro de la seleccion*/
    simulateDragStarted: function (masterKeyFramePos) {
        this.offsetMouseX = masterKeyFramePos - this.localState.coords.left;
    },
    simulateDragging: function (masterKeyFramePos) {
        this.localState.coords.left = masterKeyFramePos - this.offsetMouseX;
        this.movementConstraints(false);
    },
    simulateDragEnded: function () {
        this.calcTimelineTimeFromLocation(this.localState.coords.left - PADDING_WITH + this.localState.coords.width / 2);
        },
    /**/
    setDictKeyFramesBySecondsForSnapping:function(dict){
        this.dictKeyFramesBySecondsForSnapping=dict;
    },
    notifyOnMouseFixedClick: function () {
        this.observerOnFixedClick.notificationOnKeyframeFixedClick(this);
    },
    notifyOnMouseDown: function () {
        this.observerOnMouseDown.notificationOnKeyframeMouseDown(this);
    },
    notifyOnDragStarted: function () {
        this.observerOnDragStarted.notificationOnKeyframeDragStarted(this);
    },
    notifyOnDragging: function () {
        this.observerOnDragging.notificationOnKeyframeDragging(this);
    },
    notifyOnDragEnded: function () {
        this.observerOnDragEnded.notificationOnKeyframeDragEnded(this);
    },
    notificationOnScrollBarResize: function () {
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        if(durationBefore>durationAfter){
            let keyFrameTimePercent=this.timeLineTime/durationBefore;
            this.timeLineTime=durationAfter*keyFrameTimePercent;
        }
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    registerOnMouseDown: function (obj) {
        this.observerOnMouseDown = obj;
    },
    registerOnFixedClick: function (obj) {
        this.observerOnFixedClick = obj;
    },
    registerOnDragging: function (obj) {
        this.observerOnDragging = obj;
    },
    registerOnDragEnded: function (obj) {
        this.observerOnDragEnded = obj;
    },
    registerOnDragStarted: function (obj) {
        this.observerOnDragStarted = obj;
    }
})