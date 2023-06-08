const express = require('express')
const auth = require('./../controller/auth.controller')
const review = require('./../controller/review.controller')

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(auth.protect, review.getAllReviews)
  .post(auth.protect, auth.authorization('user'), review.createReview)

router.route('/:id').delete(review.deleteReview)

module.exports = router
