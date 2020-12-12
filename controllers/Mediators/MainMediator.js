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
    notify:function(className,event,args){
        let observerMethod="notification" + className + event;
        for(let i in this.members[className][event]){
            this.members[className][event][i][observerMethod](args);
        }
    }
}