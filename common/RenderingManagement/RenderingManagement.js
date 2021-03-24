// const fabric = require('fabric').fabric;
// const { spawn } = require('child_process');
// const StaticResource= require("./../StaticResource");

let RenderingManagement={
    init:function(){
        this.staticResourcesLoaded=false;
        this.projectLoaded=false;
        this.loadedObjectsReady=false;


        /*resources loading loading*/
        StaticResource.addListenerOnImagesReady(function(){
            this.staticResourcesLoaded=true;
            this.startProjectLoading();
        }.bind(this))
        StaticResource.init();

        new FontsLoader();


        /*necessary rendering  components*/
        this.renderizer=new Renderizer();

        this.canvasRenderer=new PreviewerCanvas();

        this.scenesList=new ScenesList(this);
        this.addNewScene();

        this.projectPersistance=new ProjectPersistance(this.sceneList);
        this.projectPersistance.registerOnProjectLoaded(this);

        this.scenePreviewerController=new ScenePreviewController(this.scenesList);
        this.scenePreviewerController.setPreviewerCanvas(this.canvasRenderer);

        /*start logic after everything is loaded(static resources, font rendering)*/
        this.isRendering=false;

        this.json="project";


    },
    addNewScene:function(){
        this.scenesList.addNewScene(null);//la camara se establecera al cargar el projecto
    },

    attemptStartRendering:function(){
        if(this.staticResourcesLoaded && this.projectLoaded && this.loadedObjectsReady){
            this.startRendering();
        }
    },
    startProjectLoading:function(){ //start
        if(this.staticResourcesLoaded){
            this.projectPersistance.load(this.json);
        }
    },
    startRendering:function(){
        if(!this.isRendering){
            this.isRendering=true;

            let self=this;
            let fps=64;
            let durationPerFrame=1000/64;
            let progress=0;

            function renderFrame(){
                self.scenePreviewerController.animator.setTotalProgress(progress);
                self.renderizer.writeCanvasToCommand(self.canvasRenderer,function(){
                    progress+=durationPerFrame;
                    if(progress<=self.scenePreviewerController.animator.totalDuration){
                        renderFrame();
                    }else{
                        self.renderizer.finish();
                    }
                });
            }
            this.scenePreviewerController.startPreview(function(){
                this.scenePreviewerController.animator.stopAnimation();
                renderFrame();
            }.bind(this));

        }
    },
    /*notification from ScenesList*/
    onSceneItemAdded:function(collectionName,obj){
        //NOTHING
    },
    onSceneItemRemoved:function(collectionName,index,obj){
        if(collectionName===global.EnumCollectionsNames.animObjsNotReady){
            if(this.scenesList.AreAllAssetsReady()){
                this.loadedObjectsReady=true;
                this.attemptStartRendering();
            }
        }
    },
    onSceneItemsSwapped:function(collectionName,firstIndex,secondIndex){
        //NOTHING
    },
    /*notification from ProjectPersistance*/
    notificationOnProjectLoaded:function(loadPendingData){
        this.projectLoaded=true;
        this.canvasRenderer.setWidth(loadPendingData.projectWidth);
        this.canvasRenderer.setHeight(loadPendingData.projectHeight);
        this.scenePreviewerController.setDuration(loadPendingData.animatorDuration);
        this.attemptStartRendering()
    }
}

