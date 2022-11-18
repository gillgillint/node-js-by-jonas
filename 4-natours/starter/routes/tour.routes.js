const express = require('express');
const tour = require('./../controller/tour.controller');

const router = express.Router();

// router.param('id', tour.checkID);

router
  .route('/')
  .get(tour.getAllTours)
  .post([tour.createTour]);

router
  .route('/:id')
  .get(tour.getTour)
  .patch(tour.updateTour)
  .delete(tour.deleteTour);

module.exports = router;
