import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { server } from './app.js';
import connectDB from './db/index.js';

// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

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
