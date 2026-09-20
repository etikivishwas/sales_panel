const express = require("express");
const controller = require("../controllers/salesCommissionController");

const router = express.Router();

// Mount the same sales authentication middleware that is already used by the
// withdrawal routes before this router, or pass it directly in this route.
router.get("/", controller.getHistory);

module.exports = router;
