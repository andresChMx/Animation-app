var Utils={
    insertionSort:function(inputArr,numActiveFrames) {
        let n = numActiveFrames;
        for (let i = 1; i < n; i++) {
            // Choosing the first element in our unsorted subarray
            let current = inputArr[i];
            // The last element of our sorted subarray
            let j = i-1;
            while ((j > -1) && (current.timeLineTime < inputArr[j].timeLineTime)) {
                inputArr[j+1] = inputArr[j];
                j--;
            }
            inputArr[j+1] = current;
        }
        return inputArr;
    },
    rgbToHex:function(rgbColor){
        let reg=/\((\d+),(\d+),(\d+)\)/;

        let arrVals=rgbColor.match(reg);
        let rhex=parseInt(arrVals[1]).toString(16); rhex=rhex.length===1?"0"+rhex:rhex;
        let ghex=parseInt(arrVals[2]).toString(16); ghex=ghex.length===1?"0"+ghex:ghex;
        let bhex=parseInt(arrVals[3]).toString(16); bhex=bhex.length===1?"0"+bhex:bhex;

        return "#"+rhex+ghex+bhex;
    },

    isSVG:function(urlstring){
        const regex1 = RegExp('.svg$', 'i');
        return regex1.test(urlstring);
    },
    capitalize:function(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    },
    mobileAndTabletCheck:function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    },
}
var PathLength={
    calculate:function(pathOffsetX,pathOffsetY,path){
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
            l = -pathOffsetX,
            t = -pathOffsetY;
        let length=0;
        let previousPoint={x:0,y:0};
        for (var i = 0, len = path.length; i < len; ++i) {

            current = path[i];

            switch (current[0]) { // first letter

                case 'l': // lineto, relative
                    x += current[1];
                    y += current[2];

                    length+=this._calcLineLength(previousPoint.x,previousPoint.y,x+l,y+t);
                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'L': // lineto, absolute
                    x = current[1];
                    y = current[2];
                    length+=this._calcLineLength(previousPoint.x,previousPoint.y,x+l,y+t);
                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'h': // horizontal lineto, relative
                    x += current[1];
                    length+=this._calcLineLength(previousPoint.x,previousPoint.y,x+l,y+t);
                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'H': // horizontal lineto, absolute
                    x = current[1];
                    length+=this._calcLineLength(previousPoint.x,previousPoint.y,x+l,y+t);
                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'v': // vertical lineto, relative
                    y += current[1];
                    length+=this._calcLineLength(previousPoint.x,previousPoint.y,x+l,y+t);
                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'V': // verical lineto, absolute
                    y = current[1];
                    length+=this._calcLineLength(previousPoint.x,previousPoint.y,x+l,y+t);
                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'm': // moveTo, relative
                    x += current[1];
                    y += current[2];
                    subpathStartX = x;
                    subpathStartY = y;

                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'M': // moveTo, absolute
                    x = current[1];
                    y = current[2];
                    subpathStartX = x;
                    subpathStartY = y;

                    previousPoint.x=x+l;
                    previousPoint.y=y+t;
                    break;

                case 'c': // bezierCurveTo, relative
                    tempX = x + current[5];
                    tempY = y + current[6];
                    controlX = x + current[3];
                    controlY = y + current[4];
                    length+=this._calcBezierCurveLength(previousPoint.x,previousPoint.y,
                        x + current[1] + l, // x1
                        y + current[2] + t, // y1
                        controlX + l, // x2
                        controlY + t, // y2
                        tempX + l,
                        tempY + t
                    );

                    x = tempX;
                    y = tempY;

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
                    break;

                case 'C': // bezierCurveTo, absolute
                    x = current[5];
                    y = current[6];
                    controlX = current[3];
                    controlY = current[4];
                    length+=this._calcBezierCurveLength(previousPoint.x,previousPoint.y,
                        current[1] + l,
                        current[2] + t,
                        controlX + l,
                        controlY + t,
                        x + l,
                        y + t
                    );

                    previousPoint.x=x + l;
                    previousPoint.y=y + t;
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

                    length+=this._calcBezierCurveLength(previousPoint.x,previousPoint.y,
                        controlX + l,
                        controlY + t,
                        x + current[1] + l,
                        y + current[2] + t,
                        tempX + l,
                        tempY + t
                    );
                    // set control point to 2nd one of this command
                    // "... the first control point is assumed to be
                    // the reflection of the second control point on
                    // the previous command relative to the current point."
                    controlX = x + current[1];
                    controlY = y + current[2];

                    x = tempX;
                    y = tempY;

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
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
                    length+=this._calcBezierCurveLength(previousPoint.x,previousPoint.y,
                        controlX + l,
                        controlY + t,
                        current[1] + l,
                        current[2] + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;

                    // set control point to 2nd one of this command
                    // "... the first control point is assumed to be
                    // the reflection of the second control point on
                    // the previous command relative to the current point."
                    controlX = current[1];
                    controlY = current[2];

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
                    break;

                case 'q': // quadraticCurveTo, relative
                    // transform to absolute x,y
                    tempX = x + current[3];
                    tempY = y + current[4];

                    controlX = x + current[1];
                    controlY = y + current[2];

                    length+=this._calcQuadraticCurveLength(previousPoint.x,previousPoint.y,
                        controlX + l,
                        controlY + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
                    break;

                case 'Q': // quadraticCurveTo, absolute
                    tempX = current[3];
                    tempY = current[4];

                    length+=this._calcQuadraticCurveLength(previousPoint.x,previousPoint.y,
                        current[1] + l,
                        current[2] + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;
                    controlX = current[1];
                    controlY = current[2];

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
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

                    length+=this._calcQuadraticCurveLength(previousPoint.x,previousPoint.y,
                        controlX + l,
                        controlY + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
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
                    length+=this._calcQuadraticCurveLength(previousPoint.x,previousPoint.y,
                        controlX + l,
                        controlY + t,
                        tempX + l,
                        tempY + t
                    );
                    x = tempX;
                    y = tempY;

                    previousPoint.x=tempX + l;
                    previousPoint.y=tempY + t;
                    break;

                case 'a':
                    // TODO: optimize this
                    x += current[6];
                    y += current[7];
                    break;

                case 'A':
                    // TODO: optimize this
                    x = current[6];
                    y = current[7];
                    break;

                case 'z':
                case 'Z':
                    x = subpathStartX;
                    y = subpathStartY;
                    // length+=this._calcLineLength(previousPoint.x,previousPoint.y, subpathStartX,subpathStartY);
                    // previousPoint.x=subpathStartX;
                    // previousPoint.y=subpathStartY;
                    break;
            }
            previous = current;
        }
        return length;
    },
    _calcLineLength:function(p1x,p1y,p2x,p2y){
        let dx=p2x-p1x;
        let dy=p2y-p1y;
        return Math.sqrt(dx*dx + dy*dy);
    },
    _calcQuadraticCurveLength:function(x1,y1,x2,y2,x3,y3){
        var a, e, c, d, u, a1, e1, c1, d1, u1, v1x, v1y;
        v1x = x2 * 2;
        v1y = y2 * 2;
        d = x1 - v1x + x3;
        d1 = y1 - v1y + y3;
        e = v1x - 2 * x1;
        e1 = v1y - 2 * y1;
        c1 = (a = 4 * (d * d + d1 * d1));
        c1 += (b = 4 * (d * e + d1 * e1));
        c1 += (c = e * e + e1 * e1);
        c1 = 2 * Math.sqrt(c1);
        a1 = 2 * a * (u = Math.sqrt(a));
        u1 = b / u;
        a = 4 * c * a - b * b;
        c = 2 * Math.sqrt(c);
        return (a1 * c1 + u * b * (c1 - c) + a * Math.log((2 * u + u1 + c1) / (u1 + c))) / (4 * a1);
    },
    _calcBezierCurveLength:function(Ax,Ay,Bx,By,Cx,Cy,Dx,Dy,sampleCount){
        var ptCount=sampleCount||40;
        var totDist=0;
        var lastX=Ax;
        var lastY=Ay;
        var dx,dy;
        for(var i=1;i<ptCount;i++){
            var pt=this._cubicQxy(i/ptCount,Ax,Ay,Bx,By,Cx,Cy,Dx,Dy);
            dx=pt.x-lastX;
            dy=pt.y-lastY;
            totDist+=Math.sqrt(dx*dx+dy*dy);
            lastX=pt.x;
            lastY=pt.y;
        }
        dx=Dx-lastX;
        dy=Dy-lastY;
        totDist+=Math.sqrt(dx*dx+dy*dy);
        return (parseInt(totDist));
    },
    _cubicQxy:function(t,ax,ay,bx,by,cx,cy,dx,dy) {
        ax += (bx - ax) * t;
        bx += (cx - bx) * t;
        cx += (dx - cx) * t;
        ax += (bx - ax) * t;
        bx += (cx - bx) * t;
        ay += (by - ay) * t;
        by += (cy - by) * t;
        cy += (dy - cy) * t;
        ay += (by - ay) * t;
        by += (cy - by) * t;
        return({
            x:ax +(bx - ax) * t,
            y:ay +(by - ay) * t
        });
    },
}