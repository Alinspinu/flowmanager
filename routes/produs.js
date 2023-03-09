const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchasync");

const { isAdmin, isLoggedIn, isTva, isNotTva } = require("../middleware");
const produs = require("../controlers/produs");

router
  .route("/nomenclator")
  .get(isLoggedIn, isAdmin, catchAsync(produs.nomenclator));

router
  .route("/addProdus")
  .post(isLoggedIn, isAdmin, catchAsync(produs.addProdus));

router.route('/addCategorie').get(isLoggedIn, isAdmin, catchAsync(produs.renderAddCategorie))
router.route('/addFurnizor').get(isLoggedIn, isAdmin, catchAsync(produs.renderAddFurnizor))
router.route('/addNir').get(isLoggedIn, isAdmin, isTva, catchAsync(produs.renderAddNirTva))
router.route('/addNirFaraTva').get(isLoggedIn, isAdmin, isNotTva, catchAsync(produs.renderAddNirFaraTva))
router.route('/addProdus').get(isLoggedIn, isAdmin, catchAsync(produs.renderAddProdus))
router.route('/transfer').get(isLoggedIn, isAdmin, catchAsync(produs.renderTransfer))

router
  .route("/addMainCat")
  .post(isLoggedIn, isAdmin, catchAsync(produs.addMainCat));

router.route("/addCat").post(isLoggedIn, isAdmin, catchAsync(produs.addCat));
router
  .route("/modifica/:id")
  .get(isLoggedIn, isAdmin, catchAsync(produs.renderEdit))
  .put(isLoggedIn, isAdmin, catchAsync(produs.edit))
  .delete(isLoggedIn, isAdmin, catchAsync(produs.delete));

module.exports = router;
