const multer = require('multer');

const AppError = require('../utils/AppError');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    const originalName = file.originalname.replace(/ /g,"_");
    cb(null, `${originalName.split('.')[0]}-${Date.now()}.${extension}`);
  }
});

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')) {
    cb(null, true);
  }else {
    cb(new AppError('Invalid file type. Only images allowed!', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadDogPhoto = upload.single('image');