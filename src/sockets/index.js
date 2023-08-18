const { socket } = require('socket.io');
const PostService = require('../services/post.service');

class Sockets {
  constructor(io) {
    this.io = io;
    this.postService = new PostService();
    this.socketEvents();
  }

  socketEvents() {
    this.io.on('connection', (socket) => {
      socket.on('new-post', async ({ id }) => {
        try {
          const post = await this.postService.FindPost(id);
          const newPost = await this.postService.downloadImgPost(post);
          socket.broadcast.emit('render-new-post', newPost);
        } catch (error) {
          throw new Error(error);
        }
      });
    });
  }
}

module.exports = Sockets;
