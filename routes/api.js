const express = require("express");
const router = express.Router();

const catchAsync = require("../utilities/catchasync");

const { isAdmin, isLoggedIn, isCasier, isTva, isNotTva } = require("../middleware");

const api = require("../controlers/api");

router.route('/tvaInfo').get(isLoggedIn, isAdmin, catchAsync(api.tva))

router.route("/notaApi").post(isCasier, catchAsync(api.reciveNota));

router.route('/orderDone').post(catchAsync(api.orderDone))

router.route("/produseApi").post(isAdmin, catchAsync(api.sendProduse));

router.route("/ingSearch").post(isAdmin, isTva, catchAsync(api.querySearchIng));

router.route('/ingSearchFaraTva').post(isAdmin, isNotTva, catchAsync(api.querySearchIngFaraTva))

router.route("/sendCat").get(isCasier, catchAsync(api.sendCat));

router.route("/furSearch").post(isAdmin, catchAsync(api.sendFurnizor));

router.route("/clientSearch").post(catchAsync(api.sendClient));

module.exports = router;
