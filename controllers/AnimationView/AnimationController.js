var AnimationController=fabric.util.createClass({
    initialize:function(){
        this.animator=new ControllerAnimator(null,this); //asignamos el canvas a rendedirzar cuando el ui haya cargado
        this.animator.setListObjectsToAnimate(CanvasManager.listAnimableObjects);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragged,this);
        MainMediator.registerObserver(WindowManager.name,WindowManager.events.OnUILoaded,this)
        },
    childNotificationOnAnimatorTick:function(normalizedProgress){
        //not implemented
    },
    notificationWindowManagerOnUILoaded:function(){
        this.animator.canvasToDisplay=CanvasManager.canvas;
    },
    notificationPanelActionEditorOnMarkerDragged:function(args){
        let newProgress=args[0];
        this.animator.setTotalProgress(newProgress);
    }
})

