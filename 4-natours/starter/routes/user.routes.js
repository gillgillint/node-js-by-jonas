const express = require('express');
const user = require('./../controller/user.controller');

const router = express.Router();

router.route('/').get(user.getAllUsers).post(user.createUser);

router
  .route('/:id')
  .get(user.getUser)
  .post(user.createUser)
  .patch(user.updateUser)
  .delete(user.deleteUser);

module.exports = router;
