var express = require('express');
var router = express.Router();
var session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const assert = require('assert');
const mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

const uri = 'mongodb+srv://groupchat:groupchat@groupchat-qozyy.mongodb.net/test?retryWrites=true';
const dbName = 'groupchat';

router.post('/login', function(req, res, next) {
    authenticate(req.body.username, req.body.password, function(err, user){
      if (user) {

        //regenerate the session
        req.session.regenerate(function(){
          //update the user
          req.session.user = user;
         

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.toString(), timeout: true}));
        });
        // res.redirect('back');

      } else {
         //return invalid username or password
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.toString(), timeout: false}));
      }
    
  });

 
});

router.post('/create', function(req, res, next) {

  createAccount(req.body.username, req.body.password, req.body.firstname, req.body.lastname, req.body.email, function(err, user){
    if (user) {
      //regenerate the session
      req.session.regenerate(function(){
        //update the user
        req.session.user = user;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.toString(), timeout: true}));
      });
    } else {
       //return invalid username or password
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.toString(), timeout: false}));
    }
  
  });
  
});

router.post('/deleteAccount', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);

    //get all the chats the user belongs to
    groupchat.collection('users').findOne({username: req.session.user}, function(err, document) {
      if(err) throw err;
      if(document && document._id){
        
        //loop through each chat id that the user is in and get the id and chat title
        document.chats.forEach(chat => {
          
          //remove the user from the memebers list of the chat
          groupchat.collection('chats').updateOne({_id: ObjectId(chat.id)}, {$pull: { members: req.session.user }}, function(error){
            console.log('Error occurred ', error);
          });
        });
        groupchat.collection('users').deleteOne({username: req.session.user});

      }
    });
  });
});

router.post('/updateFirstName', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').updateOne({username: req.session.user}, {$set: {firstname: req.body.firstname}}, function(err, document) {
      if(err) throw err;

    });
  });
  
});
router.post('/updateLastName', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').updateOne({username: req.session.user}, {$set: {lastname: req.body.lastname}}, function(err, document) {
      if(err) throw err;

    });
  });
  
});
router.post('/updateEmail', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').updateOne({username: req.session.user}, {$set: {email: req.body.email}}, function(err, document) {
      if(err) throw err;

    });
  });
  
});

router.post('/updatePassword', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);


    groupchat.collection('users').findOne({username: req.session.user}, function(err, document) {
      if(err) throw err;
      if(document && document._id){
        bcrypt.compare(req.body.oldPassword, document.password, function(err, result) {
          if(result) {
            bcrypt.genSalt(saltRounds, function(err, salt) {
              bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                groupchat.collection('users').updateOne({username: req.session.user}, {$set: {password: hash}}, function(err, document) {
                  if(err) throw err;
                  console.log("password updated successfully");
                  res.end(JSON.stringify({ message: "password updated successfully", error: false}));
                });
              });
            });
            
          } else {
            console.log("Incorrect password.");
            res.end(JSON.stringify({ message: "Incorrect password.", error: true}));
          } 
        });
      }
    });
  });
  
});

router.post('/updateSettingTime', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').updateOne({username: req.session.user}, {$set: {"setting.time": req.body.time}}, function(err, document) {
      if(err) throw err;

    });
  });
  
});

router.post('/updateSettingTheme', function(req, res, next) {

  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').updateOne({username: req.session.user}, {$set: {"setting.light": req.body.light}}, function(err, document) {
      if(err) throw err;

    });
  });
  
});

router.post('/logout', function(req, res){
  
  delete online_user_list[req.session.user];
  
  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
    console.log("logging out")
    console.log(req.session.user);
    console.log(req.body.chats);
    groupchat.collection('users').updateOne({username: req.session.user}, {$set: {chats: req.body.chats}}, function(err, document) {
      if(err) throw err;
      // destroy the user's session to log them out
      req.session.destroy(function(){
        res.redirect('/');
      });
    });
  });



  
});



// Authenticate using our plain-object database of doom!

function authenticate(username, password, fn) {


  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').findOne({username: username}, function(err, document) {
      if(err) throw err;
      if(document && document._id){
        bcrypt.compare(password, document.password, function(err, res) {
          if(res) {
            // Password matches the hash
            return fn('success', document.username);
          } else {
            return fn(new Error('Incorrect username or password.'), null);
          } 
        });
      }else{
        return fn(new Error('Could not find user '+username), null);
      }
    });
    //client.close();
  });

}

function createAccount(username, password, firstname, lastname, email, fn){
  mongodb.connect(uri, { useNewUrlParser: true } , function(error, client) {

    if(error) {
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }

    const groupchat = client.db(dbName);
 
    groupchat.collection('users').findOne({username: username}, function(err, document) {
      if(err) throw err;

      //check if the account already exists
      if(document && document._id){
        return fn(new Error('Username is already taken'), null);
      }else{
        bcrypt.genSalt(saltRounds, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
              // Store password hash in database
              groupchat.collection('users').insertOne({
                username: username,
                password: hash,
                firstname: firstname,
                lastname: lastname,
                email: email,
                setting: {
                  time: true,
                  light: true,
                },
                chats: [],
              })
              .then(function(result) {
                return fn('account successfully created', username);
              })
          });
        });
  
      }
    });
    //client.close();
  });

  
}
module.exports = router;

