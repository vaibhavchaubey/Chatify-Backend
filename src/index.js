import dotenv from 'dotenv';

import { app } from './app.js';
import connectDB from './db/index.js';
dotenv.config({ path: './.env' });

export const adminSecretKey =
  process.env.ADMIN_SECRET_KEY || 'djidkldmqnbcfiwbfrfbrwyi';

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log('MONGO db connection failed !!!', err);
  });

/* 
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERROR:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("ERROR:", error);
        throw error;
    }
})();
*/
