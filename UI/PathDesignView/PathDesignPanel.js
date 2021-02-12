var PanelPathsDesigner={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-paths-designer");

        MainMediator.registerObserver(CanvasManager.name,CanvasManager.events.OnDesignPathOptionClicked,this);

        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnActionClicked,this);
    },
    notificationPanelDesignerOptionsOnActionClicked:function(){
        this.HTMLElement.style.display="none";
    },
    notificationCanvasManagerOnDesignPathOptionClicked:function(args){
        this.HTMLElement.style.display="flex";
        this.resizeHTMLElement();
    },
    resizeHTMLElement:function(){
        this.HTMLElement.style.width=document.body.offsetWidth-(PanelAssets.HTMLElement.offsetLeft+PanelAssets.HTMLElement.offsetWidth )-PanelDesignerOptions.HTMLElement.offsetWidth  + "px";
        this.HTMLElement.style.left=PanelAssets.HTMLElement.offsetWidth + "px";
    }
}