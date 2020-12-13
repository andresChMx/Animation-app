var OpenTypeFontManager={
    fontServerURL:'http://localhost:3000/',
    dictOpenTypeFontObjects:{},//{file name:opentypefontobject}  -> opentypefontobject nos permite generar los paths para cualquier mensaje
    LoadOpenTypeFont:function(fontFileName){
        if(this.dictOpenTypeFontObjects[fontFileName]){return}
        opentype.load(this.fontServerURL+fontFileName, function(err, font) {
            if (err) {
                alert('Font could not be loaded: ' + err);
            } else {
                this.dictOpenTypeFontObjects[fontFileName]=font;
                //const path = font.getPath('Hello, World!', 0, 150, 72);
            }

        }.bind(this));
    },
    GeneratePath:function(fontFileName,fontSize,left,top,text){
        if(!this.dictOpenTypeFontObjects[fontFileName]){alert("ERROR: el obj font para esta fuente aun on ha cargado");return;}
        console.log(text);
        console.log(left);
        console.log(top);
        console.log(fontSize);

        let path=this.dictOpenTypeFontObjects[fontFileName].getPath(text,left,top,fontSize);
        return path.commands;
    }
}