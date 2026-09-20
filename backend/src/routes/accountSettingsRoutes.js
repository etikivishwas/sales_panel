const express = require("express");
const controller = require("../controllers/accountSettingsController");

const router = express.Router();

router.get("/", controller.getAccountSettings);
router.put("/", controller.updateAccountSettings);
router.put("/password", controller.changePassword);

module.exports = router;
