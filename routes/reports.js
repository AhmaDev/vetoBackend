var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);

/* GET sellPrice listing. */
router.get('/', function (req, res, next) {
  res.sendStatus(200)
});


/// NOT FINISHED YET

router.get('/overview', function (req, res, next) {
  var query = "";
  if (req.query.from == undefined || req.query.from == null || req.query.to == undefined || req.query.to == null) {
    var today = new Date();
    var date1 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var date2 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  } else {
    var date1 = req.query.from
    var date2 = req.query.to
  }
  if (req.query.superVisorId != undefined) {
    query = query + " AND @superVisorId = " + req.query.superVisorId
  }
  if (req.query.delegateId != undefined) {
    query = query + " AND idUser = " + req.query.delegateId
  }
  connection.query(`SELECT * ,'******' As password , (SELECT @totalSelling := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 1 AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}') As totalSelling , (SELECT @totalRestores := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 3 AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}') As totalRestores, (SELECT IFNULL(COUNT(idCustomer),0) FROM customer WHERE createdBy = user.idUser AND isManufacture = 0) As totalCustomers, (SELECT @superVisorId := IFNULL(superVisorId,0) FROM supervisorDelegates WHERE delegateId = user.idUser) As superVisorId , (SELECT username FROM user WHERE idUser = @superVisorId) As superVisorName, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}' AND invoice.invoiceTypeId = 1) As invoicesCount, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}' AND invoice.invoiceTypeId = 3) As restoresCount , (@totalSelling - @totalRestores) As totalRemaining, (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 1 AND invoice.createdBy = user.idUser AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}') As totalGifts , (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 2 AND invoice.createdBy = user.idUser AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}') As totalOffers, IFNULL((SELECT SUM(totalPrice) FROM damagedItemsInvoiceContent JOIN damagedItemsInvoice ON damagedItemsInvoiceContent.damagedItemsInvoiceId = damagedItemsInvoice.idDamagedItemsInvoice WHERE damagedItemsInvoice.createdBy = user.idUser AND DATE(damagedItemsInvoice.createdAt) BETWEEN '${date1}' AND '${date2}'),0) As totalDamaged FROM user JOIN userInfo ON userInfo.userId = user.idUser JOIN sellPrice ON sellPrice.idSellPrice = userInfo.sellPriceId WHERE roleId = 4 ${query}`, (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  })
});


module.exports = router;
