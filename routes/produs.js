const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchasync");
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const { isAdmin, isLoggedIn, isTva, isNotTva } = require("../middleware");
const produs = require("../controlers/produs");


router
  .route("/addProdus")
  .post(upload.single('imagine'), isLoggedIn, isAdmin, catchAsync(produs.addProdus));

router
  .route("/addMainCat")
  .post(upload.single('imagine'), isLoggedIn, isAdmin, catchAsync(produs.addMainCat));

router.route("/addCat").post(isLoggedIn, isAdmin, catchAsync(produs.addCat));
router
  .route("/modifica/:id")
  .get(isLoggedIn, isAdmin, catchAsync(produs.renderEdit))
  .put(upload.single('imagine'), isLoggedIn, isAdmin, catchAsync(produs.edit))
  .delete(isLoggedIn, isAdmin, catchAsync(produs.delete));

module.exports = router;
