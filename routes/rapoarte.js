const express = require('express');
const router = express.Router();
const rap = require('../controlers/rapoarte')
const catchAsync = require('../utilities/catchasync')
const { isAdmin, isLoggedIn, isCasier } = require('../middleware')


router.route('/dashboard').get(rap.renderDashboard)

router.route('/api')
    .get(catchAsync(rap.api))
    .post(catchAsync(rap.apiRecive))

router.route('/apiNota')
    .post(catchAsync(rap.apiNota))

router.route('/apiTotalRefresh').get(catchAsync(rap.refreshTotal))

router.route('/entry')
    .post(rap.addEntry)
    .get(rap.sendEntry)
    .delete(rap.deleteEntry)

router.route('/factura')
    .get(isLoggedIn, isCasier, catchAsync(rap.renderFacturaForm))
    .post(isLoggedIn, isCasier, catchAsync(rap.factura))
module.exports = router