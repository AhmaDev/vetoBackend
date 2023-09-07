var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var db = require("../config/database");
var connection = mysql.createConnection(db);

/* GET sellPrice listing. */
router.get("/", function (req, res, next) {
  connection.query("SELECT * FROM package", (err, result) => {
    if (err) {
      console.log(err);
    }
    connection.query(`SELECT * FROM packageItem`, (err2, result2) => {
      if (err2) {
        console.log(err2);
      }
      result.forEach((element) => {
        element.items = result2.filter((e) => e.packageId == element.idPackage);
      });
      res.send(result);
    });
  });
});
/* GET sellPrice listing. */
router.get("/sellPrice/:sellPriceId", function (req, res, next) {
  connection.query(
    "SELECT * FROM package WHERE sellPriceId = ?",
    [req.params.sellPriceId],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      connection.query(`SELECT * FROM packageItem`, (err2, result2) => {
        if (err2) {
          console.log(err2);
        }
        result.forEach((element) => {
          element.items = result2.filter(
            (e) => e.packageId == element.idPackage,
          );
        });
        res.send(result);
      });
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
router.post("/addPackage", function (req, res, next) {
  connection.query(
    "INSERT INTO package SET ?",
    [req.body.package],
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        let insertId = result.insertId;
        let items = req.body.items.map((e) => [
          e.itemId,
          e.count,
          e.isGift ? 7 : 0,
          insertId,
        ]);
        connection.query(
          `INSERT INTO packageItem (itemId,count,discountTypeId,packageId) VALUES ?`,
          [items],
          (itemsErr, itemsRes) => {
            if (itemsErr) {
              console.log(itemsErr);
              res.sendStatus(500);
            } else {
              res.sendStatus(200);
            }
          },
        );
      }
    },
  );
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
      connection.query(
        `DELETE FROM packageItem WHERE packageId = ${req.params.id}`,
      );
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
