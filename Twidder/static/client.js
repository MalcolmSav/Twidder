let socket = null;

window.onload = function(){
    if(localStorage.getItem("token") == null){
        changeView("welcome");
    }
    else{
        changeView("profile");   
        connectSocket();
    }
    
};

function loginForm(formData) {
    const email = formData.email.value;
    const password = formData.pwd.value;

    let dataObject = {
        'email': email,
        'password': password
    };
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("POST", "/sign_in", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.send(JSON.stringify(dataObject));

    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            let response = JSON.parse(xmlhttpreq.responseText);
            if(xmlhttpreq.status == 201){
                removedisplayMessage();
                localStorage.setItem("token", JSON.stringify(response.data));
                changeView("profile");
                connectSocket();
            }
            else if (xmlhttpreq.status == 500){
                displayMessage(response.message);
            }
            else if (xmlhttpreq.status == 401){
                displayMessage(response.message);
            }
        }
    } 
};

function signupForm(formData){       
        const firstname = formData.fname.value;
        const lastname = formData.lname.value;
        const gender = formData.gender.value;
        const city = formData.city.value;
        const country = formData.country.value;
        const email = formData.email.value;
        const password = formData.pwd.value;
        const repeatpassword = formData.repeatpwd.value;

        let dataObject = {
            'email': email,
            'password': password,
            'firstname': firstname,
            'familyname': lastname,
            'gender': gender,
            'city': city,
            'country': country,
        };

        
        if (password.length < 6) {
            displayMessage("Password must be at least 6 characters long");
            return;
        }
        if (repeatpassword !== password) {
            displayMessage("Password is not the same");
            return;
        }


        var xmlhttpreq = new XMLHttpRequest();
        xmlhttpreq.open("POST", "/sign_up", true);
        xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
        xmlhttpreq.send( JSON.stringify(dataObject));  

        xmlhttpreq.onreadystatechange = function(){
            
            if(xmlhttpreq.readyState == 4){
                var response = JSON.parse(xmlhttpreq.responseText);
                if (xmlhttpreq.status == 201){
                    displayMessage(response.message);  
                }
                else if (xmlhttpreq.status == 401){
                    if(response == "email"){
                        displayMessage("That email is not valid");  
                    }
                    if(response == "password"){
                        displayMessage("Password must be atleast 6 characters");  
                    }
                    if(response == "fields"){
                        displayMessage("Fields can't be empty");  
                    }
                }
                else if (xmlhttpreq.status == 500){
                    if(response == "user"){
                        displayMessage("A user with that email already exists");  
                    }
                    
                }
            } 
        } 
};

function getname(){
    let token = JSON.parse(localStorage.getItem("token"));
    
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("GET", "/get_user_data_by_token", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);
    xmlhttpreq.send()

    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            var response = JSON.parse(xmlhttpreq.responseText);
            result = response.data;
            if(xmlhttpreq.status == 200){
                document.getElementById("displayName").innerHTML = result.firstname;
                document.getElementById("familyName").innerHTML = result.familyname;
                document.getElementById("displayCity").innerHTML = result.city;
                document.getElementById("displayCountry").innerHTML = result.country;
                document.getElementById("displayEmail").innerHTML = result.email
                document.getElementById("displayGender").innerHTML = result.gender;
            }
            if(xmlhttpreq.status === 404)
            {
                console.log(response.message);
            }
        }
    }
};

function changePasswordForm(formData){
    const token = JSON.parse(localStorage.getItem("token"));
    const currentPassword = formData.currentPassword.value;
    const newPassword = formData.newPassword.value;
    const confirmPassword = formData.confirmPassword.value;

    if(newPassword !== confirmPassword){
        displayMessage("New password is not matching")
        return;
    }
    else if (newPassword.length < 6) {
        displayMessage("Password must be at least 6 characters long");
        return;
    }
    
    let dataObject = {
        "oldPassword" : currentPassword,
        "newPassword" : newPassword
    } 
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("PUT", "/change_password", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send(JSON.stringify(dataObject));
    xmlhttpreq.onreadystatechange = function () {
        if (xmlhttpreq.readyState == 4) {
            var response = xmlhttpreq.responseText;
            if(xmlhttpreq.status == 201){
                if(response == "changed"){
                    displayMessage("Password changed"); 
                }       
            }
            else if (xmlhttpreq.status == 401)
            {
                if(response == "wrong"){
                    displayMessage("Wrong password"); 
                }
            }
            else if (xmlhttpreq.status == 500){
                if(response == "couldnt change"){
                    displayMessage("Couldnt change password"); 
                } 
            }
        }
    }
    
};

function postFormHome(formData){
    let token = JSON.parse(localStorage.getItem("token"));
    let content = formData.messageInputHome.value;
    let email = document.getElementById("displayEmail").innerHTML;
    let dataObject = {
        "email": email,
        "message": content
    }
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("POST", "/post_message", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send(JSON.stringify(dataObject));
    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){

            if(xmlhttpreq.status == 201){
                loadWallHome();
            }
            else if(xmlhttpreq.status == 500){
                var response = JSON.parse(xmlhttpreq.responseText);
                displayMessage(response.message);
            }
        }
    }
    formData.messageInputHome.innerHTML = "";
};

function postFormBrowse(formData){
    let token = JSON.parse(localStorage.getItem("token"));
    let content = formData.messageInputBrowse.value;
    let email = document.getElementById("otherEmail").innerHTML;
    let dataObject = {
        "email": email,
        "message": content
    }
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("POST", "/post_message", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send(JSON.stringify(dataObject));
    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            var response = JSON.parse(xmlhttpreq.responseText);
            console.log(response);
            if(xmlhttpreq.status == 201){
                loadWallBrowse(email);
            }
            else if(xmlhttpreq.status == 500){
                displayMessage(response.message);
            }
        }
    }
    formData.messageInputBrowse.innerHTML = "";
};

function changeView(view){
    document.getElementById("main").innerHTML = document.getElementById(view + "View").innerHTML; 
    
    if(view == "profile"){
        openTab("home");
        
        getname();
        loadWallHome();
    }
}

function displayMessage(message) {
    const displayMessage = document.getElementById("displayMessage");
    displayMessage.textContent = message;
    displayMessage.style.display = "block";
};

function removedisplayMessage(){
    document.getElementById("displayMessage").style.display = "none";
};

function openTab(tabName){
    removedisplayMessage();
    let tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++)
        tabs[i].style.display = "none";

    let tabsButton = document.getElementsByClassName("tabButton");
    for (let i = 0; i < tabsButton.length; i++)
        tabsButton[i].style.fontWeight = "normal";

    document.getElementById(tabName+"Div").style.display = "block";
    document.getElementById(tabName+"Button").style.fontWeight = "bold";
};

function signOut(){
    let token = JSON.parse(localStorage.getItem("token"));

    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("POST", "/sign_out", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send()
    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            if(xmlhttpreq.status == 201){
                localStorage.removeItem("token");
                changeView("welcome");
                socket = null;
            }
            else if (xmlhttpreq.status == 400){
                displayMessage(response.message);
            }
        }
    } 
};

function searchEmail(data){
    let token = JSON.parse(localStorage.getItem("token"));
    email = data.inputOtherEmail.value;
    let dataObject = {
        'email': email
    };
   
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("GET", "/get_user_data_by_email/" + email, true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send();
    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            var response = JSON.parse(xmlhttpreq.responseText);
            result = response.data;

            removedisplayMessage();
            if(xmlhttpreq.status == 200){
                document.getElementById("otherName").innerHTML = result.firstname;
                document.getElementById("otherFamilyName").innerHTML = result.familyname;
                document.getElementById("otherCity").innerHTML = result.city;
                document.getElementById("otherCountry").innerHTML = result.country;
                document.getElementById("otherEmail").innerHTML = result.email;
                document.getElementById("otherGender").innerHTML = result.gender;

                loadWallBrowse(result.email);
            }    
            
            else if(xmlhttpreq.status == 404){
                displayMessage("User not found");
                document.getElementById("otherName").innerHTML = "";
                document.getElementById("otherFamilyName").innerHTML = "";
                document.getElementById("otherCity").innerHTML = "";
                document.getElementById("otherCountry").innerHTML = "";
                document.getElementById("otherEmail").innerHTML = "";
                document.getElementById("otherGender").innerHTML = "";
                return;
            }
        }
    }
};

function loadWallHome(){
    let token = JSON.parse(localStorage.getItem("token"));
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("GET", "/get_user_messages_by_token", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send();
    xmlhttpreq.onreadystatechange = function () {
        if (xmlhttpreq.readyState == 4) {
            if (xmlhttpreq.status == 200) {

                let messageWall = document.getElementById("messageWallHome");
                document.getElementById("messageWallHome").innerHTML = null;
                response = JSON.parse(xmlhttpreq.responseText);
                messages = response.messages
         
                for(var message in messages){
                    let newMessage = document.createElement("li");
                    newMessage.setAttribute("draggable", true);
                    newMessage.setAttribute("ondragstart","drag(event)")
                    newMessage.classList.add("message");
                    newMessage.innerHTML = messages[message].sender + ": " + messages[message].message;
                    messageWall.appendChild(newMessage);
                }
            }
            else if (xmlhttpreq.status == 404) {
            }
        }
    }
};

function loadWallBrowse(email){
    let token = JSON.parse(localStorage.getItem("token"));
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("GET", "/get_user_messages_by_email/" + email, true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);

    xmlhttpreq.send();
    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            let respone = JSON.parse(xmlhttpreq.responseText);
            let messageWall = document.getElementById("messageWallBrowse");
            if(xmlhttpreq.status == 200){
                document.getElementById("messageWallBrowse").innerHTML = null;
                response = JSON.parse(xmlhttpreq.responseText);
                messages = response.messages
                for(var message in messages){
                    let newMessage = document.createElement("li");
                    newMessage.setAttribute("draggable", true);
                    newMessage.setAttribute("ondragstart","drag(event)")
                    newMessage.classList.add("message");
                    newMessage.innerHTML = messages[message].sender + ": " + messages[message].message;
                    messageWall.appendChild(newMessage);
                }
            }
            else if(xmlhttpreq.status == 404){
                if(respone == "email"){
                    displayMessage("No user found");
                }
            }
            else if(xmlhttpreq.status == 401){
                if(respone == "Not logged in"){
                    displayMessage("You are not logged in");
                }
            }
            else if(xmlhttpreq.status == 500){
                if(respone == "database"){
                    displayMessage("Something went wrong when searching for user");
                }
            }
        }
    }
}

function get_email_from_token(){
    let token = JSON.parse(localStorage.getItem("token"));
    var xmlhttpreq = new XMLHttpRequest();
    xmlhttpreq.open("GET", "/get_user_data_by_token", true)
    xmlhttpreq.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xmlhttpreq.setRequestHeader("Authorization", token);
    xmlhttpreq.send()

    xmlhttpreq.onreadystatechange = function(){
        if(xmlhttpreq.readyState == 4 ){
            var response = JSON.parse(xmlhttpreq.responseText);
            result = response.data;
            if(xmlhttpreq.status == 200){
               return result.email;
            }
            else
                return null;
        }
    }
}

function reloadWallBrowse(){
    let token = JSON.parse(localStorage.getItem("token"));
    let email = document.getElementById("otherEmail").innerHTML
    loadWallBrowse(token, email);
}

function connectSocket(){
    token = JSON.parse(localStorage.getItem("token"));
    socket = new io();

    socket.on("connect", function(){
        socket.emit("saveSocket", {"token" : token});
        console.log("connected");
    });
    

    socket.on("disconnect", (reason) => {
        console.log(reason);
    });

    socket.on("logout", () => {
        localStorage.removeItem("token");
        changeView("welcome");     
        displayMessage("Someone else logged in");
    });
    
}

function allowDrop(event){
    event.preventDefault();
}

function drag(event){
   console.log(event.target.id);
    event.dataTransfer.setData("text/plain", event.target.innerHTML);
}

function drop(event){
    event.preventDefault();
    let data = event.dataTransfer.getData("text/plain");
    index = data.indexOf(":");
    text = data.slice(index + 2);
    document.getElementById(event.target.id).innerHTML = text;
    
}