const express = require('express')
const auth = require('./../controller/auth.controller')
const review = require('./../controller/review.controller')

const router = express.Router({ mergeParams: true })

router.use(auth.protect)

router
  .route('/')
  .get(review.getAllReviews)
  .post(auth.authorization('user'), review.setTourUserIds, review.createReview)

router
  .route('/:id')
  .get(review.getReview)
  .patch(auth.authorization('user', 'admin'), review.updateReview)
  .delete(auth.authorization('user', 'admin'), review.deleteReview)

module.exports = router
