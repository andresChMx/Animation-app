  MainMediator.registerSubjects([WindowManager,PanelActionEditor,PanelAssets,CanvasManager,PanelInspector,PanelDesignerOptions,PanelPreviewer]);
  WindowManager.init();
  CanvasManager.init();
  var fontsLoader=new FontsLoader();



  /*-------------------CONTROLLERS--------------------*/

  var animationController=new AnimationController();
  PanelAnimation.setController(animationController);

  var pathDesignerController= new PathDesignerController();
  PanelDesignerOptions.setController(pathDesignerController);

  var scenePreviewController=new ScenePreviewController();
  PanelPreviewer.setController(scenePreviewController);