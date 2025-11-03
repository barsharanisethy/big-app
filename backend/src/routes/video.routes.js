const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadVideo, listVideos, likeVideo, saveVideo, addComment, getComments } = require('../controllers/video.controller');

const uploadPath = path.join(__dirname, '../../uploads/videos');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

const upload = multer({ storage });

const { authUserMiddleware } = require('../middlewares/auth.middleware');

// Public: list videos (will include isLiked/isSaved when user cookie is present)
router.get('/', listVideos);

// Protected: upload, like, save
router.post('/upload', authUserMiddleware, upload.single('video'), uploadVideo);
router.post('/:id/like', authUserMiddleware, likeVideo);
router.post('/:id/save', authUserMiddleware, saveVideo);
router.post('/:id/comments', authUserMiddleware, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
