const jwt = require('jsonwebtoken')
const User = require('./../models/user.model')
const catchAsync = require('./../utils/catchAsync')

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name:req.body.name,
    emil:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm
  })

  const token = jwt.sign({id: newUser._id})

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser
    }
  })
})
