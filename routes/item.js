var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var multer  = require('multer')
var connection = mysql.createConnection(db);
var path = require('path')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, ".." ,"uploads/"))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})

var upload = multer({ storage: storage })

/* GET item listing. */
router.get('/', function (req, res, next) {
    connection.query("SELECT *, CONCAT(itemName , ' ' , itemWeight,' ' , itemWeightSuffix, ' * ' ,cartonQauntity, ' ' , itemGroup.itemGroupName) As fullItemName, (SELECT GROUP_CONCAT(json_object('price',price,'sellPriceId',sellPriceId,'sellPriceName',sellPriceName, 'delegateTarget',delegateTarget)) FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemPrice.itemId = item.idItem) As prices FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup", (err, result) => {
        result = result.map(row => (row.prices = '[' + row.prices + ']', row));
        result = result.map(row => (row.prices = JSON.parse(row.prices) , row));
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.get('/count', function (req, res, next) {
    connection.query("SELECT * FROM item", (err, result) => {
        res.send({count: result.length});
        if (err) {
            console.log(err);
        }
    })
});


router.get('/store', function (req, res, next) {
    connection.query("SELECT *,CONCAT(itemName , ' ' , itemWeight,' ' , itemWeightSuffix, ' * ' ,cartonQauntity, ' ' , itemGroup.itemGroupName) As fullItemName, (SELECT @totalPlus := IFNULL(SUM(count), 0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE invoiceContent.itemId = item.idItem AND invoiceType.invoiceFunction = 'plus') AS totalPlus, (SELECT @totalMinus := IFNULL(SUM(count), 0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE invoiceContent.itemId = item.idItem AND invoiceType.invoiceFunction = 'minus') AS totalMinus, (@totalPlus - @totalMinus) AS store, (SELECT GROUP_CONCAT(json_object('price',price,'sellPriceId',sellPriceId,'sellPriceName',sellPriceName,'delegateTarget',delegateTarget)) FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemPrice.itemId = item.idItem) As prices FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup", (err, result) => {
        result = result.map(row => (row.prices = '[' + row.prices + ']', row));
        result = result.map(row => (row.prices = JSON.parse(row.prices) , row));
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.get('/:id', function (req, res, next) {
    connection.query("SELECT * FROM item WHERE idItem = ?", [req.params.id], (err, result) => {
        if (result.length > 0) {
            connection.query("SELECT * FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemId = ?", [req.params.id], (itemPriceErr, itemPriceResult) => {
                result[0].prices = itemPriceResult
                res.send(result[0]);
            })
        } else {
            res.sendStatus(404)
        }
        if (err) {
            console.log(err);
        }
    })
});


router.post('/new', upload.single('itemImage'), function (req, res, next) {
    let imagePath = null;
    if (req.file != undefined && req.file.fieldname == 'itemImage') {
        imagePath = req.file.path;   
    }
    let itemInfo = JSON.parse(req.body.itemInfo);
    let itemPrices = JSON.parse(req.body.itemPrices);
    connection.query("INSERT INTO item SET ?", {
        itemName: itemInfo.itemName,
        itemGroupId: itemInfo.itemGroup,
        itemCode: itemInfo.itemCode,
        itemBarcode: itemInfo.itemBarcode,
        imagePath: imagePath,
        itemDescription: itemInfo.itemDescription,
        isAvailable: 1
    }, (err, result) => {
        for (let i = 0; i < itemPrices.length; i++) {
            connection.query(`INSERT INTO itemPrice SET ?`, {
                itemId: result.insertId,
                sellPriceId: itemPrices[i].sellPriceId,
                price: itemPrices[i].price
            } , (err2, result2) => {
                
            });
        }
        res.send(result)
    });
});

router.put('/edit/:id', function (req, res, next) {
    connection.query(`UPDATE item SET ? WHERE idItem = ${req.params['id']}`, [req.body], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.put('/updatePrice/:id', function (req, res, next) {
    connection.query(`UPDATE itemPrice SET ? WHERE idItemPrice = ${req.params['id']}`, [req.body], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.post('/itemPrice/new', function (req, res, next) {
    connection.query(`INSERT INTO itemPrice SET ?`, [req.body] ,(err, result) => {
        if (err) {
            res.sendStatus(409);
        } else {
            res.send(result);
        }
    })
});


router.put('/updateImage/:id', upload.single('itemImage'), function (req, res, next) {
    let imagePath = null;
    if (req.file != undefined && req.file.fieldname == 'itemImage') {
        imagePath = "uploads/" + req.file.filename;   
    }
    connection.query(`UPDATE item SET imagePath = ? WHERE idItem = ${req.params['id']}`, [imagePath], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


router.delete('/delete/:id', function (req, res, next) {
    connection.query(`DELETE FROM item WHERE idItem = ${req.params['id']}`, [req.body], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


module.exports = router;