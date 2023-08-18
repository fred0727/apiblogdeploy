const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.protect = catchAsync(async (req, res, next) => {
  //   1.- Extraer el Token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2.- Validar si el token existe
  if (!token) {
    return next(
      new AppError('You are not logged, Please log in to get access', 401)
    );
  }

  // 3.- Decodoficar el token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED
  );

  // 4.- Buscar el usuario y validar si existe
  const user = await User.findOne({
    where: {
      id: decoded.id,
      status: 'active',
    },
  });

  if (!user) {
    return next(new AppError('The owner of this token is not longer', 401));
  }

  // Validar el tiempo en el que se cambio la contraseña, para saber si el token fue generado despues del cambio de contraseña
  if (user.passwordChangedAt) {
    const changedTimeStamp = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError('User recently changed passord! Please login again', 401)
      );
    }
  }

  req.sessionUser = user;
  next();
});

exports.protectAccountOwner = (req, res, next) => {
  const { user, sessionUser } = req;

  if (user.id !== sessionUser.id) {
    return next(new AppError('You do not ow this account', 401));
  }

  next();
};

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.sessionUser.role)) {
      return next(
        new AppError('You do not have permission to perform to action', 403)
      );
    }

    next();
  };
};
