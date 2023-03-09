const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchasync");

const { isBuc, isBarista, isLoggedIn } = require("../middleware");

const cmd = require("../controlers/comanda");

router.route("/bucatarie").get(isLoggedIn, isBuc, catchAsync(cmd.renderBuc));
router.route("/bucSend").get(isLoggedIn, isBuc, catchAsync(cmd.sendComenziBuc));
router.route("/barSend").get(isLoggedIn, isBarista, catchAsync(cmd.sendComenziBar));
router.route('/istoricBuc').get(isLoggedIn, isBuc, catchAsync(cmd.sendIstBuc))
router.route('/istoricBarista').get(isLoggedIn, isBarista, catchAsync(cmd.sendIstBarista))


router.route("/barista").get(isLoggedIn, isBarista, catchAsync(cmd.renderBar));

module.exports = router;
