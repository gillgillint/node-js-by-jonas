const jwt = require('jsonwebtoken')
const User = require('./../models/user.model')
const catchAsync = require('./../utils/catchAsync')

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm
  })


  const token = jwt.sign({id: newUser._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES})

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
})
