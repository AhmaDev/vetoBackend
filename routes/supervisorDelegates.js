var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/database');
var connection = mysql.createConnection(db);

/* GET discount listing. */
router.get('/', function (req, res, next) {
    connection.query("SELECT * FROM supervisorDelegates", (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.get('/userid/:id', function (req, res, next) {
    console.log(req.query.date);
    if (req.query.date == undefined || req.query.date == null) {
        date = "CURRENT_DATE"
    } else {
        date = req.query.date
    }
    connection.query(`SELECT *, (SELECT username FROM user WHERE idUser = supervisorDelegates.delegateId) As delegateName , (SELECT @totalInvoices := COUNT(idInvoice) FROM invoice WHERE createdBy = supervisorDelegates.delegateId AND DATE(createdAt) = '${date}') As totalInvoicesToday, (SELECT @totalVisits := COUNT(idVisit) FROM visit WHERE createdBy = supervisorDelegates.delegateId AND DATE(createdAt) = '${date}') As totalVisitsToday, (SELECT @totalCustomerToCheck := COUNT(idCustomer) FROM customer WHERE createdBy = supervisorDelegates.delegateId AND (visitDay = LOWER(DAYNAME('${date}')) || secondVisitDay = LOWER(DAYNAME('${date}')))) As totalCustomersToCheck, (@totalCustomerToCheck - @totalInvoices - @totalVisits) As ramainingCustomers, (SELECT @totalBills := IFNULL(sum(total),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdBy = supervisorDelegates.delegateId AND invoice.invoiceTypeId = 1 AND DATE(invoice.createdAt) = '${date}') As totalBills,(SELECT @totalRestoreBills := IFNULL(sum(total),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdBy = supervisorDelegates.delegateId AND invoice.invoiceTypeId = 3 AND DATE(invoice.createdAt) = '${date}') As totalRestoreBills  FROM supervisorDelegates WHERE supervisorId = ? ORDER BY @totalBills ASC`, [req.params.id], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.post('/new', function (req, res, next) {
    connection.query("INSERT INTO supervisorDelegates SET ?", [req.body], (err, result) => {

        if (err) {
            console.log(err);
            res.sendStatus(409)
        } else {
            res.send(result);
        }
    })
});

router.put('/edit/:id', function (req, res, next) {
    connection.query(`UPDATE supervisorDelegates SET ? WHERE idSupervisorDelegates = ${req.params['id']}`, [req.body], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});

router.delete('/delete/:id', function (req, res, next) {
    connection.query(`DELETE FROM supervisorDelegates WHERE idSupervisorDelegates = ${req.params['id']}`, [req.body], (err, result) => {
        res.send(result);
        if (err) {
            console.log(err);
        }
    })
});


module.exports = router;
