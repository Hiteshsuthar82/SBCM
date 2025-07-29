const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(process.env.UPLOAD_PATH)) fs.mkdirSync(process.env.UPLOAD_PATH);
    cb(null, process.env.UPLOAD_PATH);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) },
  fileFilter: (req, file, cb) => {
    const allowed = process.env.ALLOWED_FILE_TYPES.split(',');
    if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid file type'), false);
    cb(null, true);
  },
});

const compressFile = async (req, res, next) => {
  try {
    if (req.file) { // Handle single file
      if (req.file.mimetype.startsWith('image')) {
        const compressedPath = req.file.path.replace(path.extname(req.file.path), '_compressed' + path.extname(req.file.path));
        await sharp(req.file.path).resize({ width: 1024 }).toFormat('jpeg', { quality: 80 }).toFile(compressedPath);
        fs.unlinkSync(req.file.path);
        req.file.path = compressedPath;
      }
    } else if (req.files) { // Handle array
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        if (file.mimetype.startsWith('image')) {
          const compressedPath = file.path.replace(path.extname(file.path), '_compressed' + path.extname(file.path));
          await sharp(file.path).resize({ width: 1024 }).toFormat('jpeg', { quality: 80 }).toFile(compressedPath);
          fs.unlinkSync(file.path);
          req.files[i].path = compressedPath;
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload: upload.array('evidence', 5), compressFile, singleUpload: upload };