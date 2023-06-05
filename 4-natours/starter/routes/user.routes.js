const express = require('express')
const user = require('./../controller/user.controller')
const auth = require('./../controller/auth.controller')

const router = express.Router()

router.post('/signup', auth.signup)
router.post('/login', auth.login)

router.post('/forgotPassword', auth.forgotPassword)
router.patch('/resetPassword/:token', auth.resetPassword)

router.post('/updatePassword', auth.protect, auth.updatePassword)

router.patch('/updateMe', auth.protect, user.updateMe)
router.delete('/deleteMe', auth.protect, user.deleteMe)

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
