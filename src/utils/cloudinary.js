import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuid } from 'uuid';
import { getBase64 } from '../../lib/helper.js';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: 'auto',
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    // console.log(
    //   process.env.CLOUDINARY_CLOUD_NAME,
    //   process.env.CLOUDINARY_API_KEY,
    //   process.env.CLOUDINARY_API_SECRET
    // );

    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    console.log(err);
    throw new Error('Error uploading files to cloudinary', err);
  }
};

const deletFilesFromCloudinary = async (public_ids) => {
  // Delete files from cloudinary
};

export { deletFilesFromCloudinary, uploadFilesToCloudinary };
