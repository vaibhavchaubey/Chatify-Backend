import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from './constants/event.js';
import { getSockets } from '../lib/helper.js';
import { Message } from './models/message.model.js';
import cors from 'cors';

/* Seeders */

// import { createUser } from './seeders/user.seeder.js';
// import {
//   createGroupChats,
//   createMessages,
//   createMessagesInAChat,
//   createSingleChats,
// } from './seeders/chat.seeder.js';

// createUser(10);
// createSingleChats(10);
// createGroupChats(10);
// createMessages(10);
// createMessagesInAChat("666618300310dacae8f9d624", 50);

const app = express();
const server = createServer(app);
const io = new Server(server, {});

const userSocketIDs = new Map(``);

// using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

// routes import
import userRoute from './routes/user.routes.js';
import chatRoute from './routes/chat.routes.js';
import adminRoute from './routes/admin.routes.js';

// routes declaration
app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/admin', adminRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.use((socket, next) => {});

io.on('connection', (socket) => {
  const user = {
    _id: 'fwgrnhyt',
    name: 'user123',
  };
  userSocketIDs.set(user._id.toString(), socket.id);

  // console.log('User connected', socket.id);

  console.log(userSocketIDs);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealtime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);

    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealtime,
    });

    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
      chatId,
    });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    userSocketIDs.delete(user._id.toString());
  });
});

app.use(errorMiddleware);

export { app, server, userSocketIDs };
