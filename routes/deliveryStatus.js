var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);

/* GET sellPrice listing. */
router.get('/', function (req, res, next) {
    connection.query("SELECT *,DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%W') As creationDayName, (SELECT username FROM user WHERE idUser = deliveryStatus.deliveryId) As deliveryName FROM deliveryStatus ORDER BY createdAt DESC", (err, result) => {
        result.forEach((e) => e.invoicesData = JSON.parse(e.invoicesData));
        result.forEach((e) => e.delegates = JSON.parse(e.delegates));
        result.forEach((e) => e.invoices = JSON.parse(e.invoices));
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.get('/multipleInvoices', function (req, res, next) {
    connection.query(`SELECT invoiceContent.itemId, SUM(count) As count, SUM(total) As total, invoiceContent.discountTypeId, invoice.createdBy, invoice.sellPriceId, invoice.invoiceTypeId , (SELECT itemName FROM item WHERE idItem = invoiceContent.itemId) As itemName FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.invoiceTypeId = 1 AND invoice.createdBy IN (${req.query.delegates}) AND DATE(invoice.createdAt) = '${req.query.date}' AND invoiceContent.count != 0 GROUP BY invoiceContent.itemId, invoiceContent.discountTypeId ORDER BY invoiceContent.itemId , invoiceContent.discountTypeId`, (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.post('/', function (req, res, next) {
    connection.query("INSERT INTO deliveryStatus SET ?", req.body, (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.post('/multipleInsert', function (req, res, next) {
    for (let i = 0; i < req.body.deliveries.length; i++) {
        connection.query(`SELECT * FROM deliveryDelegates WHERE deliveryId = ${req.body.deliveries[i]}`, (deliveriesErr, deliveriesResult) => {
            var delegatesIds = JSON.stringify(deliveriesResult.map((e) => e.delegateId)).slice(1, -1);
            connection.query(`SELECT invoiceContent.itemId, SUM(count) As count, SUM(total) As total, invoiceContent.discountTypeId, invoice.createdBy, invoice.sellPriceId, invoice.invoiceTypeId , (SELECT itemName FROM item WHERE idItem = invoiceContent.itemId) As itemName FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.invoiceTypeId = 1 AND invoice.createdBy IN (${delegatesIds}) AND DATE(invoice.createdAt) = '${req.body.date}' AND invoiceContent.count != 0 GROUP BY invoiceContent.itemId, invoiceContent.discountTypeId ORDER BY invoiceContent.itemId , invoiceContent.discountTypeId`, (err, result) => {
                connection.query(`SELECT * FROM invoice WHERE invoiceTypeId = 1 AND createdBy IN (${delegatesIds}) AND DATE(invoice.createdAt) = '${req.body.date}'`, (errInvoices, resultInvoices) => {
                    if (result.length > 0) {
                        connection.query("INSERT IGNORE INTO deliveryStatus SET ?", {
                            deliveryId: req.body.deliveries[i],
                            delegates: JSON.stringify(deliveriesResult.map((e) => e.delegateId)),
                            invoicesData: JSON.stringify(result),
                            createdAt: req.body.date,
                            invoices: JSON.stringify(resultInvoices.map((e) => e.idInvoice)),
                            notice: "none",
                        });
                    }
                });
            })
        });
    }
    res.sendStatus(200);
});


router.get('/:id', function (req, res, next) {
    connection.query("SELECT *,DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%W') As creationDayName,  (SELECT username FROM user WHERE idUser = deliveryStatus.deliveryId) As deliveryName FROM deliveryStatus WHERE idDeliveryStatus = ?", [req.params.id], (err, result) => {
        if (result.length > 0) {
            result.forEach((e) => e.invoicesData = JSON.parse(e.invoicesData));
            result.forEach((e) => e.delegates = JSON.parse(e.delegates));
            result.forEach((e) => e.invoices = JSON.parse(e.invoices));
            res.send(result[0]);
        } else {
            res.sendStatus(404);
        }
    })
});

router.put('/:id', function (req, res, next) {
    connection.query("UPDATE deliveryStatus SET ? WHERE idDeliveryStatus = ?", [req.params.id], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.delete('/:id', function (req, res, next) {
    connection.query(`DELETE FROM deliveryStatus WHERE idDeliveryStatus = ${req.params.id}`, req.body, (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


module.exports = router;