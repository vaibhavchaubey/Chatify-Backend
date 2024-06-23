import dotenv from 'dotenv';

import { app, server } from './app.js';
import connectDB from './db/index.js';
dotenv.config({ path: './.env' });

const adminSecretKey =
  process.env.ADMIN_SECRET_KEY || 'djidkldmqnbcfiwbfrfbrwyi';

const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || 'PRODUCTION';

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running at port : ${port} in ${envMode} Mode`);
    });
  })
  .catch((err) => {
    console.log('MONGO db connection failed !!!', err);
  });

export { adminSecretKey, envMode };
