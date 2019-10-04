var express = require('express');
var router = express.Router();
var session = require('express-session');



const assert = require('assert');
const mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

const uri = 'mongodb+srv://groupchat:groupchat@groupchat-qozyy.mongodb.net/test?retryWrites=true';
const dbName = 'groupchat';

const multer = require('multer');
var path = require('path');
var jimp = require('jimp');


// const gcsSharp = require('multer-sharp');


// // simple resize with custom filename
// const storage2 = gcsSharp({
//   filename: (req, file, cb) => {
//       cb(null, `${file.fieldname}-newFilename`);
//   },
//   bucket: 'YOUR_BUCKET', // Required : bucket name to upload
//   projectId: 'YOUR_PROJECTID', // Required : Google project ID
//   keyFilename: 'YOUR_KEYFILENAME', // Optional : JSON credentials file for Google Cloud Storage
//   acl: 'publicRead', // Optional : acl credentials file for Google Cloud Storage, 'publicrRead' or 'private', default: 'private'
//   size: {
//     width: 400,
//     height: 400
//   },
//   max: true
// });
// const upload2 = multer({ storage: storage2 });

// const storage = gcsSharp({
//   destination: './public/uploads/',
//   filename: function(req, file, cb){
//     cb(null, file.fieldname+'-'+req.session.user+'.png');
//   },
//   size: {
//     width: 128,
//     height: 128
//   },
// });

//set up storage using multer
const profileStorage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname+'-'+req.session.user+'.png');
  },
});
const groupChatStorage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname+'-'+req.body.chat+'.png');
  },
});

//init upload of single upload
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter: function(req, file, cb){
    verifyImageFileType(file, cb);
  }
}).single('profile-image');

const groupChatUpload = multer({
  storage: groupChatStorage,
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter: function(req, file, cb){
    verifyImageFileType(file, cb);
  }
}).single('group-chat-image');



function verifyImageFileType(file, cb){
  console.log("testing file: ");
  console.log(file);
  console.log(file.filename);
  //image regex
  let imageFileType = /jpeg|jpg|png|gif/;

  const extname = imageFileType.test(path.extname(file.originalname).toLowerCase());
  const mimetype = imageFileType.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: not an image');
  }
  
}

router.post('/uploadProfileImage', function(req,res){

  console.log("Uploading new profile image");
  console.log(req.session.user + " is updating their image");

 
  profileUpload(req, res, (err) => {
    if(err){
      console.log("ERROR uploading profile image: "+err);
      //TODO send error message back to client
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err}));

    } else {
        if(req.file == undefined){
           //TODO send error message back to client
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'ERROR: No file selected.'}));
        } else {
          console.log("jimp test: ");
          console.log(req.file.path);
          jimp.read(req.file.path, (err, image) => {
            if (err) throw err;
            console.log(req.file.path);
            if(image.bitmap.width > image.bitmap.height){
              image.resize(jimp.AUTO, 128)
              .crop(0, 0, 128, 128)
              .write(req.file.path); 
            } else {
              image.resize(128, jimp.AUTO)
              .crop(0, 0, 128, 128)
              .write(req.file.path); 
            }
           
          });
          
          console.log(req.file);
          res.redirect(req.get('referer'));
          res.end();
        }
    }

  });
  
});

router.post('/uploadGroupChatImage', function(req,res){

  console.log("Uploading new chat image");
 
  groupChatUpload(req, res, (err) => {
    if(err){
      console.log("ERROR uploading group chat image: "+err);
      //TODO send error message back to client
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err}));

    } else {
        if(req.file == undefined){
           //TODO send error message back to client
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'ERROR: No file selected.'}));
        } else {
          jimp.read(req.file.path, (err, image) => {
            if (err) throw err;
            if(image.bitmap.width > image.bitmap.height){
              image.resize(jimp.AUTO, 128)
              .crop(0, 0, 128, 128)
              .write(req.file.path); 
            } else {
              image.resize(128, jimp.AUTO)
              .crop(0, 0, 128, 128)
              .write(req.file.path); 
            }
           
          });
          
          console.log(req.file);
          res.redirect(req.get('referer'));
          res.end();
        }
    }

  });
  
});



router.post('/getUsername', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ username: req.session.user}));
});

router.post('/getUser', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {
    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',error);
    }
    const groupchat = client.db(dbName);
    groupchat.collection('users').findOne({username: req.session.user}, function(err, document) {
      if(err) throw err;
      res.end(JSON.stringify({"username": document.username, "firstname": document.firstname, "lastname": document.lastname, "email": document.email, "setting": document.setting}));
    });
  });
});

router.post('/getChatList', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    var chats_obj = JSON.parse('{"chats":[]}');

    console.log("socket io connection made!");

    //get all the chats the user is in
    mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

        if(error) {
          console.log('Error occurred while connecting to MongoDB Atlas...\n',error);
        }

        

        const groupchat = client.db(dbName);

        groupchat.collection('users').findOne({username: req.session.user}, function(err, document) {

          if(err) throw err;
          if(document && document._id){
            var chat_count = 0;
            var chat_length = document.chats.length;
            //loop through each chat id that the user is in and get the id and chat title
            document.chats.forEach(chat => {
                console.log(chat.id);

                groupchat.collection('chats').findOne({_id: ObjectId(chat.id)}, function(err, document) {
                  let current_time = new Date();  
                  var last_message;
                  if(document.messages.length > 0){
                    last_message = {
                      message: document.messages[document.messages.length-1].message,
                      author: document.messages[document.messages.length-1].author,
                      timestamp: document.messages[document.messages.length-1].timestamp,
                    }
                  } else {
                    last_message = {
                      message: "No messages yet.",
                      author: "",
                      timestamp: current_time.getTime(),
                    }
                  }
                  console.log(document.messages.length);
                  console.log(last_message);
                  chats_obj['chats'].push({"id": chat.id, "name":document.chat, "group": document.group, "members": document.members, "preview": last_message, "unread": chat.unread});
                  chat_count++;
                  if(chat_count ==  chat_length){
                      res.end(JSON.stringify(chats_obj));
                  }
                    
                });
            });

          }
        });
        //client.close();
      });
});

router.post('/getChat', function(req, res){
    console.log(req.body.id);

    res.setHeader('Content-Type', 'application/json');
    var chat_obj = JSON.parse('{"messages":[]}');
    //get all the chats the user is in
    mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

        if(error) {
          console.log('Error occurred while connecting to MongoDB Atlas...\n',error);
        }

        const groupchat = client.db(dbName);
        console.log("starting the db query...");
        //find the group chat that has the id and make sure the logged in user is a member
        groupchat.collection('chats').findOne({_id: ObjectId(req.body.id), members: {$all: [req.session.user]}}, function(err, document) {
          if(err) throw err;
          if(document && document._id){
          
            res.end(JSON.stringify(document));

          }
        });
        //client.close();
    });
});


router.post('/getDM', function(req, res){
  console.log(req.body.user);

  res.setHeader('Content-Type', 'application/json');



  //get all the chats the user is in
  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

      if(error) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n',error);
      }
      const groupchat = client.db(dbName);
      console.log("starting the db query...");
      var members =  [req.session.user, req.body.user];
      console.log(members);

      
      //find one chat where group: false, and members include session user and user to dm
      groupchat.collection('chats').findOne({$and: [{group: false},{members: {$all: [req.session.user, req.body.user]}}]}, function(err, document) {
        if(err) throw err;
        if(document && document._id){
        
          res.end(JSON.stringify(document));

        } else {
          console.log("DM chat not found");
    
          let chat_id = new ObjectId();
    
          let chat_obj = {
            _id: chat_id,
            chat: 'dm',
            description: 'dm',
            group: false,
            private: false,
            code: null,
            owner: req.session.user,
            admins: members,
            members: members,
            banned: [],
            messages: [],
          }
          console.log("emit data to client");
          // io.sockets.in(data["chat"]).emit('message_to_client', JSON.stringify(message_obj));
    
         
          //add new chat to mongodb
          groupchat.collection('chats').insertOne(chat_obj , function(error){
            console.log('Error occurred ', error);
          });
    
          //for each member add the chat id to their list of chats
          groupchat.collection('users').updateMany({username:{$in: members}}, {$push: {chats: {id: String(chat_id), unread: 0}}} , function(error){
            console.log('Error occurred ', error);
          });
          console.log("done");


          res.end(JSON.stringify(chat_obj));

        }
      });
      //client.close();
  });
});



router.post('/getAllContacts', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    var contacts_obj = JSON.parse('{"contacts":[]}');

    //get all the chats the user is in
    mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

        if(error) {
          console.log('Error occurred while connecting to MongoDB Atlas...\n',error);
        }

        const groupchat = client.db(dbName);

        groupchat.collection('users').find({}).toArray((err, contacts) => {
            for(var i=0; i<contacts.length; i++){
                //make sure the user is not the current user
                if(!(contacts[i].username == req.session.user)){
                    contacts_obj['contacts'].push({"id": contacts[i]._id, "name":contacts[i].username});
                }
            }
            res.end(JSON.stringify(contacts_obj));
        });
        
        //client.close();
      });
});







module.exports = router;