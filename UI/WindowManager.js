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
        window.addEventListener("resize",this.onWindowResize);
        window.addEventListener("mouseup",this.onWindowMouseUp);
        window.addEventListener("mousemove",this.onWindowMouseMove);
        window.addEventListener("mousedown",this.onWindowMouseDown);

        window.addEventListener("keyup",this.onKeyUp.bind(this))

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
        let self=WindowManager;
        for(var i=0;i<self.listObservers[self.activeObserverType].onResize.length;i++){
            //self.listObserversOnResize[i].notificationOnResize();
        }
        //PanelActionEditor.onWindowResize();
    },
    onWindowMouseUp:function(e){
        let self=WindowManager;
        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseUp.length;i++){
            self.listObservers[self.activeObserverType].onMouseUp[i].notificationOnMouseUp(e);
        }
    },
    onWindowMouseMove:function(e){
        let self=WindowManager;
        self.mouse.x=e.clientX;
        self.mouse.y=e.clientY;

        for(let i=0;i<self.listObservers[self.activeObserverType].onMouseMove.length;i++){
            self.listObservers[self.activeObserverType].onMouseMove[i].notificationOnMouseMove(e);
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
        }else if (e.keyCode===13){
            for(let i=0;i<self.listObservers[self.activeObserverType].onKeyEnterUp.length;i++){
                self.listObservers[self.activeObserverType].onKeyEnterUp[i].notificationOnKeyEnterUp();
            }
        }
    },
    initUI:function(){
        document.body.style.width=window.innerWidth + "px";
        document.body.style.height=window.innerHeight + "px";
        /*AUTHENTICATION*/
        PanelAuthentication.init();
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

        MainMediator.notify(this.name,this.events.OnUILoaded,[]);
    }
}
