var AnimationController=fabric.util.createClass({
    name:'AnimationController',
    events:{
        OnAnimatorTick:'OnAnimatorTick',
        OnAnimatorNewProgress:"OnAnimatorNewProgress",

        OnAnimatorStateChanged:'OnAnimatorStateChanged',
    },
    initialize:function(){
        this.animator=new ControllerAnimator(null); //asignamos el canvas a rendedirzar cuando el ui haya cargado
        this.animator.onTick(this.callbackOnAnimatorTick.bind(this));
        this.animator.onStateChanged(this.callbackOnAnimatorStateChanged.bind(this));
        this.animator.onNewProgress(this.callbackOnAnimatorNewProgress.bind(this))
        this.animator.setListObjectsToAnimate(CanvasManager.listAnimableObjects);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragged,this);
        MainMediator.registerObserver(WindowManager.name,WindowManager.events.OnUILoaded,this);
        },
    callbackOnAnimatorTick:function(progress){
        MainMediator.notify(this.name,this.events.OnAnimatorTick,[progress])
    },
    callbackOnAnimatorNewProgress:function(progress){
        MainMediator.notify(this.name,this.events.OnAnimatorNewProgress,[progress]);
    },
    callbackOnAnimatorStateChanged:function(state){
        MainMediator.notify(this.name,this.events.OnAnimatorStateChanged,[state]);
    },
    notificationWindowManagerOnUILoaded:function(){
        this.animator.canvasToDisplay=CanvasManager.canvas;
    },
    notificationPanelActionEditorOnMarkerDragged:function(args){
        let newProgress=args[0];
        this.animator.setTotalProgress(newProgress);
        if(this.animator.state===ControllerAnimatorState.playing){
            this.animator._calcTimingValuesForLoop();
        }
    },
})

