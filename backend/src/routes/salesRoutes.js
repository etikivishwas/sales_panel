const express = require("express");

const auth = require("../middleware/auth");
const {
  getDashboard,
} = require("../controllers/dashboardController");
const { getVendors } = require("../controllers/vendorController");
const { getLeads } = require("../controllers/leadController");
const withdrawalController = require("../controllers/withdrawalController");
const salesCommissionController = require("../controllers/salesCommissionController");
const accountSettingsController = require("../controllers/accountSettingsController");
const salesVendorRegistrationRoutes =
  require(
    "./salesVendorRegistrationRoutes"
  );
const router = express.Router();

router.use(auth);

router.use(
  "/vendor-registration",
  salesVendorRegistrationRoutes
);

router.get(
  "/account-settings",
  accountSettingsController.getAccountSettings
);

router.put(
  "/account-settings",
  accountSettingsController.updateAccountSettings
);

router.put(
  "/account-settings/password",
  accountSettingsController.changePassword
);

router.get("/dashboard", getDashboard);
router.get("/vendors", getVendors);
router.get("/leads", getLeads);
router.get("/commissions", salesCommissionController.getHistory);
router.get(
  "/withdrawals/summary",
  withdrawalController.getSummary
);

router.post(
  "/withdrawals",
  withdrawalController.create
);

module.exports = router;
