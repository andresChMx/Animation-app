
  WindowManager.init();
  CanvasManager.init();

  var timeLineController=new TimeLineController();
  PanelActionEditor.setTimelineController(timeLineController);



  var pathDesignerController= new PathDesignerController();
PanelDesignerOptions.setDesignerController(pathDesignerController);

  var scenePreviewController=new ScenePreviewController();
PanelPreviewer.setScenePreviewerController(scenePreviewController);



