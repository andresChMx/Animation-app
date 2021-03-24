let ScenesList=fabric.util.createClass({
    listScenes:[],
    indexCurrentScene:0,
    initialize:function(parentClass){
        this.parentClass=parentClass;
    },
    addNewScene:function(camera){
        let scene=new Scene(this,camera);
        this.listScenes.push(scene);
    },
    /*notifications*/
    onSceneItemAdded:function(collectionName,obj){
        if(collectionName===global.EnumCollectionsNames.animObjsNotReady){
            obj.registerOnAssetReadyState(this);
            console.log("HOLOSITO");
        }
        this.parentClass.onSceneItemAdded(collectionName,obj)
    },
    onSceneItemRemoved:function(collectionName,index,obj){
        this.parentClass.onSceneItemRemoved(collectionName,index,obj);
    },
    onSceneItemsSwapped:function(firstIndex,lastIndex){
        this.parentClass.onSceneItemsSwapped(firstIndex,lastIndex)
    },

    notificationOnAssetStateReady:function(obj){/*called from animableobject*/
        this.removeInstanceFromCollection(obj,global.EnumCollectionsNames.animObjsNotReady);
    },
    //(USED as setup for new objects) adds instance to collection of current active scene
    addInstanceToAllCollections:function(newObject){
        for(let collName in global.EnumCollectionsNames){
            this.addInstanceToCollectionIfPossible(newObject,collName)
        }
        // this.canvas.add(newObject);
    },
    addInstanceToCollectionIfPossible:function(instance,collectionName){
        let contains=instance.applicableCanvasManagerCollections.indexOf(collectionName);
        if(contains>-1){
            this.addInstanceToCollection(instance,collectionName);
        }
    },
    addInstanceToCollection:function(instance,collectionName){
        this.listScenes[this.indexCurrentScene][collectionName].add(instance);
    },

    removeInstanceFromAllCollections:function(instance){
        instance.applicableCanvasManagerCollections.forEach(function(collName){
            this.removeInstanceFromCollection(instance,collName);
        }.bind(this))
    },
    removeInstanceFromCollection:function(instance,collectionName){
        this.listScenes[this.indexCurrentScene][collectionName].remove(instance);
    },

    swapInstancesInCollection:function(firstIndex,secondIndex,collectionName){
        this.listScenes[this.indexCurrentScene][collectionName].swap(firstIndex,secondIndex);
    },

    clear:function(){
        let listAnimObjs=this.getCollection(global.EnumCollectionsNames.animObjs);
        for(let i=0;i<listAnimObjs.length;i++){
            this.removeInstanceFromAllCollections(listAnimObjs[i]);
            i--;
        }
        //cleans scenes cameras references
        for(let i=0;i<this.listScenes.length;i++){
            this.listScenes[i].camera=null;
        }
    },
    /*getters*/
    AreAllAssetsReady:function(){
        return this.getCollection(global.EnumCollectionsNames.animObjsNotReady).length===0;
    },
    getCollection:function(collectionName){
        return this.listScenes[this.indexCurrentScene][collectionName].list;
    },
    getObjectIndexInCollection:function(collectionName,object){
        return this.listScenes[this.indexCurrentScene][collectionName].list.indexOf(object);
    },
    getCamera:function(){
        return this.listScenes[this.indexCurrentScene].camera;
    },
    /*setters*/
    setSceneCamera:function(camera){
        this.listScenes[this.indexCurrentScene].camera=camera;
    },
    setSceneCameraDimensions:function(projectWidth,projectHeight){
        this.listScenes[this.indexCurrentScene].camera.set("width",projectWidth);
        this.listScenes[this.indexCurrentScene].camera.set("height",projectHeight);
    },
});



