const Video = require('../models/video.model');

async function uploadVideo(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { originalname, filename, path } = req.file;
    const { desc, store, poster } = req.body;
    // url exposed to clients
    const url = `/uploads/videos/${filename}`;

    const video = await Video.create({
      filename: originalname,
      path,
      url,
      poster,
      desc,
      store
    });

    res.status(201).json({ message: 'Video uploaded', video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
}

async function listVideos(req, res) {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    // If user is authenticated, attach isLiked/isSaved flags
    const userId = req.user ? req.user._id.toString() : null;
    const mapped = videos.map(v => ({
      _id: v._id,
      filename: v.filename,
      url: v.url,
      poster: v.poster,
      desc: v.desc,
      store: v.store,
      createdAt: v.createdAt,
      likesCount: (v.likes && v.likes.length) ? v.likes.length : 0,
      savesCount: (v.saves && v.saves.length) ? v.saves.length : 0,
      isLiked: userId ? (v.likes || []).some(id => id.toString() === userId) : false,
      isSaved: userId ? (v.saves || []).some(id => id.toString() === userId) : false
    }));
    res.json({ videos: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list videos' });
  }
}


async function likeVideo(req, res) {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const idx = (video.likes || []).findIndex(id => id.toString() === userId.toString());
    let action = 'liked';
    if (idx === -1) {
      video.likes.push(userId);
    } else {
      video.likes.splice(idx, 1);
      action = 'unliked';
    }
    await video.save();
    res.json({ message: `Video ${action}`, likesCount: video.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
}

async function saveVideo(req, res) {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const idx = (video.saves || []).findIndex(id => id.toString() === userId.toString());
    let action = 'saved';
    if (idx === -1) {
      video.saves.push(userId);
    } else {
      video.saves.splice(idx, 1);
      action = 'unsaved';
    }
    await video.save();
    res.json({ message: `Video ${action}`, savesCount: video.saves.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to toggle save' });
  }
}

async function addComment(req, res) {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.comments.push({
      user: userId,
      text
    });

    await video.save();
    
    // Populate user info for the new comment
    const newComment = video.comments[video.comments.length - 1];
    await Video.populate(video, {
      path: 'comments.user',
      select: 'name email'
    });

    res.json({ 
      message: 'Comment added',
      comment: {
        id: newComment._id,
        text: newComment.text,
        user: newComment.user,
        createdAt: newComment.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
}

async function getComments(req, res) {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId)
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      .lean();

    if (!video) return res.status(404).json({ message: 'Video not found' });

    res.json({ comments: video.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get comments' });
  }
}

module.exports = { uploadVideo, listVideos, likeVideo, saveVideo, addComment, getComments };
