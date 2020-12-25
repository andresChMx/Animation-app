let ModalUploadImage={
    name:'SectionUplaodImage',
    events:{

    },
    parentClass:null,

    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-assets__modal-upload-image");
        this.HTMLFormUploader=document.querySelector(".panel-assets__modal-upload-image__form-uploader");
        this.HTMLFormFileInput=this.HTMLFormUploader.querySelector('.form-uploader__input-file');
        this.HTMLCloseBtn=document.querySelector(".panel-assets__modal-upload-image__btn-close");
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLFormUploader.addEventListener("submit",this.OnFormUploaderSubmit.bind(this));
        this.HTMLCloseBtn.addEventListener("click",this.OnCloseButtonClicked.bind(this));
    },
    OnCloseButtonClicked:function(e){
        this.hiddeModal();
    },
    /*
    OnFormUploaderSubmit:function(e){

        let self=this;
        e.preventDefault();
        let collectionNewDocs=[];
        NetworkManager.UploadImageFile(this.HTMLFormFileInput.files)
            .then(function(data){
                // let jsonData=data.map(function(value,index){
                //     return JSON.parse(value).url;
                // })
                // console.log(jsonData);
                // return;
                for(let i=0;i<data.length;i++){
                    if(data[i]!==undefined){
                        let jsonData=JSON.parse(data[i]);
                        if(jsonData.error){
                            alert(jsonData.error.message);
                        }else{
                            console.log(jsonData.url);
                            let newDoc={
                                id:"",
                                url_image:jsonData.url,
                                url_thumbnail:"",
                                user_id:USER_ID,
                                category:"uploaded",
                            }
                            collectionNewDocs.push(newDoc);
                            //TODO: notification,taibmen en el bloque if positivo
                        }
                    }else{
                        alert("Error trying to upload an image");
                    }
                }
                if(collectionNewDocs.length>0){
                    let promises=[];
                    for(let i=0;i<collectionNewDocs.length;i++){
                        promises.push(
                            NetworkManager.insertToFirestoreImageAsset(collectionNewDocs[i])
                            .then(function(docRef) {
                                return docRef.id;
                            })
                            .catch(function(error) {
                                return error;
                            })
                        );
                    }
                    return Promise.all(promises).then(function(data){
                        return data;
                    })
                }

            })
            .then(function(listDocsIds){
                self.parentClass.childNotificationOnImageAssetDBInserted(collectionNewDocs,listDocsIds);
                self.hiddeModal();
            })
            .catch(function(err){
                console.log(err);
                self.hiddeModal();
            })

    },
    */


    OnFormUploaderSubmit:function(e){
        e.preventDefault();
        let promises=[];
        for(let i=0;i<parts.length;i++){
            promises.push(
                NetworkManager.insertToFirestoreImageAsset(parts[i])
                    .then(function(docRef) {
                        return docRef.id;
                    })
                    .catch(function(error) {
                        return error;
                    })
            );
        }
        Promise.all(promises).then(function(data){
            console.log(data);
        })
    },
    showModal:function(){
        this.HTMLElement.parentNode.style.display="block";
    },
    hiddeModal:function(){
        this.HTMLElement.parentNode.style.display="none";
        this.clearInputFile(this.HTMLFormFileInput);
    },
    clearInputFile(f){
    if(f.value){
        try{
            f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
        }catch(err){ }
        if(f.value){ //for IE5 ~ IE10
            var form = document.createElement('form'),
                parentNode = f.parentNode, ref = f.nextSibling;
            form.appendChild(f);
            form.reset();
            parentNode.insertBefore(f,ref);
        }
    }
}
}
let SectionImageAssets={

    HTMLElement:null,
    HTMLDummyAssetDrag:null,
    HTMLItemMenu:null,

    isItemPressed:false,
    isItemBtnActive:false,

    lastModelOnItemMenuBtnClicked:null,
    lastModelOnItemDragged:null,
    baseUrl:"https://res.cloudinary.com/dswkzmiyh",
    //https://www.alamy.com/happy-family-with-young-children-hand-drawn-doodle-vector-illustration-sketch-drawing-family-isolated-on-white-background-young-family-with-son-and-daughter-image344422627.html
    MODELItemAssets:[
        {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603391302/700_FO49918911_12cfed34802ecb4daaa7a7b7fddd464d_w2lfrh.jpg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
    ],
    //state:imported-empty,imported-designed,ours, bitmap-empty,bitmap-designed,svg-emtpy,svg-designed,svg-custom,
    MODELItemMenuOptions:[
        {
            label:"Delete Asset",
            action:function(){
                let self=SectionImageAssets;
                console.log("de elimino asert");
            }
        }
    ],
    listAssets:ko.observableArray([]),
    parentClass:null,

    ModalUploadImage:ModalUploadImage,
    init:function(parentClass){

        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-assets__sections-container__section-image");
        this.HTMLDummyAssetDrag=document.querySelector(".section-image-assets__dummy-drag-asset");
        this.HTMLItemMenu=document.querySelector(".section-image-assets__item__menu-options");
        this.HTMLBtnUploadImageAsset=document.querySelector(".panel-assets__section-image__box-options__btn-add-image");

        this.HTMLMenuCategories=document.querySelector(".panel-assets__section-image__box-options__second-row__menu-categories");
        this.HTMLMenuCategoriesControlButtons=this.HTMLMenuCategories.querySelectorAll("button");
        this.HTMLMenuCategoriesListCategories=this.HTMLMenuCategories.querySelectorAll("li");
        this.HTMLMenuCategoriesSelectedOption=null;
        this.selectMenuCategoriesOption(this.HTMLMenuCategoriesListCategories[0]);

        this.generateImageAssets(this.MODELItemAssets);
        this.generateHTMLMenuOptionsCollection(this.MODELItemMenuOptions);
        this.initEvents();

        /*setting up DOM elemes*/
        this.HTMLMenuCategories.style.paddingLeft=this.HTMLMenuCategoriesControlButtons[0].offsetWidth +"px";

        this.HTMLDummyAssetDrag.style.width=this.HTMLElement.children[0].offsetWidth + "px";
        this.HTMLDummyAssetDrag.style.height=this.HTMLElement.children[0].offsetWidth + "px";

        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseDown(this);
        WindowManager.registerOnMouseMove(this);

        this.ModalUploadImage.init(this);
    },
    initEvents:function(){
        this.HTMLBtnUploadImageAsset.addEventListener("click",this.OnButtonAddImageClicked.bind(this))
        /*menu categories*/
        this.HTMLMenuCategoriesControlButtons[0].addEventListener("click",this.OnMenuCategoriesControlButtonsPressed.bind(this));
        this.HTMLMenuCategoriesControlButtons[1].addEventListener("click",this.OnMenuCategoriesControlButtonsPressed.bind(this));

        for(let i=0;i<this.HTMLMenuCategoriesListCategories.length;i++){
            this.HTMLMenuCategoriesListCategories[i].addEventListener("click",this.OnMenuCategoriesOptionClicked.bind(this));
        }
        },
    generateHTMLMenuOptionsCollection:function(MODEL){
        for(var i=0;i<MODEL.length;i++){
            let btnOpt=document.createElement("div");
            btnOpt.classList.add("section-image-assets__item__menu-options__option");
            btnOpt.setAttribute("name",i);
            btnOpt.textContent=MODEL[i].label;
            this.HTMLItemMenu.append(btnOpt);
            btnOpt.addEventListener("mouseup",this.OnItemMenuOptionMouseUp);
        }
    },
    generateImageAssets:function(MODEL){
        for(var i=0;i<MODEL.length;i++){
            let asset=new AssetImage(MODEL[i],this);
            this.listAssets.push(asset);
        }
    },
    setPositionHTMLDummyAsset:function(x,y){
        let self=SectionImageAssets;
        self.HTMLDummyAssetDrag.style.left=x-self.HTMLDummyAssetDrag.offsetWidth/2 + "px";
        self.HTMLDummyAssetDrag.style.top=y-self.HTMLDummyAssetDrag.offsetWidth/2+ "px";
    },
    setPositionHTMLItemMenu:function(x,y){
        let self=SectionImageAssets;
        self.HTMLItemMenu.style.left=x+ 10 + "px";
        self.HTMLItemMenu.style.top=y+10 + "px";
    },
    hiddeHTMLItemMenu:function(){
        let self=SectionImageAssets;
        self.HTMLItemMenu.style.display="none";
        self.setPositionHTMLItemMenu(-200,-200);
    },
    hiddeHTMLDummyAsset:function(){
        let self=SectionImageAssets;
        self.setPositionHTMLDummyAsset(-200,-200);
        self.HTMLDummyAssetDrag.style.display="none";
    },
    selectMenuCategoriesOption:function(HTML_LI_Option){
        if(this.HTMLMenuCategoriesSelectedOption){
            this.HTMLMenuCategoriesSelectedOption.classList.remove("active");
        }
        HTML_LI_Option.classList.add("active");
        this.HTMLMenuCategoriesSelectedOption=HTML_LI_Option;
    },
    OnItemMenuOptionMouseUp:function(e){
        let self=SectionImageAssets;
        let indexModelOptions=parseInt(e.target.getAttribute("name"));
        self.MODELItemMenuOptions[indexModelOptions].action(self.lastModelOnItemMenuBtnClicked);

        self.hiddeHTMLItemMenu();
    },
    OnButtonAddImageClicked:function(){
        this.ModalUploadImage.showModal();
    },
    OnMenuCategoriesControlButtonsPressed:function(e){
        if(e.target.id==="control-left"){
            this.HTMLMenuCategories.parentNode.scrollLeft-=50;
        }else if(e.target.id==="control-right"){
            this.HTMLMenuCategories.parentNode.scrollLeft+=50;
        }
        if(this.HTMLMenuCategories.parentNode.scrollLeft>this.HTMLMenuCategories.parentNode.scrollWidth){
            this.HTMLMenuCategories.parentNode.scrollLeft=this.HTMLMenuCategories.parentNode.scrollWidth;
        }
        this.HTMLMenuCategoriesControlButtons[0].style.left=this.HTMLMenuCategories.parentNode.scrollLeft + "px";
        this.HTMLMenuCategoriesControlButtons[1].style.right=-this.HTMLMenuCategories.parentNode.scrollLeft + "px";
        },
    OnMenuCategoriesOptionClicked:function(e){
        this.selectMenuCategoriesOption(e.target);
        NetworkManager.getCollectionImagesAssetsWithLimit(e.target.getAttribute("value")).then(function(docs){
           let mappedDocs=docs.map(function(value,index){
               return value.data();
           })
           console.log(mappedDocs);
           this.MODELItemAssets=mappedDocs;
           this.listAssets([]);
           this.generateImageAssets(this.MODELItemAssets);
        }.bind(this));
    },
    notificationOnMouseUp:function(){
        let self=SectionImageAssets;

        if(self.isItemPressed){
            self.hiddeHTMLDummyAsset();
            self.notifyOnDummyDraggingEnded();
        }
        self.isItemPressed=false;
    },
    notificationOnMouseMove:function(){
        let self=SectionImageAssets;
        if(self.isItemPressed){
            self.setPositionHTMLDummyAsset(WindowManager.mouse.x,WindowManager.mouse.y);
        }
    },
    notificationOnMouseDown:function(e){
        let self=SectionImageAssets;
        let classAssetMenuOption="section-image-assets__item__menu-options__option"
        if(e.target.className!==classAssetMenuOption){
            if(self.isItemBtnActive){
                self.hiddeHTMLItemMenu();
            }
        }

    },
    childNotificationOnAssetDraggingStarted:function(model){
        let self=SectionImageAssets;
        self.lastModelOnItemDragged=model;
        self.isItemPressed=true;
        self.HTMLDummyAssetDrag.style.display="block";
    },
    childNotificationOnAssetMenuPressed:function(model){
        let self=SectionImageAssets;
        self.lastModelOnItemMenuBtnClicked=model
        self.isItemBtnActive=false;//lock
        setTimeout(()=>{self.isItemBtnActive=true},100);
        self.HTMLItemMenu.style.display="block";
        self.setPositionHTMLItemMenu(WindowManager.mouse.x,WindowManager.mouse.y);
    },
    childNotificationOnImageAssetDBInserted:function(collectionNewDocs,listDocsId){
        //CONVERTING ENTITY TO TDO
        if(collectionNewDocs.length>0){
            let mappedDocs=collectionNewDocs.map(function(value,index){
                return {
                    id:listDocsId[index],
                    url:value.url,
                    userid:value.userid
                };
            })
            this.generateImageAssets(mappedDocs);
        }
    },
    notifyOnDummyDraggingEnded:function(){
        this.parentClass.childNotificationOnImageAssetDummyDraggingEnded(this.lastModelOnItemDragged);
    },

}
var PanelAssets={
    name:'PanelAssets',
    events:{
        OnImageAssetDummyDraggingEnded:'OnImageAssetDummyDraggingEnded',
    },
    HTMLElement:null,
    htmlElementNormalHeight:0,
    SectionImageAssets:SectionImageAssets,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-assets");
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);

        this.SectionImageAssets.init(this);
    },
    notificationPanelDesignerOptionsOnSettingActionClicked:function(){
        this.HTMLElement.style.height=this.htmlElementNormalHeight;
    },
    childNotificationOnImageAssetDummyDraggingEnded:function(lastModelOnItemDragged){
        MainMediator.notify(this.name,this.events.OnImageAssetDummyDraggingEnded,[lastModelOnItemDragged]);
    }
}


var AssetImage=function(model,parentClass){
    this.HTMLElement=null;
    this.HTMLDraggable=null;
    this.HTMLBtnMenu=null;

    this.model=null;

    this.observerOnDraggingStarted=[];
    this.observerOnMenuPressed=[];
    this.parentClass=null;
    this.constructor=function(){
        this.model=model;
        this.parentClass=parentClass;
    }
    this.koBindingSetupHTML=function(HTMLContainer){
        this.HTMLElement=HTMLContainer;
        this.HTMLElement.style.height=this.HTMLElement.offsetWidth + "px";
        this.HTMLDraggable=this.HTMLElement.children[0];
        this.HTMLBtnMenu=this.HTMLElement.children[0].children[1];

        //TODO: Quitar el campo imgHigh del DTO para convertirlo en entity para subirlo a la db
        this.HTMLDraggable.children[0].ondragstart=function(){return false;}
        this.HTMLDraggable.addEventListener("mousedown",this.OnMouseDown.bind(this));
    }
    this.OnMouseDown=function(e){
        if(e.target===this.HTMLDraggable || e.target===this.HTMLDraggable.children[0]){
            this.notifyOnDraggingStarted();
        }
        else if(e.target===this.HTMLBtnMenu){
            this.notifyOnMenuPressed();
        }
    }
    this.notifyOnDraggingStarted=function(){
        this.parentClass.childNotificationOnAssetDraggingStarted(this.model);
    }
    this.notifyOnMenuPressed=function(){
        this.parentClass.childNotificationOnAssetMenuPressed(this.model);
    }
    this.constructor();
}
var AssetAudio=function(){

};
ko.bindingHandlers.setupEvents={
    init:function(element,valueAccesor,allBindings){
        valueAccesor();
    }
}
ko.applyBindings(SectionImageAssets);