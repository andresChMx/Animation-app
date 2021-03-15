var PanelHome={
    HTMLElement:null,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-home__filter");
        this.HTMLcloseBtn=document.querySelector(".panel-home__header__btn-close");

        this.HTMLInputFile=this.HTMLElement.querySelector("#input-load-project")
        this.fileReader=new FileReader();
        this.initEvents();

    },
    initEvents:function(){
        this.HTMLcloseBtn.addEventListener("click",this.OnBtnCloseClicked.bind(this));
        this.HTMLInputFile.addEventListener("change",this.OnInputLoadFileChange.bind(this))

        this.fileReader.onload=this.OnFileReaderLoad.bind(this)
    },
    showModal:function(){
        this.HTMLElement.style.display="block";
    },
    hiddeModel:function(){
        this.HTMLElement.style.display="none";
    },
    OnBtnCloseClicked:function(){
        this.hiddeModel();
    },
    OnInputLoadFileChange:function(e){
        let file=e.target.files[0];
        if(this._getFileExtension(file.name)!=="acm") {
            alert("not allowed file type");
            e.target.value="";
        }
        else{
            this.fileReader.readAsText(file);//this  triggers OnFileReaderLoad
        }
    },
    OnFileReaderLoad:function(e){
        let contents=e.target.result;
        CanvasManager.loadFromJSON(contents);
        this.hiddeModel();
        this.HTMLInputFile.value="";
    },
    _getFileExtension:function(filename){
        return /[^.]+$/.exec(filename)[0];
    }
};