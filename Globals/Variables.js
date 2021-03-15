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
    assets_images:"/assets/images/"
}

/*Styling variables*/
let CSS_VARIABLE={
    PanelAnimationHeight:225
}

/*Animations*/

/*LANENAME: se refiere los lanes pero de la parte UI
* PROPERTY: se refiere a los lanes pero del animator(al diccionario)
* UINAME: nombre que veran los usuarios
* */
let LANENAME_TO_UINAME={
    "position":"Position",
    "scale":"Scale",
    "rotation":"Rotation",
    "opacity":"Opacity",
    "border_width":"Border Width",
    "radius":"Radius",
    "border_start":"Border Start",
    "border_end":"Border End",
}
let PROPERTY_TO_LANENAME={
    "left":"position",
    "top":"position",
    "scaleX":"scale",
    "scaleY":"scale",
    "angle":"rotation",
    "opacity":"opacity",
    "strokeWidth":"border_width",
    "radius":"radius",
    "startRenderingPoint":"border_start",
    "endRenderingPoint":"border_end"
}
let LANENAME_TO_PROPERTYS={
    "position":["left","top"],
    "scale":["scaleX","scaleY"],
    "rotation":["angle"],
    "opacity":["opacity"],
    "border_width":["strokeWidth"],
    "radius":["radius"],
    "border_start":["startRenderingPoint"],
    "border_end":["endRenderingPoint"]
};
let EnumCollectionsNames={
    animObjs:"animObjs",
    animObjsWithEntrance:"animObjsWithEntrance",
    animObjsClippers:"animObjsClippers",
    animObjsNotReady:"animObjsNotReady",
};