const User = require('./../models/user.model')
const catchAsync = require('./../utils/catchAsync')

exports.getAllUsers = catchAsync(async(req, res) => {

  const user = await User.find()

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  })
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet Define'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet Define'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet Define'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet Define'
  });
};
