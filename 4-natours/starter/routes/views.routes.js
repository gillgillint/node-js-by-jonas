const express = require('express')
const viewsController = require('../controller/views.controller')
const authController = require('../controller/auth.controller')
const booking = require('../controller/booking.controller')

const router = express.Router()

router.get(
  '/',
  booking.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccount)
router.get('/my-tour', authController.protect, viewsController.getAccount)

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
)

module.exports = router
