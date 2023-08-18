const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/appError');
const storage = require('../utils/firebase');

const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

exports.SignUp = catchAsync(async (req, res) => {
  const { name, email, password, description } = req.body;

  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);

  const imgUpload = await uploadBytes(imgRef, req.file.buffer);

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: encryptedPassword,
    description,
    profileImgUrl: imgUpload.metadata.fullPath,
  });

  const token = await generateJWT(user.id);

  return res.status(200).json({
    status: 'Success',
    message: 'The user has been created',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: user.profileImgUrl,
    },
  });
});

exports.SignIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email: email.toLowerCase().trim(),
    },
  });

  if (!user) {
    return next(new AppError(`User with email: ${email} not found`, 404));
  }

  // Validamos si la contraseña es correcta
  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError(`Incorret email or password`, 401));
  }

  // Generamos el Token
  const tokenPromise = generateJWT(user.id);

  const imgRef = ref(storage, user.profileImgUrl);
  const urlPromise = await getDownloadURL(imgRef);

  const [token, url] = await Promise.all([tokenPromise, urlPromise]);

  user.profileImgUrl = url;

  return res.status(200).json({
    status: 'Success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: user.profileImgUrl,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;

  // Validamos que las contraseñas no sea igual a la anterior
  if (currentPassword === newPassword) {
    return next(new AppError(`The password cannot be equals`, 400));
  }

  // Validamos la contraseña
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError(`Incorret password`, 401));
  }

  // Encriptando contraseña
  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(newPassword, salt);

  // Actualizando contraseña
  await user.update({
    password: encryptedPassword,
    passwordChangedAt: new Date(),
  });

  return res.status(200).json({
    status: 'success',
    message: 'The user password was updated successfully',
  });
});
