function Save(){
    //saving other things
    //saving image models -> collection: images
    // for i in imagesModels
    //      if(imagesModels[i].paths.type==ImageType.CREATED_NO_PATH){
    //          NOTHING
    //      }
    //      else if(imagesModels[i].paths.type==ImageType.CREATED_PATHDESIGNED || CREATED_PATHLOADED){
    //          SAVING ALL FIELDS
    //      }
}
var NetworkManager={
    UploadImageFile:function(files){
            let promises=[];
            const formData = new FormData();
            let url=IMAGE_UPLOAD_APIS_URLS[Math.floor(Math.random()*IMAGE_UPLOAD_APIS_URLS.length)];
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                formData.append("file", file);
                formData.append("upload_preset", CLOUDINARY_PRESET_NAME);

                promises.push(
                    fetch(url, {
                        method: "POST",
                        body: formData
                    })
                        .then((response) => {
                            return response.text();
                        })
                        .then((data) => {
                            return data
                        })
                        .catch((err)=>{

                        })
                )
            }

            return Promise.all(promises).then(function(data){
                return data;
            })
    },
    CreateUser:function(email,password){
        const auth=firebase.auth();
        const promise=auth.createUserWithEmailAndPassword(email,password);
        return promise
            .then(function(userData){return userData})
            .catch(function(e){return e;});
    },
    LoginUser:function(email,password){
        const auth=firebase.auth();
        const promise=auth.signInWithEmailAndPassword(email,password);
        return promise
            .then(function(userData){return userData})
            .catch(function(e){return e;});
    },
    insertImageAsset:function(docs){
        let db= firebase.firestore();
        let batch=window.db.batch();

        docs.forEach(function(doc){
            batch.set(db.collection("assets_image").doc(),doc);
        })
        return batch.commit().then(function(data){
            console.log(data);
            return data;
        }).catch(function(err){
            return err;
        })
    },
    insertToFirestoreImageAsset:function(doc){
        let db=firebase.firestore(appImageAssets.characters);
        return db.collection("assets_images").add(doc);
    },
    getCollectionImagesAssetsWithLimit:function(image_category){
        let db=firebase.firestore(appImageAssets[image_category]);
        var query = db.collection("assets_images")
            .orderBy("name")
            .limit(50);
        return query.get().then(function(documents){
            return documents.docs;
        });
    }
}