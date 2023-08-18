const Comment = require('./comment.model');
const User = require('./user.model');
const { Post } = require('./post.model');
const PostImg = require('./postimg.model');

const initModel = () => {
  User.hasMany(Post, { foreignKey: 'userId' });
  Post.belongsTo(User, { foreignKey: 'userId' });

  Post.hasMany(Comment, { foreignKey: 'postId' });
  Comment.belongsTo(Post, { foreignKey: 'postId' });

  User.hasMany(Comment, { foreignKey: 'userId' });
  Comment.belongsTo(User, { foreignKey: 'userId' });

  Post.hasMany(PostImg, { foreignKey: 'postId' });
  PostImg.belongsTo(Post, { foreignKey: 'postId' });
};

module.exports = initModel;
