import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

// using middlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// routes import
import userRoute from './routes/user.routes.js';

// routes declaration
app.use('/user', userRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);

export { app };
