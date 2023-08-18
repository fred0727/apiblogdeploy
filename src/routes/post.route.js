const express = require('express');

const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
const postMiddleware = require('../middlewares/post.middleware');
const userMiddleware = require('../middlewares/user.middleware');
const upload = require('../utils/multerUpload');

const router = express.Router();

router.route('/').get(postController.findAllPosts).post(
  upload.array('postImgs', 3), //Al utilizar el uplado de multer, me va a permitir tener acceso a la req.file
  authMiddleware.protect,
  validationMiddleware.createPostValidation,
  postController.createPost
);

router.use(authMiddleware.protect);

router.get('/me', postController.findMyPosts);

router.get(
  '/profile/:id',
  userMiddleware.validaUser,
  postController.findUserPosts
);

router
  .route('/:id')
  .get(postMiddleware.validPostPerFindOne, postController.findOnePost)
  .patch(
    postMiddleware.validPost,
    validationMiddleware.createPostValidation,
    authMiddleware.protectAccountOwner,
    postController.updatePost
  )
  .delete(
    postMiddleware.validPost,
    authMiddleware.protectAccountOwner,
    postController.deletePost
  );

module.exports = router;
