var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var db = require("../config/database");
var connection = mysql.createConnection(db);

/* GET itemGroup listing. */
router.get("/", function (req, res, next) {
  let query = "";

  if (
    req.query.dateRangeFrom != undefined &&
    req.query.dateRangeTo != undefined
  ) {
    query =
      query +
      ` AND DATE(log.createdAt) BETWEEN '${req.query.dateRangeFrom}' AND '${req.query.dateRangeTo}'`;
  }
  connection.query(
    "SELECT * FROM log WHERE 1=1 ${query} ORDER BY log.createdAt ASC",
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.post("/new", function (req, res, next) {
  connection.query("INSERT INTO log SET ?", [req.body], (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});

module.exports = router;
