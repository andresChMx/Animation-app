var DrawingHand=fabric.util.createClass({
    initialize:function(options){
        this.image=null;
        fabric.Image.fromURLImageOutOfCamera('https://res.cloudinary.com/dkhbeokkp/image/upload/v1608049692/drawing_hand_fldb5f.png', function(oImg) {
            this.image=oImg;
            this.image.originX="left";
            this.image.originY="top";
        }.bind(this));
    },
    getHandImage:function(){
        return this.image;
    },
    updatePosition:function(posx,posy){
        this.image.set({left:posx});
        this.image.set({top:posy});
    }
});
var ImageOutOfCamera=fabric.util.createClass(fabric.Image,{
    type:'ImageOutOfCamera',
    initialize:function(element, options){
        this.callSuper('initialize', element,options);
    },
    render: function(ctx) {
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
fabric.util.object.extend(fabric.Image,{
    fromURLImageOutOfCamera:function(url, callback, imgOptions){
        fabric.util.loadImage(url, function(img) {
            callback && callback(new ImageOutOfCamera(img, imgOptions));
        }, null, imgOptions && imgOptions.crossOrigin);
    }
})