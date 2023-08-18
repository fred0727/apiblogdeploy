const express = require('express');
const userController = require('../controllers/user.controller');
const userMiddleware = require('../middlewares/user.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.route('/').get(userController.findAllUsers);

router.use(authMiddleware.restricTo('admin', 'user'));

router
  .use('/:id', userMiddleware.validaUser)
  .route('/:id')
  .get(userController.findOneUser)
  .patch(validationMiddleware.updateUserValidation, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
