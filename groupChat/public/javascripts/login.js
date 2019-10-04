//Variable for keeping track of login page or create account page
var switch_flag = true;

//make sure the elements on the page are ready
$(document).ready(function () {
    //by default hide the create account 
    $(".create-account").hide();

    //action listener for the login button
    $("#login-button").on("click", function (event) {

        if (switch_flag) {
            button_click_count = 0;

            //checking if user exists
            const username = $("#username").val(); // Get the username from the form        
            const password = $("#password").val(); // Get the password from the form
            if (!username) {
                errorMessage("Please enter a username");
            } else if (!password) {
                errorMessage("Please enter a password");
            } else {
                $("#error-message").text("");
                // Make a URL-encoded string for logging the user in
                const data = { 'username': username, 'password': password };
                fetch("/api/auth/login", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(response => {
                    console.log('response:');
                    console.log(response);
                    if("success" != response.error){
                        errorMessage(response.error);

                    }
                    if(response.timeout){
                        setTimeout('location.reload(true);',0);
                    }
                })
                .catch(error => console.error('Error:',error));
                
                console.log("login");


                
            }

        } else {
            //get user info from forms
            const username = $("#username").val() // Get the username from the form
            const password = $("#password").val() // Get the password from the form
            const firstname = $("#first-name").val();
            const lastname = $("#last-name").val();
            const email = $("#email").val();
            const confirmPass = $("#confirm-password").val();

            if (!username) {
                errorMessage("Please enter a username");
            } else if (!password) {
                errorMessage("Please enter a password");
            } else if (!validatePassword(password)) {
                errorMessage("Password must contain 1 lower case, 1 upper case, 1 special character, 1 digit and be at least 6 characters long");
            } else if (!firstname) {
                errorMessage("Please enter a firstname");
            } else if (!lastname) {
                errorMessage("Please enter a lastname");
            } else if (!email) {
                errorMessage("Please enter a email");
            } else if (!validateEmail(email)) {
                errorMessage("Please enter a valid email");
            } else if (!confirmPass) {
                errorMessage("Please cofirm password");
            } else if (password != confirmPass) {
                errorMessage("Passwords do not match");
            } else {
                $("#error-message").text("");
                // Make a URL-encoded string for creating a new user
                let data = { 'username': username, 'password': password, 'firstname': firstname, 'lastname': lastname, 'email': email };
                fetch("/api/auth/create", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(response => {
                    console.log('response:');
                    console.log(response);
                    errorMessage(response.error);
                    if(response.timeout){
                        setTimeout('location.reload(true);',0);
                    }
                })
                .catch(error => console.error('Error:',error));

                console.log("create account");


            }

        }
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    $("#new-user").on("click", function (event) {
        switch_flag = !switch_flag;
        if (switch_flag) {
            switch_click_count = 0;
            $(".create-account").hide()
            $("#login-button").text("Log In");
            $("#login-question").text("New User?");
            $("#new-user").text("Create Account");
            $("#error-message").text("");
        } else {
            $(".create-account").show();
            $("#login-button").text("Create Account");
            $("#login-question").text("Already have account?");
            $("#new-user").text("Login");
            $("#error-message").text("");

        }
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();


    });


    //action listener to trigger login button if eneter key pressed in password field
    $("#password").keyup(function (event) {
        //check if the enter key is pressed
        if (event.keyCode === 13) {
            $("#login-button").click();
        }
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

});

function errorMessage(message) {
    //toggle the shake animation if wrong information entered
    $("#login-button").addClass("shake");
    //set a delay for when to end the animation
    setTimeout(function () {
        $(".shake").removeClass("shake");
    }, 500);

    $("#error-message").text(message);
}

//email validator from chromium
function validateEmail(email) {
    var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email_regex.test(String(email).toLowerCase());
}

//password validator checks for 1 lower, 1 upper, 1 digit, 1 special, at least 6 letter long
function validatePassword(password) {
    var password_regex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/;
    return password_regex.test(String(password));
}