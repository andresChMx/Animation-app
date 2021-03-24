let Collection=fabric.util.createClass({
    initialize:function(name,parentClass){
        this.name=name;
        this.parentClass=parentClass;
        this.list=[];
        //Se usa callbacks debido a que no formazmos al listener que nombrar de cierta forma sus funciones, y debido a que el padre
        // generaltemnete tendra muchas instancias de este tipo de objecto, todos desencadenarian la misma funcion, lo que es un problema
        this.cbBeforeAdding=function(){return true;}; // useful for performing something before adding, and if desired aborting adding item;
    },
    add:function(item){
        if(!this.cbBeforeAdding(item)){return;}

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
    swap:function(initialIndex,finalIndex){
        if(initialIndex<0 || initialIndex>=this.list.length){return;}
        if(finalIndex<0 || finalIndex>=this.list.length){return;}
        let tmp=this.list[initialIndex];
        this.list[initialIndex]=this.list[finalIndex];
        this.list[finalIndex]=tmp;
        this.notifyOnItemsSwapped(initialIndex,finalIndex);
    },
    listenBeforeAdding:function(callback){
        this.cbBeforeAdding=callback;
    },
    notifyOnItemAdded:function(item){
        this.parentClass.onCollectionItemAdded(this.name,item);
    },
    notifyOnItemDeleted:function(index,item){
        this.parentClass.onCollectionItemRemoved(this.name,index,item);
    },
    notifyOnItemsSwapped:function(firstIndex,secondIndex){
        this.parentClass.onCollectionItemsSwapped(firstIndex,secondIndex);
    }
})
let Scene=fabric.util.createClass({
    initialize:function(parentClass,camera){
        this.parentClass=parentClass;
        this.camera=camera;
        for(let key in global.EnumCollectionsNames){
            this[key]=new Collection(key,this);
        }

        // adding collections logic
        this[global.EnumCollectionsNames.animObjsWithEntrance].listenBeforeAdding(function(item){
            return item.entranceBehaviour.entranceModeName !== global.EntranceName.none;
        });

    },
    onCollectionItemAdded:function(collName,item){
        this.parentClass.onSceneItemAdded(collName,item);
    },
    onCollectionItemRemoved:function(collName,index,item){
        this.parentClass.onSceneItemRemoved(collName,index,item);
    },
    onCollectionItemsSwapped:function(startIndex,endIndex){
        this.parentClass.onSceneItemsSwapped(startIndex,endIndex);
    }
});
