const express = require('express');
const router = express.Router();
const rap = require('../controlers/rapoarte')
const catchAsync = require('../utilities/catchasync')
const { isAdmin, isLoggedIn, isCasier } = require('../middleware')

router.route('/rap')
    .get(isLoggedIn, isAdmin, rap.renderRapoarte)

router.route('/api')
    .get(catchAsync(rap.api))
    .post(catchAsync(rap.apiRecive))

router.route('/apiNota')
    .post(catchAsync(rap.apiNota))

router.route('/apiTotal')
    .get(catchAsync(rap.apiTotal))

router.route('/factura')
    .get(isLoggedIn, isCasier, catchAsync(rap.renderFacturaForm))
    .post(isLoggedIn, isCasier, catchAsync(rap.factura))
module.exports = router