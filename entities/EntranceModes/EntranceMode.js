global.EntranceMode=fabric.util.createClass({
    initialize:function(parentObject){
        this.parentObject=parentObject;
        this.turnIndexInEntranceList=-1; /*gets updated just before project serialization (project saving).*/
        /*configuration attributes*/
        this.config={};
        /*fin*/
    },
    setTurnIndexInEntraceList:function(index){
        this.turnIndexInEntranceList=index;
    },
    /*abstract methods to implement*/
    generateEntranceData:function(callback){},
    clearEntranceData:function(){},
    renderEntranceEffect:function(ctx){}
})
