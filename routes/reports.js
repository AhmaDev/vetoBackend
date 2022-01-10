var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);

/* GET sellPrice listing. */
router.get('/', function(req, res, next) {
  res.sendStatus(200)
});


/// NOT FINISHED YET

router.get('/delivering', function(req, res, next) {
    connection.query("SELECT * FROM sellPrice", (err,result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    })
  });
  

module.exports = router;
