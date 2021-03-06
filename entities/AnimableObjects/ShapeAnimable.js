var CommonShapeAnimableStylingProperties=["strokeWidth", "fill", "transparentFill", "stroke", "transparentStroke", "startRenderingPoint", "endRenderingPoint", "clipBorder", "inverted"]
var ShapeAnimable=fabric.util.createClass(fabric.Path, {
    applicableEntranceModes:[EntranceName.none],
    applicableMenuOptions:[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete],
    applicableAnimationProperties:["position","scale","rotation","opacity","border_width","border_start","border_end"],
    type:"ShapeAnimable",
    subtype:"PathAnimable",
    initialize:function(pathList,options){
        this.callSuper('initialize', pathList,options);
        /*fabric object properties setup*/
        //this.objectCaching=false;        // Propiedad de FABRIC Se que deberiamos hacer que este objecto siempre se dibuje en el main canvas(no cache), ya que constantemente alteramos los estilos del objeto. Pero
        //el problema surge cuando el shape usa usado como clippath, en este modo se requiere hacer ciempre uso del cache
        //y el problema en si, es que al tener esta variable en false, a parte de no usar el cache, se elimina siempre el cache, y cuando toca usarlo como clip,
        // se tiene que volver a crear otro canvas, y estas operaciones de creacion y eliminacion de canvas supongo que es costo
        // SOLUCION; por ende se deja esta variable en true. de forma que siempre se haga uso del cache, pero como necesitamos
        // que en casa frame se vuelva a dibujar porque vamos cambiando mucho el estilo del objeto, tras renderizar el objeto,
        // siempre estableseremos !!!! dirty=true !!!!, cosa que le cache sera siempre refrescado.
        this.absolutePositioned=true;    // Propiedad de FABRIC util para cuando el objecto es usado como clipPath, hace que la posicion del enmascaramiento sea se forma absoluta

        this.entranceMode=EntranceName.none; // Siempre sera none, por ende ni se permitira abrir el panel de configuraciones para ShapeAnimable

        /*Editable styling properties*/
        this.strokeWidth=4;             // Propiedad de FABRIC
        this.fill="#000000";        // Propiedad de FABRIC
        this.transparentFill=true;     // Nueva propiedad. Si es verdadero se obvia el valor de fill, y es remplazado por transparent
        this.stroke="#000000";          // Propiedad de FABRIC
        this.transparentStroke=false;   // Nueva propiedad. Si es verdadero se obvia el valor de stroke, y es reemplazado por transparent
        this.startRenderingPoint=0;     // Nueva propiedad. Indica el porcentaje inicial desde donde se empieza a dibujar el border
        this.endRenderingPoint=100;     // Nueva propiedad. Indica el porcentaje final hasta donde se dibuja el border
        this.clipBorder=false;          // Nueva propiedad. Para cuando es usado como clipPath, indica si el enmascaramiento se da en el borde o en el relleno
        this.inverted=false;            // Propiedad de FABRIC.
        this.listEditableStylingProperties=["strokeWidth", "fill", "transparentFill", "stroke", "transparentStroke", "startRenderingPoint", "endRenderingPoint", "clipBorder", "inverted",] //for the  object properties editor (UI)

        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        /*auxiliary attributes*/
        this.totalStrokeLength=PathLength.calculate(this.pathOffset.x,this.pathOffset.y,this.path); //util for startRenderingPoint and endRenderingPoint styling properties. Store the total length of the path
        this.animator=new Animator(this);
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },

    /*Inspector main Object list, items options actions*/
    setLockState:function(val){
        this.selectable=!val;
        this.evented=!val;
    },
    getLockState:function(){
        return !this.selectable;
    },
    setVisibilityState:function(val){
        this.visible=val;
        this.selectable=val;
        this.evented=val;
    },
    getVisibilityState:function(){
        return this.visible;
    },

    /*
    * FABRIC CUSTOMIZED METHODS
    * */
    /*para renderizar el objecto aun cuando este offscreen*/
    render:function(ctx){
        let originalFill=this.fill,originalStroke=this.stroke;
        if(this.transparentFill){
            this.fill="transparent";
        }
        if(this.transparentStroke){
            this.stroke="transparent";
        }
        this.customRenderOffScreen(ctx);
        this.dirty=true;//ya se explica en el metodo initialize de esta clase,(porque no se aplico objectCaching false)

        this.fill=originalFill;this.stroke=originalStroke;
    },
    //Para aplicar el clipath aun cuando el path tenga opacidad de 0. Con los cambios realizados, logramos
    // que en esta misma funcion se entre al if (this.isChacheDitry()){aqui} donde se dibuja en si el path al ser
    // usado como mascara
    renderCache: function(options) {
        options = options || {};
        if (!this._cacheCanvas) {
            this._createCacheCanvas();
        }
        let originalOpacity=this.opacity;   //MODIFIED
        let originalScaleX=this.scaleX;
        let originalScaleY=this.scaleY;
        this.opacity=1;                     //MODIFIED
        if(this.scaleX===0){this.scaleX=0.001}
        if(this.scaleY===0){this.scaleY=0.001}
        if (this.isCacheDirty()) {
            this.statefullCache && this.saveState({ propertySet: 'cacheProperties' });
            this.drawObject(this._cacheContext, options.forClipping);
            //this.dirty = false;           //MODIFIED
        }
        this.opacity=originalOpacity;      //MODIFIED
        this.scaleX=originalScaleX;
        this.scaleY=originalScaleY;
    },
    // Para soportar la funcionalidad de border cliping (clipBorder)
    drawObject: function(ctx, forClipping) {
        var originalFill = this.fill, originalStroke = this.stroke;
        if (forClipping) {
            if(this.clipBorder){                //moficiacion
                this.fill = '';                 //moficiacion
                this.stroke = 'black';          //moficiacion
            }else{                              //moficiacion
                this.fill = 'black';            //moficiacion
                this.stroke = '';               //moficiacion
            }                                   //moficiacion
            this.opacity=1;                    //modificacion
            this._setStrokeStyles(ctx, this);   //modificacion
            this._setClippingProperties(ctx);   //moficicacion
        }
        else {
            this._renderBackground(ctx);
            this._setStrokeStyles(ctx, this);
            this._setFillStyles(ctx, this);
        }
        this._render(ctx);
        this._drawClipPath(ctx);
        this.fill = originalFill;
        this.stroke = originalStroke;
    },
    _setClippingProperties: function(ctx) {
        ctx.globalAlpha = 1;
        if(this.clipBorder){
            ctx.strokeStyle = '#000000';         //modificado
            ctx.fillStyle = 'transparent';       //modificado
        }else{                                   //modificado
            ctx.strokeStyle = 'transparent';     //modificado
            ctx.fillStyle = '#000000';           //modificado
        }
    },

    /* funcion padre: _render() , sobreescrito para soportar la funcionlidad de dibujar cierto porcentaje del path*/
    _renderPathCommands: function(ctx) {
        //TODO LO QUE SE VE AQUI FUE AGREGADO
        let renderingPathNormalized=(this.endRenderingPoint/100);
        let renderingPart=renderingPathNormalized*this.totalStrokeLength;
        let negativeRenderingPart=(1-renderingPathNormalized)*this.totalStrokeLength;
        let startPointNormalized=0;
        let endPointNormalized=0;
        if(this.startRenderingPoint<this.endRenderingPoint){
            startPointNormalized=this.startRenderingPoint/100;
            endPointNormalized=this.endRenderingPoint/100;
        }else{
            startPointNormalized=this.endRenderingPoint/100;
            endPointNormalized=this.startRenderingPoint/100;
        }
        let pattern=[0,startPointNormalized*this.totalStrokeLength,(endPointNormalized-startPointNormalized)*this.totalStrokeLength,(1-endPointNormalized)*this.totalStrokeLength];
        ctx.setLineDash(pattern);
        // APARTIR DE AQUI ERA EL MISMO COMPORTAMIENTO QUE EL OBJECTO ORIGINAL, ASI QUE SOLO SE LLAMA AL METODO DEL PADRE (METODO ORIGINAL)
        this.callSuper("_renderPathCommands",ctx);
    },

});

var CircleShapeAnimable=fabric.util.createClass(fabric.Circle,{
    applicableEntranceModes:[EntranceName.none],
    applicableMenuOptions:[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete],
    applicableAnimationProperties:["position","scale","rotation","opacity","border_width","border_start","border_end"],
    type:"ShapeAnimable",
    subtype:"CircleShapeAnimable",
    initialize:function(options){
        this.callSuper('initialize',options);
        this.absolutePositioned=true;    // Propiedad de FABRIC util para cuando el objecto es usado como clipPath, hace que la posicion del enmascaramiento sea se forma absoluta

        this.entranceMode=EntranceName.none; // Siempre sera none, por ende ni se permitira abrir el panel de configuraciones para ShapeAnimable

        /*Editable styling properties*/
        this.strokeWidth=4;             // Propiedad de FABRIC
        this.fill="#000000";        // Propiedad de FABRIC
        this.transparentFill=true;     // Nueva propiedad. Si es verdadero se obvia el valor de fill, y es remplazado por transparent
        this.stroke="#000000";          // Propiedad de FABRIC
        this.transparentStroke=false;   // Nueva propiedad. Si es verdadero se obvia el valor de stroke, y es reemplazado por transparent
        this.startRenderingPoint=0;     // Nueva propiedad. Indica el porcentaje inicial desde donde se empieza a dibujar el border
        this.endRenderingPoint=100;     // Nueva propiedad. Indica el porcentaje final hasta donde se dibuja el border
        this.radius=100;                 //Propiedad de fabric
        this.clipBorder=false;          // Nueva propiedad. Para cuando es usado como clipPath, indica si el enmascaramiento se da en el borde o en el relleno
        this.inverted=false;            // Propiedad de FABRIC.
        this.listEditableStylingProperties=["strokeWidth", "fill", "transparentFill", "stroke", "transparentStroke", "startRenderingPoint", "endRenderingPoint","radius", "clipBorder", "inverted",] //for the  object properties editor (UI)

        this.set("radius",this.radius); //this will trigger objects dimentions calculation

        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        /*auxiliary attributes*/
        this.animator=new Animator(this);
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },

    /*Inspector main Object list, items options actions*/
    setLockState:function(val){
        this.selectable=!val;
        this.evented=!val;
    },
    getLockState:function(){
        return !this.selectable;
    },
    setVisibilityState:function(val){
        this.visible=val;
        this.selectable=val;
        this.evented=val;
    },
    getVisibilityState:function(){
        return this.visible;
    },

    /*
    * FABRIC CUSTOMIZED METHODS
    * */
    /*para renderizar el objecto aun cuando este offscreen*/
    render:function(ctx){
        let originalFill=this.fill,originalStroke=this.stroke;
        if(this.transparentFill){
            this.fill="transparent";
        }
        if(this.transparentStroke){
            this.stroke="transparent";
        }
        this.customRenderOffScreen(ctx);
        this.dirty=true;//ya se explica en el metodo initialize de esta clase,(porque no se aplico objectCaching false)

        this.fill=originalFill;this.stroke=originalStroke;
    },
    //Para aplicar el clipath aun cuando el path tenga opacidad de 0. Con los cambios realizados, logramos
    // que en esta misma funcion se entre al if (this.isChacheDitry()){aqui} donde se dibuja en si el path al ser
    // usado como mascara
    renderCache: function(options) {
        options = options || {};
        if (!this._cacheCanvas) {
            this._createCacheCanvas();
        }
        let originalOpacity=this.opacity;   //MODIFIED
        this.opacity=1;                     //MODIFIED
        if (this.isCacheDirty()) {
            this.statefullCache && this.saveState({ propertySet: 'cacheProperties' });
            this.drawObject(this._cacheContext, options.forClipping);
            //this.dirty = false;           //MODIFIED
        }
        this.opacity=originalOpacity;      //MODIFIED
    },
    // Para soportar la funcionalidad de border cliping (clipBorder)
    drawObject: function(ctx, forClipping) {
        var originalFill = this.fill, originalStroke = this.stroke;
        if (forClipping) {
            if(this.clipBorder){                //moficiacion
                this.fill = '';                 //moficiacion
                this.stroke = 'black';          //moficiacion
            }else{                              //moficiacion
                this.fill = 'black';            //moficiacion
                this.stroke = '';               //moficiacion
            }                                   //moficiacion
            this.opacity=1;                    //modificacion
            this._setStrokeStyles(ctx, this);   //modificacion
            this._setClippingProperties(ctx);   //moficicacion
        }
        else {
            this._renderBackground(ctx);
            this._setStrokeStyles(ctx, this);
            this._setFillStyles(ctx, this);
        }
        this._render(ctx);
        this._drawClipPath(ctx);
        this.fill = originalFill;
        this.stroke = originalStroke;
    },
    _setClippingProperties: function(ctx) {
        ctx.globalAlpha = 1;
        if(this.clipBorder){
            ctx.strokeStyle = '#000000';         //modificado
            ctx.fillStyle = 'transparent';       //modificado
        }else{                                   //modificado
            ctx.strokeStyle = 'transparent';     //modificado
            ctx.fillStyle = '#000000';           //modificado
        }
    },

    /* funcion padre: _render() , sobreescrito para soportar la funcionlidad de dibujar cierto porcentaje del path*/
    _render: function(ctx) {
        this.startAngle=(this.startRenderingPoint/100)*Math.PI*2;
        this.endAngle=(this.endRenderingPoint/100)*Math.PI*2;
        this.callSuper("_render",ctx);
    },
});
let RectShapeAnimable=fabric.util.createClass(fabric.Rect,{
    applicableEntranceModes:[EntranceName.none],
    applicableMenuOptions:[AnimObjectOptionMenu.duplicate,AnimObjectOptionMenu.delete],
    applicableAnimationProperties:["position","scale","rotation","opacity","border_width","border_start","border_end"],
    type:"ShapeAnimable",
    initialize:function(options){
        this.callSuper('initialize',options);
        this.absolutePositioned=true;    // Propiedad de FABRIC util para cuando el objecto es usado como clipPath, hace que la posicion del enmascaramiento sea se forma absoluta

        this.entranceMode=EntranceName.none; // Siempre sera none, por ende ni se permitira abrir el panel de configuraciones para ShapeAnimable

        /*Editable styling properties*/
        this.strokeWidth=4;             // Propiedad de FABRIC
        this.fill="#000000";        // Propiedad de FABRIC
        this.transparentFill=true;     // Nueva propiedad. Si es verdadero se obvia el valor de fill, y es remplazado por transparent
        this.stroke="#000000";          // Propiedad de FABRIC
        this.transparentStroke=false;   // Nueva propiedad. Si es verdadero se obvia el valor de stroke, y es reemplazado por transparent
        this.startRenderingPoint=0;     // Nueva propiedad. Indica el porcentaje inicial desde donde se empieza a dibujar el border
        this.endRenderingPoint=100;     // Nueva propiedad. Indica el porcentaje final hasta donde se dibuja el border
        this.width=300;                 // Propiedad de FABRIC
        this.height=300;                // Propiedad de FABRIC
        this.borderRadius=0;
        this.clipBorder=false;          // Nueva propiedad. Para cuando es usado como clipPath, indica si el enmascaramiento se da en el borde o en el relleno
        this.inverted=false;            // Propiedad de FABRIC.
        this.listEditableStylingProperties=["strokeWidth", "fill", "transparentFill", "stroke", "transparentStroke","width","height","borderRadius","startRenderingPoint", "endRenderingPoint", "clipBorder", "inverted",] //for the  object properties editor (UI)

        this.calcStrokeLength();
        this.entranceBehaviour=new EntranceEffectBehaviour(this,this.applicableEntranceModes);

        /*auxiliary attributes*/
        this.animator=new Animator(this);
    },
    calcStrokeLength:function(){
        var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
            ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
            w = this.width,
            h = this.height,
            x = -this.width / 2,
            y = -this.height / 2,
            isRounded = rx !== 0 || ry !== 0,
            /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */
            k = 1 - 0.5522847498;
            let path=[]
            path.push(["M",x+rx,y]);
            path.push(["L",x + w - rx, y]);
            isRounded && path.push(["C",x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry]);
            path.push(["L",x + w, y + h - ry]);
            isRounded && path.push(["C",x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h]);
            path.push(["L",x + rx, y + h]);
            isRounded && path.push(["C",x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry]);
            path.push(["L",x, y + ry]);
            isRounded && path.push(["C",x, y + k * ry, x + k * rx, y, x + rx, y]);
        this.totalStrokeLength=PathLength.calculate(0,0,path); //util for startRenderingPoint and endRenderingPoint styling properties. Store the total length of the path
    },
    setEntranceMode:function(mode){
        this.entranceMode=mode;
    },
    getEntranceMode:function(){
        return this.entranceMode;
    },

    /*Inspector main Object list, items options actions*/
    setLockState:function(val){
        this.selectable=!val;
        this.evented=!val;
    },
    getLockState:function(){
        return !this.selectable;
    },
    setVisibilityState:function(val){
        this.visible=val;
        this.selectable=val;
        this.evented=val;
    },
    getVisibilityState:function(){
        return this.visible;
    },

    /*
    * FABRIC CUSTOMIZED METHODS
    * */
    /*para renderizar el objecto aun cuando este offscreen*/
    render:function(ctx){
        let originalFill=this.fill,originalStroke=this.stroke;
        if(this.transparentFill){
            this.fill="transparent";
        }
        if(this.transparentStroke){
            this.stroke="transparent";
        }
        this.customRenderOffScreen(ctx);
        this.dirty=true;//ya se explica en el metodo initialize de esta clase,(porque no se aplico objectCaching false)

        this.fill=originalFill;this.stroke=originalStroke;
    },
    //Para aplicar el clipath aun cuando el path tenga opacidad de 0. Con los cambios realizados, logramos
    // que en esta misma funcion se entre al if (this.isChacheDitry()){aqui} donde se dibuja en si el path al ser
    // usado como mascara
    renderCache: function(options) {
        options = options || {};
        if (!this._cacheCanvas) {
            this._createCacheCanvas();
        }
        let originalOpacity=this.opacity;   //MODIFIED
        this.opacity=1;                     //MODIFIED
        if (this.isCacheDirty()) {
            this.statefullCache && this.saveState({ propertySet: 'cacheProperties' });
            this.drawObject(this._cacheContext, options.forClipping);
            //this.dirty = false;           //MODIFIED
        }
        this.opacity=originalOpacity;      //MODIFIED
    },
    // Para soportar la funcionalidad de border cliping (clipBorder)
    drawObject: function(ctx, forClipping) {
        var originalFill = this.fill, originalStroke = this.stroke;
        if (forClipping) {
            if(this.clipBorder){                //moficiacion
                this.fill = '';                 //moficiacion
                this.stroke = 'black';          //moficiacion
            }else{                              //moficiacion
                this.fill = 'black';            //moficiacion
                this.stroke = '';               //moficiacion
            }                                   //moficiacion
            this.opacity=1;                    //modificacion
            this._setStrokeStyles(ctx, this);   //modificacion
            this._setClippingProperties(ctx);   //moficicacion
        }
        else {
            this._renderBackground(ctx);
            this._setStrokeStyles(ctx, this);
            this._setFillStyles(ctx, this);
        }
        this._render(ctx);
        this._drawClipPath(ctx);
        this.fill = originalFill;
        this.stroke = originalStroke;
    },
    _setClippingProperties: function(ctx) {
        ctx.globalAlpha = 1;
        if(this.clipBorder){
            ctx.strokeStyle = '#000000';         //modificado
            ctx.fillStyle = 'transparent';       //modificado
        }else{                                   //modificado
            ctx.strokeStyle = 'transparent';     //modificado
            ctx.fillStyle = '#000000';           //modificado
        }
    },

    /* funcion padre: _render() , sobreescrito para soportar la funcionlidad de dibujar cierto porcentaje del path*/
    _render: function(ctx) {
        let renderingPathNormalized=(this.endRenderingPoint/100);
        let renderingPart=renderingPathNormalized*this.totalStrokeLength;
        let negativeRenderingPart=(1-renderingPathNormalized)*this.totalStrokeLength;
        let startPointNormalized=0;
        let endPointNormalized=0;
        if(this.startRenderingPoint<this.endRenderingPoint){
            startPointNormalized=this.startRenderingPoint/100;
            endPointNormalized=this.endRenderingPoint/100;
        }else{
            startPointNormalized=this.endRenderingPoint/100;
            endPointNormalized=this.startRenderingPoint/100;
        }
        let pattern=[0,startPointNormalized*this.totalStrokeLength,(endPointNormalized-startPointNormalized)*this.totalStrokeLength,(1-endPointNormalized)*this.totalStrokeLength];
        ctx.setLineDash(pattern);
        this.callSuper("_render",ctx);
    },
})