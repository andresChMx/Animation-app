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
    OnFormUploaderSubmit:function(e){
        let self=this;
        e.preventDefault();
        let collectionNewDocs=[];
        NetworkManager.UploadImageFile(this.HTMLFormFileInput.files)
            .then(function(data){
                for(let i=0;i<data.length;i++){
                    if(data[i]!==undefined){
                        let jsonData=JSON.parse(data[i]);
                        if(jsonData.error){
                            alert(jsonData.error.message);
                        }else{
                            console.log(jsonData.url);
                            let newDoc={
                                id:"",
                                url:jsonData.url,
                                userid:USER_ID
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
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603343397/sample.jpg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348016/characters/man-chatting_tm5goo.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348017/characters/man-driving_apauqe.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348017/characters/man-flying_nn8kls.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348017/characters/man-travel-world_oyajkr.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348017/characters/woman-vacation_zglkwg.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348017/characters/man-pilot_i4ueol.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348322/school/book2_exm9ix.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348322/school/book_w9pqvy.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348322/school/laptop_uggkg9.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603348322/school/paper-plane_zmao5u.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347887/food/cangre_zw3xud.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347861/food/tomato_tf8ydk.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347600/food/bread_b3bevl.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347841/food/sandwich2_hfrzew.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347831/food/wine_yg6g9u.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347600/food/bread_b3bevl.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347598/food/uvo_koaxdq.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347598/food/water_dnnaa0.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347599/food/banana_dlyh07.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347597/food/pina_g1z6li.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347597/food/sandwich_soqxls.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347597/food/pear_xocq7t.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603347596/food/icecream_abwou8.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603778695/black_dll5gm.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235822/characters/suit-man-contract_oau3t6.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235822/characters/suit-man_cfadsx.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235822/characters/farmer-man_bgq1km.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235820/characters/suit-man-device_xiadim.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235820/characters/suit-woman_tbo2fm.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235820/characters/suit-woman-coffe_jovpzk.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235820/characters/suit-woman-waiting_ezof2s.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235819/characters/technical-man_phv6gs.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603235819/characters/air-attender-woman_vwv4gu.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603237231/characters/board-man-suit_x2llk5.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242016/characters/man-suit-green-crying_qup2ul.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242016/characters/man-suit-green-avoid_cfkrzi.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242014/characters/man-suit-green-thrilling_bxb3yb.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242013/characters/man-suit-green-fine_roqslv.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242014/characters/man-suit-idle_xuciwu.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242014/characters/man-suit-green-good_e3anur.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242013/characters/man-suit-green-doubt_j9yzvq.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242013/characters/man-suit-green-stop_omm0mw.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242845/signs/box_aaalib.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242845/signs/cross_zfek6m.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242845/signs/circle-check_afaqbo.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242843/signs/admiration_krsmcm.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242843/signs/question_wtweh5.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242842/signs/down-arrow_zvv3rm.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242843/signs/euro_fcy9nr.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242843/signs/statistics_o0qvas.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},
        // {url:"https://res.cloudinary.com/dswkzmiyh/image/upload/v1603242843/signs/avoid_hgarvs.svg",paths:{points:[],linesWidths:[],pathsNames:[],strokesTypes:[],duration:3000,ctrlPoints:[],type:ImageType.CREATED_NOPATH,delay:0}},

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
        this.HTMLElement=document.querySelector(".panel-assets__sections-container__section-image-assets");
        this.HTMLDummyAssetDrag=document.querySelector(".section-image-assets__dummy-drag-asset");
        this.HTMLItemMenu=document.querySelector(".section-image-assets__item__menu-options");
        this.HTMLBtnUploadImageAsset=document.querySelector(".panel-assets__buttons-add-resource__image-asset")
        this.generateImageAssets(this.MODELItemAssets);
        this.generateHTMLMenuOptionsCollection(this.MODELItemMenuOptions);
        this.initEvents();

        this.HTMLDummyAssetDrag.style.width=this.HTMLElement.children[0].offsetWidth + "px";
        this.HTMLDummyAssetDrag.style.height=this.HTMLElement.children[0].offsetWidth + "px";

        WindowManager.registerOnMouseUp(this);
        WindowManager.registerOnMouseDown(this);
        WindowManager.registerOnMouseMove(this);

        this.ModalUploadImage.init(this);
    },
    initEvents:function(){
        this.HTMLBtnUploadImageAsset.addEventListener("click",this.OnButtonAddImageClicked.bind(this))
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
    OnItemMenuOptionMouseUp:function(e){
        let self=SectionImageAssets;
        let indexModelOptions=parseInt(e.target.getAttribute("name"));
        self.MODELItemMenuOptions[indexModelOptions].action(self.lastModelOnItemMenuBtnClicked);

        self.hiddeHTMLItemMenu();
    },
    OnButtonAddImageClicked:function(){
        this.ModalUploadImage.showModal();
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

        this.model.imgHTML=this.HTMLDraggable.children[0];
        //TODO: Quitar el campo imgHTML del DTO para convertirlo en entity para subirlo a la db
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