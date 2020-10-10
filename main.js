
  WindowManager.init();
  CanvasManager.init();

  var timeLineController=new TimeLineController();
  PanelActionEditor.registerOnMarkerDragged(timeLineController); 
  PanelActionEditor.setTimelineController(timeLineController);



  var pathDesignerController= new PathDesignerController();
PanelDesignerOptions.setDesignerController(pathDesignerController);

  //var scenePreviewController=new ScenePreviewController();





