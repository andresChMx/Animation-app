var NoneEntranceMode=fabric.util.createClass(EntranceMode,{
    type:"None",
    initialize:function(parentObject){
        this.callSuper("initialize",parentObject);
        this.turnIndexInEntranceList=null; /*This class is the exception of entraceModes that uses this variable, since this will not use this variable */
    },
    /*implementing abstract methods*/
    generateEntranceData:function(callback){
    },
    clearEntranceData:function(){

    },
    renderEntranceEffect:function(ctx){
        this.parentObject.callSuper("_render",ctx);
    },
    toObject:function(){
        return {};
    },
    fromObject:function(object){

    }
})