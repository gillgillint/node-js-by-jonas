const express = require('express')
const user = require('./../controller/user.controller')
const auth = require('./../controller/auth.controller')

const router = express.Router()

router.post('/signup', auth.signup)
router.post('/login', auth.login)
router.post('/forgotPassword', auth.forgotPassword)
router.patch('/resetPassword/:token', auth.resetPassword)

// Protect all routes after this middleware
router.use(auth.protect)

router.post('/updatePassword', auth.updatePassword)
router.get('/me', user.getMe, user.getUser)
router.patch('/updateMe', user.updateMe)
router.delete('/deleteMe', user.deleteMe)

router.use(auth.authorization('admin'))

router
  .route('/')
  .get(user.getAllUsers)
  .post(user.createUser)

router
  .route('/:id')
  .get(user.getUser)
  .post(user.createUser)
  .patch(user.updateUser)
  .delete(user.deleteUser)

module.exports = router
