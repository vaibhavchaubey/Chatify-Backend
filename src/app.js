import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import { createUser } from './seeders/user.seeder.js';
import {
  createGroupChats,
  createMessages,
  createMessagesInAChat,
  createSingleChats,
} from './seeders/chat.seeder.js';

// createUser(10);

// createSingleChats(10);
// createGroupChats(10);
// createMessages(10);
// createMessagesInAChat("666618300310dacae8f9d624", 50);

const app = express();

// using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes import
import userRoute from './routes/user.routes.js';
import chatRoute from './routes/chat.routes.js';

// routes declaration
app.use('/user', userRoute);
app.use('/chat', chatRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);

export { app };
