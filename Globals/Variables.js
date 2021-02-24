var IMAGE_UPLOAD_APIS_URLS=["https://api.cloudinary.com/v1_1/dhc21c3yy/image/upload"];
var CLOUDINARY_PRESET_NAME="nkq5azoh";
var USER_ID="5RUawVPijiUA7yHmwJFnWhkQDhH3";
//FontsName
var FontsNames={ //serves as the truth source of the names of fonts
    "AlegreyaSans":"AlegreyaSans",
    "Alice":"Alice",
    "Amita":"Amita",
    "BadScript":"BadScript",
    "BalooDa2":"BalooDa2",
    "Caveat":"Caveat",
    "Changa":"Changa",
    "CormorantInfant":"CormorantInfant",
    "GothicA1":"GothicA1",
    "HindSiliguri":"HindSiliguri",
    "Kalam":"Kalam",
    "Lobster":"Lobster",
    "Pacifico":"Pacifico"
}
var FontsFileName={ // allows as to get the name file of the font in the server from the font name
    "AlegreyaSans":'AlegreyaSans-Regular.ttf',
    "Alice":"Alice-Regular.ttf",
    "Amita":"Amita-Regular.ttf",
    "BadScript":"BadScript-Regular.ttf",
    "BalooDa2":"BalooDa2-Regular.ttf",
    "Caveat":"Caveat-Regular.ttf",
    "Changa":"Changa-Regular.ttf",
    "CormorantInfant":"CormorantInfant-Medium.ttf",
    "GothicA1":"GothicA1-Medium.ttf",
    "HindSiliguri":"HindSiliguri-Medium.ttf",
    "Kalam":"Kalam-Regular.ttf",
    "Lobster":"Lobster-Regular.ttf",
    "Pacifico":"Pacifico-Regular.ttf",

}

const EntranceName={/*Entrance modes are only applicable to Scene objects (ImageAnimable, TextAnimable, CameraAnimable)*/
    image_drawn:"ImageDrawn",
    dragged:"Dragged",
    none:"None",

    svg_drawn:"SVGDrawn",

    text_drawn:"TextDrawn",
    text_typed:"TextTyped"
}
var DrawingDataType={/*DrawingDataTypes are used when an object has entreancemode drawn or text_drawn*/
    PROVIDED:"PROVIDED",
    CREATED_PATHLOADED:"CREATED_PATHLOADED",
    CREATED_PATHDESIGNED:"CREATED_PATHDESIGNED",
    CREATED_NOPATH:"CREATED_NOPATH"
}
var TextType={
    PROVIDED:'PROVIDED'
}
var AnimObjectOptionMenu={
    duplicate:"duplicate",
    delete:"delete",
    removeMask:"removeMask",
    addMask:"addMask",
}
/*RUTES*/
var RUTES={
    assets_images:"assets/images/"
}

/*Styling variables*/
let CSS_VARIABLE={
    PanelAnimationHeight:225
}