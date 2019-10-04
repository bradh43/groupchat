var express = require('express');
var router = express.Router();

router.get('/', restrict, function(req, res){
    res.render('home', { title: 'Express' });
});

module.exports = router;

function restrict(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.session.error = 'Access denied!';
      res.render('login', { title: 'Express' });
    }
  }