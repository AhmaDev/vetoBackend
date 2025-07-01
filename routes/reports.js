var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var db = require("../config/database");
var connection = mysql.createConnection(db);

/* GET sellPrice listing. */
router.get("/", function (req, res, next) {
  res.sendStatus(200);
});

/// NOT FINISHED YET

router.get("/overview", function (req, res, next) {
  if (req.query.days == null || req.query.days == undefined) {
    req.query.days =
      "'sunday','monday','tuesday','wednesday','thursday','friday','saturday'";
  }
  var query = "";
  if (
    req.query.from == undefined ||
    req.query.from == null ||
    req.query.to == undefined ||
    req.query.to == null
  ) {
    var today = new Date();
    var date1 =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var date2 =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
  } else {
    var date1 = req.query.from;
    var date2 = req.query.to;
  }

  if (req.query.superVisorId != undefined) {
    query = query + " AND @superVisorId = " + req.query.superVisorId;
  }
  if (req.query.delegateId != undefined) {
    query = query + " AND idUser IN (" + req.query.delegateId + ")";
  }
  connection.query(
    `SELECT * ,'******' As password , (SELECT @totalSelling := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 1 AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalSelling , (SELECT @totalRestores := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 3 AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalRestores, (SELECT IFNULL(COUNT(idCustomer),0) FROM customer WHERE createdBy = user.idUser AND isManufacture = 0 AND visitDay IN (${req.query.days})) As totalCustomers, (SELECT COUNT(idVisit) FROM visit WHERE createdBy = user.idUser AND visit.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalVisits, (SELECT @superVisorId := IFNULL(superVisorId,0) FROM supervisorDelegates WHERE delegateId = user.idUser LIMIT 1) As superVisorId , (SELECT username FROM user WHERE idUser = @superVisorId) As superVisorName, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoice.invoiceTypeId = 1) As invoicesCount, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoice.invoiceTypeId = 3) As restoresCount , (@totalSelling - @totalRestores) As totalRemaining, (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 1 AND invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalGifts , (SELECT createdAt FROM invoice WHERE invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idInvoice ASC LIMIT 1) As firstInvoiceDate , (SELECT createdAt FROM visit WHERE visit.createdBy = user.idUser AND visit.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idVisit ASC LIMIT 1) As firstVisitDate , (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 7 AND invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalOffers, IFNULL((SELECT SUM(totalPrice) FROM damagedItemsInvoiceContents JOIN damagedItemsInvoice ON damagedItemsInvoiceContents.damagedItemsInvoiceId = damagedItemsInvoice.idDamagedItemsInvoice WHERE damagedItemsInvoice.createdBy = user.idUser AND damagedItemsInvoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'),0) As totalDamaged FROM user JOIN userInfo ON userInfo.userId = user.idUser JOIN sellPrice ON sellPrice.idSellPrice = userInfo.sellPriceId WHERE roleId IN (4,3) ${query}`,
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/overviewHuge", function (req, res, next) {
  if (req.query.days == null || req.query.days == undefined) {
    req.query.days =
      "'sunday','monday','tuesday','wednesday','thursday','friday','saturday'";
  }
  var query = "";
  if (
    req.query.from == undefined ||
    req.query.from == null ||
    req.query.to == undefined ||
    req.query.to == null
  ) {
    var today = new Date();
    var date1 =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var date2 =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
  } else {
    var date1 = req.query.from;
    var date2 = req.query.to;
  }

  if (req.query.superVisorId != undefined) {
    query = query + " AND @superVisorId = " + req.query.superVisorId;
  }
  if (req.query.delegateId != undefined) {
    query = query + " AND idUser IN (" + req.query.delegateId + ")";
  }
  connection.query(
    `SELECT * ,'******' As password , (SELECT @totalSelling := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 1 AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalSelling , (SELECT @totalRestores := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 3 AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalRestores, (SELECT IFNULL(COUNT(idCustomer),0) FROM customer WHERE createdBy = user.idUser AND isManufacture = 0 AND visitDay IN (${req.query.days})) As totalCustomers, (SELECT COUNT(idVisit) FROM visit WHERE createdBy = user.idUser AND visit.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalVisits, (SELECT @superVisorId := IFNULL(superVisorId,0) FROM supervisorDelegates WHERE delegateId = user.idUser LIMIT 1) As superVisorId , (SELECT username FROM user WHERE idUser = @superVisorId) As superVisorName, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoice.invoiceTypeId = 1) As invoicesCount, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoice.invoiceTypeId = 3) As restoresCount , (@totalSelling - @totalRestores) As totalRemaining, (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 1 AND invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalGifts , (SELECT createdAt FROM invoice WHERE invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idInvoice ASC LIMIT 1) As firstInvoiceDate ,(SELECT createdAt FROM visit WHERE visit.createdBy = user.idUser AND visit.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idVisit ASC LIMIT 1) As firstVisitDate , (SELECT createdAt FROM invoice WHERE invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idInvoice DESC LIMIT 1) As lastInvoiceDate , (SELECT createdAt FROM visit WHERE visit.createdBy = user.idUser AND visit.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idVisit DESC LIMIT 1) As lastVisitDate ,(SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 7 AND invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalOffers, IFNULL((SELECT SUM(totalPrice) FROM damagedItemsInvoiceContents JOIN damagedItemsInvoice ON damagedItemsInvoiceContents.damagedItemsInvoiceId = damagedItemsInvoice.idDamagedItemsInvoice WHERE damagedItemsInvoice.createdBy = user.idUser AND damagedItemsInvoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'),0) As totalDamaged FROM user JOIN userInfo ON userInfo.userId = user.idUser JOIN sellPrice ON sellPrice.idSellPrice = userInfo.sellPriceId WHERE roleId IN (4,3) ${query}`,
    (err, result) => {
      console.log(
        `SELECT * ,'******' As password , (SELECT @totalSelling := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 1 AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalSelling , (SELECT @totalRestores := IFNULL(SUM(invoiceContent.total),0) FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId WHERE invoice.createdBy = user.idUser AND invoice.invoiceTypeId = 3 AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalRestores, (SELECT IFNULL(COUNT(idCustomer),0) FROM customer WHERE createdBy = user.idUser AND isManufacture = 0 AND visitDay IN (${req.query.days})) As totalCustomers, (SELECT COUNT(idVisit) FROM visit WHERE createdBy = user.idUser AND visit.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalVisits, (SELECT @superVisorId := IFNULL(superVisorId,0) FROM supervisorDelegates WHERE delegateId = user.idUser LIMIT 1) As superVisorId , (SELECT username FROM user WHERE idUser = @superVisorId) As superVisorName, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoice.invoiceTypeId = 1) As invoicesCount, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoice.invoiceTypeId = 3) As restoresCount , (@totalSelling - @totalRestores) As totalRemaining, (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 1 AND invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalGifts , (SELECT createdAt FROM invoice WHERE invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idInvoice ASC LIMIT 1) As firstInvoiceDate , (SELECT createdAt FROM invoice WHERE invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' ORDER BY idInvoice DESC LIMIT 1) As lastInvoiceDate , (SELECT IFNULL(SUM((invoiceContent.count * invoiceContent.price)),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.discountTypeId = 7 AND invoice.createdBy = user.idUser AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalOffers, IFNULL((SELECT SUM(totalPrice) FROM damagedItemsInvoiceContents JOIN damagedItemsInvoice ON damagedItemsInvoiceContents.damagedItemsInvoiceId = damagedItemsInvoice.idDamagedItemsInvoice WHERE damagedItemsInvoice.createdBy = user.idUser AND damagedItemsInvoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'),0) As totalDamaged FROM user JOIN userInfo ON userInfo.userId = user.idUser JOIN sellPrice ON sellPrice.idSellPrice = userInfo.sellPriceId WHERE roleId IN (4,3) ${query}`,
      );
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/overviewHuge-new", function (req, res, next) {
  const days =
    req.query.days ??
    "'sunday','monday','tuesday','wednesday','thursday','friday','saturday'";

  let date1, date2;
  if (!req.query.from || !req.query.to) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    date1 = `${year}-${month}-${day}`;
    date2 = `${year}-${month}-${day}`;
  } else {
    date1 = req.query.from;
    date2 = req.query.to;
  }

  let extraWhere = "";
  if (req.query.superVisorId !== undefined) {
    extraWhere += ` AND userInfo.superVisorId = ${req.query.superVisorId}`;
  }
  if (req.query.delegateId !== undefined) {
    extraWhere += ` AND user.idUser IN (${req.query.delegateId})`;
  }

  const sql = `
    SELECT
      user.idUser,
      user.username,
      '******' AS password,

      IFNULL(sales.totalSelling, 0) AS totalSelling,
      IFNULL(sales.totalRestores, 0) AS totalRestores,
      (IFNULL(sales.totalSelling, 0) - IFNULL(sales.totalRestores, 0)) AS totalRemaining,

      IFNULL(invoiceCounts.invoicesCount, 0) AS invoicesCount,
      IFNULL(invoiceCounts.restoresCount, 0) AS restoresCount,

      IFNULL(gifts.totalGifts, 0) AS totalGifts,
      IFNULL(offers.totalOffers, 0) AS totalOffers,

      firstInvoice.firstInvoiceDate,
      lastInvoice.lastInvoiceDate,

      IFNULL(visitStats.totalVisits, 0) AS totalVisits,
      firstVisit.firstVisitDate,
      lastVisit.lastVisitDate,

      IFNULL(customerStats.totalCustomers, 0) AS totalCustomers,
      IFNULL(damagedStats.totalDamaged, 0) AS totalDamaged,

      userInfo.*,
      sellPrice.*
    FROM user
    JOIN userInfo ON userInfo.userId = user.idUser
    JOIN sellPrice ON sellPrice.idSellPrice = userInfo.sellPriceId

    -- Total Selling and Restores
    LEFT JOIN (
      SELECT
        invoice.createdBy AS userId,
        SUM(CASE WHEN invoice.invoiceTypeId = 1 THEN invoiceContent.total ELSE 0 END) AS totalSelling,
        SUM(CASE WHEN invoice.invoiceTypeId = 3 THEN invoiceContent.total ELSE 0 END) AS totalRestores
      FROM invoiceContent
      JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId
      WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY invoice.createdBy
    ) AS sales ON sales.userId = user.idUser

    -- Invoice Count and Restore Count
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        COUNT(CASE WHEN invoiceTypeId = 1 THEN 1 ELSE NULL END) AS invoicesCount,
        COUNT(CASE WHEN invoiceTypeId = 3 THEN 1 ELSE NULL END) AS restoresCount
      FROM invoice
      WHERE createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY createdBy
    ) AS invoiceCounts ON invoiceCounts.userId = user.idUser

    -- Total Gifts
    LEFT JOIN (
      SELECT
        invoice.createdBy AS userId,
        SUM(invoiceContent.count * invoiceContent.price) AS totalGifts
      FROM invoiceContent
      JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId
      WHERE invoiceContent.discountTypeId = 1
        AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY invoice.createdBy
    ) AS gifts ON gifts.userId = user.idUser

    -- Total Offers
    LEFT JOIN (
      SELECT
        invoice.createdBy AS userId,
        SUM(invoiceContent.count * invoiceContent.price) AS totalOffers
      FROM invoiceContent
      JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId
      WHERE invoiceContent.discountTypeId = 7
        AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY invoice.createdBy
    ) AS offers ON offers.userId = user.idUser

    -- First Invoice Date
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        MIN(createdAt) AS firstInvoiceDate
      FROM invoice
      WHERE createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY createdBy
    ) AS firstInvoice ON firstInvoice.userId = user.idUser

    -- Last Invoice Date
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        MAX(createdAt) AS lastInvoiceDate
      FROM invoice
      WHERE createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY createdBy
    ) AS lastInvoice ON lastInvoice.userId = user.idUser

    -- Visit Stats
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        COUNT(*) AS totalVisits
      FROM visit
      WHERE createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY createdBy
    ) AS visitStats ON visitStats.userId = user.idUser

    -- First Visit
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        MIN(createdAt) AS firstVisitDate
      FROM visit
      WHERE createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY createdBy
    ) AS firstVisit ON firstVisit.userId = user.idUser

    -- Last Visit
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        MAX(createdAt) AS lastVisitDate
      FROM visit
      WHERE createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY createdBy
    ) AS lastVisit ON lastVisit.userId = user.idUser

    -- Total Customers
    LEFT JOIN (
      SELECT
        createdBy AS userId,
        COUNT(*) AS totalCustomers
      FROM customer
      WHERE isManufacture = 0
        AND visitDay IN (${days})
      GROUP BY createdBy
    ) AS customerStats ON customerStats.userId = user.idUser

    -- Total Damaged
    LEFT JOIN (
      SELECT
        damagedItemsInvoice.createdBy AS userId,
        IFNULL(SUM(totalPrice), 0) AS totalDamaged
      FROM damagedItemsInvoice
      JOIN damagedItemsInvoiceContents ON damagedItemsInvoice.idDamagedItemsInvoice = damagedItemsInvoiceContents.damagedItemsInvoiceId
      WHERE damagedItemsInvoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY damagedItemsInvoice.createdBy
    ) AS damagedStats ON damagedStats.userId = user.idUser
     
    WHERE user.roleId IN (4, 3)
    ${extraWhere};
  `;

  connection.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.send(result);
  });
});






router.get("/delegateItems/:id", function (req, res, next) {
  connection.query(
    `SELECT IFNULL(SUM(invoiceContent.total),0) As totalPrice, IFNULL(SUM(invoiceContent.count),0) As totalCount, (SELECT  IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName)  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId  WHERE invoiceContent.itemId = item.idItem LIMIT 1) As itemName FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE DATE(invoice.createdAt) = '${req.query.date}' AND invoice.createdBy = ${req.params.id} AND invoice.invoiceTypeId = ${req.query.type} GROUP BY invoiceContent.itemId ORDER BY totalCount DESC`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.send(result);
      }
    },
  );
});
router.get("/delegateDamagedItems/:id", function (req, res, next) {
  connection.query(
    `SELECT IFNULL(SUM(damagedItemsInvoiceContents.totalPrice),0) As totalPrice, IFNULL(SUM(damagedItemsInvoiceContents.count),0) As totalCount, (SELECT  IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName)  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId  WHERE damagedItemsInvoiceContents.itemId = item.idItem LIMIT 1) As itemName FROM damagedItemsInvoiceContents JOIN damagedItemsInvoice ON damagedItemsInvoiceContents.damagedItemsInvoiceId = damagedItemsInvoice.idDamagedItemsInvoice WHERE DATE(damagedItemsInvoice.createdAt) = '${req.query.date}' AND damagedItemsInvoice.createdBy = ${req.params.id} GROUP BY damagedItemsInvoiceContents.itemId ORDER BY totalCount DESC`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.send(result);
      }
    },
  );
});

router.get("/delegateRail/:id", function (req, res, next) {
  let sort = "";
  if (req.query.sort != undefined) {
    sort = "ORDER BY lastInvoice DESC";
  }
  connection.query(
    `SELECT *,DATE_FORMAT(customer.createdAt, '%Y-%m-%d %r') As customerCreatedAt, (SELECT IFNULL(SUM(total),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.customerId = customer.idCustomer AND invoice.invoiceTypeId = 1 AND DATE(invoice.createdAt) BETWEEN '${req.query.date1}' AND '${req.query.date2}') AS totalSell, (SELECT IFNULL(SUM(total),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.customerId = customer.idCustomer AND invoice.invoiceTypeId = 3 AND DATE(invoice.createdAt) BETWEEN '${req.query.date1}' AND '${req.query.date2}') AS totalRestore, (SELECT createdAt FROM invoice WHERE invoice.customerId = customer.idCustomer ORDER BY idInvoice DESC LIMIT 1) As lastInvoice, (SELECT IFNULL(COUNT(idInvoice),0) FROM invoice WHERE invoice.customerId = customer.idCustomer AND invoice.invoiceTypeId = 1 AND DATE(invoice.createdAt) BETWEEN '${req.query.date1}' AND '${req.query.date2}') As totalInvoiceCount, (SELECT IFNULL(COUNT(idVisit),0) FROM visit WHERE visit.customerId = customer.idCustomer AND DATE(visit.createdAt) BETWEEN '${req.query.date1}' AND '${req.query.date2}') As visitCount FROM customer LEFT JOIN customerClass ON customer.customerClassId = customerClass.idCustomerClass WHERE createdBy = ${req.params.id} ${sort}`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.send(result);
      }
    },
  );
});

router.get("/itemRail/:id", function (req, res, next) {
  connection.query(
    `SELECT *,(SELECT username FROM user WHERE idUser = invoice.createdBy LIMIT 1) As delegateName, DATE_FORMAT(invoice.createdAt, '%Y-%m-%d %r') As creationFixedDate FROM invoiceContent JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId LEFT JOIN customer ON customer.idCustomer = invoice.customerId LEFT JOIN item on item.idItem = invoiceContent.itemId WHERE invoiceContent.itemId = ${req.params.id} AND DATE(invoice.createdAt) BETWEEN '${req.query.date1}' AND '${req.query.date2}'`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.send(result);
      }
    },
  );
});

module.exports = router;
