var NoneEntranceMode=fabric.util.createClass(EntranceMode,{
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
    },
    /*implementing abstract methods*/
    generateEntranceData:function(callback){
    },
    clearEntranceData:function(){

    },
    renderEntranceEffect:function(ctx){
        this.parentObject.callSuper("_render",ctx);
    }
})