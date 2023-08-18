const { ref, getDownloadURL } = require('firebase/storage');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const storage = require('../utils/firebase');

exports.findAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    where: {
      status: 'active',
    },
  });

  const usersPromises = users.map(async (user) => {
    const imgRef = ref(storage, user.profileImgUrl);
    const url = await getDownloadURL(imgRef);

    user.profileImgUrl = url;

    return user;
  });

  const userResolved = await Promise.all(usersPromises);

  return res.status(200).json({
    status: 'success',
    users: userResolved,
  });
});

exports.findOneUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  const imgRef = ref(storage, user.profileImgUrl);
  const url = await getDownloadURL(imgRef);

  console.log(url);

  return res.status(200).json({
    status: 'success',
    message: 'Get user by id',
    user: {
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: url,
      role: user.role,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { name, email, description } = req.body;
  await user.update({
    name,
    email,
    description,
  });
  return res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    User: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  await user.update({ status: 'inactive' });
  res.status(200).json({
    status: 'success',
    message: 'Great, delete user.',
  });
});
