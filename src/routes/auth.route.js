const express = require('express');

const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middlewares/validations.middleware');
const uservalidationMiddleware = require('../middlewares/user.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../utils/multerUpload');

const router = express.Router();

router.post(
  '/signup',
  upload.single('profileImgUrl'),
  validationMiddleware.createUserValidation,
  authController.SignUp
);

router.post('/signin', authController.SignIn);

router.use(authMiddleware.protect);

router.patch(
  '/password/:id',
  validationMiddleware.updatePasswordValidation,
  uservalidationMiddleware.validaUser,
  authMiddleware.protectAccountOwner,
  authController.updatePassword
);

module.exports = router;
