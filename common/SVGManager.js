var SVGManager=fabric.util.createClass({
    initialize:function (){

        this.listParser=new SVGParser();
    },
    loadSVG:function(url,imgWidth,imgHeight,callback){

        let self=this;
        this.imgWidth=imgWidth;
        this.imgHeight=imgHeight;
        let result= {
            points: [],
            linesWidths:[],
            pathsNames:[],
            strokesTypes: [],
            ctrlPoints:[]
        }
        let layerIndex=-1;
        fabric.loadSVGFromURL(url, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            console.log(obj);
            if(obj.type==="path"){
                self.listParser.parseSinglePath(obj,result,layerIndex,self.imgWidth,self.imgHeight);
            }else if(obj.type==="group"){
                self.parseFabricGroup.bind(self)(obj,result,layerIndex);
            }
            callback(result);
        });
    },
    parseFabricGroup:function(group,result,layerIndex){

        let groupElems=group.getObjects();
        for(let i=0;i<groupElems.length;i++){
            console.log(groupElems[i].type);
            if(groupElems[i].type==="path"){
                layerIndex=this.listParser.parseSinglePath(groupElems[i],result,layerIndex,this.imgWidth,this.imgHeight);
            }
        }
    },
    parseSinglePath:function(pathArray){
    }

});
var SVGParser=fabric.util.createClass({
    initialize:function(){
    this.imgWidth;
    this.imgHeight
    },
    parsePathArray:function(){

    },
    parseSinglePath: function(pathObj,result,layerIndex,imgWidth,imgHeight) {
        let fliX=pathObj.flipX?-1:1;
        let fliY=pathObj.flipY?-1:1;
        this.imgWidth=imgWidth/pathObj.scaleX*fliX;
        this.imgHeight=imgHeight/pathObj.scaleY*fliY;
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

            if(pathObj.flipX){
                l=this.imgWidth;
            }
            if(pathObj.flipY){
                t=this.imgHeight
            }

        for (var i = 0, len =pathObj.path.length; i < len; ++i) {
            current =pathObj.path[i];
            switch (current[0]) { // first letter

                case 'l': // lineto, relative
                    x += current[1];
                    y += current[2];

                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'L': // lineto, absolute
                    x = current[1];
                    y = current[2];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'h': // horizontal lineto, relative
                    x += current[1];
                    ctx.lineTo(x + l, y + t);
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'H': // horizontal lineto, absolute
                    x = current[1];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'v': // vertical lineto, relative
                    y += current[1];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'V': // verical lineto, absolute
                    y = current[1];
                    result.strokesTypes[layerIndex].push("l");
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(-1,-1,-1,-1);
                    break;

                case 'm': // moveTo, relative
                    x += current[1];
                    y += current[2];
                    subpathStartX = x;
                    subpathStartY = y;
                    layerIndex++;
                    result.strokesTypes.push([]);
                    result.points.push([(x + l)/this.imgWidth,(y+t)/this.imgHeight]);
                    result.ctrlPoints.push([]);
                    if(pathObj.stroke && pathObj.strokeWidth){
                        result.linesWidths.push(current.strokeWidth/this.imgWidth);
                    }else{
                        result.linesWidths.push(50/this.imgWidth);
                    }
                    result.pathsNames.push("Path " +layerIndex)

                    break;

                case 'M': // moveTo, absolute
                    x = current[1];
                    y = current[2];
                    subpathStartX = x;
                    subpathStartY = y;
                    layerIndex++;
                    result.strokesTypes.push([]);
                    result.points.push([(x + l)/this.imgWidth,(y+t)/this.imgHeight]);
                    result.ctrlPoints.push([]);
                    if(pathObj.stroke && pathObj.strokeWidth){
                        result.linesWidths.push(pathObj.strokeWidth/this.imgWidth);
                    }else{
                        result.linesWidths.push(50/this.imgWidth);
                    }
                    result.pathsNames.push("Path " +layerIndex)

                    break;

                case 'c': // bezierCurveTo, relative
                    tempX = x + current[5];
                    tempY = y + current[6];
                    controlX = x + current[3];
                    controlY = y + current[4];

                    result.strokesTypes[layerIndex].push("c");
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (x + current[1] + l)/this.imgWidth,
                            (y + current[2] + t)/this.imgHeight,
                                (controlX + l)/this.imgWidth,
                                    (controlY + t)/this.imgHeight
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
                    result.points[layerIndex].push((x + l)/this.imgWidth,(y+t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (current[1] + l)/this.imgWidth,
                            (current[2] + t )/this.imgHeight,
                                (controlX + l )/this.imgWidth,
                                    (controlY + t)/this.imgHeight
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
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/this.imgWidth,
                            (controlY + t )/this.imgHeight,
                                (x + current[1] + l)/this.imgWidth,
                                    (y + current[2] +t )/this.imgHeight
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
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/this.imgWidth,
                            (controlY + t)/this.imgHeight,
                                (current[1] + l)/this.imgWidth,
                                    (current[2] +t )/this.imgHeight
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
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/this.imgWidth,
                            (controlY + t)/this.imgHeight,
                                (-1)/this.imgWidth,
                                    (-1)/this.imgHeight
                    );
                    x = tempX;
                    y = tempY;
                    break;

                case 'Q': // quadraticCurveTo, absolute
                    tempX = current[3];
                    tempY = current[4];


                    result.strokesTypes[layerIndex].push("q");
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (current[1] + l)/this.imgWidth,
                            (current[2] + t)/this.imgHeight,
                                (-1)/this.imgWidth,
                                    (-1)/this.imgHeight
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
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/this.imgWidth,
                            (controlY + t)/this.imgHeight,
                                (-1)/this.imgWidth,
                                    (-1)/this.imgHeight
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
                    result.points[layerIndex].push((tempX + l)/this.imgWidth,(tempY + t)/this.imgHeight);
                    result.ctrlPoints[layerIndex].push(
                        (controlX + l)/this.imgWidth,
                            (controlY + t)/this.imgHeight,
                                (-1)/this.imgWidth,
                                    (-1)/this.imgHeight
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
        }
        return layerIndex;
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
}
})