const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const User = require('./../models/user.model')
const catchAsync = require('./../utils/catchAsync')
const Email = require('../utils/email')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  user.password = undefined

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true
  }

  res.cookie('jwt', token, cookieOptions)

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  })

  //'http://127.0.0.1:8000/me'
  const url = `${req.protocol}://${req.get('host')}/me`
  console.log(url)
  await new Email(newUser, url).sendWelcome()

  createSendToken(newUser, 200, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }
  // 3) If everything is ok, send token to client
  // const token = signToken(user._id)

  // res.status(200).json({
  //   status: 'success',
  //   token
  // })
  createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({ status: 'success' })
}

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token
  const { authorization } = req.headers

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1]
  } else if (req.cookie.jwt) {
    token = req.cookie.jwt
  }

  if (!token) {
    return next(new AppError('Your are not logged in!', 401))
  }
  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET) // มี parameter ตัวที่ 3 ด้วย เป็น callback ว่าโทเคนผ่านหรือเปล่า หรือหมออายุหรือยัง

  // 3) Check if user still exists
  const user = await User.findById(decoded.id)

  if (!user) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    )
  }

  // 4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    )
  }

  req.user = user
  next()
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        return next()
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser
      return next()
    } catch (err) {
      return next()
    }
  }
  next()
}

exports.authorization = (...role) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide'] role='user'

    if (!role.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      )
    }

    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user base on Posted email.
  const { email } = req.body
  const user = await User.findOne({ email: email })

  if (!user) {
    return next(new AppError('There is no user with email address', 404))
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  try {
    // 3) Send it user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`

    await new Email(user, resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    )
  }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  // 3) Update changedPasswordAt property for the user

  // 4) Log user in, send JWT
  // const token = signToken(user._id)

  // res.status(200).json({
  //   status: 'success',
  //   token
  // })

  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const { passwordCurrent, password, passwordConfirm } = req.body
  const user = await User.findById(req.user._id).select('+password')

  // 2) Check if POSTed current password is correct

  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  // 3) If so, update password
  user.password = password
  user.passwordConfirm = passwordConfirm
  await user.save()
  // 4) Log user in, send JWT

  // const token = signToken(user._id)

  // res.status(200).json({
  //   status: 'success',
  //   token
  // })
  createSendToken(user, 200, res)
})
