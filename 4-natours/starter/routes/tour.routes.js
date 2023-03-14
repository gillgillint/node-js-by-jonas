const express = require('express')
const tour = require('./../controller/tour.controller')
const auth = require('./../controller/auth.controller')

const router = express.Router()

// router.param('id', tour.checkID);

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
  .delete(tour.deleteTour)

module.exports = router
