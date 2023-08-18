require('dotenv').config();
const app = require('./app');
const { db } = require('./database/config');
const initModel = require('./models/initModels');
const { Server } = require('socket.io');
const Sockets = require('./sockets');

// var cron = require('node-cron');

// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });

db.authenticate()
  .then(() => console.log('Database connected 💻'))
  .catch((err) => console.log(err));

initModel();

db.sync({ force: false })
  .then(() => console.log('Database syncronized 👌'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is up un port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

new Sockets(io);
