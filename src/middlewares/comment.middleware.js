const catchAsync = require('../utils/catchAsync');
const Comment = require('../models/comment.model');
const AppError = require('../utils/appError');

exports.validComment = catchAsync(async (req, res, next) => {
  /* valor a retornar */
  const { id } = req.params;
  const comment = await Comment.findOne({
    where: {
      status: true,
      id,
    },
  });

  if (!comment) {
    next(new AppError('Comment not found', 404));
  }

  req.comment = comment;
  next();
});
