// const fabric = require('fabric').fabric;
// const Blob = require('node-blob');
// var createObjectURL = require('create-object-url');

var applyViewboxTransform=function(element){/*modificado de: applyViewboxTransform() */ /*obtener dimensiones reales de svg, ya que las dimenciones dadas por el tag html <img> son muy diferentes a las dadas por fabric,
por lo que conclui que las dimenciones reales las halla fabric, es asi que de esta funcion se conservo solo lo que permite calcular las dimenciones reales del svg, esto es usado por
NetworkManager.loadSVG , la cual fue a su vez modificada de fabric.util.loadSVGFromURL, para que una vez cargada la iamgen,
se modifique el codigo svg para pasar las dimenciones como atributos, y de esta forma el tag <img> usa esas dimenciones, las cuale son las reales.
En conclusion, esta funcion calcula las dimenciones reales de la imagen svg*/
    var reViewBoxAttrValue = new RegExp(
        '^' +
        '\\s*(' + fabric.reNum + '+)\\s*,?' +
        '\\s*(' + fabric.reNum + '+)\\s*,?' +
        '\\s*(' + fabric.reNum + '+)\\s*,?' +
        '\\s*(' + fabric.reNum + '+)\\s*' +
        '$'
    );
    let parseUnit = fabric.util.parseUnit;
    var viewBoxAttr = element.getAttribute('viewBox'),
        scaleX = 1,
        scaleY = 1,
        minX = 0,
        minY = 0,
        viewBoxWidth, viewBoxHeight, matrix, el,
        widthAttr = element.getAttribute('width'),
        heightAttr = element.getAttribute('height'),
        x = element.getAttribute('x') || 0,
        y = element.getAttribute('y') || 0,
        preserveAspectRatio = element.getAttribute('preserveAspectRatio') || '',
        missingViewBox = (!viewBoxAttr || !fabric.svgViewBoxElementsRegEx.test(element.nodeName)
            || !(viewBoxAttr = viewBoxAttr.match(reViewBoxAttrValue))),
        missingDimAttr = (!widthAttr || !heightAttr || widthAttr === '100%' || heightAttr === '100%'),
        toBeParsed = missingViewBox && missingDimAttr,
        parsedDim = { }, translateMatrix = '', widthDiff = 0, heightDiff = 0;

    parsedDim.width = 0;
    parsedDim.height = 0;
    parsedDim.toBeParsed = toBeParsed;

    if (toBeParsed) {
        return parsedDim;
    }

    if (missingViewBox) {
        parsedDim.width = parseUnit(widthAttr);
        parsedDim.height = parseUnit(heightAttr);
        return parsedDim;
    }
    minX = -parseFloat(viewBoxAttr[1]);
    minY = -parseFloat(viewBoxAttr[2]);
    viewBoxWidth = parseFloat(viewBoxAttr[3]);
    viewBoxHeight = parseFloat(viewBoxAttr[4]);
    parsedDim.minX = minX;
    parsedDim.minY = minY;
    parsedDim.viewBoxWidth = viewBoxWidth;
    parsedDim.viewBoxHeight = viewBoxHeight;
    if (!missingDimAttr) {
        parsedDim.width = parseUnit(widthAttr);
        parsedDim.height = parseUnit(heightAttr);
        scaleX = parsedDim.width / viewBoxWidth;
        scaleY = parsedDim.height / viewBoxHeight;
    }
    else {
        parsedDim.width = viewBoxWidth;
        parsedDim.height = viewBoxHeight;
    }
    return parsedDim
};


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
        let dummyData=[{vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/y63j3k3b7qtavvpsi0om.svg",thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/y63j3k3b7qtavvpsi0om.svg",category:"arrow", data:"<svg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' width='2480px' height='3508px' version='1.1' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'\n" +
                "     viewBox='0 0 2480 3507'\n" +
                "     xmlns:xlink='http://www.w3.org/1999/xlink'>\n" +
                " <g id='Capa_x0020_1'>\n" +
                "  <path fill='none' stroke='#373435' stroke-width='31' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='22.9256' d='M496 2126l744 0 0 372 744 -744 -744 -744 0 372 -744 0 0 744zm372 0m372 187m372 -187m0 -744m-372 -187m-372 187m-372 372'/>\n" +
                " </g>\n" +
                "</svg>\n"},

            {vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/qc0r0ngshysmncu9nnhm.svg",thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/qc0r0ngshysmncu9nnhm.svg",category:"arrow", data:"<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <circle fill=\"none\" stroke=\"#373435\" stroke-width=\"31\" stroke-miterlimit=\"22.9256\" cx=\"1240\" cy=\"1754\" r=\"737\"/>\n" +
                    " </g>\n" +
                    "</svg>"},
            {
                vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/rdeodwyju03y6pnfyrsp.svg",
                thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/rdeodwyju03y6pnfyrsp.svg",
                data:"<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <path fill=\"none\" stroke=\"#373435\" stroke-width=\"25\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"22.9256\" d=\"M1078 2476l325 0 0 -559 559 0 0 -325 -559 0 0 -559 -325 0 0 559 -559 0 0 325 559 0 0 559zm162 0m162 -278m278 -278m278 -162m-278 -162m-278 -278m-162 -278m-162 278m-278 278m-278 162m278 162m278 278\"/>\n" +
                    " </g>\n" +
                    "</svg>\n"
            },
            {
                vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/ipxmeqzcjylvawchvl8d.svg",
                thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/ipxmeqzcjylvawchvl8d.svg",
                data:"<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <path fill=\"none\" stroke=\"#373435\" stroke-width=\"31\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"22.9256\" d=\"M503 1016c491,1106 984,-737 1475,369 0,369 0,737 0,1106 -491,-1106 -984,737 -1475,-369 0,-369 0,-737 0,-1106z\"/>\n" +
                    " </g>\n" +
                    "</svg>"
            },
            {
                vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/rssoit8z66k6njf1huoo.svg",
                thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/rssoit8z66k6njf1huoo.svg",
                data:"\n" +
                    "<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <path fill=\"none\" stroke=\"#373435\" stroke-width=\"31\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"22.9256\" d=\"M1240 1704c0,-53 -41,-97 -91,-97 -50,0 -91,44 -91,97 0,106 81,194 181,194 100,0 181,-87 181,-194 0,-159 -122,-291 -272,-291 -150,0 -272,131 -272,291 0,216 162,387 366,387 200,0 366,-175 366,-387 0,-269 -203,-484 -456,-484 -250,0 -456,219 -456,484 0,322 244,581 547,581 303,0 547,-259 547,-581 0,-375 -284,-678 -637,-678 -353,0 -637,303 -637,678 0,428 325,778 728,778 403,0 728,-347 728,-778\"/>\n" +
                    " </g>\n" +
                    "</svg>\n"
            },
            {
                vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/itfjwriuqwkcljmet8sy.svg",
                thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066453/shapeThumbnails/itfjwriuqwkcljmet8sy.svg",
                data:"<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <rect fill=\"none\" stroke=\"#373435\" stroke-width=\"31\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"22.9256\" x=\"493\" y=\"1007\" width=\"1494\" height=\"1494\"/>\n" +
                    " </g>\n" +
                    "</svg>\n"
            },
            {
                vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066455/shapeThumbnails/cj10kbiay6si0p8snrj7.svg",
                thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066455/shapeThumbnails/cj10kbiay6si0p8snrj7.svg",
                data:"<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <polygon fill=\"none\" stroke=\"#373435\" stroke-width=\"31\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"22.9256\" points=\"1240,1069 1409,1594 1959,1591 1515,1916 1684,2438 1240,2113 796,2438 965,1916 521,1591 1071,1594 \"/>\n" +
                    " </g>\n" +
                    "</svg>\n"
            },
            {
                vectorUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066455/shapeThumbnails/vn0ytqf7cjtjq6w5bobi.svg",
                thumbnailUrl:"https://res.cloudinary.com/dfr41axmh/image/upload/v1614066455/shapeThumbnails/vn0ytqf7cjtjq6w5bobi.svg",
                data:"\n" +
                    "<svg xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\" width=\"2480px\" height=\"3508px\" version=\"1.1\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"\n" +
                    "viewBox=\"0 0 2480 3507\"\n" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                    " <g id=\"Capa_x0020_1\">\n" +
                    "  <path fill=\"none\" stroke=\"#373435\" stroke-width=\"31\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"22.9256\" d=\"M515 1029l1453 1453 -1453 0 0 -1453zm728 728m0 728m-728 -728\"/>\n" +
                    " </g>\n" +
                    "</svg>\n"
            }
        ];
        return new Promise(function(resolutionFunc,rejectionFunc){
            resolutionFunc(dummyData);
        });
    },

    loadImage:function(url,oldImage=null){// esta opcion genera una imagne apartir de una url a un svg, ademas retorna el string svg para evitar tener que hacer otra peticion para parcear la imagen svg a fabric object
        return new Promise(function(resolve, reject){
            let img;
            if(oldImage){
                img=oldImage;
            }else{
                img=new Image();
            }
            img.crossOrigin="anonymous"
            img.onload=function(){
                resolve(img);
            }
            img.onerror=function(){
                reject();
            }
            img.src=url;
        })
    },
    loadSVG:function(url,callback){/*modification of fabric.loadSVGFromURL*/
        url = url.replace(/^\n\s*/, '').trim();
        new fabric.util.request(url, {
            method: 'get',
            onComplete: onComplete
        });
        let self=this;
        function onComplete(r) {
            if(r.status===200){
                var xml = r.responseXML;
                let svg = r.response;
                let blob = new Blob([svg], {type: 'image/svg+xml'});

                let url=null;
                if(global.browserBehaviour.createObjectURL){
                    url = URL.createObjectURL(blob);
                }else{
                    url = createObjectURL(blob)
                }
                let image=fabric.util.createImage();
                image.src=url;
                image.onload=function(){

                    let dimmension=applyViewboxTransform(xml.documentElement); // calculando dimencioens reales del svg
                    //establenciendo las dimenciones halladas en el codigo svg, para que cuando se cree una Imagen() a partir de
                    //ese codigo se haga con las dimenciones correctas, ya que si no hacemos esto, las dimenciones se calcularan
                    //de otra manera que aun no se como, pero no coincidiran con las de fabric, las cuales si son correctas
                    xml.documentElement.setAttribute("width",dimmension.width);
                    xml.documentElement.setAttribute("height",dimmension.height);
                    //generando imagen a partir de svg string con modificado (dimenciones establecidas)
                    let newSvgString=(new XMLSerializer).serializeToString(xml.documentElement);
                    blob = new Blob([newSvgString], {type: 'image/svg+xml'});

                    if(global.browserBehaviour.createObjectURL){
                        url = URL.createObjectURL(blob);
                    }else{
                        url = createObjectURL(blob)
                    }

                    image.src=url;
                    image.onload=function(){
                        callback(newSvgString,image,false);
                    }
                }
            }else{
                callback(null,null,true)
            }


        }
    }
}
function createObjectURL(blob){
    var mime = 'image/svg+xml';
    var encoding = 'base64';
    var data = blob.buffer.toString(encoding);
    var uri = 'data:' + mime + ';' + encoding + ',' + data;
    return uri;
}