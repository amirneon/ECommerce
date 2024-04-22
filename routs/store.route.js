const express = require("express");
const { storeController } = require("../controllers");
const { userAuthentication } = require("../middlewares");

const router = express.Router();

router.post("/payRequest", userAuthentication, storeController.request);
router.post("/verifyRequest", userAuthentication, storeController.Verify);
router.post("/factor");

module.exports = router;
