const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validaUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({
    where: {
      id,
      status: 'active',
    },
  });
  if (!user) {
    return next(new AppError(`User with id ${id} not found!`, 400));
  }
  req.user = user;
  next();
});
