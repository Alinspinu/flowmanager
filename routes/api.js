const express = require("express");
const router = express.Router();

const catchAsync = require("../utilities/catchasync");

const { isAdmin, isLoggedIn, isCasier, isTva, isNotTva } = require("../middleware");

const api = require("../controlers/api");

router.route('/reprint').post(isLoggedIn, isAdmin, api.reciveReprint)

router.route('/tvaInfo').get(isLoggedIn, isAdmin, catchAsync(api.tva))

router.route("/notaApi").post(isLoggedIn, catchAsync(api.reciveNota));

router.route('/orderDone').post(catchAsync(api.orderDone))

router.route("/produseApi").post(isLoggedIn, catchAsync(api.sendProduse));

router.route("/ingSearch").post(isAdmin, isTva, catchAsync(api.querySearchIng));

router.route('/ingSearchFaraTva').post(isAdmin, isNotTva, catchAsync(api.querySearchIngFaraTva))

router.route("/sendCat").get(isLoggedIn, catchAsync(api.sendCat));

router.route("/furSearch").post(isAdmin, catchAsync(api.sendFurnizor));

router.route("/clientSearch").post(isAdmin, catchAsync(api.sendClient));

router.route("/search").get(catchAsync(api.search))

module.exports = router;
