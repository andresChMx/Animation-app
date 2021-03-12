let FontsLoader=function(){
    this.init=function(){
        let listPromises=[];
        for(let fontName in FontsNames){
            let fontObserver = new FontFaceObserver(fontName);
            listPromises.push(fontObserver.load());
        }
        Promise.all(listPromises).then(function(e){
            console.log("fonts loaded successfuly");
        }).catch(function(error){

        })
    }
    this.init();
}