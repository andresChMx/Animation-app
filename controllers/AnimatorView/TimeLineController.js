var TimeLineController=fabric.util.createClass({
    initialize:function(){
        this.animator=new ControllerAnimator(CanvasManager.canvas);
        this.animator.setListObjectsToAnimate(CanvasManager.listAnimableObjects);
        PanelActionEditor.registerOnMarkerDragged(this); 
    },
    notificationOnMarkerDragged:function(newProgress){
        this.animator.setTotalProgress(newProgress);
    },
})

