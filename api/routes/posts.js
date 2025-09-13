const postsRouter = require("express").Router();
const postsController = require("../controllers/posts");
const passport = require("passport");

postsRouter.use(passport.authenticate("jwt", { session: false }));

postsRouter.get("/", postsController.getFeed);
postsRouter.post("/", postsController.createPost);
postsRouter.post("/like", postsController.likePost);
postsRouter.get("/:postId", postsController.getPost);
postsRouter.post("/comments", postsController.postComment);

module.exports = postsRouter;