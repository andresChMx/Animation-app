var PanelPathsDesigner={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-paths-designer");

        MainMediator.registerObserver(PanelAssets.name,PanelAssets.events.OnImageAssetDesignPathsClicked,this);

        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);
    },
    notificationPanelDesignerOptionsOnSettingActionClicked:function(){
        this.HTMLElement.style.display="none";
    },
    notificationPanelAssetsOnImageAssetDesignPathsClicked:function(args){
        this.HTMLElement.style.display="flex";
        this.resizeHTMLElement();
    },
    resizeHTMLElement:function(){
        this.HTMLElement.style.width=document.body.offsetWidth-(PanelAssets.HTMLElement.offsetLeft+PanelAssets.HTMLElement.offsetWidth )-PanelDesignerOptions.HTMLElement.offsetWidth  + "px";
        this.HTMLElement.style.left=PanelAssets.HTMLElement.offsetWidth + "px";
    }
}