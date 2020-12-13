let FontsLoader=function(){
    this.init=function(){
        var myfont = new FontFaceObserver("bauhs 93")
        myfont.load()
            .then(function() {
                // when font is loaded, use it.
                //canvas.getActiveObject().set("fontFamily", font);
                //canvas.requestRenderAll();
            }).catch(function(e) {
            console.log(e)
            alert('font loading failed ');
        });
    }
    this.init();
}