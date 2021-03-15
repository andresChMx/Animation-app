var ViewModel={
    SectionImageAssets:PanelAssets.SectionImageAssets.listAssets,
    SectionShapeAssets:PanelAssets.SectionShapeAssets.listAssets,
    SectionObjectsEntraceEditor:PanelInspector.AreaSceneObjects.SectionObjectsEntraceEditor.listObjects,
    SectionAnimableObjectsEditor:PanelInspector.AreaSceneObjects.SectionAnimableObjectsEditor.listObjects
}

ko.bindingHandlers.setupEvents={
    init:function(element,valueAccesor,allBindings){
        valueAccesor();
    }
}
ko.applyBindings(ViewModel);
