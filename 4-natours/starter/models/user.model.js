const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const user = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        // This only works on CREATE and SAVE!!!
        return el === this.password
      },
      message: 'Passwords are not the same!'
    }
  }
})

user.pre('save', async function(next) {
  // Only ran this function if password was actually modified
  if (!this.isModified('password')) {
    return next()
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  // Delete passwordConfirm field
  this.passwordConfirm = undefined
  next()
})

user.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}
const User = mongoose.model('User', user)

module.exports = User
