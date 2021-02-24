let EntranceMode=fabric.util.createClass({
    initialize:function(parentObject){
        this.parentObject=parentObject;
        /*configuration attributes*/
        this.config={};
        /*fin*/
    },
    /*abstract methods to implement*/
    generateEntranceData:function(callback){},
    clearEntranceData:function(){},
    renderEntranceEffect:function(ctx){}
})
