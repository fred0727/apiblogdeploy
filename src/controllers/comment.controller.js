const catchAsync = require('../utils/catchAsync');

const Comment = require('../models/comment.model');

exports.findAllComment = catchAsync(async (req, res, next) => {
  // const { initDate, endDate } = req.query;

  const comments = await Comment.findAll({
    where: {
      status: true,
      // Para filtrar por fecha
      // createdAt: {
      //   [Op.between]: [initDate, endDate],
      // },
    },
  });

  return res.status(200).json({
    status: 'success',
    results: comments.length,
    comments,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  const { id: userId } = req.sessionUser;
  const { id: postId } = req.params;

  const comment = await Comment.create({
    text,
    postId,
    userId,
  });

  return res.status(201).json({
    status: 'success',
    results: 'Comment created successfully',
    comment,
  });
});

exports.findOneComment = catchAsync(async (req, res, next) => {
  const { comment } = req;

  return res.status(200).json({
    status: 'success',
    comment,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { comment } = req;
  const { text } = req.body;

  await comment.update({
    text,
  });

  return res.status(200).json({
    status: 'success',
    results: 'Comment updated successfully',
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { comment } = req;

  await comment.update({
    status: false,
  });

  return res.status(200).json({
    status: 'success',
    results: 'Comment delete successfully',
  });
});
