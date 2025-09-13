const db = require("../queries/posts");
const { body, validationResult } = require("express-validator");
const multer = require("multer");

const upload = multer({
  dest: process.env.NODE_ENV === "test" ? "tests/uploads/" : "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, GIF, and WEBP files are allowed."));
    }
    cb(null, true);
  },
});

async function getFeed(req, res, next) {
  try {
    const data = await db.getFeed(req.query.id);
    return res.json({
      success: true,
      posts: data,
    });
  } catch (error) {
    next(error);
  }
}

const validatePost = [
  body("content").trim().notEmpty().isLength({ max: 1000 }),
];

const createPost = [
  upload.single("image"),
  validatePost,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({
        message: "Send Failed Invalid Details",
        details: errors.array(),
      });
    }
    try {
      image = req.file ? req.file.path : null;
      await db.createPost(req.body.content, req.body.userId, image);
      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
];

async function likePost(req, res, next) {
  try {
    await db.likePost(req.body.postId);
    return res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await db.getPost(req.params.postId);
    return res.json({
      success: true,
      post: post,
    });
  } catch (error) {
    next(error);
  }
}

const validateComment = [
  body("comment").trim().notEmpty().isLength({ max: 255 }),
];

const postComment = [
  validateComment,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({
        message: "Send Failed Invalid Details",
        details: errors.array(),
      });
    }
    try {
      await db.postComment(req.body.comment, req.body.postId, req.body.userId);
      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
];

module.exports = {
  getFeed,
  createPost,
  likePost,
  getPost,
  postComment,
};