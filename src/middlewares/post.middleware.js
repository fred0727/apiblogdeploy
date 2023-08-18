const catchAsync = require('../utils/catchAsync');
const { Post, postStatus } = require('../models/post.model');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const PostImg = require('../models/postimg.model');
const Comment = require('../models/comment.model');

exports.validPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne({
    where: {
      status: postStatus.active,
      id,
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImgUrl', 'description'],
      },
      {
        model: PostImg,
      },
      {
        model: Comment,
        include: [
          {
            model: User,
          },
        ],
      },
    ],
  });

  if (!post) {
    return next(new AppError(`Post with id ${id} not found`));
  }

  req.user = post.user;
  req.post = post;
  next();
});

exports.validPostPerFindOne = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne({
    where: {
      status: postStatus.active,
      id,
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImgUrl', 'description'],
      },
      {
        model: PostImg,
      },
      {
        model: Comment,
        include: [
          {
            model: User,
          },
        ],
      },
    ],
  });

  if (!post) {
    return next(new AppError(`Post with id ${id} not found`));
  }

  req.user = post.user;
  req.post = post;
  next();
});
