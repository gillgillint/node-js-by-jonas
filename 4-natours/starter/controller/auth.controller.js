const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const User = require('./../models/user.model')
const catchAsync = require('./../utils/catchAsync')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  })
}

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  })

  const token = signToken(newUser._id)

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
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
  const token = signToken(user._id)

  res.status(200).json({
    status: 'success',
    token
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token
  const { authorization } = req.headers

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1]
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
