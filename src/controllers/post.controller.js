const { db } = require('../database/config');
const Comment = require('../models/comment.model');
const { Post, postStatus } = require('../models/post.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const PostImg = require('../models/postimg.model');
const storage = require('../utils/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const crypto = require('crypto');

exports.findAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.findAll({
    where: {
      status: postStatus.active,
    },
    attributes: {
      exclude: ['status', 'userId'],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImgUrl', 'description'],
      },
      {
        model: PostImg,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  const postPromises = posts.map(async (post) => {
    const imgRef = ref(storage, post.user.profileImgUrl);
    const urlUser = await getDownloadURL(imgRef);

    post.user.profileImgUrl = urlUser;

    const postImgsPromises = post.postimgs.map(async (postImg) => {
      const imgRef = ref(storage, postImg.postImgUrl);
      const url = await getDownloadURL(imgRef);
      postImg.postImgUrl = url;
      return postImg;
    });

    const postImgsResolved = await Promise.all(postImgsPromises);
    post.postimgs = postImgsResolved;

    return post;
  });

  await Promise.all(postPromises);

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    posts,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const { id } = req.sessionUser;

  const post = await Post.create({
    title,
    content,
    userId: id,
  });

  const postImgsPromises = req.files.map(async (file) => {
    const imgRef = ref(
      storage,
      `posts/${crypto.randomUUID()}-${file.originalname}`
    );
    const imgUpload = await uploadBytes(imgRef, file.buffer);
    return await PostImg.create({
      postId: post.id,
      postImgUrl: imgUpload.metadata.fullPath,
    });
  });

  await Promise.all(postImgsPromises);

  return res.status(201).json({
    status: 'success',
    message: 'The post has been created!',
    post,
  });
});

exports.findOnePost = catchAsync(async (req, res, next) => {
  const { post } = req;

  const imgRefUserProfile = ref(storage, post.user.profileImgUrl);
  const urlUserProfile = await getDownloadURL(imgRefUserProfile);
  let userImgCommentPromises = [];
  let postImgsPromises = [];

  post.user.profileImgUrl = urlUserProfile;

  // Mapeando nuestras imagenes para convertirlas a la URL de nuestro storage en firebase
  if (post.postimgs?.length > 0) {
    postImgsPromises = post.postimgs.map(async (postImg) => {
      const imgRef = ref(storage, postImg.postImgUrl);
      const url = await getDownloadURL(imgRef);

      postImg.postImgUrl = url;
      return postImg;
    });
  }

  // Mapeando nuestras imagenes para convertirlas a la URL de nuestro storage en firebase
  if (post.comments?.length > 0) {
    userImgCommentPromises = post.comments.map(async (comment) => {
      const imgRef = ref(storage, comment.user.profileImgUrl);
      const url = await getDownloadURL(imgRef);
      comment.user.profileImgUrl = url;
      return comment;
    });
  }

  const arrPromises = [...userImgCommentPromises, ...postImgsPromises];
  await Promise.all(arrPromises);

  return res.status(200).json({
    status: 'success',
    post,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { post } = req;
  const { title, content } = req.body;

  await post.update({
    title,
    content,
  });

  return res.status(200).json({
    status: 'success',
    message: 'The post has been updated',
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { post } = req;
  await post.update({
    status: postStatus.disabled,
  });
  return res.status(200).json({
    status: 'success',
    message: 'The post has been deleted',
  });
});

//TODO: Crear lo mismo en FindMyPosts
exports.findMyPosts = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const posts = await Post.findAll({
    where: {
      status: postStatus.active,
      userId: sessionUser.id,
    },
    attributes: {
      exclude: ['status', 'userId'],
    },
    include: [
      {
        model: PostImg,
      },
    ],
  });

  if (posts.length > 0) {
    const postPromises = posts.map(async (post) => {
      const postImgsPromises = post.postimgs.map(async (postImg) => {
        const imgRef = ref(storage, postImg.postImgUrl);
        const url = await getDownloadURL(imgRef);
        postImg.postImgUrl = url;
        return postImg;
      });

      const postImgsResolved = await Promise.all(postImgsPromises);
      post.postimgs = postImgsResolved;
      return post;
    });

    await Promise.all(postPromises);
  }

  return res.status(200).json({
    status: 'success',
    posts,
  });
});

exports.findUserPosts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.query;
  const query = `SELECT * FROM posts WHERE "userId" = :iduser AND status = :status`;

  const [rows, fields] = await db.query(query, {
    replacements: { iduser: id, status: status },
  });

  return res.status(200).json({
    status: 'success',
    results: fields.rowCount,
    posts: rows,
  });
});
