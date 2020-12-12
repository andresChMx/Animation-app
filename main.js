  MainMediator.registerSubjects([WindowManager,PanelActionEditor,PanelAssets,CanvasManager,PanelInspector,PanelDesignerOptions,PanelPreviewer]);


  var fontsLoader=new FontsLoader();



  /*-------------------CONTROLLERS--------------------*/

  var animationController=new AnimationController();
  PanelAnimation.setController(animationController);

  var pathDesignerController= new PathDesignerController();
  PanelDesignerOptions.setController(pathDesignerController);

  var scenePreviewController=new ScenePreviewController();
  PanelPreviewer.setController(scenePreviewController);

  //registering controllers as subjects
  MainMediator.registerSubject(scenePreviewController.name,scenePreviewController.events);
  /*---------------------------------------------------*/
  WindowManager.init();
  CanvasManager.init();