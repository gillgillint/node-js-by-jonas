const AppError = require('./../utils/appError')

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name
  const message = `Duplicate field value "${value}" Please use another value! `

  return new AppError(message, 400)
}

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message)

  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const errOnDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // API
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    })
  } else {
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'something want wrong',
      message: err.message
    })
  }
}

const handleJWTError = () =>
  new AppError('Invalid token please log in again!', 401)

const handleJWTExpiredError = () =>
  new AppError('token has expired! Please log in again.', 401)

const errOnProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // API
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }
    // Programming or other unknown error: don't leak error details to client
    // 1) Log error
    console.error('ERROR 💥', err)

    // 2)  Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    })
  }
  // RENDER WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something want wrong',
      message: err.message
    })

    // Programming or other unknown error: don't leak error details to client
  }
  // 1) Log error
  console.error('ERROR 💥', err)

  // 2)  Send generic message
  return res.status(500).render('error', {
    title: 'something want wrong',
    message: 'Please try again later'
  })
}

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    errOnDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    error.message = err.message

    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error._message.includes('validation failed'))
      error = handleValidationError(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)

    errOnProd(error, req, res)
  }
}
