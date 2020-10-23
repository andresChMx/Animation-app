var CanvasManager={
    canvas:null,
    listAnimableObjects:[],
    listAnimableObjectsWithEntrance:[],

    listObserversOnObjSelected:[],
    listObserversOnObjModified:[],
    listObserversOnObjDeleted:[],

    listObserversOnObjCreated:[],
    init:function(){
        this.canvas=new fabric.Canvas('c',{ width: window.innerWidth, height: window.innerHeight ,backgroundColor: 'rgb(0,0,0)'});
        this.canvas.preserveObjectStacking=true;
        this.canvas.on('selection:updated',this.notifyOnObjSelected)
        this.canvas.on('selection:created',this.notifyOnObjSelected)
        this.canvas.on('selection:cleared',this.notifyOnObjSelected)
        //this.canvas.on('object:removed',this.notifyOnObjDeleted)
        this.canvas.on('object:modified',this.notifyOnObjModified)
        PanelInspector.SectionPropertiesEditor.registerOnFieldInput(this);
        PanelAssets.SectionImageAssets.registerOnDummyDraggingEnded(this);
        PanelActionEditor.registerOnMarkerDragEnded(this);

        WindowManager.registerOnKeyDeletePressed(this);
        /*
        let self=this;
        window.addEventListener("keydown",function(e){
            if(e.keyCode==32){
                self.canvas.remove(self.canvas.getActiveObject());
            }
        });
        */
    },
    getSelectedAnimableObj:function(){
        let activeObj=this.canvas.getActiveObject()
        if(activeObj && activeObj.type==="ImageAnimable"){
            return activeObj
        }else{
            return null;
        }
        //switch(case obj.)

    },
    getListIndexObjectWithEntrance:function(obj){
        return this.listAnimableObjectsWithEntrance.indexOf(obj);
    },
    createAnimableObject:function(model){
        let self=CanvasManager;

        /*
                fabric.loadSVGFromURL('http://localhost:3000/svg.svg', function(objects, options) {
                console.log(objects);
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.set({left:WindowManager.mouse.x});
                    obj.set({top:WindowManager.mouse.y});
                    self.canvas.add(obj).renderAll();
                  });
                */
        let oImg=new ImageAnimable(model.imgHTML,{
            "originX":"center",
            "originY":"center",
            "left":WindowManager.mouse.x,
            "top":WindowManager.mouse.y
        })
        oImg.imageModel=model;
        oImg.entraceMode=EntranceModes.drawn;
        oImg.setCoords();
        self.canvas.add(oImg);
        self.listAnimableObjects.push(oImg);
        self.listAnimableObjectsWithEntrance.push(oImg);
        self.notifyOnObjCreated(oImg)

    },
    setCanvasOnAnimableObjects:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i]._set('canvas', this.canvas);
            this.listAnimableObjects[i].setCoords();
        }
        this.canvas.renderAll();
    },
    registerOnSelectionUpdated:function(obj){
        this.listObserversOnObjSelected.push(obj);
    },
    registerOnObjDeleted:function(obj){
        this.listObserversOnObjDeleted.push(obj);
    },
    registerOnObjModified:function(obj){
        this.listObserversOnObjModified.push(obj);
    },
    registerOnObjCreated:function(obj){
        this.listObserversOnObjCreated.push(obj);
    },
    notifyOnObjCreated:function(animObj){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjCreated.length;i++){
            self.listObserversOnObjCreated[i].notificationOnObjCreated(animObj);
        }
    },
    notifyOnObjSelected:function(opt){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjSelected.length;i++){
            self.listObserversOnObjSelected[i].notificationOnSelectionUpdated(opt.target);
        }
    },
    notifyOnObjDeleted:function(indexInObjsWithEntrance,indexInMainList){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjDeleted.length;i++){
            self.listObserversOnObjDeleted[i].notificationOnObjDeleted(indexInObjsWithEntrance,indexInMainList);
        }
    },
    notifyOnObjModified:function(){
        let self=CanvasManager;
        for(let i=0;i<self.listObserversOnObjModified.length;i++){
            self.listObserversOnObjModified[i].notificationOnObjModified();
        }
    },
    notificationOnFieldInput:function(target){
        console.log(target.getAttribute("name") + " + " + target.value);
        let self=CanvasManager;
        let activeAnimObj=self.getSelectedAnimableObj();
        if(activeAnimObj){
            activeAnimObj.set(target.getAttribute("name"),parseFloat(target.value));
            activeAnimObj.setCoords();
            self.canvas.renderAll();
        }
    },
    notificationOnKeyDeleteUp:function(){
        if(this.canvas.getActiveObject()){

            let activeObject=this.canvas.getActiveObject();
            if(activeObject.type==="ImageAnimable"){
                let indexInMainList=this.listAnimableObjects.indexOf(activeObject);
                let indexInObjsWithEntrance=this.listAnimableObjectsWithEntrance.indexOf(activeObject);
                if(indexInMainList!=-1){
                    this.listAnimableObjects.splice(indexInMainList,1);
                }
                if(indexInObjsWithEntrance!=-1){
                    this.listAnimableObjectsWithEntrance.splice(indexInObjsWithEntrance,1);
                }
                this.notifyOnObjDeleted(indexInObjsWithEntrance,indexInMainList);
                this.canvas.remove(this.canvas.getActiveObject());
            }
        }
    },
    notificationOnDummyDraggingEnded:function(model){
        let self=CanvasManager;
        self.createAnimableObject(model);
    },
    notificationOnMarkerDragEnded:function(){
        for(let i=0;i<this.listAnimableObjects.length;i++){
            this.listAnimableObjects[i].setCoords();
        }
    }
}