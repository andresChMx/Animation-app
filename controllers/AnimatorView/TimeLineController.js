var TimeLineController=fabric.util.createClass({
    initialize:function(){
        this.animator=new ControllerAnimator(CanvasManager.canvas,CanvasManager.listAnimableObjects);
        PanelActionEditor.registerOnMarkerDragged(this); 
    },
    notificationOnMarkerDragged:function(newProgress){
        this.animator.setTotalProgress(newProgress);
    },
})

