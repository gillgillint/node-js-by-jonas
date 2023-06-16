const express = require('express')
const viewsController = require('../controller/views.controller')
const authController = require('../controller/auth.controller')

const router = express.Router()

router.get('/', authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccount)

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
)

module.exports = router
