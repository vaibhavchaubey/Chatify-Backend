// import multer from 'multer';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/temp');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// export const multerUpload = multer({
//   limits: { fileSize: 1024 * 1024 * 5 },
//   storage: storage,
// });

import multer from 'multer';

export const multerUpload = multer({
  limits: { fileSize: 1024 * 1024 * 5 },
});

const singleAvatar = multerUpload.single('avatar');
const attachmentsMulter = multerUpload.array('files', 5);

export { singleAvatar,attachmentsMulter };
