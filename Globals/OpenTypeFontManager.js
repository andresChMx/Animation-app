var OpenTypeFontManager={
    fontServerURL:'https://limitless-castle-38573.herokuapp.com/',
    dictOpenTypeFontObjects:{},//{file name:opentypefontobject}  -> opentypefontobject nos permite generar los paths para cualquier mensaje
    LoadOpenTypeFont:function(fontFileName,callback){
        if(this.dictOpenTypeFontObjects[fontFileName]){callback(false);return}

        if (global.browserBehaviour.LoadOpenTypeFontForBrowser) {
            this._loadForBrowser(this.fontServerURL,fontFileName,callback)
        }
        else {
            let fontRoute=__dirname + "/assets/fonts/";
            this._loadForNode(fontRoute,fontFileName,callback)
        }
    },
    _loadForBrowser:function(route,fontFileName,callback){
        opentype.load(route+fontFileName, function(err, font) {
            if (err) {
                callback(true);
            } else {
                this.dictOpenTypeFontObjects[fontFileName]=font;
                callback(false);
            }
        }.bind(this));
    },
    _loadForNode:function(route,fontFileName,callback){
        const font=opentype.loadSync(route+fontFileName);
        this.dictOpenTypeFontObjects[fontFileName]=font;
        callback(false);
    },
    GeneratePath:function(fontFileName,fontSize,left,top,text){
        if(!this.dictOpenTypeFontObjects[fontFileName]){alert("ERROR: el obj font para esta fuente aun on ha cargado");return;}

        let path=this.dictOpenTypeFontObjects[fontFileName].getPath(text,left,top,fontSize);
        return path;
    }
}