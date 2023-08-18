const Error = require('../models/error.model');
const AppError = require('../utils/appError');

const handleCastError22001 = () =>
  new AppError('The number of character is greater and excepted', 400);

const handleCastError22P02 = () =>
  new AppError('Invalid data type in database', 400);

const handleCastError23505 = () =>
  new AppError('Duplicate fild value: please use another value', 400);

const handleJWTError = () =>
  new AppError('Invalid Token, please login again', 401);

const handleJWTExpireError = () =>
  new AppError('Yoyr token has expired!, Please login again', 401);

const sendErrorDev = (err, res) => {
  Error.create({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });

  console.log(err);

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err: err,
  });
};

const sendErroProd = (err, res) => {
  console.log(err);
  // operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming or other unknown error: don't leak error detail
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (err.parent?.code === '22001') error = handleCastError22001();
    if (err.parent?.code === '22P02') error = handleCastError22P02();
    if (err.parent?.code === '23505') error = handleCastError23505();
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpireError();

    sendErroProd(error, res);
  }
};

module.exports = globalErrorHandler;
