var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var db = require("../config/database");
var connection = mysql.createConnection(db);

/* GET discount listing. */
router.get("/", function (req, res, next) {
  connection.query("SELECT * FROM discount", (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});

router.get("/items", function (req, res, next) {
  let dateQuery = "";

  if (req.query.from != undefined) {
    dateQuery = `AND DATE(invoice.createdAt) BETWEEN '${req.query.from}' AND '${req.query.to}'`;
  }
  connection.query(
    `SELECT user.username,user.idUser, customer.idCustomer, customer.storeName, invoiceContent.*, discount.*,IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName,item.imagePath,DATE_FORMAT(invoice.createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(invoice.createdAt, '%r') As creationFixedTime, DATE_FORMAT(invoice.createdAt, '%W') As creationDayName , SUM(count) As count, (SELECT IFNULL(SUM(count),0) FROM invoiceContent AS subInvoiceContent WHERE subInvoiceContent.itemId = invoiceContent.itemId AND subInvoiceContent.invoiceId = invoiceContent.invoiceId AND subInvoiceContent.discountTypeId = 0) As notFreeCount, (SELECT IFNULL(SUM(total),0) FROM invoiceContent AS subInvoiceContent WHERE subInvoiceContent.invoiceId = invoiceContent.invoiceId) As totalPrice, (SELECT IFNULL(SUM(total),0) FROM invoiceContent AS subInvoiceContent JOIN invoice  ON invoice.idInvoice = subInvoiceContent.invoiceId WHERE DATE(invoice.createdAt) BETWEEN '${req.query.from}' AND '${req.query.to}' AND invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 1) As totalInvoicesPrice FROM invoiceContent JOIN item ON item.idItem = invoiceContent.itemId LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice LEFT JOIN discount ON invoiceContent.discountTypeId = discount.idDiscount LEFT JOIN customer ON customer.idCustomer = invoice.customerId JOIN user ON user.idUser = invoice.createdBy WHERE invoiceContent.discountTypeId != 0 ${dateQuery} GROUP BY invoice.idInvoice, invoiceContent.itemId ,discountTypeId`,
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});
router.get("/items-new", function (req, res, next) {
  try {
    let dateQuery = "";

    if (req.query.from != undefined) {
      dateQuery = `AND DATE(invoice.createdAt) BETWEEN '${req.query.from}' AND '${req.query.to}'`;
    }
    connection.query(
      `SELECT 
    user.username,
    user.idUser,
    customer.idCustomer,
    customer.storeName,
    manufacturer.customerName AS manufactureName,
    invoiceContent.*,
    discount.*,
    IFNULL(CONCAT(itemType , ' ', itemName, ' ', itemWeight, ' ', itemWeightSuffix, ' * ', cartonQauntity, ' ', brand.brandName), item.itemName) AS fullItemName,
    item.imagePath,
    DATE_FORMAT(invoice.createdAt, '%Y-%m-%d') AS creationFixedDate,
    DATE_FORMAT(invoice.createdAt, '%r') AS creationFixedTime,
    DATE_FORMAT(invoice.createdAt, '%W') AS creationDayName,
    SUM(invoiceContent.count) AS count,
    IFNULL(subNotFree.notFreeCount, 0) AS notFreeCount,
    IFNULL(totalPricePerInvoice.totalPrice, 0) AS totalPrice,
    IFNULL(totalPricePerUser.totalInvoicesPrice, 0) AS totalInvoicesPrice
  FROM invoiceContent
  JOIN item ON item.idItem = invoiceContent.itemId
  LEFT JOIN brand ON item.brandId = brand.idBrand
  LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId
  LEFT JOIN customer AS manufacturer ON manufacturer.idCustomer = item.manufactureId
  JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice
  LEFT JOIN discount ON invoiceContent.discountTypeId = discount.idDiscount
  LEFT JOIN customer ON customer.idCustomer = invoice.customerId
  JOIN user ON user.idUser = invoice.createdBy
  LEFT JOIN (
      SELECT itemId, invoiceId, SUM(count) AS notFreeCount
      FROM invoiceContent
      WHERE discountTypeId = 0
      GROUP BY itemId, invoiceId
  ) AS subNotFree ON subNotFree.itemId = invoiceContent.itemId AND subNotFree.invoiceId = invoiceContent.invoiceId
  LEFT JOIN (
      SELECT invoiceId, SUM(total) AS totalPrice
      FROM invoiceContent
      GROUP BY invoiceId
  ) AS totalPricePerInvoice ON totalPricePerInvoice.invoiceId = invoiceContent.invoiceId
  LEFT JOIN (
      SELECT invoice.createdBy AS userId, SUM(subInvoiceContent.total) AS totalInvoicesPrice
      FROM invoiceContent AS subInvoiceContent
      JOIN invoice ON invoice.idInvoice = subInvoiceContent.invoiceId
      WHERE invoice.invoiceTypeId = 1
        AND invoice.createdAt >= '${req.query.from} 00:00:00' AND invoice.createdAt <= '${req.query.to} 23:59:59'
      GROUP BY invoice.createdBy
  ) AS totalPricePerUser ON totalPricePerUser.userId = user.idUser
  WHERE invoiceContent.discountTypeId != 0
    AND invoice.createdAt >= '${req.query.from} 00:00:00' AND invoice.createdAt <= '${req.query.to} 23:59:59'
  GROUP BY invoice.idInvoice, invoiceContent.itemId, discountTypeId;
  `,
      (err, result) => {
        res.send(result);
        if (err) {
          console.log(err);
        }
      },
    );
  } catch (error) {
    console.log(error);

  }

});

router.post("/new", function (req, res, next) {
  connection.query("INSERT INTO discount SET ?", [req.body], (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});

router.put("/edit/:id", function (req, res, next) {
  connection.query(
    `UPDATE discount SET ? WHERE idDiscount = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

// router.delete('/delete/:id', function(req, res, next) {
//   connection.query(`DELETE FROM discount WHERE idDiscount = ${req.params['id']}`,[req.body], (err,result) => {
//     res.send(result);
//     if (err) {
//       console.log(err);
//     }
//   })
// });

module.exports = router;
