var UserEventsHandler={
    init:function(){
        this.cbListeners={
            mouseup:function(){},
            mousemove:function(){},
            mousedown:function(){},
            scroll:function(){},
            keyup:function(){}
        }

        this.evCache = [];//helpers for touch events
        this.prevDiff = -1;//helpers for touch events


        if(Utils.mobileAndTabletCheck()){
            window.onpointerdown = this.pointerdown_handler.bind(this);
            window.onpointermove = this.pointermove_handler.bind(this);

            // Use same handler for pointer{up,cancel,out,leave} events since
            // the semantics for these events - in this app - are the same.
            window.onpointerup = this.pointerup_handler.bind(this);
            window.onpointercancel = this.pointerup_handler.bind(this);
            window.onpointerout = this.pointerup_handler.bind(this);
            window.onpointerleave = this.pointerup_handler.bind(this);
        }else{
            window.addEventListener("mouseup",this.onWindowMouseUp.bind(this));
            window.addEventListener("mousemove",this.onWindowMouseMove.bind(this));
            window.addEventListener("mousedown",this.onWindowMouseDown.bind(this));
            window.addEventListener("scroll",this.onMouseScroll.bind(this))
        }

        window.addEventListener("keyup",this.onKeyUp.bind(this))
    },
    addListener:function(event,callback){
        this.cbListeners[event]=callback;
    },

    /*desktop events listeners*/
    onWindowMouseUp:function(e){
        this.cbListeners["mouseup"](e);
    },
    onWindowMouseMove:function(e){
        this.cbListeners["mousemove"](e);
    },
    onWindowMouseDown:function(e){
        this.cbListeners["mousedown"](e);
    },
    onKeyUp:function(e){
        this.cbListeners["keyup"](e);
    },
    onMouseScroll:function(e){
        this.cbListeners["scroll"](e);
    },


    /*mobile events listeners*/
    pointerdown_handler:function(ev) {
        this.cbListeners["mousedown"](ev);

        // The pointerdown event signals the start of a touch interaction.
        // This event is cached to support 2-finger gestures
        this.evCache.push(ev);
    },
    pointermove_handler:function (ev) {
        this.cbListeners["mousemove"](ev);


        // This function implements a 2-pointer horizontal pinch/zoom gesture.
        //
        // If the distance between the two pointers has increased (zoom in),
        // the target element's background is changed to "pink" and if the
        // distance is decreasing (zoom out), the color is changed to "lightblue".
        //

        // Find this event in the cache and update its record with this event
        for (var i = 0; i < this.evCache.length; i++) {
            if (ev.pointerId === this.evCache[i].pointerId) {
                this.evCache[i] = ev;
                break;
            }
        }

        // If two pointers are down, check for pinch gestures
        if (this.evCache.length === 2) {
            // Calculate the distance between the two pointers
            var curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);

            if (this.prevDiff > 0) {
                if (curDiff > this.prevDiff) {//zoomin
                    this.cbListeners["scroll"]({deltaY:1});
                }
                if (curDiff < this.prevDiff) {//zoomout
                    this.cbListeners["scroll"]({deltaY:-1});
                }
            }

            // Cache the distance for the next move event
            this.prevDiff = curDiff;
        }
    },
    pointerup_handler:function(ev) {
        this.cbListeners["mouseup"](ev);

        this._remove_event(ev);
        // If the number of pointers down is less than two then reset diff tracker
        if (this.evCache.length < 2) {
            prevDiff = -1;
        }
    },
    /*mobile events listenres HELPERS*/
    _remove_event:function(ev) {
    // Remove this event from the target's cache
    for (var i = 0; i < this.evCache.length; i++) {
        if (this.evCache[i].pointerId === ev.pointerId) {
            this.evCache.splice(i, 1);
            break;
        }
    }
}
}