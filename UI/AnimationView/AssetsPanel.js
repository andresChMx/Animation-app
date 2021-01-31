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
var ModalLoadURLImage={
    HTMLElement:null,
  HTMLBtnClose:null,
  HTMLBtnAccept:null,
  HTMLBtnCancel:null,
  HTMLInputURL:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-assets__modal-load-url-image__filter");
        this.HTMLBtnClose=this.HTMLElement.querySelector(".modal__header__btn-close-modal");
        this.HTMLBtnAccept=this.HTMLElement.querySelector(".btn-accept");
        this.HTMLBtnCancel=this.HTMLElement.querySelector(".btn-cancel");

        this.HTMLInputURL=this.HTMLElement.querySelector(".panel-assets__modal-load-url-image__body input")
        this.initEvents();
    },
    initEvents:function(){
        this.HTMLBtnClose.addEventListener("click",this.OnBtnClose.bind(this));
        this.HTMLBtnAccept.addEventListener("click",this.OnBtnAccept.bind(this));
        this.HTMLBtnCancel.addEventListener("click",this.OnBtnCancel.bind(this));
        },
    OnBtnClose:function(){
        this.HTMLElement.style.display="none";
    },
    OnBtnAccept:function(){
        let fieldValue=this.HTMLInputURL.value;
        let urls=fieldValue.split(",");
        for(let i=0;i<urls.length;i++){
            console.log(urls[i]);
            this.parentClass.childNotificationOnImageURLLoaded(urls[i]);
        }
        this.HTMLElement.style.display="none";
    },
    OnBtnCancel:function(){
        this.HTMLElement.style.display="none";

    },
    showModal:function(){
        this.HTMLElement.style.display="block";
    }
};
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
    listAssetsPerPageCant:20,
    listAssetsPageNumber:1,
    lastSearch:"",
    lastCategory:"",
    lastProvider:"unsplash", //unsplash, pixabay

    parentClass:null,

    ModalUploadImage:ModalUploadImage,
    ModalLoadURLImage:ModalLoadURLImage,
    init:function(parentClass){

        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-assets__sections-container .section-assets.image");

        this.HTMLDummyAssetDrag=document.querySelector(".section-image-assets__dummy-drag-asset");
        this.HTMLDummyAssetDrag.style.width=200 + "px";
        this.HTMLDummyAssetDrag.style.height=200 + "px";

        this.HTMLItemMenu=document.querySelector(".section-image-assets__item__menu-options");
        this.HTMLBtnUploadImageAsset=document.querySelector(".section-assets.images .section-assets__box-options__first-row .btn-add-image");
        this.HTMLFieldSearch=document.querySelector(".section-assets.images .section-assets__box-options__first-row .search-field-box");

        this.HTMLMenuCategories=document.querySelector(".section-assets.images .section-assets__box-options__second-row__menu-categories");
        this.HTMLMenuCategoriesControlButtons=this.HTMLMenuCategories.querySelectorAll("button");
        this.HTMLMenuCategoriesListCategories=this.HTMLMenuCategories.querySelectorAll("li");
        this.HTMLMenuCategoriesSelectedOption=null;

        this.HTMLBtnLoadMore=document.querySelector(".section-assets.images .section-assets__btn-load-more");
        this.generateImageAssets(this.MODELItemAssets);
        this.generateHTMLMenuOptionsCollection(this.MODELItemMenuOptions);
        this.initEvents();

        /*setting up DOM elemes*/
        this.HTMLMenuCategories.style.paddingLeft=this.HTMLMenuCategoriesControlButtons[0].offsetWidth +"px";


        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseDown(this);
        WindowManager.registerOnMouseMove(this);

        //this.ModalUploadImage.init(this);
        this.ModalLoadURLImage.init(this);

        // simulating clicking in first category (all)
        this.selectMenuCategoriesOption(this.HTMLMenuCategoriesListCategories[0]);
        this.lastProvider="unsplash";
        this.lastSearch="";
        this.lastCategory="";
        NetworkManager.getUnsplashImagesBySearch(this.lastProvider,this.lastSearch,this.lastCategory,this.listAssetsPageNumber).then(function(data){
            this.MODELItemAssets=data;
            this.listAssets([]);
            this.generateImageAssets(this.MODELItemAssets);
        }.bind(this));
    },
    initEvents:function(){
        this.HTMLBtnUploadImageAsset.addEventListener("click",this.OnButtonAddImageClicked.bind(this))
        this.HTMLFieldSearch.querySelector("button").addEventListener("click",this.OnSearchFieldBtnClicked.bind(this))
        /*menu categories*/
        this.HTMLMenuCategoriesControlButtons[0].addEventListener("click",this.OnMenuCategoriesControlButtonsPressed.bind(this));
        this.HTMLMenuCategoriesControlButtons[1].addEventListener("click",this.OnMenuCategoriesControlButtonsPressed.bind(this));

        for(let i=0;i<this.HTMLMenuCategoriesListCategories.length;i++){
            this.HTMLMenuCategoriesListCategories[i].addEventListener("click",this.OnMenuCategoriesOptionClicked.bind(this));
        }
        this.HTMLBtnLoadMore.addEventListener("click",this.OnBtnLoadMore.bind(this))
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
        this.ModalLoadURLImage.showModal();
        // this.ModalUploadImage.showModal();
    },
    OnSearchFieldBtnClicked:function(e){
        let htmlTarget=this.HTMLFieldSearch.querySelector("input");
        this.lastSearch=htmlTarget.value;
        this.listAssetsPageNumber=1;
        NetworkManager.getUnsplashImagesBySearch(this.lastProvider,this.lastSearch,this.lastCategory,this.listAssetsPageNumber).then(function(data){
            this.MODELItemAssets=data;
            this.listAssets([]);
            this.generateImageAssets(this.MODELItemAssets);

            if(this.listAssets().length>=this.listAssetsPerPageCant){//The button "Looad More" will only be shown if there are more than the mininum quantity of images loaded
                this.HTMLBtnLoadMore.style.display="block";
            }else{
                this.HTMLBtnLoadMore.style.display="none";
            }
        }.bind(this));

        htmlTarget.value="";


    },
    OnMenuCategoriesControlButtonsPressed:function(e){
        if(e.target.id==="control-left"){
            this.HTMLMenuCategories.parentNode.scrollLeft-=70;
        }else if(e.target.id==="control-right"){
            this.HTMLMenuCategories.parentNode.scrollLeft+=70;
        }
        if(this.HTMLMenuCategories.parentNode.scrollLeft>this.HTMLMenuCategories.parentNode.scrollWidth){
            this.HTMLMenuCategories.parentNode.scrollLeft=this.HTMLMenuCategories.parentNode.scrollWidth;
        }
        this.HTMLMenuCategoriesControlButtons[0].style.left=this.HTMLMenuCategories.parentNode.scrollLeft + "px";
        this.HTMLMenuCategoriesControlButtons[1].style.right=-this.HTMLMenuCategories.parentNode.scrollLeft + "px";
        },
    OnMenuCategoriesOptionClicked:function(e){
        this.selectMenuCategoriesOption(e.target);
        this.listAssetsPageNumber=1;
        this.lastSearch="";
        let category=e.target.getAttribute("value");
        this.lastCategory=category;
        if(category==="vector"){
            this.lastProvider="pixabay"
        }else{
            this.lastProvider="unsplash"
        }
        NetworkManager.getUnsplashImagesBySearch(this.lastProvider,this.lastSearch,this.lastCategory,this.listAssetsPageNumber).then(function(data){
            this.MODELItemAssets=data;
            this.listAssets([]);
            this.generateImageAssets(this.MODELItemAssets);

            if(this.listAssets().length>=this.listAssetsPerPageCant){//The button "Looad More" will only be shown if there are more than the mininum quantity of images loaded
                this.HTMLBtnLoadMore.style.display="block";
            }else{
                this.HTMLBtnLoadMore.style.display="none";
            }
        }.bind(this));


        // NetworkManager.getCollectionImagesAssetsWithLimit(e.target.getAttribute("value")).then(function(docs){
        //    let mappedDocs=docs.map(function(value,index){
        //        return value.data();
        //    })
        //    console.log(mappedDocs);
        //    this.MODELItemAssets=mappedDocs;
        //    this.listAssets([]);
        //    this.generateImageAssets(this.MODELItemAssets);
        // }.bind(this));
    },
    OnBtnLoadMore:function(e){

        this.listAssetsPageNumber++;
        NetworkManager.getUnsplashImagesBySearch(this.lastProvider,this.lastSearch,this.lastCategory,this.listAssetsPageNumber).then(function(data){
            this.generateImageAssets(data);
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
    childNotificationOnImageURLLoaded:function(url){
        this.parentClass.childNotificationOnImageURLLoaded(url);
    },
    notifyOnDummyDraggingEnded:function(){
        this.parentClass.childNotificationOnImageAssetDummyDraggingEnded(this.lastModelOnItemDragged);
    },

}
var SectionTextAssets={
    HTMLElement:null,
    HTMLDraggableElement:null,
    parentClass:null,
    listAssets:[],
    assetDragStarted:false,
    HTMLAssetBeenDragged:null,
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-assets__sections-container .section-assets.text");
        this.HTMLDraggableElement=document.querySelector(".section-text-assets__dummy-drag-asset")
        this.HTMLAssetPrefab=this.HTMLElement.querySelector(".text-asset");
        this.initListAssets();
        // registering as observer
        WindowManager.registerOnMouseMove(this);
        WindowManager.registerOnMouseUp(this);

    },
    initListAssets:function(){
        let htmlBoxAssets=this.HTMLElement.querySelector(".section-assets__box-assets");
        for(let i in FontsNames){
            let newAsset=this.HTMLAssetPrefab.cloneNode(true);
            newAsset.style.fontFamily=FontsNames[i];
            newAsset.addEventListener("mousedown",this.OnAssetDragStarted.bind(this));
            htmlBoxAssets.appendChild(newAsset);
        }
        this.HTMLAssetPrefab.style.display="none";
    },
    _moveDraggableTo(x,y){
        this.HTMLDraggableElement.style.left=x-this.HTMLDraggableElement.clientWidth/2 + "px";
        this.HTMLDraggableElement.style.top=y-this.HTMLDraggableElement.clientHeight/2 + "px";
    },
    OnAssetDragStarted:function(e){
        this.assetDragStarted=true;
        this.HTMLAssetBeenDragged=e.target;
    },

    notificationOnMouseMove:function(){
        if(this.assetDragStarted){
            this._moveDraggableTo(WindowManager.mouse.x,WindowManager.mouse.y)
        }
    },
    notificationOnMouseUp:function(){
        if(this.assetDragStarted){
            let fontFamily=getComputedStyle(this.HTMLAssetBeenDragged).getPropertyValue("font-family");
            console.log(fontFamily);
            this.parentClass.childNotificationOnTextAssetDraggableDropped(fontFamily);
            this.assetDragStarted=false;
        }
    }
};
var PanelAssets={
    name:'PanelAssets',
    events:{
        OnImageURLLoaded:'OnImageURLLoaded',
        OnImageAssetDummyDraggingEnded:'OnImageAssetDummyDraggingEnded',
        OnTextAssetDraggableDropped:'OnTextAssetDraggableDropped'
    },
    HTMLElement:null,
    HTMLCollMenuOptions:null,
    HTMLCollSectionsAssets:null,

    HTMLMenuOptionActive:null,
    HTMLSectionAssetActive:null,
    htmlElementNormalHeight:0,
    SectionImageAssets:SectionImageAssets,
    SectionTextAssets:SectionTextAssets,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-assets");
        this.HTMLCollMenuOptions=document.querySelector(".panel-assets__menu-sections").children;
        this.HTMLCollSectionsAssets=document.querySelector(".panel-assets__sections-container").children;
        this.htmlElementNormalHeight=this.HTMLElement.offsetHeight;
        MainMediator.registerObserver(PanelDesignerOptions.name,PanelDesignerOptions.events.OnSettingActionClicked,this);

        this.SectionImageAssets.init(this);
        this.SectionTextAssets.init(this);
        this.initEvents();

        /*Simulating click in first menu option*/
        this.OnMenuOptionClicked({target:this.HTMLCollMenuOptions[0]});
    },
    initEvents:function(){
        for (let i = 0; i <this.HTMLCollMenuOptions.length; i++) {
            this.HTMLCollMenuOptions[i].addEventListener("click",this.OnMenuOptionClicked.bind(this));
        }
    },
    OnMenuOptionClicked:function(e){
        let index=[].slice.call(this.HTMLCollMenuOptions).indexOf(e.target);
        if(index!==-1){
            if(this.HTMLMenuOptionActive!==null){
                this.HTMLMenuOptionActive.classList.remove("active");
            }

            this.HTMLMenuOptionActive=e.target;
            this.HTMLMenuOptionActive.classList.add("active");

            this._activeSectionAssets(index);
        }
    },
    _activeSectionAssets:function(index){
        if(this.HTMLSectionAssetActive!==null){
            this.HTMLSectionAssetActive.classList.remove("active");
        }
        this.HTMLSectionAssetActive=this.HTMLCollSectionsAssets[index];
        this.HTMLSectionAssetActive.classList.add("active");
    },
    notificationPanelDesignerOptionsOnSettingActionClicked:function(){
        this.HTMLElement.style.height=this.htmlElementNormalHeight;
    },

    childNotificationOnImageAssetDummyDraggingEnded:function(lastModelOnItemDragged){
        MainMediator.notify(this.name,this.events.OnImageAssetDummyDraggingEnded,[lastModelOnItemDragged]);
    },
    childNotificationOnTextAssetDraggableDropped:function(fontFamily){
        MainMediator.notify(this.name,this.events.OnTextAssetDraggableDropped,[fontFamily]);
    },

    childNotificationOnImageURLLoaded:function(url){
        MainMediator.notify(this.name,this.events.OnImageURLLoaded,[url]);
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