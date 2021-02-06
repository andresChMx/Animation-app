var SVGManager=fabric.util.createClass({
    initialize:function (){
    },
    fetchTextSVGData:function(animableText,callback){
        let request={
            message: animableText.text,
            font_size:animableText.fontSize
        }
        fetch("https://wicked-nightmare-94207.herokuapp.com/",{
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(request),
        })  .then(response => response.json())
            .then(data => callback(data.response));
    },


    calcDrawingDataFromString_noForcePaths:function(string,imgWidth,imgHeight,callback){
        this.calcDrawingData(string,imgWidth,imgHeight,"no_force","string",callback)
    },
    calcDrawingDataFromString_forcePaths:function(string,imgWidth,imgHeight,strokeWidth,callback){
        this.calcDrawingData(string,imgWidth,imgHeight,"force_paths","string",callback,strokeWidth)
    },
    calcDrawingDataFromUrl_noForcePaths:function(url,imgWidth,imgHeight,callback){
        this.calcDrawingData(url,imgWidth,imgHeight,"no_force","url",callback)
    },
    calcDrawingDataFromUrl_forcePaths:function(url,imgWidth,imgHeight,strokeWidth,callback){
        this.calcDrawingData(url,imgWidth,imgHeight,"force_paths","url",callback,strokeWidth)
    },
    calcDrawingData:function(source,imgWidth,imgHeight,loadingMode,sourceType,callback,strokeWidth=2.5){
        let result= {
            points: [],
            linesWidths:[],
            pathsNames:[],
            strokesTypes: [],
            linesColors:[],
            ctrlPoints:[],
        }
        let f=function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            let listObjects=[]
            console.log(obj);
            if(obj.type==="path"){
                listObjects=[obj];
            }else if(obj.type==="group"){
                listObjects=obj.getObjects();
            }else{
                alert("ERROORR conocido: el objeto retornado por fabric es otra cosa no contemplada wdf" );
            }
            this.parseFabricGroup(listObjects,imgWidth,imgHeight,strokeWidth,loadingMode,result);
            callback(result);
        }.bind(this);

        if(sourceType==="url"){
            fabric.loadSVGFromURL(source,f);
        }else if(sourceType==="string"){
            fabric.loadSVGFromString(source,f);
        }


        /*
        fabric.loadSVGFromURLCustom(url, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);

            if(obj.type==="path"){
                self.parseFabricGroup.bind(self)([obj],result,layerIndex,loadingMode);
            }else if(obj.type==="group"){
                self.parseFabricGroup.bind(self)(obj.getObjects(),result,layerIndex,loadingMode);
            }
            callback(result);
        });
        */
    },

    /*METODOS PRIVADOS*/
    parseFabricGroup:function(group,imgWidth,imgHeight,strokeWidth,loadingMode,result){
        let layerIndex=-1;

        for(let i=0;i<group.length;i++){
            if(group[i].type==="path"){
               layerIndex=this.parsePath(group[i],imgWidth,imgHeight,strokeWidth,result,layerIndex,loadingMode);
            }
        }

        console.log(result);
    },
    utilParseArc :function(fx, fy, coords) {
        var rx = coords[0],
            ry = coords[1],
            rot = coords[2],
            large = coords[3],
            sweep = coords[4],
            tx = coords[5],
            ty = coords[6],
            segs = [[], [], [], []],
            segsNorm = this.arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

        for (var i = 0, len = segsNorm.length; i < len; i++) {
            segs[i][0] = segsNorm[i][0] + fx;
            segs[i][1] = segsNorm[i][1] + fy;
            segs[i][2] = segsNorm[i][2] + fx;
            segs[i][3] = segsNorm[i][3] + fy;
            segs[i][4] = segsNorm[i][4] + fx;
            segs[i][5] = segsNorm[i][5] + fy;
            ctx.bezierCurveTo.apply(ctx, segs[i]);
        }
    },
    arcToSegments:function (toX, toY, rx, ry, large, sweep, rotateX) {
        var argsString = _join.call(arguments);
        if (fabric.arcToSegmentsCache[argsString]) {
            return fabric.arcToSegmentsCache[argsString];
        }

        var PI = Math.PI, th = rotateX * PI / 180,
            sinTh = fabric.util.sin(th),
            cosTh = fabric.util.cos(th),
            fromX = 0, fromY = 0;

        rx = Math.abs(rx);
        ry = Math.abs(ry);

        var px = -cosTh * toX * 0.5 - sinTh * toY * 0.5,
            py = -cosTh * toY * 0.5 + sinTh * toX * 0.5,
            rx2 = rx * rx, ry2 = ry * ry, py2 = py * py, px2 = px * px,
            pl = rx2 * ry2 - rx2 * py2 - ry2 * px2,
            root = 0;

        if (pl < 0) {
            var s = Math.sqrt(1 - pl / (rx2 * ry2));
            rx *= s;
            ry *= s;
        }
        else {
            root = (large === sweep ? -1.0 : 1.0) *
                Math.sqrt( pl / (rx2 * py2 + ry2 * px2));
        }

        var cx = root * rx * py / ry,
            cy = -root * ry * px / rx,
            cx1 = cosTh * cx - sinTh * cy + toX * 0.5,
            cy1 = sinTh * cx + cosTh * cy + toY * 0.5,
            mTheta = calcVectorAngle(1, 0, (px - cx) / rx, (py - cy) / ry),
            dtheta = calcVectorAngle((px - cx) / rx, (py - cy) / ry, (-px - cx) / rx, (-py - cy) / ry);

        if (sweep === 0 && dtheta > 0) {
            dtheta -= 2 * PI;
        }
        else if (sweep === 1 && dtheta < 0) {
            dtheta += 2 * PI;
        }

        // Convert into cubic bezier segments <= 90deg
        var segments = Math.ceil(Math.abs(dtheta / PI * 2)),
            result = [], mDelta = dtheta / segments,
            mT = 8 / 3 * Math.sin(mDelta / 4) * Math.sin(mDelta / 4) / Math.sin(mDelta / 2),
            th3 = mTheta + mDelta;

        for (var i = 0; i < segments; i++) {
            result[i] = segmentToBezier(mTheta, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY);
            fromX = result[i][4];
            fromY = result[i][5];
            mTheta = th3;
            th3 += mDelta;
        }
        fabric.arcToSegmentsCache[argsString] = result;
        return result;
    },

    parsePath:function(pathObj,imgWidth,imgHeight,strokeWidth,result,layerIndex,loadingMode){
        if(loadingMode==="force_paths"){
            if(pathObj.hasOwnProperty("strokeWidth")){
                strokeWidth=pathObj.strokeWidth;
            }else{
                strokeWidth=strokeWidth;
            }
        }else{ // TODO: BORRAR ESTE ELSE
            if(pathObj.hasOwnProperty("strokeWidth")) {

                strokeWidth = pathObj.strokeWidth;
            }else{
                return layerIndex;
            }
        }



        let fliX=pathObj.flipX?-1:1;
        let fliY=pathObj.flipY?-1:1;
        imgWidth=imgWidth/pathObj.scaleX*fliX;
        imgHeight=imgHeight/pathObj.scaleY*fliY;
        var current, // current instruction
            previous = null,
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
        //l=pathObj.aCoords.tl.x/pathObj.scaleX,
        //t=pathObj.aCoords.tl.y/pathObj.scaleY;
        //l=-pathObj.pathOffset.x+pathObj.left/pathObj.scaleX +imgWidth/2,
        //t=-pathObj.pathOffset.y+pathObj.top/pathObj.scaleY +imgHeight/2;
        if(pathObj.flipX){
            l=imgWidth;
        }
        if(pathObj.flipY){
            t=imgHeight
        }


        layerIndex++;
        result.strokesTypes.push([]);
        result.points.push([]);
        result.ctrlPoints.push([]);
        result.linesWidths.push(strokeWidth/imgWidth);
        result.pathsNames.push("Path " +layerIndex);

        if(pathObj.fill){
            result.linesColors.push(pathObj.fill);
        }else if(pathObj.stroke){
            result.linesColors.push(pathObj.stroke);
        }else{
            result.linesColors.push("#000000");
        }

        for (var i = 0, len =pathObj.path.length; i < len; ++i) {
            current =pathObj.path[i];
            switch (current[0]) { // first letter

                case 'l': // lineto, relative
                    x += current[1];
                    y += current[2];

                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'L': // lineto, absolute
                    x = current[1];
                    y = current[2];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'h': // horizontal lineto, relative
                    x += current[1];

                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'H': // horizontal lineto, absolute
                    x = current[1];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'v': // vertical lineto, relative
                    y += current[1];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'V': // verical lineto, absolute
                    y = current[1];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'm': // moveTo, relative
                    x += current[1];
                    y += current[2];
                    subpathStartX = x;
                    subpathStartY = y;

                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    if(i!==0){
                        result.strokesTypes[layerIndex].push("m");
                        result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    }

                    break;

                case 'M': // moveTo, absolute
                    x = current[1];
                    y = current[2];
                    subpathStartX = x;
                    subpathStartY = y;

                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    if(i!==0){
                        result.strokesTypes[layerIndex].push("m");
                        result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    }

                    break;

                case 'c': // bezierCurveTo, relative
                    tempX = x + current[5];
                    tempY = y + current[6];
                    controlX = x + current[3];
                    controlY = y + current[4];

                    result.strokesTypes[layerIndex].push("c");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (x + current[1] + l)/imgWidth,
                        (y + current[2] + t)/imgHeight,
                        (controlX + l)/imgWidth,
                        (controlY + t)/imgHeight
                    );

                    x = tempX;
                    y = tempY;
                    break;

                case 'C': // bezierCurveTo, absolute
                    x = current[5];
                    y = current[6];
                    controlX = current[3];
                    controlY = current[4];
                    result.strokesTypes[layerIndex].push("c");
                    result.points[layerIndex].push((x + l)/imgWidth,(y+t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (current[1] + l)/imgWidth,
                        (current[2] + t )/imgHeight,
                        (controlX + l )/imgWidth,
                        (controlY + t)/imgHeight
                    );
                    break;

                case 's': // shorthand cubic bezierCurveTo, relative

                    // transform to absolute x,y
                    tempX = x + current[3];
                    tempY = y + current[4];

                    if (previous[0].match(/[CcSs]/) === null) {
                        // If there is no previous command or if the previous command was not a C, c, S, or s,
                        // the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control points
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }


                    result.strokesTypes[layerIndex].push("c");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/imgWidth,
                        (controlY + t )/imgHeight,
                        (x + current[1] + l)/imgWidth,
                        (y + current[2] +t )/imgHeight
                    );
                    // set control point to 2nd one of this command
                    // "... the first control point is assumed to be
                    // the reflection of the second control point on
                    // the previous command relative to the current point."
                    controlX = x + current[1];
                    controlY = y + current[2];

                    x = tempX;
                    y = tempY;
                    break;

                case 'S': // shorthand cubic bezierCurveTo, absolute
                    tempX = current[3];
                    tempY = current[4];
                    if (previous[0].match(/[CcSs]/) === null) {
                        // If there is no previous command or if the previous command was not a C, c, S, or s,
                        // the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control points
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }

                    result.strokesTypes[layerIndex].push("c");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/imgWidth,
                        (controlY + t)/imgHeight,
                        (current[1] + l)/imgWidth,
                        (current[2] +t )/imgHeight
                    );
                    x = tempX;
                    y = tempY;

                    // set control point to 2nd one of this command
                    // "... the first control point is assumed to be
                    // the reflection of the second control point on
                    // the previous command relative to the current point."
                    controlX = current[1];
                    controlY = current[2];

                    break;

                case 'q': // quadraticCurveTo, relative
                    // transform to absolute x,y
                    tempX = x + current[3];
                    tempY = y + current[4];

                    controlX = x + current[1];
                    controlY = y + current[2];


                    result.strokesTypes[layerIndex].push("q");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/imgWidth,
                        (controlY + t)/imgHeight,
                        (-1)/imgWidth,
                        (-1)/imgHeight
                    );
                    x = tempX;
                    y = tempY;
                    break;

                case 'Q': // quadraticCurveTo, absolute
                    tempX = current[3];
                    tempY = current[4];


                    result.strokesTypes[layerIndex].push("q");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (current[1] + l)/imgWidth,
                        (current[2] + t)/imgHeight,
                        (-1)/imgWidth,
                        (-1)/imgHeight
                    );
                    x = tempX;
                    y = tempY;
                    controlX = current[1];
                    controlY = current[2];
                    break;

                case 't': // shorthand quadraticCurveTo, relative

                    // transform to absolute x,y
                    tempX = x + current[1];
                    tempY = y + current[2];

                    if (previous[0].match(/[QqTt]/) === null) {
                        // If there is no previous command or if the previous command was not a Q, q, T or t,
                        // assume the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control point
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }

                    result.strokesTypes[layerIndex].push("q");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/imgWidth,
                        (controlY + t)/imgHeight,
                        (-1)/imgWidth,
                        (-1)/imgHeight
                    );
                    x = tempX;
                    y = tempY;

                    break;

                case 'T':
                    tempX = current[1];
                    tempY = current[2];

                    if (previous[0].match(/[QqTt]/) === null) {
                        // If there is no previous command or if the previous command was not a Q, q, T or t,
                        // assume the control point is coincident with the current point
                        controlX = x;
                        controlY = y;
                    }
                    else {
                        // calculate reflection of previous control point
                        controlX = 2 * x - controlX;
                        controlY = 2 * y - controlY;
                    }

                    result.strokesTypes[layerIndex].push("q");
                    result.points[layerIndex].push((tempX + l)/imgWidth,(tempY + t)/imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/imgWidth,
                        (controlY + t)/imgHeight,
                        (-1)/imgWidth,
                        (-1)/imgHeight
                    );
                    x = tempX;
                    y = tempY;
                    break;

                case 'a':
                    /*
                    // TODO: optimize this
                    this.utilParseArc(x + l, y + t, [
                        current[1],
                        current[2],
                        current[3],
                        current[4],
                        current[5],
                        current[6] + x + l,
                        current[7] + y + t
                    ]);
                    */

                    x += current[6];
                    y += current[7];
                    break;

                case 'A':
                    /*
                    // TODO: optimize this
                    this.utilParseArc(x + l, y + t, [
                        current[1],
                        current[2],
                        current[3],
                        current[4],
                        current[5],
                        current[6] + l,
                        current[7] + t
                    ]);

                     */
                    x = current[6];
                    y = current[7];
                    break;

                case 'z':
                case 'Z':
                    x = subpathStartX;
                    y = subpathStartY;
                    break;
            }
            previous = current;

            firstPathStroke=false;
        }
        return layerIndex;
    }

});
