let AnimablesCollections=fabric.util.createClass({
    initialize:function(){
        for(let key in EnumCollectionsNames){
            this[key]=new Collection();
        }
        // adding collections logic
        this.animObjsWithEntrance.cbBeforeAdding=function(item){
            return item.entranceBehaviour.entranceModeName !== EntranceName.none;
        };
    },
})
let Collection=fabric.util.createClass({
    initialize:function(){
        this.list=[];
        //Se usa callbacks debido a que no formazmos al listener que nombrar de cierta forma sus funciones, y debido a que el padre
        // generaltemnete tendra muchas instancias de este tipo de objecto, todos desencadenarian la misma funcion, lo que es un problema
        this.cblistenerOnItemAdded=function(){};
        this.cblistenerOnItemDeleted=function(){};
        
        this.cbBeforeAdding=function(){return true;}; // useful for performing something before adding, and if desired aborting adding item;
    },
    add:function(item){
        if(!this.cbBeforeAdding(item)){
            return;
        }
        this.list.push(item);
        this.notifyOnItemAdded(item)
    },
    remove:function(obj){
        let indexInList=this.list.indexOf(obj);
        if(indexInList!==-1){
            this.list.splice(indexInList,1);
            this.notifyOnItemDeleted(indexInList,obj)
        }
    },
    listenOnItemAdded:function(callback){
        this.cblistenerOnItemAdded=callback;
    },
    listenOnItemDeleted:function(callback){
        this.cblistenerOnItemDeleted=callback;
    },
    notifyOnItemAdded:function(item){
        this.cblistenerOnItemAdded(item);
    },
    notifyOnItemDeleted:function(index,item){
        this.cblistenerOnItemDeleted(index,item);
    }
})