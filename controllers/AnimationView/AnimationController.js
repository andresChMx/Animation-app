var AnimationController=fabric.util.createClass({
    initialize:function(){
        this.animator=new ControllerAnimator(CanvasManager.canvas);
        this.animator.setListObjectsToAnimate(CanvasManager.listAnimableObjects);
        MainMediator.registerObserver(PanelActionEditor.name,PanelActionEditor.events.OnMarkerDragged,this);
    },
    notificationPanelActionEditorOnMarkerDragged:function(args){
        let newProgress=args[0];
        this.animator.setTotalProgress(newProgress);
    }
})

