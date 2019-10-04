
let editMenuFlag = false;
let chatFlag = true;
//Make sure document is ready to load action listener
$(document).ready(function () {
   
    loadUser();

    //loadUsername();
    loadChatList();
    loadContactList();

    //check if the send button is clicked
    $("#send-button").on("click", function (event) {
        //call the send message function
        console.log("send-button send message");
        sendMessage();
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    //check if the enter key in send message is clicked
    $("#message-input").keyup(function (event) {
        //check if the enter key is pressed
        if (event.keyCode === 13) {
            console.log("message-input send message");
            sendMessage();
        }
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    //check if the toggle menu is clicked
    $("#toggle-menu-button").on("click", function (event) {
        console.log("menu");
        
        if($("#side-menu").hasClass("slide-menu-left")){

            $("#side-menu").removeClass("slide-menu-left");
            $("#content").removeClass("slide-content-left");

            $("#side-menu").toggleClass("slide-menu-right");
            $("#content").toggleClass("slide-content-right");

            console.log("right");

            
        } else {
            console.log("left");

            $("#side-menu").removeClass("slide-menu-right");
            $("#content").removeClass("slide-content-right");

            $("#side-menu").toggleClass("slide-menu-left");
            $("#content").toggleClass("slide-content-left");


        }
       
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });


    //check if the profile view is clicked
    $("#view-profile").on("click", function (event) {
        
        openProfileView();
                
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });


    //check if the view chats is clicked
    $("#view-chat-list").on("click", function (event) {
        console.log("Chats");
        chatFlag = true;
        $("#drawer-contact-list").hide();
        $("#drawer-chat-list").show();
        $("#search-input").val("")

        $("#drawer-title").text("Chats");
        $("#add-chat-button").css("display", "block");
        $("#search-input").attr("placeholder", "Search Chats");
        toggleMenuOpen();
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });


    //check if the view contacts is clicked
    $("#view-contact-list").on("click", function (event) {
        console.log("Contacts");
        chatFlag = false;
        $("#drawer-chat-list").hide();
        $("#drawer-contact-list").show();
        $("#search-input").val("")
        $("#drawer-title").text("Contacts");
        $("#add-chat-button").css("display", "none");
        $("#edit-drop-down-menu").css("display","none");
        $("#search-input").attr("placeholder", "Search Contacts");
        toggleMenuOpen();
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });



    //check if the settings is clicked
    $("#view-setting").on("click", function (event) {
        console.log("Settings");
        
        openSettingView();
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    $("#add-chat-button").on("click", function (event) {
        console.log("add chat");
        $("#create-chat-error-field").text("");

        $("#edit-drop-down-menu").toggle();
        editMenuFlag = true;
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    $("#add-group-chat").on("click", function (event) {
        console.log("add group");
        $("#add-group-chat-modal").toggle();
        $("#edit-drop-down-menu").toggle();
        editMenuFlag = false;
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $(".close-modal").on("click", function (event) {
        console.log("close modal");
        $("#add-group-chat-modal").css("display", "none");
        $("#add-direct-chat-modal").css("display", "none");
        $("#chat-setting-modal").css("display", "none");
        $("#chat-members-modal").css("display", "none");
        $("#add-member-modal").css("display","none");
        $("new-group-add-member-modal").css("display","none");
        $("#new-group-add-member-modal").css("display","none");
        $("#edit-group-chat-title").val("");
        $("#edit-group-chat-description").val("");
        
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    $("#add-direct-chat").on("click", function (event) {
        console.log("add dm");
        $("#edit-drop-down-menu").toggle();
        $("#add-direct-chat-modal").toggle();
        editMenuFlag = false;
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    $("#cancel-direct-chat-button").on("click", function (event) {
        console.log("cancel dm");
        $("#add-direct-chat-modal").toggle();
        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $("#cancel-add-member-button").on("click", function (event) {
        console.log("cancel add member");
        $("#add-member-modal").toggle();
        $("#chat-members-modal").toggle();

        console.log(chat_add_member_list.length);
        if(chat_add_member_list.length >= 1){
            console.log("adding member to db: ");
            console.log(chat_add_member_list);
            //update the add member list
            $("#add-member-search-list").children('.contact-target').each(function () {
                if(chat_add_member_list.includes(String($(this).children('h3').text()))){
                    $(this).removeClass("add");
                }
            });

            let chat_id = $('#message-list').data('chat');

            let chat_name = chat_cache[chat_id].chat;

          
            let current_time = new Date();
            var last_message;
            if(chat_cache[chat_id].messages.length > 0){
                last_message = {
                  message: chat_cache[chat_id].messages[chat_cache[chat_id].messages.length-1].message,
                  author: chat_cache[chat_id].messages[chat_cache[chat_id].messages.length-1].author,
                  timestamp: chat_cache[chat_id].messages[chat_cache[chat_id].messages.length-1].timestamp,
                }
              } else {
                last_message = {
                  message: "No messages yet.",
                  author: "",
                  timestamp: current_time.getTime(),
                }
              }
            console.log("adding member to chat");
            console.log(chat_name);
            console.log(last_message);
            console.log("------------------");

            socketio.emit("add_chat_user", {user:chat_add_member_list, chat:chat_id, name:chat_name, preview:last_message});
            // addChatUser(chat_add_member_list, chat_id);

            //clear the users to add
            chat_add_member_list = [];
            //reset back to cancel button
            $("#cancel-add-member-button").children(":first").text("cancel");
            $("#cancel-add-member-button").removeClass("add-member");

        }
     
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    
    var new_group_chat_add_member_list = [];
    $("#new-group-cancel-add-member-button").on("click", function (event) {
        console.log("cancel add chat member");
        $("#new-group-add-member-modal").toggle();
        $("#add-group-chat-modal").toggle();
        console.log(new_group_chat_add_member_list.length)
        if(new_group_chat_add_member_list.length >= 1){
            createNewGroup(new_group_chat_add_member_list);
            //clear the users to add
            new_group_chat_add_member_list = [];
        }   
     
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

   

    $("#search-input").on("input", function () {
        let search_input = String($("#search-input").val());
        console.log(search_input);
        if(chatFlag){
            console.log("searching chats...");
            
        } else {
            console.log("searching contacts...");

        }
    });

    $("#edit-group-chat-title").keyup(function (event) {        
        //check if the enter key is pressed
        if (event.keyCode === 13) {
            createGroup();
        }
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    
    $("#edit-group-chat-description").keyup(function (event) {        
        //check if the enter key is pressed
        if (event.keyCode === 13) {
            createGroup();
        }
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $("#add-chat-save-button").on("click", function(event){
        createGroup();

        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });

    $("#add-direct-chat-search").on("input",function (event) {        
            let input_string = $("#add-direct-chat-search").val();
            console.log(input_string);
            console.log("searching for contact...");

        
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    
    

    //check document click
    $(document).click(function(event) { 
        // Check if edit menu open 
        if(editMenuFlag){
            if (!($(event.target).is("#edit-drop-down-menu"))) {
                $("#edit-drop-down-menu").toggle();
                editMenuFlag = false;
            }
        }
        if($(event.target).is("#add-group-chat-modal")) {            
            $("#add-group-chat-modal").css("display","none");

        }
        if($(event.target).is("#add-direct-chat-modal")) {            
            $("#add-direct-chat-modal").css("display","none");

        }
        if($(event.target).is("#add-member-modal")) {   
            console.log(event.target);         
            $("#add-member-modal").css("display","none");

        }

        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();

       
    });


    $("#drawer-chat-list").on("click", "div.chat-target", function(){
        //clear the chat member list except for the add new member
        $("#member-grid").children().not('div:first').remove();
        //get the chat id and load that chat
        let chat_name = $(this).find('h3').text();

        $("#chat-title-bar-header").text(chat_name);

        updateGroupChatImage($("#group-chat-header-picture"), this.id);
        openChatView();
        displayChat(this.id);
        if($(window).width() < 720){
            $("#side-menu").removeClass("slide-menu-right");
            $("#content").removeClass("slide-content-right");

            $("#side-menu").addClass("slide-menu-left");
            $("#content").addClass("slide-content-left");

        }
        socketio.emit("change_room", {room:this.id});

        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $("#drawer-contact-list").on("click", "div.contact-target", function(){
        console.log("contact click");
        let user = $(this).find('h3').text();
        loadDM(user);
        console.log($(window).width());
        console.log($( document ).width());
        if($(window).width() < 720){
            $("#side-menu").removeClass("slide-menu-right");
            $("#content").removeClass("slide-content-right");

            $("#side-menu").addClass("slide-menu-left");
            $("#content").addClass("slide-content-left");

        }
        
        


        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $("#add-member-search-list").on("click", "div.contact-target", function(){
        console.log("add member click");
        let user = $(this).find('h3').text();
        console.log(user);
       
        if($(this).hasClass("checked")){
            console.log("User already in group chat");
        } else {
            if($(this).hasClass("add")){
                console.log("removing user from list of members to add");
                $(this).removeClass("add");
                for(var i = 0; i < chat_add_member_list.length; i++){ 
                    if (chat_add_member_list[i] == user) {
                        chat_add_member_list.splice(i, 1); 
                    }
                 }
            } else {
                console.log("adding member to the list of member to add");
                $(this).addClass("add");
                chat_add_member_list.push(user);
            }
        }
        console.log(chat_add_member_list);
        if(chat_add_member_list.length == 1){
            $("#cancel-add-member-button").addClass("add-member");
            $("#cancel-add-member-button").children(":first").text("Add "+chat_add_member_list.length+" member");
        } else if(chat_add_member_list.length > 1){
            $("#cancel-add-member-button").children(":first").text("Add "+chat_add_member_list.length+" members");
        } else {
            $("#cancel-add-member-button").children(":first").text("cancel");
            $("#cancel-add-member-button").removeClass("add-member");

        }
       
    

        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $("#new-group-add-member-search-list").on("click", "div.contact-target", function(){
        console.log("add member click");
        let user = $(this).find('h3').text();
        console.log(user);
       
        
        if($(this).hasClass("add")){
            console.log("removing user from list of members to add");
            $(this).removeClass("add");
            for(var i = 0; i < new_group_chat_add_member_list.length; i++){ 
                if (new_group_chat_add_member_list[i] == user) {
                    new_group_chat_add_member_list.splice(i, 1); 
                }
            }
        } else {
            console.log("adding member to the list of member to add");
            $(this).addClass("add");
            new_group_chat_add_member_list.push(user);
        }
        
        console.log(new_group_chat_add_member_list);
        if(new_group_chat_add_member_list.length == 1){
            $("#new-group-cancel-add-member-button").addClass("add-member");
            $("#new-group-cancel-add-member-button").children(":first").text("Create group with "+new_group_chat_add_member_list.length+" member");
        } else if(new_group_chat_add_member_list.length > 1){
            $("#new-group-cancel-add-member-button").children(":first").text("Create group with "+new_group_chat_add_member_list.length+" members");
        } else {
            $("#new-group-cancel-add-member-button").children(":first").text("cancel");
            $("#new-group-cancel-add-member-button").removeClass("add-member");

        }
       
    

        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    
    
    $("#add-direct-chat-search-list").on("click", "div.contact-target", function(){
        console.log("add dm click");
        let user = $(this).find('h3').text()
        loadDM(user);
        $("#add-direct-chat-modal").css("display","none");
        console.log($( window ).width());
        console.log($( document ).width());
        console.log($( body ).width());


        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });
    $("#message-list").on("click", "span.like-button", function(){
        likeMessage(this.id);
        //prevent bubble click from causing button to be clicked twice
        event.stopImmediatePropagation();
    });






    $("#message-list").on('click', '.message',function() {
        $('.message').not($(this)).removeClass('message-active');
        $(this).toggleClass('message-active');
        event.stopPropagation();
    });
    $("#close-chat").on('click', function(event){
        closeChatView();
    });
    $("#group-chat-menu-button").on('click', function(event){
        console.log("chat settings");

        // $("#group-chat-menu-button").attr("src", "/assets/icons/drop-up-arrow.png");
        $("#group-chat-menu-button").toggleClass('up');
        $("#chat-drop-down-menu").toggleClass('hidden');
   
    });

    $("#chat-member-button").on('click', function(event){
       console.log("chat member list button");
       $("#chat-members-modal").toggle();

   
    });
    $("#chat-setting-button").on('click', function(event){
        console.log("chat settings ");

        $("#modal-chat-setting-error-field").text("");
        //restore the chat title and description
        let chat_id = $('#message-list').data('chat');
        $("#modal-chat-setting-edit-name-button").text("Edit");
        $("#modal-chat-setting-edit-group-name").attr('disabled','disabled');
        $("#modal-chat-setting-edit-group-name").addClass('edit-disabled');

        $("#modal-chat-setting-edit-description-button").text("Edit");
        $("#modal-chat-setting-edit-description").attr('disabled','disabled');
        $("#modal-chat-setting-edit-description").addClass('edit-disabled');

        $("#modal-chat-setting-edit-group-name").val(chat_cache[chat_id].chat);
        $("#modal-chat-setting-edit-description").val(chat_cache[chat_id].description);

        $("#chat-setting-modal").toggle();

       


    });
    $("#modal-chat-setting-edit-name-button").on('click', function(event){
        
        let current_state = String($("#modal-chat-setting-edit-name-button").text());
        console.log(current_state);
        if(current_state == "Save"){
            $("#modal-chat-setting-edit-name-button").text("Edit");
            $("#modal-chat-setting-edit-group-name").attr('disabled','disabled');
            $("#modal-chat-setting-edit-group-name").addClass('edit-disabled');

            let updated_title = String($("#modal-chat-setting-edit-group-name").val());
            let chat_id = $('#message-list').data('chat');

            console.log("updating chat name...");
            console.log(updated_title);
            console.log(chat_id);
            if(updated_title == String($("#chat-title-bar-header").text())){
                console.log("No changes made to title");
            } else {
                updateChatTitle(updated_title, chat_id);
            }

            
        } else {
            $("#modal-chat-setting-edit-name-button").text("Save");
            $("#modal-chat-setting-edit-group-name").removeAttr('disabled');
            $("#modal-chat-setting-edit-group-name").removeClass('edit-disabled');
            $("#modal-chat-setting-edit-group-name").focus();

        }

        event.stopPropagation();

    });
    $("#modal-chat-setting-edit-description-button").on('click', function(event){
        
        let current_state = String($("#modal-chat-setting-edit-description-button").text());
        if(current_state == "Save"){
            $("#modal-chat-setting-edit-description-button").text("Edit");
            $("#modal-chat-setting-edit-description").attr('disabled','disabled');
            $("#modal-chat-setting-edit-description").addClass('edit-disabled');

            let updated_description = String($("#modal-chat-setting-edit-description").val());
            let chat_id = $('#message-list').data('chat');

            if(updated_description == String($("#chat-description").text())){
                console.log("No changes made to description");
            } else {
                updateChatDescription(updated_description, chat_id);
            }

          
        } else {
            $("#modal-chat-setting-edit-description-button").text("Save");
            $("#modal-chat-setting-edit-description").removeAttr('disabled');
            $("#modal-chat-setting-edit-description").removeClass('edit-disabled');
            $("#modal-chat-setting-edit-description").focus();

        }
        event.stopPropagation();

    });
   
    $("#profile-edit-first-name-button").on('click', function(event){
        
        let current_state = String($("#profile-edit-first-name-button").text());
        if(current_state == "Save"){
            $("#profile-edit-first-name-button").text("Edit");
            $("#profile-edit-first-name").attr('disabled','disabled');
            $("#profile-edit-first-name").addClass('edit-disabled');

            let updated_first_name = String($("#profile-edit-first-name").val());           
            updateFirstName(updated_first_name);

        } else {
            $("#profile-edit-first-name-button").text("Save");
            $("#profile-edit-first-name").removeAttr('disabled');
            $("#profile-edit-first-name").removeClass('edit-disabled');
            $("#profile-edit-first-name").focus();

        }
        event.stopPropagation();
    });
     
    $("#profile-edit-last-name-button").on('click', function(event){
        
        let current_state = String($("#profile-edit-last-name-button").text());
        if(current_state == "Save"){
            $("#profile-edit-last-name-button").text("Edit");
            $("#profile-edit-last-name").attr('disabled','disabled');
            $("#profile-edit-last-name").addClass('edit-disabled');

            let updated_last_name = String($("#profile-edit-last-name").val());           
            updateLastName(updated_last_name);

        } else {
            $("#profile-edit-last-name-button").text("Save");
            $("#profile-edit-last-name").removeAttr('disabled');
            $("#profile-edit-last-name").removeClass('edit-disabled');
            $("#profile-edit-last-name").focus();

        }
        event.stopPropagation();
    });
      
    $("#profile-edit-email-button").on('click', function(event){
        
        let current_state = String($("#profile-edit-email-button").text());
        if(current_state == "Save"){
            $("#profile-edit-email-button").text("Edit");
            $("#profile-edit-email").attr('disabled','disabled');
            $("#profile-edit-email").addClass('edit-disabled');

            let updated_email = String($("#profile-edit-email").val());           
            updateEmail(updated_email);

        } else {
            $("#profile-edit-email-button").text("Save");
            $("#profile-edit-email").removeAttr('disabled');
            $("#profile-edit-email").removeClass('edit-disabled');
            $("#profile-edit-email").focus();

        }
        event.stopPropagation();
    });
    $("#profile-edit-password-button").on('click', function(event){
        
        $("#profile-edit-password-button").css('visibility','hidden');
        $("#profile-password-label").toggle();

        $("#profile-edit-current-password").css('display','inline-block');
        $("#profile-edit-current-password").focus();

        
        $("#profile-edit-new-password").css('display','inline-block');
        $("#profile-edit-confirm-password").css('display','inline-block');
        $("#profile-save-password-button").css('display','inline-block');
        $("#profile-cancel-password-button").css('display','inline-block');



        event.stopPropagation();
    });

    
    $("#profile-cancel-password-button").on('click', function(event){

        hideEditProfilePassword();

        $("#profile-edit-current-password").val("");
        $("#profile-edit-new-password").val("");
        $("#profile-edit-confirm-password").val("");
        $("#profile-error-field").text("");

        event.stopPropagation();
    });
    $("#profile-save-password-button").on('click', function(event){
        let old_password = String($("#profile-edit-current-password").val());
        let updated_password = String($("#profile-edit-new-password").val());
        let confirm_password = String($("#profile-edit-confirm-password").val());

        hideEditProfilePassword();

        updatePassword(old_password, updated_password, confirm_password);
        event.stopPropagation();
    });

  

    $("#hamburger").on('click', function(event){
        $("#hamburger").toggleClass("close-menu");
        console.log("hamburger menu clicked");

        $("#hamburger-slide-menu").toggle();

        event.stopPropagation();
    });
    
    $("#hamburger-chat-button").on('click', function(event){
        $("#hamburger").toggleClass("close-menu");
        console.log("chat menu clicked");
        $("#hamburger").removeClass("close-menu");
        $("#hamburger-slide-menu").hide();

        $("#drawer-contact-list").hide();
        $("#drawer-chat-list").show();
        $("#search-input").val("")

        $("#drawer-title").text("Chats");
        $("#add-chat-button").css("display", "block");
        $("#search-input").attr("placeholder", "Search Chats");
        toggleMenuOpen();

        event.stopPropagation();
    });
    $("#hamburger-contact-button").on('click', function(event){
        $("#hamburger-chat-button").toggleClass("close-menu");
        console.log("contact menu clicked");
        $("#hamburger").removeClass("close-menu");
        $("#hamburger-slide-menu").hide();

        $("#side-menu").removeClass("slide-menu-left");
        $("#content").removeClass("slide-content-left");

        $("#side-menu").addClass("slide-menu-right");
        $("#content").addClass("slide-content-right");

        $("#drawer-chat-list").hide();
        $("#drawer-contact-list").show();
        $("#search-input").val("")
        $("#drawer-title").text("Contacts");
        $("#add-chat-button").css("display", "none");
        $("#edit-drop-down-menu").css("display","none");
        $("#search-input").attr("placeholder", "Search Contacts");
        toggleMenuOpen();
        

        event.stopPropagation();
    });
    $("#hamburger-profile-button").on('click', function(event){
        $("#hamburger").toggleClass("close-menu");
        console.log("profile menu clicked");
        $("#hamburger").removeClass("close-menu");
        $("#hamburger-slide-menu").hide();

        
        $("#side-menu").removeClass("slide-menu-right");
        $("#content").removeClass("slide-content-right");

        $("#side-menu").addClass("slide-menu-left");
        $("#content").addClass("slide-content-left");

        // $("#side-menu").hide();
        //TODO ^^^^
        openProfileView();

        event.stopPropagation();
    });
    $("#hamburger-setting-button").on('click', function(event){
        $("#hamburger").toggleClass("close-menu");
        console.log("settinfg menu clicked");
        $("#hamburger").removeClass("close-menu");
        $("#hamburger-slide-menu").hide();



        $("#side-menu").removeClass("slide-menu-right");
        $("#content").removeClass("slide-content-right");

        $("#side-menu").addClass("slide-menu-left");
        $("#content").addClass("slide-content-left");

        // $("#side-menu").hide();
        //TODO ^^^^^^
        


        openSettingView();


        event.stopPropagation();
    });









    var chat_add_member_list = [];
    $("#chat-add-members").on('click', function(event){
        
        $("#add-member-modal").toggle();
        $("#chat-members-modal").css("display", "none");
        chat_add_member_list = [];
        
        event.stopPropagation();
    });
    $("#profile-logout-button").on('click', function(event){
        logout();
        event.stopPropagation();
    });
    $("#setting-logout-button").on('click', function(event){
        logout();
        event.stopPropagation();
    });
    
    
    $("#delete-account-button").on('click', function(event){

        //promt the user with an alert
        let confirm_delete_account = confirm("Are you sure you wish to delete your account?\nThis is permanent and can not be undone.");
        //check if they for sure want to delete account
        if(confirm_delete_account){
            console.log("deleting account");
            //make auth api call to delete account
            fetch("/api/auth/deleteAccount", {
                method: 'POST',
                headers: { 'content-type': 'application/json' }
            })
            .catch(error => console.error('Error:',error));
            //log the user out
            logout();
        } 
        event.stopPropagation();
    });
    
    
    $("#modal-chat-setting-leave-chat-button").on('click', function(event){

        console.log("leave chat");
         //promt the user with an alert
         let confirm_leave_chat = confirm("Are you sure you wish to leave the chat?");
         //check if they for sure want to delete account
         if(confirm_leave_chat){

            console.log("leaving chat...");

            //close the chat view
            closeChatView();

            //close the chat settings modal  
            $("#chat-setting-modal").css("display","none");

            //remove the chat from the list of chats display
            var chat_id = $('#message-list').data('chat');
            document.getElementById("drawer-chat-list").removeChild(document.getElementById(chat_id));


            //call socket to leave the chat
            socketio.emit("leave_chat", {room:chat_id});
          
         } 


        event.stopPropagation();
    });


    $('#setting-time-format-select').on('change',function(event){
        let time = $(this).children("option:selected").val() == 0;
        if(time != time_setting){
            updateTime(time);
        }
    });

    $('#setting-theme-select').on('change',function(event){
        let light = $(this).children("option:selected").val() == 0;
        if(light != light_theme_setting){
            updateTheme(light);
        }
    });

    $('#edit-profile-image').on('click', function(event){
        console.log("Edit profile image");
        // $("#edit-profile-image-picker").click();
        $("#edit-profile-image-selector").trigger('click');


        event.stopPropagation();
    });
    $('#edit-profile-image-selector').change(function(event) {
        console.log("User changed profile image");
        $("#edit-profile-image-submit").click();

        event.stopPropagation();
    });
    
    $('#edit-group-chat-image').on('click', function(event){
        console.log("Edit group chat image");
        $("#edit-group-chat-image-selector").trigger('click');

        
        event.stopPropagation();
    });
    $('#edit-group-chat-image-selector').change(function(event) {
        console.log("User changed group chat image");
        let chat_id = $('#message-list').data('chat');
        $("#edit-group-chat-image-chat-name").val(chat_id);
        if(event.currentTarget.files && event.currentTarget.files.length > 0){
            $("#edit-group-chat-image-submit").click();
        }

        event.stopPropagation();
    });







    $('#hamburger-slide-menu').on('click', function(event) {
        console.log("hello hamburger: ");
        console.log(event);
        console.log(event.target.id);
        console.log($('#hamburger-slide-menu'));
        if(event.target.id == 'hamburger-slide-menu'){
            console.log("close menu");
            $("#hamburger").toggleClass("close-menu");
            $("#hamburger").removeClass("close-menu");
            $("#hamburger-slide-menu").hide();
        }
        event.stopPropagation();
    });




    //enable emojis
    $(function() {
        // Initializes and creates emoji set from sprite sheet
        window.emojiPicker = new EmojiPicker({
          emojiable_selector: '[data-emojiable=true]',
          assetsPath: '/assets/images/',
          popupButtonClasses: 'fa fa-smile-o'
        });
        window.emojiPicker.discover();
      });

    //reverse the scroll behavior of the double mirrored message list
    // $(".message-list-scroll-field").scroll(function(){
    //     $(".message-list-scroll-field").css('scrollTop', $(this).scrollTop()*-2);
    //     // $('.message-list').css('transform', 'translate(0,' + $(this).scrollTop()*-2 + 'px, 0)'); 
    //     // console.log($(this).scrollTop()*-2);
    // }).scroll();
    // $(".message-list-scroll-field").scroll(function(){
    //     console.log("scrolling....");
    //     $('.message-list').css('margin-top', $(this).scrollTop()*2 + 'px'); 
    //  }).scroll();

    

});


// groupChat/node_modules/socket.io/lib/socket.js
// let io_path = window.location.href+"node_modules/socket.io/lib/socket.io.js";
// console.log(io_path);
var socketio = io.connect();
socketio.on("message_to_client",function(data) {
    console.log("message recieved!!!");
    data = JSON.parse(data);
    console.log(data);
    console.log(data.chat_update);
    console.log(data.chat_id);
    console.log(current_chat_id == data.chat_id);
    //check if current chat is the chat recieving the update
    var current_chat_id = $('#message-list').data('chat');
    console.log(current_chat_id);
    console.log(data.chat_id);
    if(current_chat_id === data.chat_id){
        console.log("current chat message!!!");
        if(data.chat_update){
            switch(data.update_type){
                case "title":
                    updateTitle(data.update_data);
                    break;
                case "description":
                    updateDescription(data.update_data);
                    break;
                case "remove":
                    removeUser(data.update_data);
                    break;
                case "add":
                    addUser(data.update_data);
                    break;
                case "leave":
                    console.log("leave switch");
                    removeUser(data.update_data);
                    break;
                default:
                    break;
            }
        }
      
    
        //create the message node
        const message = createMessageNode(data);
        
        //add the message to the chat
        document.getElementById("message-list").appendChild(message);

    } else {
        console.log("notification update?")
        let current_user = String($("#welcome-username").text());

        if(data.author != current_user){
            //todo
             //let the user know they got a message from another chat
            //consider doing snackbar / toast
            //consider putting blue dot next to chat with notfication
            //consider putting adding notfication count (3)
            let notification_count = parseInt($("#"+data.chat_id).find(".notification").text());
            notification_count += 1;
            $("#"+data.chat_id).find(".notification").text(notification_count);
            $("#"+data.chat_id).find(".notification").css("display", "block");

            //bring the chat to the top of the list
            $("#drawer-chat-list").children().first().after($("#"+data.chat_id).next());
            $("#drawer-chat-list").children().first().after($("#"+data.chat_id));
        }
       
    }
    //update preview message
    $("#"+data.chat_id).find(".preview-message").first().text("");
    $("#"+data.chat_id).find(".preview-message").first().append("<strong class='preview-message-author'>"+data.author+"</strong>" );

    $("#"+data.chat_id).find(".preview-message").first().append(data.message);
    let update_date = new Date(data.timestamp);
    $("#"+data.chat_id).find(".preview-message-date").first().text(update_date.toDateString());

    if(chat_cache[data.chat_id]){
        chat_cache[data.chat_id].messages.push(data);
    }
    
    
});

socketio.on("like_to_client",function(data) {
    console.log("like recieved");
    data = JSON.parse(data);
    console.log(data);
    updateLike(data["message"], data["user"]);
   
});
socketio.on("kick_user",function(data) {
    data = JSON.parse(data);

    console.log(data);
    console.log(data["chat"]);
    //remove the chat from the users chat list
    document.getElementById("drawer-chat-list").removeChild(document.getElementById(data["chat"]));

    var chat_id = $('#message-list').data('chat');
    //check if the user has the chat open
    if(data["chat"] == chat_id) {
        closeChatView();
    }
   
});
socketio.on("add_user",function(data) {
    console.log("add logged in user");
    data = JSON.parse(data);

    console.log(data);
    console.log(data["chat"]);

    const line_node = document.createElement("div");
    line_node.className = "line-break";
    document.getElementById("drawer-chat-list").appendChild(line_node);
    //add the chat to the users chat list
    const chat = createDrawerChatItemNode(data["chat"], data["name"], data["preview"], data["unread"]);
    document.getElementById("drawer-chat-list").appendChild(chat);

    alert("You've been added to the " + data["name"] + " chat!");
    //TODO check if creator
   
});


function createGroup(){
    let group_name = String($("#edit-group-chat-title").val());
    let group_description = String($("#edit-group-chat-description").val());
    if(group_name){
        if(group_description){
            $("#create-chat-error-field").text("");
            $("#add-group-chat-modal").css("display","none");
            $("#new-group-add-member-modal").toggle();
        } else {
            $("#create-chat-error-field").text("Description required");
            $("#edit-group-chat-description").focus();
        }
        
    } else {
        $("#create-chat-error-field").text("Title required");
        $("#edit-group-chat-title").focus();
    }
}




function updateFirstName(updated_first_name){
    if(updated_first_name == ""){
        $("#profile-edit-first-name-button").click();
        $("#profile-error-field").text("First name can not be blank");
    } else {
        if(user_cache.firstname == updated_first_name){
            console.log("no changes were made to first name");
        } else {
            $("#profile-error-field").text("");
            user_cache.firstname = updated_first_name;
            const data = { 'firstname': updated_first_name };
            fetch("/api/auth/updateFirstName", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'content-type': 'application/json' }
            })
            .catch(error => console.error('Error:',error));
        }
    }
} 


function updateLastName(updated_last_name){
    if(updated_last_name == ""){
        $("#profile-edit-last-name-button").click();
        $("#profile-error-field").text("Last name can not be blank");

    } else {
        if(user_cache.lastname == updated_last_name){
            console.log("no changes were made to last name");
        } else {
            user_cache.lastname = updated_last_name;
            $("#profile-error-field").text("");
            const data = { 'lastname': updated_last_name };
            fetch("/api/auth/updateLastName", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'content-type': 'application/json' }
            })
            .catch(error => console.error('Error:',error));
        }
    }
}
function updateEmail(updated_email){
    if(updated_email == ""){
        $("#profile-edit-email-button").click();
        $("#profile-error-field").text("email can not be blank");

    } else {
        if(user_cache.email == updated_email){
            console.log("no changes were made to email");
        } else {
            if(validateEmail(updated_email)){
                user_cache.email = updated_email;
                $("#profile-error-field").text("");
                console.log(updated_email);
                const data = { 'email': updated_email };
                fetch("/api/auth/updateEmail", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'content-type': 'application/json' }
                })
                .catch(error => console.error('Error:',error));
            } else {
                $("#profile-edit-email-button").click();
                $("#profile-error-field").text("Invalid email format");
            }   
            

           
        }
    }
}
function updatePassword(old_password, updated_password, confirm_password){
    if(old_password == "" || updated_password == "" || confirm_password == ""){
        $("#profile-error-field").text("Password field can not be blank");
        $("#profile-edit-password-button").click();


    } else {
        if(updated_password === confirm_password){
            console.log(updated_password);
            if(validatePassword(updated_password)){
                const data = { 'oldPassword': old_password, 'newPassword': updated_password };
                fetch("/api/auth/updatePassword", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(response => {
                    console.log("password response: ");
                    console.log(response);
                    console.log(response.message);
                    console.log(response.error);
                    if(response.error){
                        $("#profile-error-field").text(response.message);
                        $("#profile-edit-password-button").click();

                    } else {
                        $("#profile-edit-current-password").val("");
                        $("#profile-edit-new-password").val("");
                        $("#profile-edit-confirm-password").val("");
                        $("#profile-error-field").text("");
                    }
                })
                .catch(error => console.error('Error:',error));
                } else {
                    $("#profile-error-field").text("Password must contain 1 lower case, 1 upper case, 1 special character, 1 digit and be at least 6 characters long");
                    $("#profile-edit-password-button").click();

                }
           

            

        } else {
            $("#profile-error-field").text("Passwords do not match");
            $("#profile-edit-password-button").click();
            $("#profile-edit-new-password").focus();
           
        }
       
    }
}
function hideEditProfilePassword(){
    $("#profile-password-label").toggle();
    $("#profile-edit-password-button").css('visibility','visible');
    $("#profile-edit-current-password").css('display','none');
    $("#profile-edit-new-password").css('display','none');
    $("#profile-edit-confirm-password").css('display','none');
    $("#profile-save-password-button").css('display','none');
    $("#profile-cancel-password-button").css('display','none');
}
var user_cache = {}

function loadUser(){
    fetch("/api/chat/getUser", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(response => {
        $('#welcome-username').text(response.username);
        $('#profile-username').text(response.username);
        $.get("uploads/profile-image-"+response.username+".png")
        .done(function() { 
            // exists code 
            console.log("profile exists for "+response.username);
            $('#profile-user-picture').attr('src', "uploads/profile-image-"+response.username+".png");
        }).fail(function() { 
            // not exists code
            console.log("could not find "+response.username+" profile image.");
            $('#profile-user-picture').attr('src', "https://robohash.org/"+response.username+".png");
        });
        $('#profile-edit-first-name').val(response.firstname);
        $('#profile-edit-last-name').val(response.lastname);
        $('#profile-edit-email').val(response.email);
        console.log(response);

        time_setting = response.setting.time;
        if(!time_setting){
            $("#setting-time-format-select").val("1");
        }
       

        light_theme_setting = response.setting.light;
        if(!light_theme_setting){
            $("#setting-theme-select").val("1");
            $("body").addClass("dark-theme");
        } 

        user_cache = response;
    })
    .catch(error => console.error('Error:',error));
}


function loadUsername(){
    fetch("/api/chat/getUsername", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(response => {
        $('#welcome-username').text(response.username);
    })
    .catch(error => console.error('Error:',error));
}

function loadChatList(){
    fetch("/api/chat/getChatList", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(response => {
        console.log("Before: ");
        console.log(response.chats);
        //sort the chats by order of most recent time stamp of last message
        for(var i=0; i<response.chats.length; i++){
            var temp = response.chats[i];
            var j = i - 1;
            while (j >= 0 && response.chats[j].preview.timestamp < temp.preview.timestamp) {
                response.chats[j+1] = response.chats[j];
                j--;
            }
            response.chats[j+1] = temp;
        }
        console.log("After: ");
        console.log(response.chats);

        for(var i=0; i<response.chats.length; i++){
            if(response.chats[i].group){
                console.log(response.chats[i]);
                if(i != 0){
                    const line_node = document.createElement("div");
                    line_node.className = "line-break";
                    document.getElementById("drawer-chat-list").appendChild(line_node);
                }
                const chat = createDrawerChatItemNode(response.chats[i].id, response.chats[i].name, response.chats[i].preview, response.chats[i].unread);
                document.getElementById("drawer-chat-list").appendChild(chat);
            } else {
                //load dm
                console.log("dm chat loaded");
                console.log(response.chats[i]);
                console.log(response.chats[i].members);

                //find the current user
                let current_user = String($("#welcome-username").text());
                dm_members = response.chats[i].members;

                //remover the current user
                var current_user_index = dm_members.indexOf(current_user);
                if (current_user_index > -1) {
                    dm_members.splice(current_user_index, 1);
                }
                //only member remaining will be the other member in the dm
                dm_user = dm_members[0];

                //add chat ID to the contact button 
                $("#drawer-contact-list").find("h3:contains('"+dm_user+"')").attr('id', response.chats[i].id);


                //load dm into chat list
                console.log(response.chats[i]);
                if(i != 0){
                    const line_node = document.createElement("div");
                    line_node.className = "line-break";
                    document.getElementById("drawer-chat-list").appendChild(line_node);
                }
                const chat = createDrawerChatItemNode(response.chats[i].id, dm_user, response.chats[i].preview, response.chats[i].unread);
                document.getElementById("drawer-chat-list").appendChild(chat);
                


            }
            console.log(response.chats[i].id);
            socketio.emit("change_room", {room: response.chats[i].id});
            
        }
        $("#loading-chat-list").css("display", "none");
    })
    .catch(error => console.error('Error:',error));
}


function loadContactList(){
    fetch("/api/chat/getAllContacts", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(response => {
        for(var i=0; i<response.contacts.length; i++){
            //create the contact node
            const contact = createContactItemNode(response.contacts[i].id, response.contacts[i].name);

            //add the contact to the drawer list of contacts
            document.getElementById("drawer-contact-list").appendChild(contact);
            console.log(contact);
            contact.getElementsByTagName("img")[0].addEventListener("error", function(){
                this.src = "https://robohash.org/"+contact.getElementsByTagName("h3")[0].innerHTML+".png";
            });
            //add the contact to the dm contact list
            let dm_contact = contact.cloneNode(true);
            dm_contact.getElementsByTagName("img")[0].addEventListener("error", function(){
                this.src = "https://robohash.org/"+dm_contact.getElementsByTagName("h3")[0].innerHTML+".png";
            });
            document.getElementById("add-direct-chat-search-list").appendChild(dm_contact);
            //add the contact to create new chat add user list
            let group_add_contact = contact.cloneNode(true);
            group_add_contact.getElementsByTagName("img")[0].addEventListener("error", function(){
                this.src = "https://robohash.org/"+group_add_contact.getElementsByTagName("h3")[0].innerHTML+".png";
            });
            document.getElementById("new-group-add-member-search-list").appendChild(group_add_contact);
            //add the contact to the dm contact list
            let add_contact = contact.cloneNode(true);
            add_contact.getElementsByTagName("img")[0].addEventListener("error", function(){
                this.src = "https://robohash.org/"+add_contact.getElementsByTagName("h3")[0].innerHTML+".png";
            });
            document.getElementById("add-member-search-list").appendChild(add_contact);
        }
        $("#loading-contact-list").css("display", "none");
    })
    .catch(error => console.error('Error:',error));
}

var chat_cache = {};


function loadChat(id){
    $('#message-list').data('chat',id);
    let test ="hello world";
    // Make a URL-encoded string for fetching the chat
    const data = { 'id': id };
    fetch("/api/chat/getChat", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(response => {
        console.log("chat response: ");
        console.log(response);
        chat_cache[id] = response;
        displayChat(id);       
    })
    .catch(error => console.error('Error:',error));
}

function loadDM(user){
    // //check if the chat has already been loaded
    var dm_id = false;
    try {
        dm_id = $("#drawer-contact-list").find("h3:contains('"+user+"')").attr('id');
    } catch (err){
        console.log("error, could not find dm chat, creating new dm");
    }
    console.log("Test: "+dm_id);
    


    if (typeof dm_id !== typeof undefined && dm_id !== false && chat_cache.hasOwnProperty(dm_id) && chat_cache[dm_id]) {
        console.log("displaying chat from chat cache");
        displayChat(dm_id);   
        openChatView();
        $('#message-list').data('chat',dm_id);
        socketio.emit("change_room", {room: dm_id});
    } else {

        //else fetch the chat
        console.log("making api call for DM");
        console.log(user);
        //make api call to get the dm chat
        const data = { 'user': user };
        fetch("/api/chat/getDM", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(response => {
            console.log("chat response: ");
            console.log(response);
            chat_cache[response._id] = response;
            displayChat(response._id);     
            openChatView();
            $('#message-list').data('chat',response._id);
            socketio.emit("change_room", {room: response._id});
        })
        .catch(error => console.error('Error:',error));

    }
    // openChatView();
    // $('#message-list').data('chat',dm_id);
    // socketio.emit("change_room", {room: dm_id});
    
}

//keep track of the last time stamp
var last_timestamp = 0;
//if time stamp is greater than an hour display the time
const delta_time = 3600000;

function displayChat(id){
   
    //todo update chat id
    $('#message-list').data('chat',id);
    $("#"+id).find(".notification").first().css("display", "none");
    $("#"+id).find(".notification").first().text("0");

    console.log("make sure this id is correct: "+id);
    if (chat_cache.hasOwnProperty(id) && chat_cache[id]){
        document.getElementById("message-list").innerHTML = "";
        let chat_obj = chat_cache[id];
        var chat = chat_obj.messages;
        if(chat.length == 0){
            let welcome =  {
                _id: null,
                author: null,
                message: "No messages yet. Send a message to start the conversation",
                timestamp: null,
                likes: [],
                chat_update: true,
                update_type: "welcome",
                update_data: null,
              }
            //create the message node
            const message = createMessageNode(welcome);
            message.classList.add("welcome");
            //add the message to the chat
            document.getElementById("message-list").appendChild(message);
        } else {
             //load all the messages in the chat
            for(var i=0; i<chat.length; i++){
                //check if its the first element in the chat or its been more than delta time
                var message_timestamp = chat[i].timestamp;
                if(message_timestamp>(last_timestamp+delta_time) || i==0){
                    const timestamp_node = createTimestampNode(message_timestamp);
                    document.getElementById("message-list").appendChild(timestamp_node);
                }
                last_timestamp = message_timestamp;
                //create the message node
                const message = createMessageNode(chat[i]);
        
                //add the message to the chat
                document.getElementById("message-list").appendChild(message);
            }

        }
       
        //load the members of the chat
        let member_list = chat_obj.members;
        let group_flag = chat_obj.group;
        let admin_list = chat_obj.admins;
        let chat_owner = chat_obj.owner;
        let chat_name = chat_obj.chat;
        let chat_description = chat_obj.description;
        let current_user = String($("#welcome-username").text());
        console.log("current user: " + current_user);
        console.log(member_list);
        console.log(group_flag);
        console.log(admin_list);
        console.log(chat_owner);
        console.log(chat_name);
        console.log(chat_description);

        //$("#group-chat-header-picture").attr("src", "https://robohash.org/"+chat_name+".png");
        updateGroupChatImage($("#chat-setting-profile-image").children().first(), id);
        updateGroupChatImage($("#modal-chat-setting-profile-image").children().first(), id);

        // $("#chat-setting-profile-image").children().first().attr('src', "https://robohash.org/"+chat_name+".png");
        // $("#modal-chat-setting-profile-image").children().first().attr('src', "https://robohash.org/"+chat_name+".png");
        
        $("#chat-description").text(chat_description);
        $("#modal-chat-setting-edit-description").val(chat_description);
        console.log("length: " + member_list.length);
        $("#chat-member-count").text(member_list.length);
        $("#member-chat-count").text(member_list.length);

        $("#modal-chat-setting-edit-group-name").val(chat_name);
        $("#setting-chat-title").text(chat_name);
        $("#member-chat-title").text(chat_name);

        //check if it is a group chat or a direct message
        if(group_flag){
            $("#group-chat-menu-button").show();

            //update the member list
            for(var i=0; i<member_list.length; i++){
                let member = member_list[i]
                owner = chat_owner == member;
                self = current_user == member;

                const member_node = createMemberCard(member, owner, self);
                $("#member-grid").append(member_node);
            }
            //update the add member list
            $("#add-member-search-list").children('.contact-target').each(function () {
                if(member_list.includes(String($(this).children('h3').text()))){
                    $(this).addClass("checked");
                } else {
                    $(this).removeClass("checked");
                }
            });
        } else {
            $("#group-chat-menu-button").hide();
            $("#chat-drop-down-menu").addClass("hidden");


            //set up direct message header

            //find the current user
            dm_members = member_list;

            //remover the current user
            var current_user_index = dm_members.indexOf(current_user);
            if (current_user_index > -1) {
                dm_members.splice(current_user_index, 1);
            }
            //only member remaining will be the other member in the dm
            dm_user = dm_members[0];

            console.log("creating dm chat header");
            $("#chat-title-bar-header").text(dm_user);
            $.get("uploads/profile-image-"+dm_user+".png")
            .done(function() { 
                $("#group-chat-header-picture").attr('src', "uploads/profile-image-"+dm_user+".png");
            }).fail(function() { 
                $("#group-chat-header-picture").attr('src', "https://robohash.org/"+dm_user+".png");
            });


        }

       


    } else {
        loadChat(id);
    }
}
function updateGroupChatImage(element, chat_id){
    $.get("uploads/group-chat-image-"+chat_id+".png")
    .done(function() { 
       element.attr('src', "uploads/group-chat-image-"+chat_id+".png");
    }).fail(function() { 
        element.attr('src', "https://robohash.org/"+chat_id+".png");
    });
}

function likeMessage(id){
    var chat_id = $('#message-list').data('chat');
    socketio.emit("like_to_server", {message:id, chat:chat_id});
}

function logout(){
    console.log("log out");
    var chats = [];
    //get all notification counts for each chat
    $('#drawer-chat-list').children().each(function () {
        //parseInt(this.find(".notification").text())
        if($(this).hasClass("search-item")){
            notification_count = parseInt($(this).find(".notification").text());
            console.log(this.id);
            console.log(notification_count);
            chats.push({
                id: this.id,
                unread: notification_count,
            });
        }
    });


    console.log(chats);

    //TODO
    let data = {chats: chats};
    
    fetch("/api/auth/logout", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(()=>{setTimeout('location.reload(true);',0);})
    .catch(error => console.error('Error:',error));
}


function sendMessage(){
    //get the message to be sent

    let message = String($("#text-area-message-input").text());
    console.log(message);
    var chat_id = $('#message-list').data('chat');
    if(message == ""){
        console.log("message can't be blank");
    } else {
        socketio.emit("message_to_server", {message:message, chat:chat_id});
    }

    console.log("Send: "+message);
    console.log("chat id: "+chat_id);
    //clear the text that was sent
    $("#text-area-message-input").empty();
    $("#text-area-message-input").blur();
    
}

function updateChatTitle(updated_title, chat_id){
    
    if(updated_title == ""){
        $("#modal-chat-setting-error-field").text("Title can't be blank");
        $("#modal-chat-setting-edit-name-button").text("Save");
        $("#modal-chat-setting-edit-group-name").removeAttr('disabled');
        $("#modal-chat-setting-edit-group-name").removeClass('edit-disabled');
        $("#modal-chat-setting-edit-group-name").focus();


    } else {
        socketio.emit("update_group_chat_title", {title:updated_title, chat:chat_id});
    }

    console.log("New title: "+updated_title);
    console.log("chat id: "+chat_id);
    
}
function updateTitle(update_title){
    var chat_id = $('#message-list').data('chat'); 

    $("#modal-chat-setting-edit-group-name").val(update_title);
    $("#setting-chat-title").text(update_title);
    $("#member-chat-title").text(update_title);
    $("#"+chat_id).find('h3').text(update_title);
    $("#chat-title-bar-header").text(update_title);
    // $("#group-chat-header-picture").attr('src', "https://robohash.org/"+update_title+".png");
    // $("#chat-setting-profile-image").children().first().attr('src', "https://robohash.org/"+update_title+".png");
    // $("#modal-chat-setting-profile-image").children().first().attr('src', "https://robohash.org/"+update_title+".png");
    // $("#"+chat_id).find('img').attr('src', "https://robohash.org/"+update_title+".png");
    chat_cache[chat_id].chat = update_title;


}
function updateChatDescription(updated_description, chat_id){
    if(updated_description == ""){
        $("#modal-chat-setting-error-field").text("Description can't be blank");
        $("#modal-chat-setting-edit-description-button").text("Save");
        $("#modal-chat-setting-edit-description").removeAttr('disabled');
        $("#modal-chat-setting-edit-description").removeClass('edit-disabled');
        $("#modal-chat-setting-edit-description").focus();
    } else {
        socketio.emit("update_group_chat_description", {description:updated_description, chat:chat_id});
    }

    console.log("New description: "+updated_description);
    console.log("chat id: "+chat_id);
}
function updateDescription(updated_description){
    var chat_id = $('#message-list').data('chat'); 

    $("#modal-chat-setting-edit-description").val(updated_description);
    $("#chat-description").text(updated_description);
    chat_cache[chat_id].description = updated_description;


}
// function addChatUser(user_list, chat_id){
//     console.log(user_list);
//     if(user_list.length > 1){
//         console.log("No users to add");
//     } else {
//         socketio.emit("add_chat_user", {user:user_list, chat:chat_id});
//     }
//     console.log("chat id: "+chat_id);
// }
function addUser(user_list){

    // Update the chat cache member list
    var chat_id = $('#message-list').data('chat');

    console.log(user_list);
    for(var i=0; i<user_list.length; i++){
        chat_cache[chat_id].members.push(user_list[i]);
        const member_node = createMemberCard(user_list[i], false, false);
        $("#member-grid").append(member_node);
    }

    //update the add member list
    $("#add-member-search-list").children('.contact-target').each(function () {
        if(user_list.includes(String($(this).children('h3').text()))){
            $(this).addClass("checked");
        } 
    });
    let member_count =  $("#chat-member-count").text();
    $("#chat-member-count").text(+member_count +  +user_list.length);
    $("#member-chat-count").text(+member_count +  +user_list.length);
  
    

}
function removeChatUser(user, chat_id){
   
    socketio.emit("remove_chat_user", {user:user, chat:chat_id});
    document.getElementById("member-grid").removeChild(document.getElementById("member-"+user));
    

    console.log("Remove: "+user);
    console.log("chat id: "+chat_id);
}
function removeUser(user){
    console.log("removing user");
    console.log(user);

    //remove the user from the chat cache
    var chat_id = $('#message-list').data('chat');

    //remover the user from cache
    var user_index = chat_cache[chat_id].members.indexOf(user);
    if (user_index > -1) {
        chat_cache[chat_id].members.splice(user_index, 1);
    }

    //remove the user from the members of the chat
    $("div").remove("#member-"+user);
    //update the member count
    let member_count =  $("#chat-member-count").text();
    console.log(member_count);
    $("#chat-member-count").text(member_count - 1);
    $("#member-chat-count").text(member_count - 1);

     //update the add member list
     $("#add-member-search-list").children('.contact-target').each(function () {
        if(user == String($(this).children('h3').text())){
            $(this).removeClass("checked");
        }
    });


}
function toggleMenuOpen(){
    if( $("#side-menu").hasClass("slide-menu-left")){

        $("#side-menu").removeClass("slide-menu-left");
        $("#content").removeClass("slide-content-left");

        $("#side-menu").toggleClass("slide-menu-right");
        $("#content").toggleClass("slide-content-right");
        

        
    }
}

function openChatView(){
    $("#chat-title-bar").css("display","block");
    $("#home").css("display","none");
    $("#setting").css("display", "none");
    $("#profile-page").css("display","none");
    $("#message-list").css("display","block");
    $("#input-message-bar").css("display","flex");
}

function closeChatView(){
    $("#chat-title-bar").css("display","none");
    $("#home").css("display","block");
    $("#message-list").css("display","none");
    $("#input-message-bar").css("display","none");
    $("#chat-drop-down-menu").addClass("hidden");
    $("#group-chat-menu-button").removeClass('up');
    $("#member-grid").children().not('div:first').remove();

}

function openSettingView(){
    closeChatView();
    $("#profile-page").css("display","none");
    $("#home").css("display","none");
    $("#setting").css("display", "block");
    
}

function openProfileView(){
    closeChatView();
    $("#home").css("display","none");
    $("#setting").css("display", "none");
    $("#profile-error-field").text("");
    $("#profile-page").css("display","block");

    //restore the profile to the user cache
    $('#welcome-username').text(user_cache.username);
    $('#profile-username').text(user_cache.username);
    // $('#profile-user-picture').attr('src', "https://robohash.org/"+user_cache.username+".png");
    $('#profile-edit-first-name').val(user_cache.firstname);
    $('#profile-edit-last-name').val(user_cache.lastname);
    $('#profile-edit-email').val(user_cache.email);

    //clear the error field
    $("#profile-error-field").text("");

    $("#profile-edit-first-name-button").text("Edit");
    $("#profile-edit-first-name").attr('disabled','disabled');
    $("#profile-edit-first-name").addClass('edit-disabled');

    $("#profile-edit-last-name-button").text("Edit");
    $("#profile-edit-last-name").attr('disabled','disabled');
    $("#profile-edit-last-name").addClass('edit-disabled');

    $("#profile-edit-email-button").text("Edit");
    $("#profile-edit-email").attr('disabled','disabled');
    $("#profile-edit-email").addClass('edit-disabled');

    $("#profile-password-label").css("display","inline-block");
    $("#profile-edit-password-button").css("visibility","visible");

    $("#profile-edit-current-password").css("display","none");
    $("#profile-edit-new-password").css("display","none"); 
    $("#profile-edit-confirm-password").css("display","none");
    $("#profile-save-password-button").css("display","none");
    $("#profile-cancel-password-button").css("display","none");

    

    $("#profile-edit-current-password").val("");
    $("#profile-edit-new-password").val("");
    $("#profile-edit-confirm-password").val("");

}

function createNewGroup(new_group_chat_add_member_list){
    let group_name = String($("#edit-group-chat-title").val());
    let group_description = String($("#edit-group-chat-description").val());

    //clear the input fields
    $("#edit-group-chat-title").val("");
    $("#edit-group-chat-description").val("");
    //close the modal
    $("#add-group-chat-modal").css("display","none");


    console.log("creating chat with members to db: ");
    //update the add member list 
    $("#new-group-add-member-search-list").children().removeClass("add")

    console.log(new_group_chat_add_member_list);

    socketio.emit("new_group_chat", {chat:group_name, description:group_description, members:new_group_chat_add_member_list});

    
    //reset back to cancel button
    $("#cancel-add-member-button").children(":first").text("cancel");
    $("#cancel-add-member-button").removeClass("add-member");

    console.log(group_name);
    console.log(group_description);
    console.log("creating new group...");    

}

function createDrawerChatItemNode(id, title, last_message, unread){
    const item_node = document.createElement('div');
    item_node.className = "search-item message-header chat-target"
    item_node.id = id;
    
    const picture_node = document.createElement('div');
    picture_node.className = "group-chat-picture";

    const img_node = document.createElement('img');
    img_node.src = "uploads/group-chat-image-"+id+".png";
    img_node.alt = "profile";
    img_node.addEventListener("error", function(){
        this.src = "https://robohash.org/"+id+".png";
    });

    picture_node.appendChild(img_node);
    item_node.appendChild(picture_node);

    title_node = document.createElement('h3');
    title_node.innerHTML = title;

    const preview_timestamp_node = document.createElement("h4");
    let last_message_date = new Date(last_message.timestamp);
    console.log(last_message_date);
    console.log(last_message_date.getDate());
    console.log(last_message_date.toDateString());
    console.log(last_message_date.toString());
    console.log(last_message_date.toLocaleDateString());
    console.log(last_message_date.toLocaleString());


    preview_timestamp_node.innerHTML = last_message_date.toDateString();
    preview_timestamp_node.className = "preview-message-date";

    const preview_message_node = document.createElement('p');
    preview_message_node.className = "preview-message";


    const preview_author_node = document.createElement('strong');
    preview_author_node.innerHTML = last_message.author;
    preview_author_node.className = "preview-message-author";

    preview_message_node.appendChild(preview_author_node);

    preview_message_node.innerHTML += last_message.message;

    const notification_node = document.createElement('div');
    notification_node.className = "notification";
    notification_node.innerHTML = unread;
    if(unread > 0){
        notification_node.style.display = "block";
    }



    item_node.appendChild(title_node);
    item_node.appendChild(preview_timestamp_node);
    item_node.appendChild(preview_message_node);
    item_node.appendChild(notification_node);


    return item_node;
}

function createContactItemNode(id, user){
    const item_node = document.createElement('div');
    item_node.className = "search-item message-header contact-target";
    // item_node.id = id;
    
    const picture_node = document.createElement('div');
    picture_node.className = "user-profile-picture";

    const img_node = document.createElement('img');
    console.log("starting build: " +user);
    // $.get("uploads/profile-image-"+user+".png")
    // .done(function() { 
    //     console.log("found profile =) for "+user);
    //     img_node.src = "uploads/profile-image-"+user+".png";
    // }).fail(function() { 
    //     console.log("nope =( "+user);
    //     img_node.src = "https://robohash.org/"+user+".png";
    // });

    img_node.src = "uploads/profile-image-"+user+".png";
    // img_node.addEventListener("error", function(){
    //     img_node.src = "https://robohash.org/"+user+".png";
    // });
    // img_node.onerror = () => {
    //     console.log("error loading image...");
    //     console.log(this);
    //     console.log(this.src);
    //     this.src="https://robohash.org/"+user+".png";
    // }
    // let default_img_path = "\'https://robohash.org/"+user+".png\'"
    // img_node.onerror="this.src="+default_img_path;


    // img_node.onerror = "this.src='https://robohash.org/"+user+".png'";
    // img_node.onerror = "test";

    
    console.log("ending build: "+user);
    img_node.alt = "profile";

    picture_node.appendChild(img_node);
    item_node.appendChild(picture_node);

    title_node = document.createElement('h3');
    title_node.innerHTML = user;

    item_node.appendChild(title_node);

    return item_node;

 
    
}

function createMessageNode(message){
    const message_node = document.createElement('div');
    var current_user = String($("#welcome-username").text());
    if(message.author == current_user){
        message_node.className = "message self-message";
    } else {
        message_node.className = "message";
    }
 
    const message_body_node = document.createElement('div');
    message_body_node.className = "message-content";    

    const message_text_node = document.createElement('p');
    message_text_node.innerHTML = message.message;
    if(message.chat_update){
        message_text_node.className = "chat-update";
    } else {
        const message_header_node = document.createElement('div');
        message_header_node.className = "message-header";
        const picture_node = document.createElement('div');
        picture_node.className = "user-profile-picture";
    
        const img_node = document.createElement('img');
        img_node.alt = "profile";
        
    
        const name_node = document.createElement('h3');
        name_node.innerHTML = message.author;
        $.get("uploads/profile-image-"+message.author+".png")
        .done(function() { 
            img_node.src = "uploads/profile-image-"+message.author+".png";
        }).fail(function() { 
            img_node.src = "https://robohash.org/"+message.author+".png";
        });
        picture_node.appendChild(img_node);
        message_header_node.appendChild(picture_node);
        message_header_node.appendChild(name_node);
        message_node.appendChild(message_header_node);

    }
 

    message_body_node.appendChild(message_text_node);

    const message_like_button_node = document.createElement('span');
    //figure out the state of the like button
    if(message.likes.length > 0){
        message_like_button_node.className = "like-button liked";
        var flag = true;
        for(var i=0; (i<message.likes.length)&&flag; i++){
            //check if user liked the message
            if(String($("#welcome-username").text()) == message.likes[i]){
                message_like_button_node.className = "like-button like-toggle";
                flag = false;
            }
        }
    } else {
        message_like_button_node.className = "like-button like";
    }
    message_like_button_node.id = message._id;
    const like_label_node = document.createElement('label');
    like_label_node.className = "like-count";
    like_label_node.innerHTML = message.likes.length > 0 ? message.likes.length : '';

    message_like_button_node.appendChild(like_label_node);


    message_body_node.appendChild(message_like_button_node);

    if(message.update_type == "welcome"){
        message_body_node.removeChild(message_like_button_node);
    }


    message_node.appendChild(message_body_node);


    return message_node;
}

var time_setting = true;

var week = ['SUN','MON','TUE','WED','THU','FRI','SAT']
var month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function createTimestampNode(time){
    //get the current data
    var current_date = new Date();

    //conver the UTC time to the current time zone
    var message_date = new Date(time);
    var day = message_date.getDay();
    var hour = message_date.getHours();
    var minnute = message_date.getMinutes();
    //format the minutes if it is under 10
    minnute = minnute < 10 ? '0'+minnute : minnute;
    //check if its military time
    if(time_setting){
        if((hour >= 12)){
            hour = hour == 12 ? 12 : hour-12;
            minnute = minnute + ' PM';
        } else {
            hour = hour == 0 ? 12 : hour;
            minnute = minnute + ' AM';
        }
    } else {
        //format the time if its under 10
        hour = hour < 10 ? '0'+hour : hour;
    }

    const time_node = document.createElement('div');
    time_node.className = "time-divider";
    const time_label = document.createElement('h3');

    if(current_date.getFullYear() == message_date.getFullYear() && current_date.getMonth()==message_date.getMonth() && current_date.getDay()==day){
        //check if it is the same year month and day, if so only display time
        time_label.innerHTML = hour + ':' + minnute;
    } else if(current_date.getFullYear() == message_date.getFullYear() && current_date.getMonth()==message_date.getMonth() && (current_date.getDate()-message_date.getDate())<=7){
        //check if the message occured in the last 7 days
        time_label.innerHTML = week[day] + ', ' + hour + ':' + minnute;
    } else if(current_date.getFullYear() == message_date.getFullYear()){
        //check if the message was within the year
        time_label.innerHTML = month[message_date.getMonth()]+' '+message_date.getDate() + ', ' + hour+':'+minnute;
    } else {
        //display the month date and year
        time_label.innerHTML = message_date.getMonth()+1+'/'+message_date.getDate()+'/'+message_date.getFullYear() + ', ' + hour+':'+minnute;
    }


    time_node.appendChild(time_label);

    return time_node;

}

function updateTime(time){
    console.log(time);

    //update the time setting
    time_setting = time;

    //make api call to update the users setting
    const data = { 'time': time };
    fetch("/api/auth/updateSettingTime", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .catch(error => console.error('Error:',error));

}

var light_theme_setting = true;
function updateTheme(light){
    console.log(light);

    //set the setting to the passed in light mode boolean variable
    light_theme_setting = light;

    //change the css classes to be dark or light theme
    if(light_theme_setting){
        $("body").removeClass("dark-theme");
    } else {
        $("body").addClass("dark-theme");
    }


    //make api call to update the users setting
    const data = { 'light': light };
    fetch("/api/auth/updateSettingTheme", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .catch(error => console.error('Error:',error));
    
}

   


function updateLike(message_id, user){
    console.log("updating like....");
    var chat_id = $('#message-list').data('chat');
    console.log(chat_id);
    var message_index = chat_cache[chat_id].messages.findIndex(target => {
        return target._id == message_id;
    });
    console.log(message_index);
    var likes = chat_cache[chat_id].messages[message_index].likes;
    console.log(chat_cache[chat_id].messages[message_index]);
    console.log(likes);
    console.log("---------");

    var like_flag = true;
    var user_liked = false;
    let like_count = likes.length;
    console.log("from: "+user);
    var current_user = String($("#welcome-username").text());
    console.log("current user: "+$("#welcome-username").text());
    for(var i=0; (i<like_count); i++){
        console.log(likes[i]);
        //check if user is unliking
        if(likes[i] == user){
            console.log("unlike :(");
            like_flag = false;     
            chat_cache[chat_id].messages[message_index].likes = likes.slice(0, i).concat(likes.slice(i + 1, like_count))
            like_count--;
            console.log("removed from likes list:");
            console.log(chat_cache[chat_id].messages[message_index].likes);
        } else if(likes[i] == current_user){
            //check if the logged in user liked the post
            console.log("for <3");
            user_liked = true;
        } 
    }
    if(like_flag){
        if(user == current_user){
            console.log("user check <3");
            user_liked = true;
        } 
        console.log("like++");
        chat_cache[chat_id].messages[message_index].likes.push(user);
        like_count++;
    } 
    $("#"+message_id).children(":first").text(like_count);
    //set the heart to empty if noone liked it
    if(like_count==0){
        $("#"+message_id).children(":first").text("");
        $("#"+message_id).attr('class', 'like-button like');
    } else if(user_liked){
        //set the heart to red if the logged in user liked it
        $("#"+message_id).attr('class', 'like-button like-toggle');
    }else {
        //if the message has likes set it to the grey heart
        $("#"+message_id).attr('class', 'like-button liked');

    }
  


}

function createMemberCard(user, owner, self){
    const member_card = document.createElement('div');
    if(owner){
        member_card.className = "member-card owner";
    } else {
        member_card.className = "member-card";
    }
    
    member_card.id = "member-" + String(user);
    const profile_picture = document.createElement('div');
    profile_picture.className = "profile-picture";
    const profile_image = document.createElement('img');
    $.get("uploads/profile-image-"+user+".png")
    .done(function() { 
        profile_image.src = "uploads/profile-image-"+user+".png";
    }).fail(function() { 
        profile_image.src = "https://robohash.org/"+user+".png";
    });
    profile_image.alt = "profile";
    profile_picture.appendChild(profile_image);
    member_card.appendChild(profile_picture);
    
    const username = document.createElement('h2');
    username.innerHTML = user;

    member_card.appendChild(username);
    
    if(!owner && !self){
        const dirrect_message_button = document.createElement('div');
        dirrect_message_button.className = "member-button direct-message-button";
        const dirrect_message_button_label = document.createElement('label');
        dirrect_message_button_label.innerHTML = "Direct Message";
        dirrect_message_button.appendChild(dirrect_message_button_label);
        dirrect_message_button.addEventListener("click", function(){
            console.log("direct message");
            console.log(user);
            //TODO dm
            $("#chat-members-modal").css("display","none");
            loadDM(user);
            console.log($(window).width());
            console.log($( document ).width());
            if($(window).width() < 720){
                $("#side-menu").removeClass("slide-menu-right");
                $("#content").removeClass("slide-content-right");
    
                $("#side-menu").addClass("slide-menu-left");
                $("#content").addClass("slide-content-left");
    
            }
           
        });
        
        member_card.appendChild(dirrect_message_button);

    
        const remove_button = document.createElement('div');
        remove_button.className = "member-button remove-button";
        const remove_button_label = document.createElement('label');
        remove_button_label.innerHTML = "Remove";
        remove_button.appendChild(remove_button_label);

        let chat_id = $('#message-list').data('chat');

        remove_button.addEventListener("click", function(){
            console.log("remove user: "+user);
            removeChatUser(user, chat_id)
  
        });
        member_card.appendChild(remove_button);
    }


    
    return member_card;
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