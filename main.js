
MainMediator.registerSubjects([WindowManager,PanelConfig,PanelActionEditor,PanelAssets,CanvasManager,PanelInspector,PanelDesignerOptions,  PanelPreviewer, PanelAnimation,ScenesManager]);

/*Loading fonts for general use*/
var fontsLoader=new FontsLoader();



  /*-------------------CONTROLLERS--------------------*/

  var animationController=new AnimationController();
  PanelAnimation.setController(animationController);

  var pathDesignerController= new PathDesignerController();
  PanelDesignerOptions.setController(pathDesignerController);

  var scenePreviewController=new EnlivedScenePreviewController(ScenesManager);
  PanelPreviewer.setController(scenePreviewController);

  //registering controllers as subjects
  //for their UI view
  MainMediator.registerSubject(scenePreviewController.name,scenePreviewController.events);
  MainMediator.registerSubject(animationController.name,animationController.events);

  /*---------------------------------------------------*/
  UserEventsHandler.init();

  WindowManager.init();

