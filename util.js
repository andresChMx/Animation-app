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
    }
}
