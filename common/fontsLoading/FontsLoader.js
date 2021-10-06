// const fabric = require('fabric').fabric;

let FontsLoader=function(){
    this.init=function(){
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
            this.loadBrowserFonts()
        }
        else {
            this.loadNodeFonts();
        }
    };
    this.loadBrowserFonts=function(){
        let listPromises=[];
        for(let fontName in global.FontsNames){
            let fontObserver = new FontFaceObserver(fontName);
            listPromises.push(fontObserver.load());
        }
        Promise.all(listPromises).then(function(e){
            console.log("fonts loaded successfuly");
        }).catch(function(error){

        })
    };
    this.loadNodeFonts=function(){
        for(let fontName in global.FontsFileName){
            fabric.nodeCanvas.registerFont(__dirname + '/assets/fonts/' + global.FontsFileName[fontName], {
                family:fontName , weight: 'regular', style: 'normal'
            });
        }
    }
    this.init();
}
//module.exports=FontsLoader;