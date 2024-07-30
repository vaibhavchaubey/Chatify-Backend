import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

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
        { resource_type: 'auto', public_id: uuid() },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    formatedResults = results.map((result) => {
      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    });

    return formatedResults;
  } catch (error) {
    throw new Error('Error uploading files to cloudinary', err);
  }

  // try {
  //   if (!localFilePath) {
  //     return null;
  //   }
  //   // upload the file on cloudinary
  //   const response = await cloudinary.uploader.upload(localFilePath, {
  //     resource_type: 'auto',
  //   });
  //   // file has been uploaded successfully
  //   // console.log("file is uploaded on cloudinary", response.url);
  //   // remove the locally saved temporary file as the upload operation has completed
  //   fs.unlinkSync(localFilePath);
  //   return response;
  // } catch (error) {
  //   console.error('Upload on Cloudinary failed', error);
  //   // remove the locally saved temporary file as the upload operation got failed
  //   fs.unlinkSync(localFilePath);
  //   return null;
  // }
};

const deletFilesFromCloudinary = async (public_ids) => {
  // Delete files from cloudinary
};

export { uploadFilesToCloudinary, deletFilesFromCloudinary };
