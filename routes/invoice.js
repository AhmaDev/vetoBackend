var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var db = require('../config/database');
var connection = mysql.createConnection(db);


/* GET invoice listing. */
router.get('/', function (req, res, next) {
    connection.query("SELECT *,(SELECT customerName FROM customer WHERE idCustomer = invoice.customerId) As customerName,(SELECT username FROM user WHERE idUser = invoice.createdBy) As createdByName, (SELECT username FROM user WHERE idUser = invoice.deliveryId) As deliveryName,(SELECT COALESCE(SUM(total),0)  FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalPrice, (SELECT COUNT(*) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalItems, DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%r') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName FROM invoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType", (err, result) => {
        res.send(result)
    })
});

router.get('/id/:id', function (req, res, next) {
    connection.query("SELECT *,(SELECT customerName FROM customer WHERE idCustomer = invoice.customerId) As customerName, (SELECT username FROM user WHERE idUser = invoice.createdBy) As createdByName, (SELECT username FROM user WHERE idUser = invoice.deliveryId) As deliveryName, (SELECT COALESCE(SUM(total),0) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalPrice, (SELECT COUNT(*) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalItems, DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%T') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName FROM invoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE idInvoice IN (?)", [req.params.id], (err, result) => {
        if (result.length > 0) {
            result[0].invoiceTypeId = Number(result[0].invoiceTypeId)
            connection.query(`SELECT *, (SELECT  IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName)  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId WHERE idItem = invoiceContent.itemId) As itemName, (SELECT imagePath FROM item WHERE idItem = invoiceContent.itemId) As imagePath FROM invoiceContent WHERE invoiceId = ${req.params.id}`, (childErr, chileResult) => {
                result[0].items = chileResult
                res.send(result[0])
            })
        } else {
            res.sendStatus(404)
        }
    })
});

router.post('/multiple', function (req, res, next) {
    connection.query("SELECT *, (SELECT GROUP_CONCAT(json_object('itemId',itemId,'discount',discount,'discountTypeId',discountTypeId,'count',count,'price',price,'total',total,'discountName',(SELECT discountName FROM discount WHERE idDiscount = invoiceContent.discountTypeId LIMIT 1),'itemName',(SELECT  IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName)  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId WHERE idItem = invoiceContent.itemId LIMIT 1))) FROM invoiceContent WHERE invoice.idInvoice = invoiceContent.invoiceId) As items , (SELECT customerName FROM customer WHERE idCustomer = invoice.customerId) As customerName,(SELECT phone FROM customer WHERE idCustomer = invoice.customerId) As customerPhone,(SELECT nearBy FROM customer WHERE idCustomer = invoice.customerId) As customerAddress, (SELECT username FROM user WHERE idUser = invoice.createdBy) As createdByName, (SELECT username FROM user WHERE idUser = invoice.deliveryId) As deliveryName, (SELECT COALESCE(SUM(total),0) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalPrice, (SELECT COUNT(*) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalItems, DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%T') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName FROM invoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE idInvoice IN (?)", [req.body.invoices], (err, result) => {
        console.log(err);
        if (result.length > 0) {
            if (row.items != null) {
                result = result.map(row => (row.items = '[' + row.items + ']', row));
                result = result.map(row => (row.items = JSON.parse(row.items), row));
            } else {
                result = result.map(row => (row.items = '[]', row));
                result = result.map(row => (row.items = JSON.parse(row.items), row));
            }
            res.send(result);
        } else {
            res.sendStatus(404)
        }
    })
});

router.get('/filter', function (req, res, next) {

    let query = '';
    let order = '';
    let limit = '';

    if (req.query.id != undefined) {
        query = query + ` AND idInvoice = ${req.query.id}`
    }

    if (req.query.date != undefined) {
        query = query + ` AND DATE(createdAt) = '${req.query.date}'`
    }

    if (req.query.dateRangeFrom != undefined && req.query.dateRangeTo != undefined) {
        query = query + ` AND DATE(createdAt) BETWEEN '${req.query.dateRangeFrom}' AND '${req.query.dateRangeTo}'`
    }

    if (req.query.user != undefined) {
        query = query + ` AND createdBy IN (${req.query.user})`
    }

    if (req.query.type != undefined) {
        query = query + ` AND invoiceTypeId IN (${req.query.type})`
    }

    if (req.query.delivery != undefined) {
        query = query + ` AND deliveryId IN (${req.query.delivery})`
    }

    if (req.query.customer != undefined) {
        query = query + ` AND customerId IN (${req.query.customer})`
    }

    if (req.query.order != undefined) {
        order = 'ORDER BY ' + req.query.order + ' ' + req.query.sort
    }

    if (req.query.limit != undefined) {
        limit = `LIMIT ${req.query.limit}`
    }

    connection.query(`SELECT *,(SELECT customerName FROM customer WHERE idCustomer = invoice.customerId) As customerName,(SELECT username FROM user WHERE idUser = invoice.createdBy) As createdByName, (SELECT username FROM user WHERE idUser = invoice.deliveryId) As deliveryName, (SELECT COALESCE(SUM(total),0) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalPrice, (SELECT COUNT(*) FROM invoiceContent WHERE invoiceId = invoice.idInvoice) As totalItems, DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%r') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName FROM invoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE 1=1 ${query} ${order} ${limit}`, (err, result) => {
        res.send(result)
        console.log(err);
    })
});


router.get('/delivery/:date', function (req, res, next) {
    connection.query("SELECT deliveryId,username AS deliveryName,invoice.createdAt, COUNT(idInvoice) AS totalInvoices,DATE_FORMAT(invoice.createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(invoice.createdAt, '%r') As creationFixedTime, DATE_FORMAT(invoice.createdAt, '%W') As creationDayName FROM invoice JOIN user ON user.idUser = invoice.deliveryId WHERE DATE(invoice.createdAt) = ? AND deliveryId > 0  GROUP BY deliveryId", [req.params.date], (err, result) => {
        console.log(err);
        if (result.length > 0) {
            res.send(result)
        } else {
            res.sendStatus(404)
        }
    })
});

router.get('/delegate/:delegateId/byItems', function (req, res, next) {
    connection.query(`SELECT IFNULL(SUM(invoiceContent.total),0) As total, invoiceContent.itemId FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdBy = ${req.params.delegateId} AND DATE(invoice.createdAt) = DATE(CURRENT_DATE()) GROUP BY invoiceContent.itemId`, [req.params.date], (err, result) => {
        console.log(err);
        res.send(result)
    })
});

router.post('/new', function (req, res, next) {
    connection.query("INSERT INTO invoice SET ?", [req.body.invoice], (err, result) => {
        for (let i = 0; i < req.body.invoiceContents.length; i++) {
            req.body.invoiceContents[i].invoiceId = result.insertId;
            if (req.body.invoiceContents[i].discountTypeId == null) {
                req.body.invoiceContents[i].discountTypeId = 0;
            }
            connection.query(`INSERT INTO invoiceContent SET ?`, [req.body.invoiceContents[i]], (err2, result2) => {
                console.log(err2);
            });
        }
        res.send(result);
    })
});


router.post('/addItemToInvoice', function (req, res, next) {
    if (req.body.discountTypeId == null) {
        req.body.discountTypeId = 0;
    }
    connection.query("INSERT INTO invoiceContent SET ?", [req.body], (err, result) => {
        res.send(result);
    })
});


router.delete('/item/:itemId', function (req, res, next) {
    connection.query("DELETE FROM invoiceContent WHERE idInvoiceContent = ?", [req.params.itemId], (err, result) => {
        res.send(result);
    })
});


router.put('/emptyQuntityOfItem/:itemId', function (req, res, next) {
    connection.query("UPDATE invoiceContent SET ? WHERE idInvoiceContent = ?", [req.body, req.params.itemId], (err, result) => {
        res.send(result);
    })
});

router.put('/setDelivery', function (req, res, next) {
    connection.query("UPDATE invoice SET ? WHERE idInvoice IN (?)", [req.body.deliveryId, req.body.invoices], (err, result) => {
        res.send(result);
        console.log(err);
    })
});


router.put('/setDelegate', function (req, res, next) {
    connection.query("UPDATE invoice SET ? WHERE idInvoice IN (?)", [req.body.deliveryId, req.body.invoices], (err, result) => {
        res.send(result);
        console.log(err);
    })
});



router.get('/type', function (req, res, next) {
    connection.query(`SELECT * FROM invoiceType`, (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.put('/type/:id', function (req, res, next) {
    connection.query(`UPDATE invoiceType SET ? WHERE idInvoiceType = ?`, [req.body, req.params.id], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.delete('/type/:id', function (req, res, next) {
    connection.query(`DELETE FROM invoiceType WHERE idInvoiceType = ?`, [req.params.id], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.put('/edit/:id', function (req, res, next) {
    connection.query(`UPDATE invoice SET ? WHERE idInvoice = ${req.params['id']}`, [req.body.invoice], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.delete('/delete/:id', function (req, res, next) {
    connection.query(`DELETE FROM invoice WHERE idInvoice = ${req.params['id']}`, (err, result) => {
        connection.query(`DELETE FROM invoiceContent WHERE invoiceId = ${req.params['id']}`, (err2, result2) => {
            console.log(err);
            console.log(err2);
        })
        res.send(result);
    })
});


router.delete('/deleteMultiple', function (req, res, next) {
    connection.query(`DELETE FROM invoice WHERE idInvoice IN (?)`, [req.body.invoices], (err, result) => {
        connection.query(`DELETE FROM invoiceContent WHERE invoiceId IN (?)`, [req.body.invoices], (err2, result2) => {
            console.log(err);
            console.log(err2);
        })
        res.send(result);
    })
});

module.exports = router;
