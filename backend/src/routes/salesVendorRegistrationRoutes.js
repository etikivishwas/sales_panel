const express = require("express");
const controller = require("../controllers/salesVendorRegistrationController");
const upload = require("../middleware/vendorRegistrationUpload");

const router = express.Router();

router.get("/categories", controller.getCategories);
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "msmeCertificate", maxCount: 1 },
    { name: "identityProof", maxCount: 1 },
  ]),
  controller.createRegistration
);
router.get("/documents/:documentId", controller.getDocument);

module.exports = router;
