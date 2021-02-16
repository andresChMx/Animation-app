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
        let db=firebase.firestore(appImageAssets.symbols);
        return db.collection("assets_images").add(doc);
    },
    getCollectionImagesAssetsWithLimit:function(image_category){
        let db=firebase.firestore(appImageAssets[image_category]);
        var query = db.collection("assets_images")
            .orderBy("name")
            .limit(2000);
        return query.get().then(function(documents){
            return documents.docs;
        });
    },
    // getUnsplashImageByCategory:function(image_category){
    //     return fetch('https://api.unsplash.com/search/photos?per_page=20&page=1&query=' +image_category,{
    //         method: 'GET',
    //         headers:{
    //             Authorization:"Client-ID gOUrrohaPV7U-niVpa-h6fvcxpIRlfnCCYYBOxX8Xgg"
    //         }
    //     }).then(function(response){
    //         return response.json();
    //     })
    // },
    getUnsplashImagesBySearch:function(provider,search,category,pageNumber){
        if(provider==="unsplash"){
            let url;
            if(search==="" && category===""){
                url='https://api.unsplash.com/photos?per_page=20' + "&page=" + pageNumber;
            }else{
                url='https://api.unsplash.com/search/photos?per_page=20&query=' + category + " " + search + "&page=" + pageNumber;
            }
            return fetch(url,{
                method: 'GET',
                headers:{
                    Authorization:"Client-ID QQmyUrAS1cohjKsY_QffE9It1YWX-bkSdOgYLdIa2kw"
                }
            }).then(function(response){
                return response.json();
            }).then(function(data){
                console.log(data);
                let readyModel;
                if(search==="" && category===""){
                    readyModel=data.map(function(value,index){ // simulating the true structure of the data retrived from "database"
                        return {id:"1",url_thumbnail:value.urls.thumb,url_image:value.urls.regular,user_id:"",category:"",name:""}
                    });
                }else{
                    readyModel=data.results.map(function(value,index){ // simulating the true structure of the data retrived from "database"
                        return {id:"1",url_thumbnail:value.urls.thumb,url_image:value.urls.regular,user_id:"",category:"",name:""}
                    });
                }

                return readyModel;
            })
        }else if(provider==="pixabay"){
            let url;
            if(search===""){
                url="https://pixabay.com/api/?key=20037884-4e79307345d2c17fae1b64e13&image_type=vector&per_page=20&page=" + pageNumber;
            }else{
                url="https://pixabay.com/api/?key=20037884-4e79307345d2c17fae1b64e13&image_type=vector&per_page=20&page=" + pageNumber + "&q=" + search;
            }
            return fetch(url,{
                method: 'GET',
            }).then(function(response){
                return response.json();
            }).then(function(data){
                console.log(data);
                let readyModel=data.hits.map(function(value,index){ // simulating the true structure of the data retrived from "database"
                    return {id:"1",url_thumbnail:value.previewURL,url_image:value.largeImageURL,user_id:"",category:"",name:""}
                });
                return readyModel;
            })
        }

    },
    fetchShapeAssets:function(category,pageNumber){
        //{vectorURL:"url...svg",category:"arrows"}
        let dummyData=[{vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1612833730/oficial/vg9xszhe1ztxwyuez02n.svg",thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1612833730/oficial/vg9xszhe1ztxwyuez02n.svg",category:"arrow"},
            {vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1613355595/jb12u4diyhq5ydqgrk6z.svg",thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1613355595/jb12u4diyhq5ydqgrk6z.svg",category:"bubble"}];
        return new Promise(function(resolutionFunc,rejectionFunc){
            resolutionFunc(dummyData);
        });
    }
}