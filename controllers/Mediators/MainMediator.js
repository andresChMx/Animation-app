var MainMediator={
    members:{
        "SectionObjects":{
            "OnClick":[]
        }
    },
    registerSubjects:function(listObjects){
        for(let i=0;i<listObjects.length;i++){
            this.registerSubject(listObjects[i].name,listObjects[i].events);
        }
    },
    registerSubject:function(className,listEvents){
        let tmpObservers={};
        for(let i in listEvents){
            tmpObservers[listEvents[i]]=[];
        }
        this.members[className]=tmpObservers;

    },
    registerObserver:function(className,event,obj){
        this.members[className][event].push(obj);
    },
    unregisterObserver:function(className,event,obj){
        let index=this.members[className][event].indexOf(obj);
        if(index!==-1){
        this.members[className][event].splice(index,1);
        }else{
            alert("ERROR: MainMediator>unregisterObjeserver: se intento unregister un objecto que no estaba");
        }
    },
    notify:function(className,event,args){
        let observerMethod="notification" + className + event;
        for(let i in this.members[className][event]){
            this.members[className][event][i][observerMethod](args);
        }
    }
}

var SceneMediator={
    members:{
        "SectionObjects":{
            "OnClick":[]
        }
    },
    registerSubjects:function(listObjects){
        for(let i=0;i<listObjects.length;i++){
            this.registerSubject(listObjects[i].name,listObjects[i].events);
        }
    },
    registerSubject:function(className,listEvents){
        let tmpObservers={};
        for(let i in listEvents){
            tmpObservers[listEvents[i]]=[];
        }
        this.members[className]=tmpObservers;

    },
    registerObserver:function(className,event,obj){
        this.members[className][event].push(obj);
    },
    unregisterObserver:function(className,event,obj){
        let index=this.members[className][event].indexOf(obj);
        if(index!==-1){
            this.members[className][event].splice(index,1);
        }else{
            alert("ERROR: MainMediator>unregisterObjeserver: se intento unregister un objecto que no estaba");
        }
    },
    notify:function(className,event,args){
        let observerMethod="notification" + className + event;
        for(let i in this.members[className][event]){
            this.members[className][event][i][observerMethod](args);
        }
    }
}
