const express = require('express')
const tour = require('./../controller/tour.controller')
const auth = require('./../controller/auth.controller')
// const review = require('./../controller/review.controller')
const reviewRouter = require('./review.routes')

const router = express.Router()

// router.param('id', tour.checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// router
//   .route('/:tourId/review')
//   .post(auth.protect, auth.authorization('user'), review.createReview)

router.use('/:tourId/review', reviewRouter)

router.route('/top-5-cheap').get(tour.aliasTopTours, tour.getAllTours)

router.route('/tour-stats').get(tour.getTourStats)
router.route('/monthly-plan/:year').get(tour.getMonthlyPlant)

router
  .route('/')
  .get([auth.protect, tour.getAllTours])
  .post(tour.createTour)

router
  .route('/:id')
  .get(tour.getTour)
  .patch(tour.updateTour)
  .delete(
    auth.protect,
    auth.authorization('admin', 'lead-guide'),
    tour.deleteTour
  )

module.exports = router
