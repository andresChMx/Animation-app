var PanelPathsDesigner={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-paths-designer");

        PanelAssets.SectionImageAssets.registerOnItemsMenu_designPaths(this);
        PanelDesignerOptions.SectionSettings.registerOnSettingActionClicked(this);
    },
    notificationOnSettingActionClicked:function(){
        this.HTMLElement.style.display="none";
    },
    notificationOnItemsMenu_designPaths:function(data){
        this.HTMLElement.style.display="flex";
        this.resizeHTMLElement();
    },
    resizeHTMLElement:function(){
        this.HTMLElement.style.width=document.body.offsetWidth-(PanelAssets.HTMLElement.offsetLeft+PanelAssets.HTMLElement.offsetWidth )-PanelDesignerOptions.HTMLElement.offsetWidth  + "px";
        this.HTMLElement.style.left=PanelAssets.HTMLElement.offsetWidth + "px";
    }
}