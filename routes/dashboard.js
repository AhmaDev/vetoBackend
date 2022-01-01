var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);


router.get('/statistics', function (req, res, next) {
    connection.query("SELECT COUNT(idCustomer) As totalCustomers FROM customer", (errCustomer, resultCustomer) => {
        connection.query("SELECT COUNT(idItem) As totalItems FROM item", (errItem, resultItem) => {
            connection.query("SELECT COUNT(idUser) As totalUsers FROM user", (errUser, resultUser) => {
                connection.query("SELECT COUNT(idInvoice) As totalInvoices FROM invoice", (errInvoice, resultInvoice) => {
                    res.send({
                        totalCustomers: resultCustomer[0].totalCustomers,
                        totalInvoices: resultInvoice[0].totalInvoices,
                        totalItems: resultItem[0].totalItems,
                        totalUsers: resultUser[0].totalUsers,
                    });
                });
            });
        });
    });
});

router.get('/mostSellingDelegates' , function (req, res) {
    if (req.query.date == undefined || req.query.date == null) {
        date = "CURRENT_DATE"
    } else {
        date = req.query.date
    }
    connection.query(`SELECT idUser,username, (SELECT @total := IFNULL(sum(invoiceContent.total), 0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND DATE(invoice.createdAt) = '${date}') As total FROM user LIMIT 7`, (err, result) => {
        res.send(result.sort((a, b) => b.total > a.total ? 1 : -1))
    })
});

router.get('/mostSellingItems' , function (req, res) {
    if (req.query.date == undefined || req.query.date == null) {
        date = "CURRENT_DATE"
    } else {
        date = req.query.date
    }
    connection.query(`SELECT idItem,itemName, (SELECT @total := IFNULL(sum(invoiceContent.total), 0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoiceContent.itemId = item.idItem AND DATE(invoice.createdAt) = '${date}') As total FROM item LIMIT 7`, (err, result) => {
        res.send(result.sort((a, b) => b.total > a.total ? 1 : -1))
    })
});

module.exports = router;
