const express = require('express')
const booking = require('../controller/booking.controller')
const auth = require('../controller/auth.controller')

const router = express.Router()

router.use(auth.protect)

router.get(
  '/checkout-session/:tourId',

  booking.getCheckoutSession
)

router.use(auth.authorization('admin', 'lead-guide'))

router
  .route('/')
  .get(booking.getAllBookings)
  .post(booking.createBooking)

router
  .route('/:id')
  .get(booking.getBooking)
  .patch(booking.updateBooking)
  .delete(booking.deleteBooking)

module.exports = router
