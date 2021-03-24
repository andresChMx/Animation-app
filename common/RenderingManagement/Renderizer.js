let Renderizer=fabric.util.createClass({
    initialize:function(){
        //https://stackoverflow.com/questions/13294919/can-you-stream-images-to-ffmpeg-to-construct-a-video-instead-of-saving-them-t  -> solo ser cambio el codec de mjpeg a png, mejor calidad. Tambien se cambio el container de avi a mp4.
        this.command=spawn('ffmpeg',["-y",'-f','image2pipe','-vcodec', 'png','-r','64','-i','-','-vcodec', 'mpeg4','-q:v', '5', '-r', '64','output.mp4']);


        this.command.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        this.command.stdout.on('close', (data) => {
            console.log(`Termino se ejecutarse el comando`);
        });
        this.command.stderr.on('data', (data) => {
            console.error(`grep stderr: ${data}`);
        });

    },
    writeCanvasToCommand:function(canvas,callback){
        var stream = canvas.createPNGStream();
        stream.on('data', function(chunk) {
            this.command.stdin.write(chunk);
        });
        stream.on('end',function(){
            callback && callback();
        })
    },
    finish:function(){
        this.command.stdin.end();
    }
})