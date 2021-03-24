var DrawingHand=fabric.util.createClass({
    defaultDrawingHandName:"man",
    initialize:function(options){
        this.image=new ImageOutOfCamera(null,{
            originX:"left",
            originY:"top"
        });
        this.offsetDrawingHand={x:0,y:0};
    },
    getHandImage:function(){
        return this.image;
    },
    updatePosition:function(posx,posy){
        this.image.set({left:posx});
        this.image.set({top:posy});
    },
    setCanvasCameraScalerDims:function(x,y){
        this.image.scaleX=x;
        this.image.scaleY=y;
    },
    setHandImage:function(drawingHandName){
        let image=StaticResource.images.drawing_hands[drawingHandName].elem
        this.image.setElement(image);
        this.offsetDrawingHand=StaticResource.images.drawing_hands[drawingHandName].offset;
    }
});
var ImageOutOfCamera=fabric.util.createClass(fabric.Image,{
    type:'ImageOutOfCamera',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
    },
    render: function(ctx) {
        if(!this._element){return;}

        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        this._setupCompositeOperation(ctx);
        this.drawSelectionBackground(ctx);
        this.transform(ctx);
        this._setOpacity(ctx);
        this._setShadow(ctx, this);
        if (this.transformMatrix) {
            ctx.transform.apply(ctx, this.transformMatrix);
        }
        this.clipTo && fabric.util.clipContext(this, ctx);
        if (this.shouldCache()) {
            this.renderCache();
            this.drawCacheOnCanvas(ctx);
        }
        else {
            this._removeCacheCanvas();
            this.dirty = false;
            this.drawObject(ctx);
            if (this.objectCaching && this.statefullCache) {
                this.saveState({ propertySet: 'cacheProperties' });
            }
        }
        this.clipTo && ctx.restore();
        ctx.restore();
    },
})
