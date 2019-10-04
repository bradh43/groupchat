var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.set('socketio', io);


const mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

// const multer = require('multer');

// //set up storage using multer
// const storage = multer.diskStorage({
//   destination: './public/uploads/',
//   filename: function(req, file, cb){
//     cb(null, file.filename+'-'+Date.now()+path.extname(file.originalname));
//   }

// });

// //init upload of single upload
// const upload = multer({
//   storage: storage,

// }).single('profile-image');


const assert = require('assert');

const uri = 'mongodb+srv://groupchat:groupchat@groupchat-qozyy.mongodb.net/test?retryWrites=true';
const dbName = 'groupchat';

var errorNotFoundRouter = require('./routes/errorNotFound');
var rootRouter = require('./routes/root');

var session = require("express-session")({
  secret: "groupChatSuperSecret",
  resave: true,
  saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

var authApi = require('./routes/api/auth');
var chatApi = require('./routes/api/chat');

const port = 3456;
app.use(session);

app.use(favicon(path.join(__dirname, 'public/assets/icons', 'favicon.ico')))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', rootRouter);

app.use('/api/auth', authApi);
app.use('/api/chat', chatApi);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('404');
});


if (!module.parent) {
  //for runnig node app.js
  server.listen(port);
  console.log('Server running at http://localhost:' + port);
}
//for runnning npm start
// module.exports = app;

global.online_user_list = {};

io.use(sharedsession(session, { autoSave: true }));

mongodb.connect(uri, { useNewUrlParser: true }, function (error, client) {

  if (error) {
    console.log('Error occurred while connecting to MongoDB Atlas...\n', error);
  }

  //set up socket.io
  io.on("connection", function (socket) {
    console.log("socket io connection made!");
   
    if(socket.handshake.session.user){
      console.log("User logged in and added to map");
      console.log(socket.handshake.session.user);
      console.log(socket.id);
      online_user_list[socket.handshake.session.user] = socket.id;
      console.log(online_user_list);

    }
    // socket.on('logout_user', function(){
    //   console.log("logging user out via socket");
    //   delete online_user_list[socket.handshake.session.user];
    //   console.log(online_user_list);
    // });

    socket.on('message_to_server', function (data) {

      let current_time = new Date();

      let message_obj = {
        _id: new ObjectId(),
        chat_id: data["chat"],
        author: socket.handshake.session.user,
        message: data["message"],
        timestamp: current_time.getTime(),
        likes: [],
        chat_update: false,
      }
      console.log("emit data to client");
      io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));



      const groupchat = client.db(dbName);
      console.log("push message DEBUG:");
      console.log(data['chat']);
      console.log(socket.handshake.session.user);
      console.log(message_obj);
      //add message to mongodb chat
      groupchat.collection('chats').findOneAndUpdate({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, { $push: { messages: message_obj } }, function(error, document){
        console.log('Error occurred ', error);
        console.log(document);
        console.log("-------");

        console.log(online_user_list);
        //check if each member is not online
        for(var member in document.value.members){
          console.log(member);
          if(!(document.value.members[member] in online_user_list)){
            console.log(document.value.members[member] + " is offline.");
            console.log(data['chat']);
            //update unread message for that users chat
            groupchat.collection('users').updateOne({$and: [{ username: document.value.members[member]}, {"chats.id": data['chat']}]}, { $inc: { "chats.$.unread": 1 } }, function(error){

            });


          } 
        }
        
      });
      //client.close();
     
    });

    socket.on('update_group_chat_title', function (data) {

      let current_time = new Date();
      let updated_title = data["title"]
      let message_obj = {
        _id: new ObjectId(),
        chat_id: data["chat"],
        author: socket.handshake.session.user,
        message: socket.handshake.session.user + " changed the name of the group to " + updated_title,
        timestamp: current_time.getTime(),
        likes: [],
        chat_update: true,
        update_type: "title",
        update_data: updated_title,
      }
      console.log("emit data to client");
      io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));



      const groupchat = client.db(dbName);
      console.log("push message DEBUG:");
      console.log(data['chat']);
      console.log(socket.handshake.session.user);
      console.log(message_obj);
      //add message to mongodb chat
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, { $push: { messages: message_obj } }, function(error){
        console.log('Error occurred ', error);
      });
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, {$set: { chat: updated_title }}, function(error){
        console.log('Error occurred ', error);
      });
      //client.close();
    });
    
    socket.on('update_group_chat_description', function (data) {

      let current_time = new Date();
      let updated_description = data["description"]
      let message_obj = {
        _id: new ObjectId(),
        chat_id: data["chat"],
        author: socket.handshake.session.user,
        message: socket.handshake.session.user + " changed the description of the group to " + updated_description,
        timestamp: current_time.getTime(),
        likes: [],
        chat_update: true,
        update_type: "description",
        update_data: updated_description,
      }
      console.log("emit data to client");
      io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));



      const groupchat = client.db(dbName);
      console.log("push message DEBUG:");
      console.log(data['chat']);
      console.log(socket.handshake.session.user);
      console.log(message_obj);
      //add message to mongodb chat
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, { $push: { messages: message_obj } }, function(error){
        console.log('Error occurred ', error);
      });
      //update the new chat description in the db
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, {$set: { description: updated_description }}, function(error){
        console.log('Error occurred ', error);
      });
      //client.close();
    });
    
    socket.on('add_chat_user', function (data) {

     

      let current_time = new Date();
      let user_list = data["user"];
      var message = socket.handshake.session.user + " added ";
      for(var i = 0; i < user_list.length; i++){
        if(i == 0){
          message += user_list[i];
        } else if(i == user_list.length-1){
          message += " and "+user_list[i];
        }else {
          message += ", "+user_list[i];
        }
      }
      message += " to the group.";

      console.log(message);

      let message_obj = {
        _id: new ObjectId(),
        chat_id: data["chat"],
        author: socket.handshake.session.user,
        message: message,
        timestamp: current_time.getTime(),
        likes: [],
        chat_update: true,
        update_type: "add",
        update_data: user_list,
      }
      console.log("emit data to client");
      io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));



      const groupchat = client.db(dbName);
      console.log("push message DEBUG:");
      console.log(data['chat']);
      console.log(socket.handshake.session.user);
      console.log(message_obj);
      //add message to mongodb chat
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, { $push: { messages: message_obj } }, function(error){
        console.log('Error occurred ', error);
      });
      //add list of user to the chat
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, {$addToSet: { members: {$each: user_list} }}, function(error){
        console.log('Error occurred ', error);
      });

       //mongo add chat_id to user's list of chats
       groupchat.collection('users').updateMany({username:{$in: data["user"]}}, {$push: {chats:{id: data["chat"], unread: 0}}}, function(error){
         //TODO check       if     this      works ^^^^^^
        console.log('Error occurred ', error);
      });
       //check if the user to add is online
       if(online_user_list[data["user"]]){
        let add_chat_obj = {chat: data['chat'], name: data["name"], preview: data["preview"], unread: 0};
        io.sockets.to(online_user_list[data["user"]]).emit('add_user', JSON.stringify(add_chat_obj));
        
      }
      //client.close();
    });

    
    socket.on('remove_chat_user', function (data) {

      let current_time = new Date();
      let user = data["user"]
      let message_obj = {
        _id: new ObjectId(),
        chat_id: data["chat"],
        author: socket.handshake.session.user,
        message: socket.handshake.session.user + " removed " + user + " from the group.",
        timestamp: current_time.getTime(),
        likes: [],
        chat_update: true,
        update_type: "remove",
        update_data: user,
      }
      console.log("emit data to client");
      io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));



      const groupchat = client.db(dbName);
      console.log("push message DEBUG:");
      console.log(data['chat']);
      console.log(socket.handshake.session.user);
      console.log(message_obj);
      //add message to mongodb chat
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, { $push: { messages: message_obj } }, function(error){
        console.log('Error occurred ', error);
      });
      //remove user from the chat db
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }]}, {$pull: { members: user }}, function(error){
        console.log('Error occurred ', error);
      });

      //mongo remove chat_id from user's list of chats
      groupchat.collection('users').updateOne({username: data["user"]}, {$pull: {chats: {id: data["chat"]}}}, function(error){
        console.log('Error occurred ', error);
      });

      //check if the user to remove is online
      if(online_user_list[data["user"]]){
        let kick_chat_obj = {chat: data['chat']};
        io.sockets.to(online_user_list[data["user"]]).emit('kick_user', JSON.stringify(kick_chat_obj));
        
      }


      //client.close();
    });



    
    socket.on('new_group_chat', function (data) {

      console.log("creating new chat...");
      var members =  data['members'];
      members.push(socket.handshake.session.user);

      let chat_id = new ObjectId();

      let chat_obj = {
        _id: chat_id,
        chat: data['chat'],
        description: data['description'],
        group: true,
        private: false,
        code: null,
        owner: socket.handshake.session.user,
        admins: [socket.handshake.session.user],
        members: members,
        banned: [],
        messages: [],
      }
      console.log("emit data to client");
      // io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));



      const groupchat = client.db(dbName);
     
      //add new chat to mongodb
      groupchat.collection('chats').insertOne(chat_obj , function(error){
        console.log('Error occurred ', error);
      });

      //for each member add the chat id to their list of chats
      groupchat.collection('users').updateMany({username:{$in: members}}, {$push: {chats: {id: String(chat_id), unread:0}}} , function(error){
        console.log('Error occurred ', error);
      });

      console.log("done");

      let current_time = new Date();
      let preview_message = {
        message: "No messages yet.",
        author: "",
        timestamp: current_time.getTime(),
      }
      let add_chat_obj = {chat: chat_id, name: data['chat'], preview: preview_message, unread: 0};

      //check if each member is online, and if so send them a notfication new chat
      for(var member in members){
        if(members[member] in online_user_list){
          io.sockets.to(online_user_list[members[member]]).emit('add_user', JSON.stringify(add_chat_obj));

        }
      }
   
      //client.close();
    });




    socket.on('like_to_server', function (data) {
      like_obj = {
        message: data["message"],
        user: socket.handshake.session.user
      }
      console.log(data["message"]);

      io.sockets.in(data["chat"]).emit('like_to_client', JSON.stringify(like_obj));
      const groupchat = client.db(dbName);
      //update the database to either remove or add the user to the likes
      // const test = groupchat.collection('chats').findOne({$and:[{ _id: ObjectId(data['chat'])}, { members: { $all: [socket.handshake.session.user] } }, {messages:{$all:{_id: data["message"]}}}]}, { $push: { likes: socket.handshake.session.user } }, function(err){
      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, 
                                            { members: { $all: [socket.handshake.session.user]}}, 
                                            { "messages._id": ObjectId(data['message']) } ]}, 
                                            // { "messages.u.username": "michael" }, 
                                            // { "$set": { "friends.$.u.name": "hello" } },
                                            { $addToSet: { "messages.$.likes": socket.handshake.session.user } }, 
                                            // { $push: { likes: socket.handshake.session.user } }, 
                                            function(error, document){
                                              if(document.modifiedCount==0){
                                               unlike(data);
                                                  
                                              }
      });

  
      





    });

    function unlike(data){
      const groupchat = client.db(dbName);

      groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['chat'])}, 
      { members: { $all: [socket.handshake.session.user]}}, 
      { "messages._id": ObjectId(data['message']) } ]}, 
      // { "messages.u.username": "michael" }, 
      // { "$set": { "friends.$.u.name": "hello" } },
      { $pull: { "messages.$.likes": socket.handshake.session.user } }, 
      // { $push: { likes: socket.handshake.session.user } }, 
      function(error){
            console.log('Failed to remove user to likes ', error);
      });
    }


   
    socket.on("leave_chat", function (data) {

        let current_time = new Date();

        console.log(socket.handshake.session.user + " leaving chat "+ data['room'])


        //send message to client to update them that user left the chat
        let message_obj = {
          _id: new ObjectId(),
          chat_id: data["room"],
          author: socket.handshake.session.user,
          message: socket.handshake.session.user + " left the group.",
          timestamp: current_time.getTime(),
          likes: [],
          chat_update: true,
          update_type: "leave",
          update_data: socket.handshake.session.user,
        }
        console.log("emit data to client");
        io.sockets.in(data["room"]).emit('message_to_client', JSON.stringify(message_obj));
  
  
  
        const groupchat = client.db(dbName);
       
        //add message to mongodb chat
        groupchat.collection('chats').updateOne({$and:[{ _id: ObjectId(data['room'])}, { members: { $all: [socket.handshake.session.user] } }]}, { $push: { messages: message_obj } }, function(error){
          console.log('Error occurred ', error);
        });

        //mongo remove the user from the members of the chat
        groupchat.collection('chats').updateOne({_id: ObjectId(data["room"])}, {$pull: { members: socket.handshake.session.user }}, function(error){
          console.log('Error occurred ', error);
        });

        //mongo remove chat_id from user's list of chats
        groupchat.collection('users').updateOne({username: socket.handshake.session.user}, {$pull: {chats:data["room"]}}, function(error){
          console.log('Error occurred ', error);
        });

        //leave the chat room
        socket.leave(data["room"]);


    });
    

    // Change room
    socket.on("change_room", function (data) {
      socket.join(data["room"]);
      //clear the unread messages
      const groupchat = client.db(dbName);

      groupchat.collection('users').updateOne({$and: [{ username: socket.handshake.session.user}, {"chats.id": data['room']}]}, { $set: { "chats.$.unread": 0 } }, function(error){

      });

    });
  });
});
