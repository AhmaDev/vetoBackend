var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);

/* GET customer listing. */
router.get('/', function (req, res, next) {
    connection.query("SELECT * ,(SELECT storeName FROM customer WHERE idCustomer = damagedItemsInvoice.customerId) As customerName,DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%T') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName, (SELECT username FROM user WHERE idUser = damagedItemsInvoice.createdBy) As createdByName FROM damagedItemsInvoice", (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.get('/id/:id', function (req, res, next) {
    connection.query("SELECT * ,(SELECT storeName FROM customer WHERE idCustomer = damagedItemsInvoice.customerId) As customerName,DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%T') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName ,(SELECT GROUP_CONCAT(json_object('itemId',itemId,'count',count,'idDamagedItemsInvoiceContents',idDamagedItemsInvoiceContents,'itemName',(SELECT  IFNULL(CONCAT(itemType.itemTypeName , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName)  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId WHERE idItem = damagedItemsInvoiceContents.itemId LIMIT 1))) FROM damagedItemsInvoiceContents WHERE damagedItemsInvoiceContents.damagedItemsInvoiceId = damagedItemsInvoice.idDamagedItemsInvoice) As items FROM damagedItemsInvoice", (err, result) => {
        console.log(err);
        if (result.length > 0) {
            result = result.map(row => (row.items = '[' + row.items + ']', row));
            result = result.map(row => (row.items = JSON.parse(row.items), row));
            res.send(result[0]);
        } else {
            res.sendStatus(404)
        }
    })
});

router.get('/contents', function (req, res, next) {
    let query = '';
    let order = '';
    let limit = '';

    if (req.query.date != undefined) {
        query = query + ` AND DATE(createdAt) = '${req.query.date}'`
    }

    if (req.query.dateRangeFrom != undefined && req.query.dateRangeTo != undefined) {
        query = query + ` AND DATE(createdAt) BETWEEN '${req.query.dateRangeFrom}' AND '${req.query.dateRangeTo}'`
    }

    if (req.query.item != undefined) {
        query = query + ` AND itemId IN (${req.query.item})`
    }

    if (req.query.order != undefined) {
        order = 'ORDER BY ' + req.query.order + ' ' + req.query.sort
    }

    if (req.query.limit != undefined) {
        limit = `LIMIT ${req.query.limit}`
    }
    connection.query(`SELECT *, (SELECT @customerId := customerId FROM damagedItemsInvoice WHERE idDamagedItemsInvoice = damagedItemsInvoiceContents.damagedItemsInvoiceId) As customerId,(SELECT storeName FROM customer WHERE idCustomer = @customerId) As customerName, (SELECT  IFNULL(CONCAT(itemType.itemTypeName , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName)  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId WHERE idItem = damagedItemsInvoiceContents.itemId) As itemName ,(SELECT imagePath FROM item WHERE idItem = damagedItemsInvoiceContents.itemId) As imagePath , DATE_FORMAT(createdAt, '%Y-%m-%d') As creationFixedDate, DATE_FORMAT(createdAt, '%T') As creationFixedTime, DATE_FORMAT(createdAt, '%W') As creationDayName , (SELECT @createdBy := createdBy FROM damagedItemsInvoice WHERE idDamagedItemsInvoice = damagedItemsInvoiceContents.damagedItemsInvoiceId) As createdBy, (SELECT username FROM user WHERE idUser = @createdBy) As createdByName FROM damagedItemsInvoiceContents WHERE 1=1 ${query} ${order} ${limit}`, (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.post('/new', function (req, res, next) {
    connection.query("INSERT INTO damagedItemsInvoice SET ?", [req.body.invoice], (err, result) => {
        console.log(err);
        for (let i = 0; i < req.body.invoiceContents.length; i++) {
            req.body.invoiceContents[i].damagedItemsInvoiceId = result.insertId;
            connection.query(`INSERT INTO damagedItemsInvoiceContents SET ?`, [req.body.invoiceContents[i]], (err2, result2) => {
                console.log(err2);
            });
        }
        res.send(result);
    })
});

router.post('/addItemToInvoice', function (req, res, next) {
    connection.query("INSERT INTO damagedItemsInvoiceContents SET ?", [req.body], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.put('/edit/:id', function (req, res, next) {
    connection.query(`UPDATE damagedItemsInvoice SET ? WHERE idDamagedItemsInvoice = ${req.params['id']}`, [req.body.invoice], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.delete('/delete/:id', function (req, res, next) {
    connection.query(`DELETE FROM damagedItemsInvoice WHERE idDamagedItemsInvoice = ${req.params['id']}`, (err, result) => {
        connection.query(`DELETE FROM damagedItemsInvoiceContents WHERE damagedItemsInvoiceId = ${req.params['id']}`, (err2, result2) => {
            console.log(err);
            console.log(err2);
        })
        res.send(result);
    })
});

router.delete('/item/:itemId', function (req, res, next) {
    connection.query("DELETE FROM damagedItemsInvoiceContents WHERE idDamagedItemsInvoiceContents = ?", [req.params.itemId], (err, result) => {
        res.send(result);
    })
});

module.exports = router;
