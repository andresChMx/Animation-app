let ProjectPersistance=fabric.util.createClass({
    //El modo de cargado y guardado estan pensados para una unica escena.Para multiples escenas se tendria que
    // primero, la lista de objetos generada seria bidimensional, con un arreglo para cada escena,
    // y para el cargado cada vez que se termine con un arreglo, invocar un metodo para anadir una escena
    // y que por defecto el indice apunte a esa nueva escena, y volver a invocar los mismos metodos
    initialize:function(scenesManager){
        this.scenesManager=scenesManager;
        this.observerOnProjectLoaded=null;//its parent
    },
    save:function(){
        if(this.scenesManager.AreAllAssetsReady()){
            let json=this._toJSON();
            //next instruction from library FileSaver.js
            var blob = new Blob([json], {
                type: "text/plain;charset=utf-8;",
            });
            saveAs(blob, "project.acm");
        }else{
            alert("cannot preview while images are not ready, please delete those images");
            //TODO Show notification "cannot preview while images are not ready, please delete those images"
        }
    },
    _toJSON:function(){
        let listAnimObjsWithEntrance=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjsWithEntrance);
        for(let i=0;i<listAnimObjsWithEntrance.length;i++){
            listAnimObjsWithEntrance[i].entranceBehaviour.entranceMode.setTurnIndexInEntraceList(i);
        }
        let listAnimObjsClippers=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjsClippers);
        for(let i=0;i<listAnimObjsClippers.length;i++){
            listAnimObjsClippers[i].indexInClipperObjectsList=i;
        }

        let tmpCanvas=new fabric.StaticCanvas();
        tmpCanvas._objects=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjs);

        let object=tmpCanvas.toObject();
        object.animatorDuration=SectionActionEditorMenu.widgetsTimelineTools.durationField.getVal();
        object.projectWidth=PanelConfig.getSettingProjectWidth();
        object.projectHeight=PanelConfig.getSettingProjectHeight();
        object.aspectRatio=PanelConfig.getSettingAspect();
        return JSON.stringify(object);
    },

    load:function(json){
        //cleaning current project (scene)
        this.scenesManager.clear();
        let serialized=JSON.parse(json);

        let tmpCanvas=new fabric.StaticCanvas();
        tmpCanvas.loadFromJSON(json);

        //clasifying objects in collections
        let camera=null;
        let listAnimObjs=tmpCanvas.getObjects();
        let listAnimObjsWithEntrance=[]
        let listAnimObjsClippers=[];
        for(let i=0;i<listAnimObjs.length;i++){
            let instance=listAnimObjs[i];
            if(instance.type==="CameraAnimable"){
                camera=instance;
            }
            if(instance.type==="ShapeAnimable"){
                listAnimObjsClippers.push(instance);
            }
            if(instance.entranceBehaviour.entranceModeName!==global.EntranceName.none){
                listAnimObjsWithEntrance.push(instance);
            }

        }
        // ordering objects in collections
        this._sortLoadedObjectsWithEntraceMode(listAnimObjsWithEntrance);
        this._sortLoadedClipperObjects(listAnimObjsClippers);
        for(let i=0;i<listAnimObjsClippers.length;i++){
            this._loadObjectInCollection(listAnimObjsClippers[i],[global.EnumCollectionsNames.animObjsClippers])
        }
        for (let i=0;i<listAnimObjsWithEntrance.length;i++){
            this._loadObjectInCollection(listAnimObjsWithEntrance[i],[global.EnumCollectionsNames.animObjsWithEntrance])
        }
        for (let i=0;i<listAnimObjs.length;i++){
            this._loadObjectInCollection(listAnimObjs[i],[global.EnumCollectionsNames.animObjs,global.EnumCollectionsNames.animObjsNotReady])

            let indexUnresolvedClipPath=listAnimObjs[i].indexUnresolvedClipPath;
            if(indexUnresolvedClipPath!==-1){
                listAnimObjs[i].clipPath=this.scenesManager.getCollection(global.EnumCollectionsNames.animObjsClippers)[indexUnresolvedClipPath];
            }
        }
        this.scenesManager.setSceneCamera(camera);

        let loadingPendingData={
            animatorDuration:serialized.animatorDuration,
            projectWidth:serialized.projectWidth,
            projectHeight:serialized.projectHeight,
            aspectRatio:serialized.aspectRatio,
        }
        this.notifyOnProjectLoaded(loadingPendingData);
    },
    _loadObjectInCollection:function(loadedObject,listCollectionNames){
        listCollectionNames.forEach(function(collName){
            this.scenesManager.addInstanceToCollectionIfPossible(loadedObject,collName);
        }.bind(this))
    },
    _sortLoadedObjectsWithEntraceMode:function(inputArr) {
        let n = inputArr.length;
        for (let i = 1; i < n; i++) {
            let current = inputArr[i];
            let j = i-1;
            while ((j > -1) && (current.entranceBehaviour.entranceMode.turnIndexInEntranceList < inputArr[j].entranceBehaviour.entranceMode.turnIndexInEntranceList)) {
                inputArr[j+1] = inputArr[j];
                j--;
            }
            inputArr[j+1] = current;
        }
    },
    _sortLoadedClipperObjects:function(inputArr) {
        let n = inputArr.length;
        for (let i = 1; i < n; i++) {
            let current = inputArr[i];
            let j = i-1;
            while ((j > -1) && (current.indexInClipperObjectsList < inputArr[j].indexInClipperObjectsList)) {
                inputArr[j+1] = inputArr[j];
                j--;
            }
            inputArr[j+1] = current;
        }
    },

    notifyOnProjectLoaded:function(loadPendingData){
        if(this.observerOnProjectLoaded){
            this.observerOnProjectLoaded.notificationOnProjectLoaded(loadPendingData);
        }
    },
    registerOnProjectLoaded:function(obj){
        this.observerOnProjectLoaded=obj;
    }
})