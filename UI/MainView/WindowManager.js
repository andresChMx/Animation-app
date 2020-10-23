var ObserverType={
    temp:"temp",
    main:"main",
};
var WindowManager={
    mouse:{
        x:0,y:0,click:false,
    },

    listObservers:{
        temp:{
            onLoad:[],
            onResize:[],
            onMouseUp:[],
            onMouseMove:[],
            onMouseDown:[],
        },
        main:{
            onLoad:[],
            onResize:[],
            onMouseUp:[],
            onMouseMove:[],
            onMouseDown:[],
            onKeyDeleteUp:[]
        }
    },

    activeObserverType:ObserverType.main,

    init:function(){
        window.addEventListener("load",initUI);
        window.addEventListener("resize",this.onWindowResize);
        window.addEventListener("mouseup",this.onWindowMouseUp);
        window.addEventListener("mousemove",this.onWindowMouseMove);
        window.addEventListener("mousedown",this.onWindowMouseDown);

        window.addEventListener("keyup",this.onKeyUp.bind(this))
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
    },
    notificationOnSettingActionClicked:function(actionId){
        let self=WindowManager;
        for(var obsListTmp in self.listObservers[ObserverType.temp] ){
            self.listObservers[ObserverType.temp][obsListTmp]=[];
        }
        self.activeObserverType=ObserverType.main;
    },
    /*PanelAssets.SectionImageAssets*/
    notificationOnItemsMenu_designPaths:function(){
        let self=WindowManager;
        self.activeObserverType=ObserverType.temp;
    },
    registerObserverOnResize:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onResize.push(obj)
    },
    registerOnMouseDown:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onMouseDown.push(obj);
    },
    registerOnMouseUp:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onMouseUp.push(obj);
    },
    registerOnMouseMove:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onMouseMove.push(obj);
    },
    registerOnKeyDeletePressed:function(obj,obsType=ObserverType.main){
        let self=WindowManager;
        self.listObservers[obsType].onKeyDeleteUp.push(obj);
    },
    onWindowResize:function(){
        let self=WindowManager;
        for(var i=0;i<self.listObservers[self.activeObserverType].onResize.length;i++){
            //self.listObserversOnResize[i].notificationOnResize();
        }
        //PanelActionEditor.onWindowResize();
    },
    onWindowMouseUp:function(){
        let self=WindowManager;
        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseUp.length;i++){
            self.listObservers[self.activeObserverType].onMouseUp[i].notificationOnMouseUp();
        }
    },
    onWindowMouseMove:function(e){
        let self=WindowManager;
        self.mouse.x=e.clientX;
        self.mouse.y=e.clientY;

        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseMove.length;i++){
            self.listObservers[self.activeObserverType].onMouseMove[i].notificationOnMouseMove();
        }
    },
    onWindowMouseDown:function(e){
        let self=WindowManager;
        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseDown.length;i++){
            self.listObservers[self.activeObserverType].onMouseDown[i].notificationOnMouseDown(e);
        }
    },
    onKeyUp:function(e){
        let self=WindowManager;
        if(e.keyCode==46){
            for(let i=0;i<self.listObservers[self.activeObserverType].onKeyDeleteUp.length;i++){
                self.listObservers[self.activeObserverType].onKeyDeleteUp[i].notificationOnKeyDeleteUp();
            }
        }
    }
}
function initUI(){
    document.body.style.width=window.innerWidth + "px";
    document.body.style.height=window.innerHeight + "px";

    /*ANIMATOR*/
    PanelAnimation.init();
    PanelAnimation.PanelActionEditor.init();

    PanelInspector.init();
    PanelInspector.SectionPropertiesEditor.init();
    PanelInspector.SectionMenuAddKey.init();

    PanelAssets.init();
    PanelAssets.SectionImageAssets.init();


    /*paths desginer*/
    PanelDesignerOptions.init();
    PanelDesignerOptions.SectionSettings.init();
    PanelDesignerOptions.SectionPaths.init();
    PanelDesignerOptions.SectionPathDesignerPopup.init();
    PanelPathsDesigner.init();

    /*pewviewer*/
    PanelPreviewer.init();

}