const express = require("express");
const router = express.Router();
const passport = require("passport");
const loc = require("../controlers/locatie");
const Locatie = require("../models/locatie");
const catchAsync = require("../utilities/catchasync");
const { isAdmin, isLoggedIn } = require("../middleware");

router.route("/login").post(
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/",
    keepSessionInfo: true,
  }),
  loc.locatieLogin
);

router
  .route("/user/login")
  .get(loc.renderUserLogin)
  .post(catchAsync(loc.userLogin));

router
  .route("/user/register")
  .get(loc.renderUserRegister)
  .post(catchAsync(loc.userRegister));

router.route("/logout").get(loc.locatieLogout);

router.route("/show").get(isLoggedIn, isAdmin, catchAsync(loc.renderUsers));

router
  .route("/user/:id")
  .get(isLoggedIn, isAdmin, loc.renderEdit)
  .put(isLoggedIn, isAdmin, catchAsync(loc.userEdit))
  .delete(isLoggedIn, isAdmin, catchAsync(loc.userDelete));

router.route("/users/logout").get(isLoggedIn, loc.userLogout);

router.route("/addFirma").post(isLoggedIn, isAdmin, catchAsync(loc.addFirma));
router.route("/addClient").post(isLoggedIn, isAdmin, catchAsync(loc.addClient));

// router.route('/locatieUpdate')
//     .get(loc.updateLocatie)

module.exports = router;
