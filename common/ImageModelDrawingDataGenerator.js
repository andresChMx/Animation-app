var ImageModelDrawingDataGenerator=fabric.util.createClass({
    initialize:function(){
        this.canvasElem=document.createElement("canvas");
        this.canvasElem.id="auxCanvas"
        // this.auxCanvasForTexts=new fabric.StaticCanvas("auxCanvas");
        this.auxCanvasForTexts=document.createElement("canvas");
        this.auxCanvasForTextsContext=this.auxCanvasForTexts.getContext("2d");
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
        let imageWidth=imageDrawingData.imgHigh.naturalWidth;
        let imageHeight=imageDrawingData.imgHigh.naturalHeight;

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

    // text related
    generateTextDrawingData:function(animableText,imgWidth,imgHeight,pathOpenTypeObjects){
        let coords=this.getLeftTopLines(animableText);
        let commandsPath=[];
        for(let i=0;i<animableText.textLines.length;i++){
            let openTypePath=OpenTypeFontManager.GeneratePath(FontsFileName[animableText.fontFamily],animableText.fontSize,coords[i].left,coords[i].top,animableText.textLines[i]);
            commandsPath.push(openTypePath.commands);
            pathOpenTypeObjects.push(openTypePath);
        }

        var current, // current instruction
            subpathStartX = 0,
            subpathStartY = 0,
            x = 0, // current x
            y = 0, // current y
            controlX = 0, // current control point x
            controlY = 0, // current control point y
            tempX,
            tempY,
            l = 0,
            t = 0;

          let result={
              strokesTypes:[],
              points:[],
              ctrlPoints:[],
              linesWidths:[],
              pathsNames:[]
          }
          let layerIndex=-1;


            for(let p=0;p<commandsPath.length;p++) {
                layerIndex++;
                result.strokesTypes.push([]);
                result.points.push([]);
                result.ctrlPoints.push([]);
                result.linesWidths.push(1);
                result.pathsNames.push("Path " +layerIndex);
                for (let i = 0; i < commandsPath[p].length; i++) {
                    let current = Object.values(commandsPath[p][i]);
                    switch (current[0]) { // first letter
                        case 'L': // lineto, absolute
                            x = current[1];
                            y = current[2];
                            result.strokesTypes[layerIndex].push("l");
                            result.points[layerIndex].push((x + l) / imgWidth, (y + t) / imgHeight);
                            result.ctrlPoints[layerIndex].push(-1, -1, -1, -1);
                            break;
                        case 'M': // moveTo, absolute
                            x = current[1];
                            y = current[2];
                            subpathStartX = x;
                            subpathStartY = y;

                            result.points[layerIndex].push((x + l) / imgWidth, (y + t) / imgHeight);
                            if (i !== 0) {
                                result.strokesTypes[layerIndex].push("m");
                                result.ctrlPoints[layerIndex].push(-1, -1, -1, -1);
                            } else {

                            }
                            break;
                        case 'C': // bezierCurveTo, absolute
                            x = current[5];
                            y = current[6];
                            controlX = current[3];
                            controlY = current[4];
                            result.strokesTypes[layerIndex].push("c");
                            result.points[layerIndex].push((x + l) / imgWidth, (y + t) / imgHeight);
                            result.ctrlPoints[layerIndex].push(
                                (current[1] + l) / imgWidth,
                                (current[2] + t) / imgHeight,
                                (controlX + l) / imgWidth,
                                (controlY + t) / imgHeight
                            );
                            break;
                        case 'Q': // quadraticCurveTo, absolute
                            tempX = current[3];
                            tempY = current[4];


                            result.strokesTypes[layerIndex].push("q");
                            result.points[layerIndex].push((tempX + l) / imgWidth, (tempY + t) / imgHeight);
                            result.ctrlPoints[layerIndex].push(
                                (current[1] + l) / imgWidth,
                                (current[2] + t) / imgHeight,
                                (-1) / imgWidth,
                                (-1) / imgHeight
                            );
                            x = tempX;
                            y = tempY;
                            controlX = current[1];
                            controlY = current[2];
                            break;
                        case 'z':
                        case 'Z':
                            x = subpathStartX;
                            y = subpathStartY;
                            break;
                    }
                }
            }
          return result;
    },
    generateTextBaseImage:function(animableText,openTypePaths){
        let dimX=animableText.getWidthInDrawingCache();
        let dimY=animableText.getHeightInDrawingCache();
        this.auxCanvasForTexts.width=dimX;
        this.auxCanvasForTexts.height=dimY;
        // let tmpText=new fabric.Text(animableText.text,{
        //     left:0,
        //     top:0,
        //     textAlign:animableText.textAlign,
        //     lineHeight:animableText.lineHeight,
        //     fontFamily:animableText.fontFamily,
        //     fontSize:animableText.fontSize,
        //     fill:animableText.fill,
        //
        //     originX:"left",
        //     originY:"top",
        // });
        // this.auxCanvasForTexts.add(tmpText);
        for(let i=0;i<openTypePaths.length;i++){
            openTypePaths[i].draw(this.auxCanvasForTextsContext);

            this.auxCanvasForTextsContext.fillStyle=animableText.fill;
            this.auxCanvasForTextsContext.fill();

        }


        let image=new Image();
        image.src=this.auxCanvasForTexts.toDataURL();
        this.auxCanvasForTextsContext.clearRect(0,0,dimX,dimY);
        return image;
    },
    getLeftTopLines:function(animableText){
        let OBJ=animableText;
        let POS=[];
        var lineHeights = 0, left = 0, top = 0;
        let offsets = this._applyPatternGradientTransform(OBJ.fill);

        for (var i = 0, len1 = OBJ._textLines.length; i < len1; i++) {
            let lineIndex=i;
            let line=OBJ._textLines[i];
            var heightOfLine = OBJ.getHeightOfLine(lineIndex),
                maxHeight = heightOfLine / OBJ.lineHeight,
                leftOffset = OBJ._getLineLeftOffset(lineIndex);
/////////
            let leftTemp=left + leftOffset-offsets.offsetX;
            let topTemp=top+lineHeights+maxHeight-offsets.offsetY;

            var lineHeight = OBJ.getHeightOfLine(lineIndex),
                isJustify = OBJ.textAlign.indexOf('justify') !== -1,
                actualStyle,
                nextStyle,
                charsToRender = '',
                charBox,
                boxWidth = 0,
                timeToRender,
                shortCut = true;

            topTemp -= lineHeight * OBJ._fontSizeFraction / OBJ.lineHeight;
            if (shortCut) {
                // render all the line in one pass without checking
                let positions=this._renderChar(animableText,'fillText', lineIndex, 0, OBJ.textLines[lineIndex], leftTemp, topTemp, lineHeight);
                POS.push(positions);
            }
            lineHeights += heightOfLine;
        }
        return POS;
    },
    _applyPatternGradientTransform: function(filler) {
        if (!filler || !filler.toLive) {
            return { offsetX: 0, offsetY: 0 };
        }
        var offsetX = -this.width / 2 + filler.offsetX || 0,
            offsetY = -this.height / 2 + filler.offsetY || 0;

        return { offsetX: offsetX, offsetY: offsetY };
    },
    _renderChar: function(animableText,method,lineIndex, charIndex, _char, left, top) {
        var decl = animableText._getStyleDeclaration(lineIndex, charIndex),
            fullDecl = animableText.getCompleteStyleDeclaration(lineIndex, charIndex),
            shouldFill = method === 'fillText' && fullDecl.fill;

        if (!shouldFill) {
            return;
        }

        if (decl && decl.deltaY) {
            top += decl.deltaY;
        }

        return {left:left,top:top};
    },
});
