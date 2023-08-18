const { body, validationResult } = require('express-validator');

const validFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.mapped(),
    });
  }
  next();
};

exports.updateUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 character long'),
  validFields,
];

exports.createUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .notEmpty()
    .withMessage('Email. is required')
    .isEmail()
    .withMessage('Email must be a correct format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must have a lost 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have contain a one letter'),
  body('description').notEmpty().withMessage('Description is required'),
  validFields,
];

exports.updatePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Password must have a lost 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have contain a one letter'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must have a lost 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have contain a one letter'),
  validFields,
];

exports.createPostValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  validFields,
];

exports.createCommentValidation = [
  body('text').notEmpty().withMessage('Text is required'),
  validFields,
];

exports.updateCommentValidation = [
  body('text').notEmpty().withMessage('Text is required'),
  validFields,
];
