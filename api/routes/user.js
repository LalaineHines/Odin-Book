const userRouter = require("express").Router();
const userController = require("../controllers/user");
const passport = require("passport");

userRouter.post("/signup", userController.signUp);
userRouter.post("/login", userController.logIn);

userRouter.use(passport.authenticate("jwt", { session: false }));

userRouter.get("/requests", userController.getReqs);
userRouter.post("/requests/accept", userController.acceptReq);
userRouter.post("/requests/decline", userController.declineReq);

userRouter.put("/", userController.updateProfile);

userRouter.get("/", userController.getNotFollowing);
userRouter.get("/:userId", userController.getUser);

userRouter.post("/follow", userController.sendFollowReq);

module.exports = userRouter;