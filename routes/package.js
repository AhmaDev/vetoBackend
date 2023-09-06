var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var db = require("../config/database");
var connection = mysql.createConnection(db);

/* GET sellPrice listing. */
router.get("/", function (req, res, next) {
  connection.query("SELECT * FROM package", (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});
/* GET sellPrice listing. */
router.get("/sellPrice/:sellPriceId", function (req, res, next) {
  connection.query(
    "SELECT * FROM package WHERE sellPriceId = ?",
    [req.params.sellPriceId],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.post("/new", function (req, res, next) {
  connection.query("INSERT INTO package SET ?", [req.body], (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});
router.post("/addItem", function (req, res, next) {
  connection.query(
    "INSERT INTO packageItem SET ?",
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.put("/edit/:id", function (req, res, next) {
  connection.query(
    `UPDATE package SET ? WHERE idPackage = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});
router.put("/editItem/:id", function (req, res, next) {
  connection.query(
    `UPDATE packageItem SET ? WHERE idPackageItem = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.delete("/delete/:id", function (req, res, next) {
  connection.query(
    `DELETE FROM package WHERE idPackage = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});
router.delete("/deleteItem/:id", function (req, res, next) {
  connection.query(
    `DELETE FROM packageItem WHERE idPackageItem = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

module.exports = router;
