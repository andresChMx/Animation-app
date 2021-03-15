var ObserverType={
    temp:"temp",
    main:"main",
};
var WindowManager={
    name:'WindowManager',
    events:{
        OnUILoaded:'OnUILoaded',
        OnLoad:'OnLoad',
        OnResize:'OnResize',
        OnMouseUp:'OnMouseUp',
        OnMouseMove:'OnMouseMove',
        OnMouseDown:'OnMouseDown',
        OnKeyDeleteUp:'OnKeyDeleteUp',
        OnKeyEnterUp:'OnKeyEnterUp'
    },
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
            onKeyDeleteUp:[],
            onKeyEnterUp:[]
        },
        main:{
            onLoad:[],
            onResize:[],
            onMouseUp:[],
            onMouseMove:[],
            onMouseDown:[],
            onKeyDeleteUp:[],
            onKeyEnterUp:[]
        }
    },

    activeObserverType:ObserverType.main,

    init:function(){
        window.addEventListener("load",this.initUI.bind(this));
        window.addEventListener("resize",this.onWindowResize.bind(this));
        window.addEventListener("keyup",this.onKeyUp.bind(this))
        UserEventsHandler.addListener("mouseup",this.onWindowMouseUp.bind(this));
        UserEventsHandler.addListener("mousemove",this.onWindowMouseMove.bind(this));
        UserEventsHandler.addListener("mousedown",this.onWindowMouseDown.bind(this));


        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);

    },
    notificationPanelDesignerOptionsOnActionClicked:function(actionId){
        let self=WindowManager;
        // for(var obsListTmp in self.listObservers[ObserverType.temp] ){
        //     self.listObservers[ObserverType.temp][obsListTmp]=[];
        // }
        self.activeObserverType=ObserverType.main;
    },
    /*PanelAssets.SectionImageAssets*/
    notificationCanvasManagerOnDesignPathOptionClicked:function(){
        this.activeObserverType=ObserverType.temp;
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
    registerOnKeyEnterPressed:function(obj,obsType=ObserverType.main){
        this.listObservers[obsType].onKeyEnterUp.push(obj);
    },
    unregisterOnKeyEnterPressed:function(obj,obsType=ObserverType.main){
        let index=this.listObservers[obsType].onKeyEnterUp.indexOf(obj);
        if(index!==-1){this.listObservers[obsType].onKeyEnterUp.splice(index,1);}
    },
    onWindowResize:function(){
        for(var i=0;i<this.listObservers[this.activeObserverType].onResize.length;i++){
            this.listObservers[this.activeObserverType].onResize[i].notificationOnResize();
        }
    },
    onWindowMouseUp:function(e){
        for(let i=0;i<this.listObservers[this.activeObserverType].onMouseUp.length;i++){
            this.listObservers[this.activeObserverType].onMouseUp[i].notificationOnMouseUp(e);
        }
    },
    onWindowMouseMove:function(e){
        this.mouse.x=e.clientX;
        this.mouse.y=e.clientY;
        for(let i=0;i<this.listObservers[this.activeObserverType].onMouseMove.length;i++){
            this.listObservers[this.activeObserverType].onMouseMove[i].notificationOnMouseMove(e);
        }
    },
    onWindowMouseDown:function(e){
        for(let i=0;i<this.listObservers[this.activeObserverType].onMouseDown.length;i++){
            this.listObservers[this.activeObserverType].onMouseDown[i].notificationOnMouseDown(e);
        }
    },
    onKeyUp:function(e){
        if(e.keyCode===46){
            for(let i=0;i<this.listObservers[this.activeObserverType].onKeyDeleteUp.length;i++){
                this.listObservers[this.activeObserverType].onKeyDeleteUp[i].notificationOnKeyDeleteUp();
            }
        }else if (e.keyCode===13){
            for(let i=0;i<this.listObservers[this.activeObserverType].onKeyEnterUp.length;i++){
                this.listObservers[this.activeObserverType].onKeyEnterUp[i].notificationOnKeyEnterUp();
            }
        }
    },
    initUI:function(){
        // document.body.style.width=window.innerWidth + "px";
        // document.body.style.height=window.innerHeight + "px";

        CanvasManager.init();
        /*AUTHENTICATION*/
        PanelAuthentication.init();

        PanelHome.init();
        /*ANIMATOR*/
        PanelAnimation.init();
        PanelAnimation.PanelActionEditor.init();

        PanelInspector.init();
        //PanelInspector.SectionLanesEditor.init();
        //PanelInspector.SectionMenuAddKey.init();

        PanelAssets.init();

        /*paths desginer*/
        PanelDesignerOptions.init();
        PanelPathsDesigner.init();

        /*pewviewer*/
        PanelPreviewer.init();

        StaticResource.addListenerOnImagesReady(function(){
            MainMediator.notify(this.name,this.events.OnUILoaded,[]);
        }.bind(this))
        StaticResource.init();
    }
}
