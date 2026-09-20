const express = require("express");
const auth = require("../middleware/auth");
const { getProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/", auth, getProfile);

module.exports = router;
