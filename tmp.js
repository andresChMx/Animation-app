let prevIndexPathTurn=0;
let i=getNextPathListIndex(-1);
let j=0

let indexPathTurn=animTotalProgress/animPathDuration;

if(prevIndexPathTurn!=parseInt(indexPathTurn)){
    let cantJumps=parseInt(indexPathTurn)-prevIndexPathTurn;
    if(cantJumps>=2){
        for(let i=prevIndexPathTurn;i<prevIndexPathTurn+cantJumps;i++){
            //dibujar beziers o quadraticos
        }
    }
    prevIndexPathTurn=parseInt(indexPathTurn);
    let indexes=getNextPath(i,j,cantJumps);
    i=indexes[0];j=indexes[1];

}
//let pathIndexes=this.getPathByIndex(parseInt(pathDrawingTurn))


getNextPath:function(i,j,jumps){
    let lengthCurrentPath=this.canvasDesignerManager.listPoints[i].length;
    if(j<lengthCurrentPath-1-jumps){
        j+=jumps
        return [i,j];
    }else{
        let carry=(lengthCurrentPath-1)-j
        jumps-=carry;
        while(jumps>=0){
            i++;
            if(i>=this.canvasDesignerManager.listPoints.length){i=0;}
            let lengthCurrentPath=this.canvasDesignerManager.listPoints[i].length-1;
            if(lengthCurrentPath==-1){
                continue;
            }
            carry=jumps-lengthCurrentPath;  
            if(carry<0){
                j=jumps;
                break;
            }
            jumps=carry;
        }
    }
    return [i,j]
}
getNextPathListIndex:function(i){
    i++;
    if(i>=this.canvasDesignerManager.listPoints.length){return 0;}
    while(this.canvasDesignerManager.listPoints[i].length<2 ){
        i++;
        if(i>=this.canvasDesignerManager.listPoints.length){i=0;break;}
    }
    return i;
}

getPathByIndex:function(index){
    let i=0;
    let j=0;
    let counterPaths=0;
    for(i=0;i<index;i++){
        let tmpCant=this.canvasDesignerManager.listPoints[i].length;
        if(counterPaths+tmpCant>index){
            j=index-counterPaths;
            break;
        }
    }
    return {i:i,j:j}
}

//====================
let lastAnimPathLocalProgress=animTotalProgress%animPathDuration;
lastAnimPathLocalProgress=lastAnimPathLocalProgress/animPathDuration;

if(lastAnimPathLocalProgress<animPathLocalProgress){
    //siguiente path
    if(j<this.canvasDesignerManager.listPoints[i].length-2){
        j++;
    }else{
        i++;j=0;
        if(i>=this.canvasDesignerManager.listPoints.length){i=0;}
        while(this.canvasDesignerManager.listPoints[i].length<2 ){
            i++;
            if(i>=this.canvasDesignerManager.listPoints.length){i=0;break;}
        }
        //this.lastStateImageData=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
        this.prevPathSnapshot.src=this.canvas.toDataURL();
        this.ctx.beginPath();
        this.ctx.lineWidth=(this.canvasDesignerManager.listLinesWidths[i]/(this.canvasDesignerManager.canvasOriginalWidth/this.canvas.width))

        if(this.canvasDesignerManager.listPoints[i].length>0){
            this.ctx.moveTo(this.canvasDesignerManager.listPoints[i][0].get("left")/this.canvasDesignerManager.canvasOriginalWidth*this.canvas.width,this.canvasDesignerManager.listPoints[i][0].get("top")/this.canvasDesignerManager.canvasOriginalHeight*this.canvas.height);
        }
        /*this.ctx.moveTo();*/
    }
}