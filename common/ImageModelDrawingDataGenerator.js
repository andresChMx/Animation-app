var ImageModelDrawingDataGenerator=fabric.util.createClass({
    initialize:function(){
        this.canvasElem=document.createElement("canvas");
        this.canvasElem.id="auxCanvas"
        this.auxCanvasForTexts=new fabric.StaticCanvas("auxCanvas");
    },
    generateCtrlPoints:function(imageModel){
        imageModel.paths.ctrlPoints=this.generateCrtlPointsFromPointsMatrix(imageModel.paths.points);
    },
    generatePoints:function(){

    },
    delete:function(imageModel){
        imageModel.paths.ctrlPoints=[];
    },
    _triangleWidthHeight:function(arr, i, j){
        return [arr[2*j]-arr[2*i], arr[2*j+1]-arr[2*i+1]]
    },
    _distace:function(arr, i, j) {
        return Math.sqrt(Math.pow(arr[2*i]-arr[2*j], 2) + Math.pow(arr[2*i+1]-arr[2*j+1], 2));
    },
    _calcCrtlPointsSinglePoint:function(x1,y1,x2,y2,x3,y3){
        var t = 0.5;
        var v = this._triangleWidthHeight(arguments, 0, 2);
        var d01 = this._distace(arguments, 0, 1);
        var d12 = this._distace(arguments, 1, 2);
        var d012 = d01 + d12;
        return [x2 - v[0] * t * d01 / d012, y2 - v[1] * t * d01 / d012,
            x2 + v[0] * t * d12 / d012, y2 + v[1] * t * d12 / d012 ];
    },

    generateCrtlPointsFromPointsMatrix:function(matPts){
        if(matPts.length==0){
            return;
        }
        let list=[];
        for (var i = 0; i <matPts.length; i += 1) {
            let newCrtlPoints=[-1,-1];
            if(matPts[i].length>=3){
                for(var j=0;j<(matPts[i].length/2)-2;j++){
                    newCrtlPoints = newCrtlPoints.concat(this._calcCrtlPointsSinglePoint(matPts[i][j*2], matPts[i][j*2+1], matPts[i][j*2+2], matPts[i][j*2+3], matPts[i][j*2+4], matPts[i][j*2+5]));
                }
            }
            newCrtlPoints.push(-1);
            newCrtlPoints.push(-1);
            list.push(newCrtlPoints);
        }
        return list;
    },
    generateDefaultDrawingPointsAndLineWidth:function (imageDrawingData,lineWidthWanted){
        let imageWidth=imageDrawingData.imgHTML.naturalWidth;
        let imageHeight=imageDrawingData.imgHTML.naturalHeight;

        let matPoints=[]
        let listLinesWidths=[lineWidthWanted/imageWidth];
        matPoints.push([]);
        let p1x,p1y,p2x,p2y;

        let layerIndex=0;
        let contPointsLayer=0;
        for(let i=0;i<imageHeight+imageWidth;i+=(lineWidthWanted-lineWidthWanted/4)){
            if(contPointsLayer>50){
                layerIndex++;
                contPointsLayer=0;
                matPoints.push([])
                listLinesWidths.push(lineWidthWanted/imageWidth);
            }//new layer

            if(i<imageWidth){
                p1x=i;
                p1y=0;
            }else{
                p1x=imageWidth;
                p1y=i-imageWidth;
            }
            if(i<imageHeight){
                p2x=0;
                p2y=i;
            }else{
                p2x=i-imageHeight;
                p2y=imageHeight;
            }
            contPointsLayer+=2;

            matPoints[layerIndex].push(
                p1x/imageWidth,
                p1y/imageHeight,
                p2x/imageWidth,
                p2y/imageHeight
            );
        }
        imageDrawingData.points=matPoints;
        imageDrawingData.linesWidths=listLinesWidths;
    },
    generateStrokesTypesFromPoints:function(matPoints){
        let matStrokes=[];

        for(let i=0;i<matPoints.length;i++){
            matStrokes.push([]);
            let len=matPoints[i].length;
            if(len<2){continue}
            if(len==2){
                matStrokes[i].push("l");
            }else{
                for(let j=0;j<matPoints[i].length;j++){
                    matStrokes[i].push("l");
                }
            }
        }
        return matStrokes;
    },

    generateLayerNames:function(matPoints){
        let layers=[];
        for(let i=0;i<matPoints.length;i++){
            layers.push("Patha" + i);
        }
        return layers;
    },

    // generateTextDrawingDataNoForcing:function(animableText,textWidth,textHeight,callback){
    //     let text=animableText.text;
    //     let svgCache=document.createElement("div");
    //     svgCache.id="container";
    //     document.body.appendChild(svgCache)
    //     new Vara("#container","http://localhost:3000/font.json",[{
    //         text:text,
    //         letterSpacing:-10
    //     }],{
    //         fontSize:46
    //     });
    //
    //     flatten(svgCache);
    //
    //     let s = new XMLSerializer();
    //     let str = s.serializeToString(svgCache);
    //     svgCache.remove();
    //     new SVGManager().loadSVGFromString(str,textWidth,textHeight,'no-force',callback)
    //
    // }
    generateTextDrawingDataNoForcing:function(animableText,textWidth,textHeight,callback){
        let svgManager=new SVGManager;
        svgManager.fetchTextSVGData(animableText,function(responseSVG){
            svgManager.calcDrawingDataFromString_forcePaths(responseSVG,textWidth,textHeight,0,callback);
        })

    },
    generateTextBaseImage:function(animableText){
        let dimX=animableText.getWidthInDrawingCache();
        let dimY=animableText.getHeightInDrawingCache();
        this.auxCanvasForTexts.setWidth(dimX);
        this.auxCanvasForTexts.setHeight(dimY);
        let tmpText=new fabric.Text(animableText.text,{
            left:0,
            top:5,
            fontFamily:animableText.fontFamily,
            fontSize:animableText.fontSize
        });
        this.auxCanvasForTexts.add(tmpText);
        let image=new Image();
        image.src=this.auxCanvasForTexts.toDataURL({
            format: 'png',
        });
        this.auxCanvasForTexts.clear();
        return image;
    }
});
