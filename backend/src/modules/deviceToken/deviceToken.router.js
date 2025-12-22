
const router = require("express").Router();
const controller = require("./deviceToken.controller");

router.post("/", controller.registerDeviceToken);

module.exports = router;

