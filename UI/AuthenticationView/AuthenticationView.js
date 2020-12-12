var EmailRegExp=/[\w\W]+@\w+\.\w+/;
var SectionLogIn={
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-authentication__login-section");
        this.HTMLForm=this.HTMLElement.querySelector(".panel-authentication__login-section__form");
        this.HTMLFormEmailField=this.HTMLForm.querySelector(".email-input");
        this.HTMLFormPasswordField=this.HTMLForm.querySelector(".password-input");

        this.HTMLSignUpFooterLink=this.HTMLElement.querySelector(".panel-authentication__login-section__footer__signup");

        this.initEvents();
    },
    initEvents:function(){
        this.HTMLForm.addEventListener("submit",this.OnSubmit.bind(this));
        this.HTMLSignUpFooterLink.addEventListener("click",this.OnSignUpLinkClicked.bind(this));

        this.HTMLFormEmailField.addEventListener("input",this.OnEmailFieldInput.bind(this));
        this.HTMLFormPasswordField.addEventListener("input",this.OnPasswordFieldInput.bind(this));
    },
    OnEmailFieldInput:function(e){

    },
    OnPasswordFieldInput:function(e){

    },
    OnSubmit:function(e){
        e.preventDefault();
        this.parentClass.childNotificationOnLogInFormSubmited(this.HTMLFormEmailField.value,this.HTMLFormPasswordField.value);
    },
    OnSignUpLinkClicked:function(e){
        e.preventDefault();
        this.parentClass.childNotificationOnSignUpLinkClicked();
    },
    ShowUp:function(){
        this.HTMLElement.style.display="block";
    },
    Hide:function(){
        this.HTMLElement.style.display="none";
    }
}
var SectionSignUp={
    init:function(parentClass){
        this.parentClass=parentClass;
        this.HTMLElement=document.querySelector(".panel-authentication__signup-section");
        this.HTMLForm=this.HTMLElement.querySelector(".panel-authentication__signup-section__form");
        this.HTMLFormEmailField=this.HTMLForm.querySelector(".email-input");
        this.HTMLFormPasswordField=this.HTMLForm.querySelector(".password-input");

        this.HTMLLogInFooterLink=this.HTMLElement.querySelector(".panel-authentication__signup-section__footer__login");
        //this.HTMLResetPassFooterLink=this.HTMLElement.querySelector(".panel-authentication__signup-section__footer__reset-pass");

        this.initEvents();
    },
    initEvents:function(){
        this.HTMLForm.addEventListener("submit",this.OnSubmit.bind(this))
        this.HTMLLogInFooterLink.addEventListener("click",this.OnSignInLinkClicked.bind(this));
        //this.HTMLResetPassFooterLink.addEventListener("click",this.OnResetPassLinkClicked.bind(this));
    },
    OnSubmit:function(e){
        e.preventDefault();
        this.parentClass.childNotificationOnSignUpFormSubmited(this.HTMLFormEmailField.value,this.HTMLFormPasswordField.value);
    },
    OnSignInLinkClicked:function(e){
        e.preventDefault();
        this.parentClass.childNotificationOnLogInLinkClicked();
    },
    OnResetPassLinkClicked:function(){
        this.parentClass.childNotificationOnResetPassLinkClicked();
    },
    ShowUp:function(){
        this.HTMLElement.style.display="block";
    },
    Hide:function(){
        this.HTMLElement.style.display="none";
    }
}

var PanelAuthentication={
    HTMLElement:null,
    SectionLogIn:SectionLogIn,
    SectionSignUp:SectionSignUp,
    flagWaitingForSignUp:false,
    flagWaitingForLogin:false,
    init:function(){
        this.HTMLElement=document.querySelector(".panel-authentication");
        this.SectionLogIn.init(this);
        this.SectionSignUp.init(this);


    },
    OnSignUpSucess:function(){
        this.Hide();
    },
    OnLogInSucess:function(){
        this.Hide();
    },
    childNotificationOnLogInFormSubmited:function(email,password){
        let self=this;
        if(!this.flagWaitingForLogin){
            if(EmailRegExp.test(email) && password.length>5){
                this.flagWaitingForLogin=true;
                NetworkManager.LoginUser(email,password)
                    .then(function(userData){
                        if(userData.user){
                            USER_ID=userData.user.uid;
                            self.OnLogInSucess.bind(self)();
                        }else{
                            alert("ERROR: " + userData.message);
                        }
                        console.log(userData);
                        self.flagWaitingForLogin=false;
                    })
                    .catch(function(e){
                        alert("ERROR: " + e.message);
                        console.log(e.message);
                        self.flagWaitingForLogin=false;
                    });
            }
        }
    },
    childNotificationOnSignUpFormSubmited:function(email,password){
        let self=this;
        if(!this.flagWaitingForSignUp){
            if(EmailRegExp.test(email) && password.length>5){
                this.flagWaitingForSignUp=true;
                NetworkManager.CreateUser(email,password)
                    .then(function(userData){
                        if(userData.user){
                            USER_ID=userData.user.uid;
                            self.OnSignUpSucess.bind(self)();
                        }else{
                            alert("ERROR: " + userData.message);
                        }
                        console.log(userData);
                        self.flagWaitingForSignUp=false;
                    })
                    .catch(function(e){
                        alert("ERROR: " + e.message);
                        console.log(e);
                        self.flagWaitingForSignUp=false;
                    });
            }
        }
    },
    Hide:function(){
        this.HTMLElement.parentNode.style.display="none";
    },
    childNotificationOnSignUpLinkClicked:function(){
        this.SectionSignUp.ShowUp();
        this.SectionLogIn.Hide();
    },
    childNotificationOnLogInLinkClicked:function(){
        this.SectionLogIn.ShowUp();
        this.SectionSignUp.Hide();
    },
    childNotificationOnResetPassLinkClicked:function(){

    }
}