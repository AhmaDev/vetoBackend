var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var db = require("../config/database");
var multer = require("multer");
var connection = mysql.createConnection(db);
var compression = require("compression");

var path = require("path");
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

var upload = multer({ storage: storage });

/* GET item listing. */
router.get("/", function (req, res, next) {
  connection.query(
    "SELECT *, IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName, (SELECT GROUP_CONCAT(json_object('price',price,'sellPriceId',sellPriceId,'sellPriceName',sellPriceName, 'delegateTarget',delegateTarget, 'itemDescription', itemDescription , 'damagedItemPrice', damagedItemPrice)) FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemPrice.itemId = item.idItem) As prices FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId",
    (err, result) => {
      result = result.map(
        (row) => ((row.prices = "[" + row.prices + "]"), row),
      );
      result = result.map(
        (row) => ((row.prices = JSON.parse(row.prices)), row),
      );
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/count", function (req, res, next) {
  connection.query("SELECT * FROM item", (err, result) => {
    res.send({ count: result.length });
    if (err) {
      console.log(err);
    }
  });
});

router.get("/offer/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM itemOffer WHERE itemId = ?",
    [req.params.id],
    (err, result) => {
      if (result.length > 0) {
        res.send(result[0]);
      } else {
        res.sendStatus(404);
      }
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/hide/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM itemHide WHERE itemId = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        res.send(result);
      }
    },
  );
});
router.get("/hide/user/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM itemHide WHERE userId = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        res.send(result);
      }
    },
  );
});

router.get("/offers", function (req, res, next) {
  connection.query("SELECT * FROM itemOffer", (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});

router.get("/detailedStore", function (req, res, next) {
  if (
    req.query.from == undefined ||
    req.query.from == null ||
    req.query.to == undefined ||
    req.query.to == null
  ) {
    var today = new Date();
    var date1 = "2010-01-01";
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
  connection.query(
    `SELECT idItem,(SELECT customerName FROM customer WHERE idCustomer = item.manufactureId) As manufactureName , (SELECT itemGroupName FROM itemGroup WHERE idItemGroup = item.itemGroupId) As itemGroupName ,imagePath, IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName , (SELECT IFNULL(SUM(count),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 1) As totalSell, (SELECT IFNULL(SUM(count),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 2) As totalBuy, (SELECT IFNULL(SUM(count),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 3) As totalRestores, (SELECT IFNULL(SUM(count),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 4) As totalBuyRestores, (SELECT IFNULL(SUM(count),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 5) As totalTempBuy, (SELECT IFNULL(SUM(damagedItemsInvoiceContents.count / item.cartonQauntity),0) FROM damagedItemsInvoiceContents WHERE damagedItemsInvoiceContents.itemId = item.idItem AND damagedItemsInvoiceContents.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') As totalDamaged , itemStore.* FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId LEFT JOIN itemStore ON itemStore.itemId = item.idItem WHERE item.isAvailable = 1`,
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});
router.get("/detailedStore-new", function (req, res, next) {
  if (
    req.query.from == undefined ||
    req.query.from == null ||
    req.query.to == undefined ||
    req.query.to == null
  ) {
    var today = new Date();
    var date1 = "2010-01-01";
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
  connection.query(
    `SELECT
    item.idItem,
    customer.customerName AS manufactureName,
    itemGroup.itemGroupName,
    item.imagePath,
    IFNULL(CONCAT(itemType, ' ', itemName, ' ', itemWeight, ' ', itemWeightSuffix, ' * ', cartonQauntity, ' ', brand.brandName), item.itemName) AS fullItemName,
    IFNULL(salesSummary.totalSell, 0) AS totalSell,
    IFNULL(salesSummary.totalBuy, 0) AS totalBuy,
    IFNULL(salesSummary.totalRestores, 0) AS totalRestores,
    IFNULL(salesSummary.totalBuyRestores, 0) AS totalBuyRestores,
    IFNULL(salesSummary.totalTempBuy, 0) AS totalTempBuy,
    IFNULL(damagedSummary.totalDamaged, 0) AS totalDamaged,
    itemStore.*
FROM item
LEFT JOIN customer ON customer.idCustomer = item.manufactureId
LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup
LEFT JOIN brand ON item.brandId = brand.idBrand
LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId
LEFT JOIN itemStore ON itemStore.itemId = item.idItem
LEFT JOIN (
    SELECT 
        invoiceContent.itemId,
        SUM(CASE WHEN invoice.invoiceTypeId = 1 THEN invoiceContent.count ELSE 0 END) AS totalSell,
        SUM(CASE WHEN invoice.invoiceTypeId = 2 THEN invoiceContent.count ELSE 0 END) AS totalBuy,
        SUM(CASE WHEN invoice.invoiceTypeId = 3 THEN invoiceContent.count ELSE 0 END) AS totalRestores,
        SUM(CASE WHEN invoice.invoiceTypeId = 4 THEN invoiceContent.count ELSE 0 END) AS totalBuyRestores,
        SUM(CASE WHEN invoice.invoiceTypeId = 5 THEN invoiceContent.count ELSE 0 END) AS totalTempBuy
    FROM invoiceContent
    JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId
    WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
    GROUP BY invoiceContent.itemId
) AS salesSummary ON salesSummary.itemId = item.idItem
LEFT JOIN (
    SELECT 
        damagedItemsInvoiceContents.itemId,
        SUM(damagedItemsInvoiceContents.count / item.cartonQauntity) AS totalDamaged
    FROM damagedItemsInvoiceContents
    JOIN item ON item.idItem = damagedItemsInvoiceContents.itemId
    WHERE damagedItemsInvoiceContents.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
    GROUP BY damagedItemsInvoiceContents.itemId
) AS damagedSummary ON damagedSummary.itemId = item.idItem
WHERE item.isAvailable = 1;
`,
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});
router.get("/compressedDetailedStore", function (req, res, next) {
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

  if (connection.config.database == "ovetoMmlka") {
    connection.query(
      `SELECT idItem ,  
        (SELECT JSON_OBJECT(
            'sell',IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 1 THEN count ELSE 0 END),0),
            'buy',IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 2 THEN count ELSE 0 END),0),
            'restore',IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 3 THEN count ELSE 0 END),0)
        ) FROM invoiceContent PARTITION (p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p23,p24,p25,p26,p27,p28,p29,p30,p31,p32,p33,p34,p35) JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.invoiceId IN (SELECT idInvoice FROM invoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') AND invoiceContent.itemId = item.idItem) As stocks FROM item WHERE item.isAvailable = 1`,
      (err, result) => {
        res.send(result);
        if (err) {
          console.log(err);
        }
      },
    );
  } else {
    connection.query(
      `SELECT idItem ,  
        (SELECT JSON_OBJECT(
            'sell',IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 1 THEN count ELSE 0 END),0),
            'buy',IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 2 THEN count ELSE 0 END),0),
            'restore',IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 3 THEN count ELSE 0 END),0)
        ) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoiceContent.invoiceId IN (SELECT idInvoice FROM invoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59') AND invoiceContent.itemId = item.idItem) As stocks FROM item WHERE item.isAvailable = 1`,
      (err, result) => {
        res.send(result);
        if (err) {
          console.log(err);
        }
      },
    );
  }
});

router.get("/compressedDetailedStore-new", function (req, res, next) {
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

  let partitionHint = "";
  if (connection.config.database == "ovetoMmlka") {
    partitionHint =
      "PARTITION (p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p23,p24,p25,p26,p27,p28,p29,p30,p31,p32,p33,p34,p35)";
  }

  const sql = `
    SELECT
      item.idItem,
      IFNULL(stockData.stocks, JSON_OBJECT('sell', 0, 'buy', 0, 'restore', 0)) AS stocks
    FROM item
    LEFT JOIN (
      SELECT
        invoiceContent.itemId,
        JSON_OBJECT(
          'sell', IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 1 THEN invoiceContent.count ELSE 0 END), 0),
          'buy', IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 2 THEN invoiceContent.count ELSE 0 END), 0),
          'restore', IFNULL(SUM(CASE WHEN invoice.invoiceTypeId = 3 THEN invoiceContent.count ELSE 0 END), 0)
        ) AS stocks
      FROM invoiceContent
      ${partitionHint ? partitionHint : ""}
      JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId
      WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
      GROUP BY invoiceContent.itemId
    ) AS stockData ON stockData.itemId = item.idItem
    WHERE item.isAvailable = 1;
  `;

  connection.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.send(result);
  });
});


router.get("/detailedStoreByUser/:userId", function (req, res, next) {
  if (
    req.query.from == undefined ||
    req.query.from == null ||
    req.query.to == undefined ||
    req.query.to == null
  ) {
    var today = new Date();
    var date1 = "2010-01-01";
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

  let query = `SELECT idItem,(SELECT customerName FROM customer WHERE idCustomer = item.manufactureId) As manufactureName , (SELECT itemGroupName FROM itemGroup WHERE idItemGroup = item.itemGroupId) As itemGroupName ,imagePath, IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName , (SELECT IFNULL(SUM(count),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 1 AND invoice.createdBy IN (${req.params.userId})) As totalSell, (SELECT IFNULL(SUM(total),0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice WHERE invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND invoiceContent.itemId = item.idItem AND invoice.invoiceTypeId = 1 AND invoice.createdBy IN (${req.params.userId})) As totalSellPrice, (SELECT IFNULL(SUM(damagedItemsInvoiceContents.count / item.cartonQauntity),0) FROM damagedItemsInvoiceContents JOIN damagedItemsInvoice ON damagedItemsInvoice.idDamagedItemsInvoice = damagedItemsInvoiceContents.damagedItemsInvoiceId WHERE damagedItemsInvoiceContents.itemId = item.idItem AND damagedItemsInvoiceContents.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND damagedItemsInvoice.createdBy IN (${req.params.userId})) As totalDamaged, (SELECT IFNULL(SUM(damagedItemsInvoiceContents.totalPrice),0) FROM damagedItemsInvoiceContents JOIN damagedItemsInvoice ON damagedItemsInvoice.idDamagedItemsInvoice = damagedItemsInvoiceContents.damagedItemsInvoiceId WHERE damagedItemsInvoiceContents.itemId = item.idItem AND damagedItemsInvoiceContents.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59' AND damagedItemsInvoice.createdBy IN (${req.params.userId})) As totalDamagedPrice FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId`;

  connection.query(`${query}`, (err, result) => {
    res.send(result);
    if (err) {
      console.log(err);
    }
  });
});


router.get("/detailedStoreByUser-new/:userId", function (req, res, next) {
  let date1, date2;
  if (!req.query.from || !req.query.to) {
    const today = new Date();
    date1 = "2010-01-01";
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    date2 = `${year}-${month}-${day}`;
  } else {
    date1 = req.query.from;
    date2 = req.query.to;
  }

  const userId = req.params.userId;

  const sql = `
    SELECT
      item.idItem,
      customer.customerName AS manufactureName,
      itemGroup.itemGroupName,
      item.imagePath,
      IFNULL(CONCAT(itemType, ' ', item.itemName, ' ', item.itemWeight, ' ', item.itemWeightSuffix, ' * ', item.cartonQauntity, ' ', brand.brandName), item.itemName) AS fullItemName,
      IFNULL(sales.totalSell, 0) AS totalSell,
      IFNULL(sales.totalSellPrice, 0) AS totalSellPrice,
      IFNULL(damaged.totalDamaged, 0) AS totalDamaged,
      IFNULL(damaged.totalDamagedPrice, 0) AS totalDamagedPrice
    FROM item
    LEFT JOIN customer ON customer.idCustomer = item.manufactureId
    LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup
    LEFT JOIN brand ON item.brandId = brand.idBrand
    LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId
    LEFT JOIN (
      SELECT
        invoiceContent.itemId,
        SUM(invoiceContent.count) AS totalSell,
        SUM(invoiceContent.total) AS totalSellPrice
      FROM invoiceContent
      JOIN invoice ON invoice.idInvoice = invoiceContent.invoiceId
      WHERE invoice.invoiceTypeId = 1
        AND invoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
        AND invoice.createdBy IN (${userId})
      GROUP BY invoiceContent.itemId
    ) AS sales ON sales.itemId = item.idItem
    LEFT JOIN (
      SELECT
        damagedItemsInvoiceContents.itemId,
        SUM(damagedItemsInvoiceContents.count / item.cartonQauntity) AS totalDamaged,
        SUM(damagedItemsInvoiceContents.totalPrice) AS totalDamagedPrice
      FROM damagedItemsInvoiceContents
      JOIN damagedItemsInvoice ON damagedItemsInvoice.idDamagedItemsInvoice = damagedItemsInvoiceContents.damagedItemsInvoiceId
      JOIN item ON item.idItem = damagedItemsInvoiceContents.itemId
      WHERE damagedItemsInvoice.createdAt BETWEEN '${date1} 00:00:00' AND '${date2} 23:59:59'
        AND damagedItemsInvoice.createdBy IN (${userId})
      GROUP BY damagedItemsInvoiceContents.itemId
    ) AS damaged ON damaged.itemId = item.idItem
    WHERE item.isAvailable = 1;
  `;

  connection.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.send(result);
  });
});



router.get("/store", compression(), function (req, res, next) {
  connection.query(
    "SELECT *,IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName, (SELECT @totalPlus := IFNULL(SUM(count), 0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE invoiceContent.itemId = item.idItem AND invoiceType.invoiceFunction = 'plus') AS totalPlus, (SELECT @totalMinus := IFNULL(SUM(count), 0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE invoiceContent.itemId = item.idItem AND invoiceType.invoiceFunction = 'minus') AS totalMinus, (@totalPlus - @totalMinus) AS store, (SELECT GROUP_CONCAT(json_object('price',price,'sellPriceId',sellPriceId,'sellPriceName',sellPriceName,'delegateTarget',delegateTarget, 'itemDescription', itemDescription , 'damagedItemPrice', damagedItemPrice)) FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemPrice.itemId = item.idItem) As prices, DATEDIFF(CURRENT_DATE(),item.createdAt) As days FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId WHERE item.isAvailable = 1",
    (err, result) => {
      result = result.map(
        (row) => ((row.prices = "[" + row.prices + "]"), row),
      );
      result = result.map(
        (row) => ((row.prices = JSON.parse(row.prices)), row),
      );
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/store/sellPriceId/:sellPriceId", function (req, res, next) {
  connection.query(
    `SELECT *,IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName, IFNULL(itemStore.stockIn,0) AS totalPlus, IFNULL(itemStore.stockOut,0) AS totalMinus, IFNULL(itemStore.stock,0) AS store, (SELECT GROUP_CONCAT(json_object('price',price,'sellPriceId',sellPriceId,'sellPriceName',sellPriceName,'delegateTarget',delegateTarget, 'itemDescription', itemDescription , 'damagedItemPrice', damagedItemPrice)) FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemPrice.sellPriceId = ${req.params.sellPriceId} AND itemPrice.itemId = item.idItem) As prices , DATEDIFF(CURRENT_DATE(),item.createdAt) As days  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId LEFT JOIN itemStore ON itemStore.itemId = item.idItem WHERE item.isAvailable = 1`,
    (err, result) => {
      result = result.map(
        (row) => ((row.prices = "[" + row.prices + "]"), row),
      );
      result = result.map(
        (row) => ((row.prices = JSON.parse(row.prices)), row),
      );
      result = result.filter((item) => item.prices[0] != null);
      if (result.filter((e) => e.store == 0).length == result.length) {
        // NO DATA IN DB
        console.log("ITEMS FROM CACHE");
        if (
          localStorage.getItem("items") != undefined &&
          localStorage.getItem("items") != null
        ) {
          result = JSON.parse(localStorage.getItem("items"));
        }
      } else {
        console.log("ITEMS FROM DATABASE");
        localStorage.setItem("items", JSON.stringify(result));
      }
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/store/sellPriceIdBackUp/:sellPriceId", function (req, res, next) {
  connection.query(
    `SELECT *,IFNULL(CONCAT(itemType , ' ' , itemName,' ' , itemWeight, ' ' ,itemWeightSuffix, ' ' , ' * ' , cartonQauntity , ' ' , brand.brandName), item.itemName) As fullItemName, (SELECT @totalPlus := IFNULL(SUM(count), 0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE invoiceContent.itemId = item.idItem AND invoiceType.invoiceFunction = 'plus') AS totalPlus, (SELECT @totalMinus := IFNULL(SUM(count), 0) FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN invoiceType ON invoice.invoiceTypeId = invoiceType.idInvoiceType WHERE invoiceContent.itemId = item.idItem AND invoiceType.invoiceFunction = 'minus') AS totalMinus, (@totalPlus - @totalMinus) AS store, (SELECT GROUP_CONCAT(json_object('price',price,'sellPriceId',sellPriceId,'sellPriceName',sellPriceName,'delegateTarget',delegateTarget, 'itemDescription', itemDescription , 'damagedItemPrice', damagedItemPrice)) FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemPrice.sellPriceId = ${req.params.sellPriceId} AND itemPrice.itemId = item.idItem) As prices , DATEDIFF(CURRENT_DATE(),item.createdAt) As days  FROM item LEFT JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup LEFT JOIN brand ON item.brandId = brand.idBrand LEFT JOIN itemType ON itemType.idItemType = item.itemTypeId`,
    (err, result) => {
      result = result.map(
        (row) => ((row.prices = "[" + row.prices + "]"), row),
      );
      result = result.map(
        (row) => ((row.prices = JSON.parse(row.prices)), row),
      );
      result = result.filter((item) => item.prices[0] != null);
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM item WHERE idItem = ?",
    [req.params.id],
    (err, result) => {
      if (result.length > 0) {
        connection.query(
          "SELECT * FROM itemPrice JOIN sellPrice ON itemPrice.sellPriceId = sellPrice.idSellPrice WHERE itemId = ?",
          [req.params.id],
          (itemPriceErr, itemPriceResult) => {
            result[0].prices = itemPriceResult;
            res.send(result[0]);
          },
        );
      } else {
        res.sendStatus(404);
      }
      if (err) {
        console.log(err);
      }
    },
  );
});

router.get("/salesByBrand/:id", function (req, res, next) {
  if (
    req.query.from == undefined ||
    req.query.from == null ||
    req.query.to == undefined ||
    req.query.to == null
  ) {
    var today = new Date();
    var date1 = "2010-01-01";
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

  connection.query(
    `SELECT itemGroup.idItemGroup, itemGroup.itemGroupName, invoice.createdBy, IFNULL(SUM(invoiceContent.total),0) As totalSales FROM invoiceContent JOIN invoice ON invoiceContent.invoiceId = invoice.idInvoice JOIN item ON invoiceContent.itemId = item.idItem JOIN itemGroup ON item.itemGroupId = itemGroup.idItemGroup WHERE invoice.createdBy = ${req.params.id} AND invoice.invoiceTypeId = 1 AND DATE(invoice.createdAt) BETWEEN '${date1}' AND '${date2}' GROUP BY item.itemGroupId`,
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

router.post("/new", upload.single("itemImage"), function (req, res, next) {
  let imagePath = null;
  if (req.file != undefined && req.file.fieldname == "itemImage") {
    imagePath = req.file.path;
  }
  let itemInfo = JSON.parse(req.body.itemInfo);
  let itemPrices = JSON.parse(req.body.itemPrices);
  connection.query(
    "INSERT INTO item SET ?",
    {
      itemName: itemInfo.itemName,
      itemGroupId: itemInfo.itemGroup,
      itemCode: itemInfo.itemCode,
      itemBarcode: itemInfo.itemBarcode,
      imagePath: imagePath,
      itemDescription: itemInfo.itemDescription,
      isAvailable: 1,
      manufactureId: itemInfo.manufactureId,
      itemTypeId: itemInfo.itemTypeId,
      itemType: itemInfo.itemType,
      cartonWidth: itemInfo.cartonWidth,
      cartonHeight: itemInfo.cartonHeight,
      cartonLength: itemInfo.cartonLength,
      cartonQauntity: itemInfo.cartonQauntity,
      expireAge: itemInfo.expireAge,
      maximumStoreNotify: itemInfo.maximumStoreNotify,
      minimumStoreNotify: itemInfo.minimumStoreNotify,
      itemWeight: itemInfo.itemWeight,
      itemWeightSuffix: itemInfo.itemWeightSuffix,
      brandId: itemInfo.brandId,
    },
    (err, result) => {
      for (let i = 0; i < itemPrices.length; i++) {
        connection.query(
          `INSERT INTO itemPrice SET ?`,
          {
            itemId: result.insertId,
            sellPriceId: itemPrices[i].sellPriceId,
            price: itemPrices[i].price,
          },
          (err2, result2) => { },
        );
      }
      res.send(result);
    },
  );
});

router.put("/edit/:id", function (req, res, next) {
  connection.query(
    `UPDATE item SET ? WHERE idItem = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.put("/updatePrice/:id", function (req, res, next) {
  connection.query(
    `UPDATE itemPrice SET ? WHERE idItemPrice = ${req.params["id"]}`,
    [req.body],
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.post("/itemPrice/new", function (req, res, next) {
  connection.query(`INSERT INTO itemPrice SET ?`, [req.body], (err, result) => {
    if (err) {
      res.sendStatus(409);
    } else {
      res.send(result);
    }
  });
});

router.post("/offer", function (req, res, next) {
  connection.query(`INSERT INTO itemOffer SET ?`, [req.body], (err, result) => {
    if (err) {
      res.sendStatus(409);
    } else {
      res.send(result);
    }
  });
});

router.post("/hide", function (req, res, next) {
  connection.query(`INSERT INTO itemHide SET ?`, [req.body], (err, result) => {
    if (err) {
      res.sendStatus(409);
    } else {
      res.send(result);
    }
  });
});

router.delete("/itemPrice/delete/:id", function (req, res, next) {
  connection.query(
    `DELETE FROM itemPrice WHERE idItemPrice = ${req.params.id}`,
    (err, result) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(result);
      }
    },
  );
});

router.put(
  "/updateImage/:id",
  upload.single("itemImage"),
  function (req, res, next) {
    let imagePath = null;
    if (req.file != undefined && req.file.fieldname == "itemImage") {
      imagePath = "uploads/" + req.file.filename;
    }
    connection.query(
      `UPDATE item SET imagePath = ? WHERE idItem = ${req.params["id"]}`,
      [imagePath],
      (err, result) => {
        res.send(result);
        if (err) {
          console.log(err);
        }
      },
    );
  },
);

router.delete("/offer/:id", function (req, res, next) {
  connection.query(
    `DELETE FROM itemOffer WHERE itemId = ${req.params["id"]}`,
    (err, result) => {
      res.send(result);
      if (err) {
        console.log(err);
      }
    },
  );
});

router.delete("/hide/delete/:id", function (req, res, next) {
  connection.query(
    `DELETE FROM itemHide WHERE idItemHide = ${req.params["id"]}`,
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
    `DELETE FROM item WHERE idItem = ${req.params["id"]}`,
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
