var Component = fabric.util.createClass({
    globalState: null,
    localState: null,
    mouseState: null,
    isPressed: false,
    hasBeenDragged: false,
    initialize: function (globalState, mouseState) {
        this.globalState = globalState;
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
    globalState: {},
    localState: {colors: {idle: "yellow"}},
    isPressed: false,
    mouseState: {},
    initialize: function (canvas, globalState, mouseState) {
        this.callSuper("initialize", globalState, mouseState)
        this.canvas = canvas;
        this.timeLineTime = 0;

        this.listObserversOnDragging=[];
        this.listObserversOnDragEnded=[];
        this.canvas.addComponent(this);
    },
    calcTimelineLocationFromTime: function (time) {
        let segmentNum = time / this.globalState.time.segmentTimeValue;
        let location = segmentNum * this.globalState.timingDistances.segmentDistance;
        this.localState.coords.left = location + this.globalState.padding.width - this.localState.coords.width / 2;
        this.movementConstraints();
    },
    calcTimelineTimeFromLocation: function (locationInUsableArea) {
        let percentInUsableArea = locationInUsableArea / this.globalState.timingDistances.usableScrollWidth;
        this.timeLineTime = this.globalState.time.duration * percentInUsableArea;
    },
    movementConstraints: function () {
        if (this.localState.coords.left < this.globalState.padding.width - (this.localState.coords.width / 2)) {
            this.localState.coords.left = this.globalState.padding.width - (this.localState.coords.width / 2)
        }
        if (this.localState.coords.left > this.globalState.timingDistances.scrollWidth - this.globalState.padding.width - this.localState.coords.width / 2) {
            this.localState.coords.left = this.globalState.timingDistances.scrollWidth - this.globalState.padding.width - this.localState.coords.width / 2
        }
    },
    render: function (ctx) {
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
    },
    onLocalCoordsSettled: function () {
        this.localState.coords.left = 200;
        this.calcTimelineTimeFromLocation(0);
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.inWorldX - this.localState.coords.left;
        this.offsetMouseY = this.mouseState.inWorldY - this.localState.coords.top;
    },
    onMouseDragging: function () {
        this.localState.coords.left = this.mouseState.inWorldX - this.offsetMouseX;
        this.movementConstraints();

        this.calcTimelineTimeFromLocation(this.localState.coords.left - this.globalState.padding.width + this.localState.coords.width / 2);
        this.notifyOnDragging();

        this.canvas.requestRenderAll();
    },
    onMouseClick: function () {

    },
    onMouseDragEnded: function () {
        this.notifyOnDragEnded();
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
        let mouseXInWorldCoords = this.mouseState.x + this.globalState.timingDistances.scrollLeft;
        this.calcTimelineTimeFromLocation(mouseXInWorldCoords - this.globalState.padding.width);
        this.calcTimelineLocationFromTime(this.timeLineTime);
        this.canvas.requestRenderAll();
    },
    registerOnDragging:function(obj){
        this.listObserversOnDragging.push(obj);
    },
    registerOnDragEnded:function (obj){
        this.listObserversOnDragEnded.push(obj);
    }
});
let ScrollBarButton = fabric.util.createClass(Component, {

    initialize: function (canvas, globalState, mouseState) {
        this.callSuper("initialize", globalState, mouseState)
        this.localState = {colors: {idle: "peru"}};
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
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
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

    initialize: function (canvas, globalState, mouseState) {
        this.callSuper("initialize", globalState, mouseState)
        this.canvas = canvas;
        this.canvas.addComponent(this);

        this.localState = {colors: {idle: "green"}};

        this.offsetMouseX = 0;
        this.offsetMouseY = 0;
        this.minWidth = 100;

        this.buttonA = new ScrollBarButton(canvas, this.globalState, this.mouseState);
        this.buttonB = new ScrollBarButton(canvas, this.globalState, this.mouseState);
        this.buttonA.name = "buttonA";
        this.buttonB.name = "buttonB";
        this.buttonA.registerOnDragged(this);
        this.buttonB.registerOnDragged(this);

        this.listObserversOnScroll = [];
        this.listObserversOnScrollBarResize = [];

        this.timelineTotalLength = 0;


    },
    _leftCoordToScrollLeft:function(){
        return (this.localState.coords.left / this.globalState.coords.width) * (this.globalState.timingDistances.usableScrollWidth)
    },
    _scrollWidthToWidthCoord:function(){

    },
    _mouseInBoundingBox: function () {
        return this.mouseState.x > this.localState.coords.left &&
            this.mouseState.x < this.localState.coords.left + this.localState.coords.width &&
            this.mouseState.y > this.localState.coords.top &&
            this.mouseState.y < this.localState.coords.top + this.localState.coords.height;
    },
    calcWidth: function () {
        let percentInViewport = (this.globalState.coords.width - (this.globalState.padding.width * 2)) / (this.globalState.timingDistances.usableScrollWidth);
        let barWidth = (this.globalState.coords.width) * percentInViewport;
        this.localState.coords.width = barWidth;
    },
    setComponentsCoords: function () {
        let buttonsWidth = 20;
        this.buttonA.setLocalCoords(this.localState.coords.left, this.localState.coords.top, buttonsWidth, this.localState.coords.height);
        this.buttonB.setLocalCoords(this.localState.coords.left + this.localState.coords.width - buttonsWidth, this.localState.coords.top, buttonsWidth, this.localState.coords.height);
    },
    render: function (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
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

        if (this.localState.coords.left < this.globalState.coords.left) {
            this.localState.coords.left = this.globalState.coords.left
        }
        if (this.localState.coords.left > this.globalState.coords.width - this.localState.coords.width) {
            this.localState.coords.left = this.globalState.coords.width - this.localState.coords.width
        }

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
            let buttonACoords = this.buttonA.localState.coords;
            let buttonBCoords = this.buttonB.localState.coords;
            if (buttonACoords.left < this.globalState.coords.left) {
                buttonACoords.left = this.globalState.coords.left
            }
            ;
            if (buttonACoords.left > buttonBCoords.left + buttonBCoords.width - this.minWidth) {
                buttonACoords.left = buttonBCoords.left + buttonBCoords.width - this.minWidth
            }


            let newWidth = (buttonBCoords.left + buttonBCoords.width) - buttonACoords.left;
            this.localState.coords.width = newWidth;
            this.localState.coords.left = buttonACoords.left;

        } else if (who.name === "buttonB") {
            let buttonACoords = this.buttonA.localState.coords;
            let buttonBCoords = this.buttonB.localState.coords;
            if (buttonBCoords.left + buttonBCoords.width > this.globalState.coords.width) {
                buttonBCoords.left = this.globalState.coords.width - buttonBCoords.width
            }
            if (buttonBCoords.left < buttonACoords.left + this.minWidth - buttonBCoords.width) {
                buttonBCoords.left = buttonACoords.left + this.minWidth - buttonBCoords.width;
            }

            let newWidth = (this.buttonB.localState.coords.left + this.buttonB.localState.coords.width) - this.buttonA.localState.coords.left;
            this.localState.coords.width = newWidth;
        }
        this.notifyOnScrollBarResize(this.localState.coords.width)
        this.notifyOnScroll((this.localState.coords.left / this.globalState.coords.width) * (this.globalState.timingDistances.usableScrollWidth))
        this.canvas.requestRenderAll();
    },
    registerOnScroll: function (obj) {
        this.listObserversOnScroll.push(obj);
    },
    registerOnScrollBarResize: function (obj) {
        this.listObserversOnScrollBarResize.push(obj);
    }

})
let Padding = fabric.util.createClass(Component, {

    initialize: function (canvas, globalState, mouseState, name) {
        this.callSuper("initialize", globalState, mouseState);
        this.localState = {"colors": {"idle": "rgba(0,0,0,0.6)"}}
        this.name = name;
        this.canvas = canvas;

        this.canvas.addComponent(this);
    },
    render: function (ctx) {
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.globalState.padding.width, this.localState.coords.height);
    },
    notificationOnScrollBarResize: function () {
        if (this.name === "paddingRight") {
            this.localState.coords.left = this.globalState.timingDistances.scrollWidth - this.globalState.padding.width;
        }
    }
})
let TimeLineProxy=fabric.util.createClass({
    initialize:function (WindowManager,htmlElementSelector,propertyLanesNames){
        this.timeLineComponent=new TimeLineActions(WindowManager,htmlElementSelector,propertyLanesNames);
    },
    setDuration:function(durationBefore,durationAfter){
        this.timeLineComponent.globalState.time.duration=durationAfter;
        this.timeLineComponent.setupGlobalStateTimingDistances(this.timeLineComponent.globalState.timingDistances.scrollWidth-this.timeLineComponent.globalState.padding.width*2);
        this.timeLineComponent.markerComponent.notificationOnDurationChange(durationBefore,durationAfter);
        this.timeLineComponent.keysBarComponent.notificationOnDurationChange(durationBefore,durationAfter);
        this.timeLineComponent.renderAll();
    },
    addKeyFrameOnMarker:function(laneName,values){
        this.timeLineComponent.keysBarComponent.addKeyFrame(laneName,this.timeLineComponent.markerComponent.timeLineTime,values);
    },
    addKeyFrameOn:function(laneName,values,time){
        this.timeLineComponent.keysBarComponent.addKeyFrame(laneName,time,values);
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
    getLaneActiveKeyFrames:function(laneName){
        let tmp =this.timeLineComponent.keysBarComponent.dictPropertiesLanes[laneName].getActiveKeyFrames();
        return tmp;
    },
    registerOnKeyFrameDragEnded:function(obj){
        this.timeLineComponent.keysBarComponent.registerOnKeyFrameDragEnded(obj);
    },
    registerOnKeyFrameDragging:function(obj){
        this.timeLineComponent.keysBarComponent.registerOnKeyFrameDragging(obj);
    },
    registerOnMarkerDragging:function(obj){
        this.timeLineComponent.markerComponent.registerOnDragging(obj);
    },
    registerOnMarkerDragEnded:function(obj){
        this.timeLineComponent.markerComponent.registerOnDragEnded(obj);
    }
})
let TimeLineActions = fabric.util.createClass({
    HTMLElement: null,
    ctx: null,
    timeBarComponent: null,
    keysBarComponent: null,
    markerComponent: null,
    scrollBarComponent: null,
    scrollBarBtnA: null,
    scrollBarBtnB: null,

    flagStopLoop: true,
    components: [],
    globalState: {
        coords: {left: 0, // cood x desde la esquina superior izquierda desde el origen del canvas a partir de donde empieza todo
            top: 0, // coor y desde la esquina superior izquierda desde el origen del canvas a partir de donde empieza todo
            width: null, // alto del viewport,
            height: null,}, // ancho del viewport
        time: {segmentTimeValue: 100, baseSegmentTimeValue: 100, duration: 60000},
        timingDistances: {
            minSegmentDistance: 100,    // longitud en px minima, a partir de la cual el segmentDistance y segmentTimeValue se  doblegan en tamaño
            maxSegmentDistance: 200,   // longitud en px maxima a partir de la cual el segmentDistance y segmentTimeValue se dividen / 2 en tamaño
            segmentDistance: 0, // longitud en px de un segmento, que representa (time.segmentTimeValue) de timpo
            scrollWidth: 0, // ancho total (areas ocultas scroleables)
            usableScrollWidth:0, // scrollWidth - padding.width * 2
            cantSegments:0, // cantidad de segmentos
            scrollLeft: 0  // tamaño de porcion oculta de la izquierda por scroll ( 0 es que 0px estan ocultos)
        },
        padding: {width: 50}
    },
    mouseState: {x: 0, y: 0, click: false, inWorldX: 0, inWorldY: 0},
    globalStateUpdated: true,
    windowEventsManager:null,
    initialize: function (WindowEventsManager, selector, MODELPropertyLanes) {

        this.HTMLElement = document.querySelector(selector);
        this.ctx = this.HTMLElement.getContext("2d");
        this.HTMLElement.width = this.HTMLElement.parentNode.clientWidth;
        this.HTMLElement.height = this.HTMLElement.parentNode.clientHeight;
        this.windowEventsManager=WindowEventsManager;

        let boundingRect = this.HTMLElement.getBoundingClientRect();
        this.htmlElementLeft = boundingRect.left;
        this.htmlElementTop = boundingRect.top;

        /*----setup-----*/
        this.setupGlobalStateCoords();
        this.setupGlobalStateTimingDistances((this.globalState.coords.width - (this.globalState.padding.width * 2)));
        //los demas campos del global state no son necesarios configurarse en timpo de ejecucion
        this.initComponents(MODELPropertyLanes);
        this.setupComponentsCoords();
        /*----events-----*/
        this.initEvents();

        this.renderAll();
    },
    setupGlobalStateCoords: function () {
        this.globalState.coords.left = 0;
        this.globalState.coords.top = 0;
        this.globalState.coords.width = this.HTMLElement.clientWidth;
        this.globalState.coords.height = this.HTMLElement.clientHeight;
    },
    setupGlobalStateTimingDistances: function (widthArea) {//debe ser el scrollWidth USABLE (sin contar los paddings)
        let numSegmentsWithBaseSegmentTimeValue = this.globalState.time.duration / this.globalState.time.baseSegmentTimeValue;
        let segmentLongitude = widthArea / numSegmentsWithBaseSegmentTimeValue;

        let newSegmentDistance;
        let newSegmentTimeValue;
        /**/
        if (segmentLongitude < this.globalState.timingDistances.minSegmentDistance) {
            /*segmentLongitudeWidthBaseSegmentTimeValue[100<] * 2^x = minSegmentDistance[100]       : x: expotente para elevar las distancias de segmento y el valor temporal de cada segmento*/
            /*necestiamos sober la cantidad de veces que reduciremos el segmento de distancia y valor temporal de cada segmento*/
            /*igualamos a minSegmentDistance porque queremos que nos de ese valor, minimamente(por eso se hace ceil())*/
            let auxExponent = Math.ceil(Math.log2(this.globalState.timingDistances.minSegmentDistance / segmentLongitude));
            newSegmentDistance = segmentLongitude * Math.pow(2, auxExponent);
            newSegmentTimeValue = this.globalState.time.baseSegmentTimeValue * Math.pow(2, auxExponent);
        } else if (segmentLongitude > this.globalState.timingDistances.maxSegmentDistance) {
            /*maxSegmentDistance[200] / 2^x = segmentoLongitudeWithBaseSegmentTimeValue[>200] se invistieron los valores porque salia negativo*/
            let auxExponent = Math.ceil(Math.log2(segmentLongitude / this.globalState.timingDistances.minSegmentDistance));
            newSegmentDistance = segmentLongitude / Math.pow(2, auxExponent);
            newSegmentTimeValue = this.globalState.time.baseSegmentTimeValue / Math.pow(2, auxExponent);
        } else {
            newSegmentDistance = segmentLongitude;
            newSegmentTimeValue = this.globalState.time.baseSegmentTimeValue;
        }
        /**/

        this.globalState.timingDistances.segmentDistance = newSegmentDistance;
        this.globalState.time.segmentTimeValue = newSegmentTimeValue;
        this.globalState.timingDistances.cantSegments = this.globalState.time.duration / newSegmentTimeValue;
        this.globalState.timingDistances.usableScrollWidth = this.globalState.timingDistances.cantSegments * newSegmentDistance;
        this.globalState.timingDistances.scrollWidth = this.globalState.timingDistances.usableScrollWidth + this.globalState.padding.width * 2;
    },
    initComponents: function (MODELPropertyLanes) {
        this.timeBarComponent = new TimeLineTimeBar(this, this.globalState, this.mouseState);
        this.keysBarComponent = new TimeLineKeysBar(this, this.globalState, this.mouseState, MODELPropertyLanes);
        this.markerComponent = new Marker(this, this.globalState, this.mouseState);
        this.paddingLeft = new Padding(this, this.globalState, this.mouseState, "paddingLeft");
        this.paddingRight = new Padding(this, this.globalState, this.mouseState, "paddingRight");
        this.scrollBarComponent = new ScrollBarComponent(this, this.globalState, this.mouseState);
    },
    setupComponentsCoords: function () {
        let timeBarLeft = 0;
        let timeBarTop = 0;
        let timeBarHeight = 20;
        let scrollBarHeight = 20;
        this.timeBarComponent.setLocalCoords(timeBarLeft, timeBarTop, this.globalState.coords.width, timeBarHeight);
        this.keysBarComponent.setLocalCoords(timeBarLeft, timeBarHeight, this.globalState.coords.width, this.globalState.coords.height - timeBarHeight);
        this.markerComponent.setLocalCoords(timeBarLeft, timeBarTop, 30, timeBarHeight);
        this.scrollBarComponent.setLocalCoords(0, this.globalState.coords.height - scrollBarHeight, 100, scrollBarHeight);

        this.paddingLeft.setLocalCoords(0, 0, this.globalState.padding.width, this.globalState.coords.height);
        this.paddingRight.setLocalCoords(this.globalState.timingDistances.scrollWidth - this.globalState.padding.width, 0, this.globalState.padding.width, this.globalState.coords.height);
    },
    initEvents:function(){
        this.scrollBarComponent.registerOnScroll(this);
        this.scrollBarComponent.registerOnScrollBarResize(this);
        this.timeBarComponent.registerOnClick(this.markerComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.markerComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.timeBarComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.keysBarComponent);
        this.scrollBarComponent.registerOnScrollBarResize(this.paddingRight);

        this.windowEventsManager.registerOnMouseDown(this);
        this.windowEventsManager.registerOnMouseUp(this);
        this.windowEventsManager.registerOnMouseMove(this);
    },
    setGlobalStateValue: function (args) {
        if (args.length == 2) {
            this.globalState[args[0]] = args[1];
        } else if (args.length == 3) {
            this.globalState[args[0]][args[1]] = args[2]
        } else {
            alert("erorrr cant argumetnso setGlobalStateValue");
        }
        this.notifyOnGlobalStateChange(args);
        this.renderAll();
    },
    addComponent: function (component) {
        this.components.push(component);
    },
    notifyOnGlobalStateChange: function (args) {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].notificationOnGlobalStateChange(args);
        }
    },
    notificationOnMouseMove: function (e) {
        this.mouseState.x = e.clientX - this.htmlElementLeft;
        this.mouseState.y = e.clientY - this.htmlElementTop;
        this.mouseState.inWorldX = this.mouseState.x - this.globalState.coords.left + this.globalState.timingDistances.scrollLeft;
        this.mouseState.inWorldY = this.mouseState.y - this.globalState.coords.top;
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].notificationOnMouseMove(e);
        }
    },
    notificationOnMouseDown: function (e) {
        for (let i = this.components.length - 1; i >= 0; i--) {
            let clicked = this.components[i].notificationOnMouseDown(e);
            if (clicked) {
                break;
            }
        }
    },
    notificationOnMouseUp: function (e) {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].notificationOnMouseUp(e);
        }
    },
    notificationOnScroll: function (scrollLeft) {
        this.globalState.timingDistances.scrollLeft = scrollLeft;
        this.ctx.setTransform(1, 0, 0, 1, -scrollLeft, 0);
    },
    notificationOnScrollBarResize: function (scrollBarCoordWidth) {
        let percentViewport = scrollBarCoordWidth / this.globalState.coords.width;
        let usableScrollWidth = (this.globalState.coords.width - this.globalState.padding.width * 2) / percentViewport;

        this.setupGlobalStateTimingDistances(usableScrollWidth);
    },
    updateLogic: function () {


    },
    requestRenderAll: function () {
        this.renderAll();
    },
    renderAll: function () {
        this._clearCanvas();

        for (let i = 0; i < this.components.length; i++) {
            this.components[i].render(this.ctx);
        }
    },
    _clearCanvas: function () {
        this.ctx.clearRect(0, 0, this.globalState.timingDistances.scrollWidth, this.globalState.coords.height);
    },
});

let TimeLineTimeBar = fabric.util.createClass(Component, {
    type: "time-bar_component",
    ctx: null,
    globalState: {},
    localState: {
        coords: {left: 0, top: 0, width: 0, height: 0},
        colors: {idle: "gray", onMouseOver: "yellow", onMouseClick: "green", text: "white"}
    },
    mouseState: {},
    snapshotLastState: null,
    initialize: function (canvas, globalState, mouseState) {
        this.callSuper('initialize', globalState, mouseState);
        this.listObserversOnClick = [];
        this.canvas = canvas;

        this.canvas.addComponent(this);
    },
    onMouseDragging: function () {
        //this.render(this.localState.colors.onMouseOver);
    },
    onMouseClick: function (e) {
        this.notifyOnClick(e);
        //this.render(this.localState.colors.onMouseClick);
    },
    onMouseDragEnded: function () {

    },
    _drawContainer: function (ctx) {
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
    },
    _drawLabels: function (ctx) {
        ctx.fillStyle = this.localState.colors.text;
        ctx.font = "10px Arial";
        ctx.textBaseline = "middle";
        let cantLabels=Math.ceil(this.globalState.timingDistances.cantSegments);
        for (let i = 0; i <=cantLabels ; i++) {
            let txt = this.globalState.time.segmentTimeValue * i;
            let txtWidth = ctx.measureText(txt).width;
            ctx.fillText(txt, this.globalState.timingDistances.segmentDistance * i + this.globalState.padding.width - txtWidth / 2, this.localState.coords.height / 2);
        }
    },
    updateLogic: function () {
    },
    render: function (ctx) {
        this._drawContainer(ctx);
        this._drawLabels(ctx);
        this.snapshotLastState = ctx.getImageData(this.localState.coords.left,
            this.localState.coords.top,
            this.localState.coords.width,
            this.localState.coords.height)
    },
    drawSnapshot: function (ctx) {
        ctx.putImageData(this.snapshotLastState, 0, 0)
    },
    notifyOnClick: function (e) {
        for (let i = 0; i < this.listObserversOnClick.length; i++) {
            this.listObserversOnClick[i].notificationOnTimeBarClicked(e);
        }
    },
    notificationOnGlobalStateChange: function (args) {
        //this.render("red");
    },
    registerOnClick: function (obj) {
        this.listObserversOnClick.push(obj);
    },
    notificationOnScrollBarResize: function () {
        this.localState.coords.width = this.globalState.timingDistances.scrollWidth;
    }
});

var TimeLineKeysBar = fabric.util.createClass(Component, {
    type: "keys-bar_component",
    localState: {
        coords: {left: 0, top: 0, width: 0, height: 0},
        colors: {idle: "red", selection: "yellow", onMouseClick: "green", text: "white"}
    },
    initialize: function (canvas, globalState, mouseState, listLanesName) {
        this.callSuper('initialize', globalState, mouseState);
        this.canvas = canvas;
        this.snapshotLastState = null;
        this.mousePosXOnDragStated = 0;
        this.mousePosYOnDragStated = 0;
        this.selectionWidth = 0;
        this.selectionHeight = 0;
        this.selecting = false;

        this.dictPropertiesLanes = {};
        this.listLanesName = listLanesName;

        this.selectedKeyframes = [];
        this.keyframeSelected = null;

        this.listObserversOnKeyFrameDragging=[];
        this.listObserversOnKeyFrameDragEnded=[];
        this.canvas.addComponent(this);

        this.initComponents();
    },
    initComponents: function () {/*{"position":[],"scale":[],"rotation":[]}*/
        for (let i=0;i<this.listLanesName.length;i++) {
            let lane = new KeyBarPropertyLane(this.canvas, this.globalState, this.mouseState, this.listLanesName[i]);
            lane.registerOnKeyframeFixedClick(this);
            lane.registerOnKeyframeMouseDown(this);
            lane.registerOnKeyframeDragStarted(this);
            lane.registerOnKeyframeDragging(this);
            lane.registerOnKeyframeDragEnded(this);
            this.dictPropertiesLanes[this.listLanesName[i]] = lane;

        }
    },
    setupComponentsCoords: function () {
        let laneHeight = 20;
        let top = 0;
        let i = 0;
        for (let key in this.dictPropertiesLanes) {
            top = laneHeight * i + this.localState.coords.top;
            this.dictPropertiesLanes[key].setLocalCoords(0, top, this.localState.coords.width, laneHeight);
            i++;
        }
    },
    deselectCurrentSelection: function () {
        if (this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                this.selectedKeyframes[i].deselect();
            }
            this.selectedKeyframes = [];
        }
        if (this.keyframeSelected) {
            this.keyframeSelected.deselect();
            this.keyframeSelected = null;
        }

    },
    findKeyframesInsideBoxSelection: function () {
        for (let i in this.dictPropertiesLanes) {
            for (let j = 0; j < this.dictPropertiesLanes[i].counterActiveKeyFrames; j++) {
                if (this.dictPropertiesLanes[i].keyFrames[j].isInsideSelection(this.mousePosXOnDragStated, this.mousePosYOnDragStated, this.selectionWidth, this.selectionHeight)) {
                    this.selectedKeyframes.push(this.dictPropertiesLanes[i].keyFrames[j]);
                    this.dictPropertiesLanes[i].keyFrames[j].select();
                }
            }
        }
    },
    discartSelectedKeyFrames: function () {
        let tmpDictCantLanesKeyFrames=this._countSelectedKeyFramesByLane();

        if (this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                this.dictPropertiesLanes[this.selectedKeyframes[i].laneName].discartKeyFrame(this.selectedKeyframes[i]);
            }
            this.selectedKeyframes = [];
        }else{
            if (this.keyframeSelected) {
                this.dictPropertiesLanes[this.keyframeSelected.laneName].discartKeyFrame(this.keyframeSelected);
                this.keyframeSelected = null;
            }
        }
        this.canvas.requestRenderAll();
        return tmpDictCantLanesKeyFrames;
    },
    _countSelectedKeyFramesByLane:function(){
        let tmpDictLanesNames={};
        if (this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                let cantLaneKeyFrames=tmpDictLanesNames[this.selectedKeyframes[i].laneName];
                tmpDictLanesNames[this.selectedKeyframes[i].laneName]=cantLaneKeyFrames!==undefined?cantLaneKeyFrames+1:1;
            }
        }else{
            if (this.keyframeSelected) {
                let cantLaneKeyFrames=tmpDictLanesNames[this.keyframeSelected.laneName];
                tmpDictLanesNames[this.keyframeSelected.laneName]=cantLaneKeyFrames!==undefined?cantLaneKeyFrames+1:1;
            }
        }
        return tmpDictLanesNames;
    },
    discartLaneKeyFrames:function(laneName){
        this.dictPropertiesLanes[laneName].discartAllKeyFrames();
        this.canvas.requestRenderAll();
    },
    discartAllKeyFrames:function(){
        this.deselectCurrentSelection();
        for(let i in this.dictPropertiesLanes){
            this.dictPropertiesLanes[i].discartAllKeyFrames();
        }
        this.canvas.requestRenderAll();
    },
    addKeyFrame: function (laneName, markerTimeLineTime,values) {
        this.dictPropertiesLanes[laneName].retrieveKeyFrame(markerTimeLineTime,values);
    },
    onLocalCoordsSettled: function () {
        this.setupComponentsCoords();
    },
    onMouseDragStarted: function (e) {
        this.selecting = true;
        this.mousePosXOnDragStated = this.mouseState.inWorldX;
        this.mousePosYOnDragStated = this.mouseState.inWorldY;
    },
    onMouseDragging: function () {
        if (this.selecting) {
            this.selectionWidth = this.mouseState.inWorldX - this.mousePosXOnDragStated;
            this.selectionHeight = this.mouseState.inWorldY - this.mousePosYOnDragStated;
            this.canvas.requestRenderAll();
        }
    },
    onMouseFixedClick: function () {
        this.deselectCurrentSelection();
        this.notifyOnKeyframeSelectionUpdated();
    },
    onMouseDragEnded: function () {
        this.deselectCurrentSelection();
        this.findKeyframesInsideBoxSelection();
        this.selecting = false;
        this.notifyOnKeyframeSelectionUpdated();
        this.canvas.requestRenderAll();
    },
    _drawContainer: function (ctx) {
        ctx.fillStyle = this.localState.colors.idle;
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);

    },
    _drawSelection: function (ctx) {
        if (this.selecting) {
            ctx.fillStyle = this.localState.colors.selection;
            ctx.fillRect(this.mousePosXOnDragStated, this.mousePosYOnDragStated, this.selectionWidth, this.selectionHeight);
        }
    },
    render: function (ctx) {
        this._drawContainer(ctx);
        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].render(ctx);
        }
        this._drawSelection(ctx);
        this.snapshotLastState = ctx.getImageData(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height)

    },
    drawSnapshot: function (ctx) {
        ctx.putImageData(this.snapshotLastState, 0, 0);
    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        for(let key in this.dictPropertiesLanes){
            this.dictPropertiesLanes[key].notificationOnDurationChange(durationBefore,durationAfter);
        }
    },
    notificationOnKeyframeMouseDown: function (keyframe) {
        if (keyframe !== this.keyframeSelected && this.selectedKeyframes.length === 0) {
            if (this.keyframeSelected) {
                this.keyframeSelected.deselect();
            }
            keyframe.select();
            this.keyframeSelected = keyframe;
            this.notifyOnKeyframeSelectionUpdated();
        } else {
            if (!keyframe.isSelected) {
                this.deselectCurrentSelection();
                keyframe.select();
                this.keyframeSelected = keyframe;
                this.notifyOnKeyframeSelectionUpdated();
            }
        }

    },

    notifyOnKeyframeSelectionUpdated: function () {
        this.canvas.renderAll();
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
    notificationOnGlobalStateChange: function (args) {
        //this.render();
    },
    notificationOnScrollBarResize: function (scrollWidth) {
        this.localState.coords.width = this.globalState.timingDistances.scrollWidth;
        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].notificationOnScrollBarResize();
        }
    },
    notificationOnKeyframeDragStarted: function (keyframe) {
        if (keyframe.isSelected && this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                if (this.selectedKeyframes[i] !== keyframe) {
                    this.selectedKeyframes[i].simulateDragStarted();
                }
            }
        }
    },
    notificationOnKeyframeDragging: function (keyframe) {
        if (keyframe.isSelected && this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                if (this.selectedKeyframes[i] !== keyframe) {
                    this.selectedKeyframes[i].simulateDragging()
                }
            }
        }
        this.notifyOnKeyFrameDragging(keyframe.laneName)
    },
    notificationOnKeyframeDragEnded: function (keyframe) {
        let dictLaneNames={};
        for(let i in this.listLanesName){dictLaneNames[this.listLanesName[i]]=0;}
        if (keyframe.isSelected && this.selectedKeyframes.length > 0) {
            for (let i = 0; i < this.selectedKeyframes.length; i++) {
                if (this.selectedKeyframes[i] !== keyframe) {
                    this.selectedKeyframes[i].simulateDragEnded();
                    dictLaneNames[this.selectedKeyframes[i].laneName]++;
                }
            }
        }
        dictLaneNames[keyframe.laneName]++;
        this.notifyOnKeyFrameDragEnded(dictLaneNames);
    },
    notificationOnKeyframeFixedClick: function (keyframe,laneName) {//click sin dragging, si se hizo dragging no se notifica
        if (this.selectedKeyframes.length !== 0) {
            this.deselectCurrentSelection();
            keyframe.select();
            this.keyframeSelected = keyframe;
            this.notifyOnKeyframeSelectionUpdated();
        }
    },
    notificationOnMouseMove: function (e) {
        for (let key in this.dictPropertiesLanes) {
            this.dictPropertiesLanes[key].notificationOnMouseMove(e);
        }
        this.callSuper("notificationOnMouseMove", e);
    },
    notificationOnMouseDown: function (e) {
        for (let key in this.dictPropertiesLanes) {
            let pressed = this.dictPropertiesLanes[key].notificationOnMouseDown(e);
            if (pressed) {
                return true;
            }
        }

        return this.callSuper("notificationOnMouseDown", e);
    },
    notificationOnMouseUp: function (e) {
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
    }
});
var KeyBarPropertyLane = fabric.util.createClass(Component, {
    initialize: function (canvas, globalState, mouseState, name) {
        this.callSuper("initialize", globalState, mouseState);
        this.localState = {colors: {idle: "orange", stroke: "yellow"}}
        this.name = name;
        this.canvas = canvas;
        this.keyFrames = [];
        this.counterActiveKeyFrames = 0;

        this.observerOnKeyframeFixedClick = null;
        this.observerOnKeyframeMouseDown = null;
        this.observerOnKeyframeDragging = null;
        this.observerOnKeyframeDragEnded = null;
        this.observerOnKeyframeDragStarted = null;
    },
    retrieveKeyFrame: function (markerTimeLineTime,values) {
        if (this.counterActiveKeyFrames >= this.keyFrames.length) {
            let newKey = new KeyFrame(this.canvas, this.globalState, this.mouseState,this.name, markerTimeLineTime,values)
            this.keyFrames.push(newKey);
            newKey.registerOnMouseDown(this);
            newKey.registerOnFixedClick(this);
            newKey.registerOnDragStarted(this);
            newKey.registerOnDragging(this);
            newKey.registerOnDragEnded(this);


            newKey.setLocalCoords(0, this.localState.coords.top, 20, 20)

        } else {
            this.keyFrames[this.counterActiveKeyFrames].activate(markerTimeLineTime,values);
        }
        this.counterActiveKeyFrames++;
        this.canvas.requestRenderAll();
    },
    discartKeyFrame: function (keyframe) {
        let index = this.keyFrames.indexOf(keyframe);
        if (index !== -1) {
            let tmp = this.keyFrames[index];
            tmp.deactivate();
            this.keyFrames.splice(index, 1);
            this.keyFrames.push(tmp);
            this.counterActiveKeyFrames--;
        }
    },
    discartAllKeyFrames: function () {
        for (let i = 0; i < this.counterActiveKeyFrames; i++) {
            this.keyFrames[i].deactivate();
        }
        this.counterActiveKeyFrames=0;
    },
    sortKeyFramesByTime:function(){
        insertionSort(this.keyFrames,this.counterActiveKeyFrames);
    },
    getActiveKeyFrames:function(){
        return this.keyFrames.slice(0,this.counterActiveKeyFrames);
    },
    render: function (ctx) {

        ctx.fillStyle = this.localState.colors.idle;
        ctx.strokeStyle = this.localState.colors.stroke
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);

        for (let i = 0; i < this.keyFrames.length; i++) {
            this.keyFrames[i].render(ctx);
        }
    },

    notificationOnScrollBarResize: function () {
        this.localState.coords.width = this.globalState.timingDistances.scrollWidth;
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
        for (let i = this.keyFrames.length - 1; i >= 0; i--) {
            this.keyFrames[i].notificationOnMouseMove(e);
        }
        this.callSuper("notificationOnMouseMove", e);
    },
    notificationOnMouseDown: function (e) {
        for (let i = this.keyFrames.length - 1; i >= 0; i--) {
            let pressed = this.keyFrames[i].notificationOnMouseDown(e);
            if (pressed) {
                return true;
            }
        }
        this.callSuper("notificationOnMouseDown", e);
        return false;
    },
    notificationOnMouseUp: function (e) {
        for (let i = this.keyFrames.length - 1; i >= 0; i--) {
            this.keyFrames[i].notificationOnMouseUp(e);
        }
        this.callSuper("notificationOnMouseUp", e);
    },
    notificationOnDurationChange:function(durationBefore,durationAfter){
        for (let i =0;i<this.counterActiveKeyFrames;i++){
            this.keyFrames[i].notificationOnDurationChange(durationBefore,durationAfter);
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
    initialize: function (canvas, globalState, mouseState,laneName, time,values) {
        this.callSuper("initialize", globalState, mouseState);
        this.values=values;
        this.localState = {colors: {idle: "red", selected: "pink"}}
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

        this.wasDragged = false;
    },
    activate: function (timeLineTime,values) {
        this.isActive = true;
        this.timeLineTime = timeLineTime;
        this.values=values;
        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    deactivate: function () {
        this.isActive = false;
        this.isSelected = false;
    },
    calcTimelineLocationFromTime: function (time) {
        let segmentNum = time / this.globalState.time.segmentTimeValue;
        let location = segmentNum * this.globalState.timingDistances.segmentDistance;
        this.localState.coords.left = location + this.globalState.padding.width - this.localState.coords.width / 2;
        this.movementConstraints();
    },
    calcTimelineTimeFromLocation: function (locationInUsableArea) {
        let percentInUsableArea = locationInUsableArea / this.globalState.timingDistances.usableScrollWidth;
        this.timeLineTime = this.globalState.time.duration * percentInUsableArea;
    },
    movementConstraints: function () {
        if (this.localState.coords.left < this.globalState.padding.width - (this.localState.coords.width / 2)) {
            this.localState.coords.left = this.globalState.padding.width - (this.localState.coords.width / 2)
        }
        if (this.localState.coords.left > this.globalState.timingDistances.scrollWidth - this.globalState.padding.width - this.localState.coords.width / 2) {
            this.localState.coords.left = this.globalState.timingDistances.scrollWidth - this.globalState.padding.width - this.localState.coords.width / 2
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
        ;
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
    render: function (ctx) {
        if (!this.isActive) {
            return false;
        }
        if (this.isSelected) {
            ctx.fillStyle = this.localState.colors.selected;
        } else {
            ctx.fillStyle = this.localState.colors.idle;
        }
        ctx.fillRect(this.localState.coords.left, this.localState.coords.top, this.localState.coords.width, this.localState.coords.height);
        },
    onLocalCoordsSettled: function () {

        this.calcTimelineLocationFromTime(this.timeLineTime);
    },
    onMouseDragStarted: function () {
        this.offsetMouseX = this.mouseState.inWorldX - this.localState.coords.left;
        //this.offsetMouseY=this.mouseState.inWorldY-this.localState.coords.top;
        this.notifyOnDragStarted();
    },
    onMouseDragging: function () {
        let newLeftCoord = this.mouseState.inWorldX - this.offsetMouseX;
        let prevLeftCoord = this.localState.coords.left;
        this.localState.coords.left = newLeftCoord;
        this.notifyOnDragging();
        this.movementConstraints();
        this.canvas.requestRenderAll();

    },
    onMouseDragEnded: function () {
        this.calcTimelineTimeFromLocation(this.localState.coords.left - this.globalState.padding.width + this.localState.coords.width / 2);
        this.notifyOnDragEnded()
    },
    onMouseDown: function () {
        this.notifyOnMouseDown()
    },
    onMouseFixedClick: function (e) {
        this.notifyOnMouseFixedClick();
    },
    /*Funciones para cuando un miembro de la seleccion de la que este objeto es parte, es arrastrado, se llamara estos metodos en cada miembro de la seleccion*/
    simulateDragStarted: function () {
        this.offsetMouseX = this.mouseState.inWorldX - this.localState.coords.left;
    },
    simulateDragging: function () {
        this.localState.coords.left = this.mouseState.inWorldX - this.offsetMouseX;
        this.movementConstraints();
    },
    simulateDragEnded: function () {
        this.calcTimelineTimeFromLocation(this.localState.coords.left - this.globalState.padding.width + this.localState.coords.width / 2);
        },
    /**/
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