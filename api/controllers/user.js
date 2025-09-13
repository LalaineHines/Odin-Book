const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../queries/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
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

const validateUser = [
  body("username").trim().notEmpty().escape(),
  body("password").trim().notEmpty(),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .custom((value, { req }) => {
      if (value === req.body.password) {
        return true;
      }
      throw new Error("Passwords do not match");
    }),
  body("firstName").trim().notEmpty().isAlpha().escape(),
  body("lastName").trim().notEmpty().isAlpha().escape(),
];

const signUp = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res
        .status(400)
        .json({ error: "Sign Up failed", details: errors.array() });
    }
    try {
      await db.signUp(
        req.body.username,
        await bcrypt.hash(req.body.password, 10),
        req.body.firstName,
        req.body.lastName
      );
      res.status(201).end();
    } catch (error) {
      next(error);
    }
  },
];

function logIn(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      // 1 week
      { expiresIn: "168h" },
      (err, token) => {
        if (err) {
          return next(err);
        }
        res.json({ token, userId: user.id, username: user.username });
      }
    );
  })(req, res, next);
}

const validateUpdate = [
  body("username").trim().notEmpty(),
  body("firstName").trim().notEmpty().isAlpha(),
  body("lastName").trim().notEmpty().isAlpha(),
  body("bio").trim().notEmpty(),
];

const updateProfile = [
  upload.single("profilePic"),
  validateUpdate,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res
        .status(400)
        .json({ error: "Sign Up failed", details: errors.array() });
    }
    try {
      const user = db.getUser(req.body.userId);
      profilePic = req.file ? req.file.path : user.profilePic;
      await db.updateProfile(
        req.body.userId,
        req.body.username,
        req.body.firstName,
        req.body.lastName,
        req.body.bio,
        profilePic
      );
      return res.json({
        success: true,
        message: "Updated Profile",
      });
    } catch (error) {
      next(error);
    }
  },
];

async function getNotFollowing(req, res, next) {
  try {
    const users = await db.getNotFollowing(req.query.id);
    return res.json({
      success: true,
      users: users,
    });
  } catch (error) {
    next(error);
  }
}

async function sendFollowReq(req, res, next) {
  try {
    const success = await db.sendFollowReq(
      req.body.followId,
      req.body.senderId
    );
    if (!success) {
      return res.json({
        success: false,
        message: "Already sent follow request",
      });
    }
    return res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getReqs(req, res, next) {
  try {
    const reqs = await db.getReqs(req.query.id);
    if (!reqs) {
      return res.json({
        success: false,
        message: "Failed to get requests",
      });
    }
    return res.json({
      success: true,
      reqs: reqs,
    });
  } catch (error) {
    next(error);
  }
}

async function acceptReq(req, res, next) {
  try {
    await db.acceptReq(req.body.username, req.body.userId);
    return res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function declineReq(req, res, next) {
  try {
    await db.declineReq(req.body.username, req.body.userId);
    return res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await db.getUser(req.params.userId);
    return res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signUp,
  logIn,
  updateProfile,
  getNotFollowing,
  sendFollowReq,
  getReqs,
  acceptReq,
  declineReq,
  getUser,
};