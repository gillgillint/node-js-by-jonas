const mongoose = require('mongoose')
const Tour = require('./tour.model')

const review = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

review.index({ tour: 1, user: 1 }, { unique: true })

review.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'user',
  //   select: 'name photo'
  // }).populate({
  //   path: 'tour',
  //   select: 'name'
  // })

  this.populate({
    path: 'user',
    select: 'name photo'
  })

  next()
})

review.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])
  console.log(stats)

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

review.post('save', function() {
  // this points to current review

  // this.constructor === review(model)
  // this === ตัวที่เราบันทึก  constructor === Model ที่เราบันทึก(review)
  this.constructor.calcAverageRatings(this.tour)
})

// findByIdAndUpdate
// findBtIdAndDelete
// is a query middleware
review.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
})

review.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', review)

module.exports = Review
