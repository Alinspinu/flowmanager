const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchasync");

const ing = require("../controlers/ingredient");
const { isAdmin, isLoggedIn, isTva, isNotTva } = require("../middleware");

router
  .route("/addIngredient")
  .post(isLoggedIn, isAdmin, isTva, catchAsync(ing.addIngTva));

router.route('/addIngFaraTva')
  .post(isLoggedIn, isAdmin, isNotTva, catchAsync(ing.addIngFaraTva))

router.route("/addInv").put(isLoggedIn, isAdmin, catchAsync(ing.addInventar));

router.route("/stoc").get(isLoggedIn, isAdmin, catchAsync(ing.stocLive));

router
  .route("/modifica/:id")
  .get(isLoggedIn, isAdmin, catchAsync(ing.renderEdit))
  .put(isLoggedIn, isAdmin, catchAsync(ing.edit))
  .delete(isLoggedIn, isAdmin, catchAsync(ing.delete));

router
  .route("/addFurnizor")
  .post(isLoggedIn, isAdmin, catchAsync(ing.addFurnizor));

router.route("/:indexData").get(isLoggedIn, isAdmin, catchAsync(ing.printNir));
router
  .route("/bon/:bonIndexData")
  .get(isLoggedIn, isAdmin, catchAsync(ing.bonTransfer));
module.exports = router;
