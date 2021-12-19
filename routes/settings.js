var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);

router.get('/', function(req, res) {
    connection.query('SELECT * FROM settings', function(err,result) {
        res.send(result)
    })
})

router.put('/', function(req, res) {
    connection.query('UPDATE settings SET value = ? WHERE variable = "title"', [req.body.title]);
    connection.query('UPDATE settings SET value = ? WHERE variable = "workStartTime"', [req.body.workStartTime]);
    connection.query('UPDATE settings SET value = ? WHERE variable = "workEndTime"', [req.body.workEndTime]);
    res.send("OK")
})




module.exports = router;
