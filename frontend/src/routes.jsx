import App from "./App";
import { Login } from "./components/Login/Login";
import { Signup } from "./components/Signup/Signup";
import { Customize } from "./components/Customize/Customize";
import { CreatePost } from "./components/CreatePost/CreatePost";
import { FollowReqs } from "./components/FollowReqs/FollowReqs";
import { Post } from "./components/Post/Post";
import { Profile } from "./components/Profile/Profile";

const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "customize",
    element: <Customize />,
  },
  {
    path: "create",
    element: <CreatePost />,
  },
  {
    path: "requests",
    element: <FollowReqs />,
  },
  {
    path: "post/:postId",
    element: <Post />,
  },
  {
    path: "/:userId",
    element: <Profile />,
  },
];

export default routes;import App from "./App";
import { Login } from "./components/Login/Login";
import { Signup } from "./components/Signup/Signup";
import { Customize } from "./components/Customize/Customize";
import { CreatePost } from "./components/CreatePost/CreatePost";
import { FollowReqs } from "./components/FollowReqs/FollowReqs";
import { Post } from "./components/Post/Post";
import { Profile } from "./components/Profile/Profile";

const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "customize",
    element: <Customize />,
  },
  {
    path: "create",
    element: <CreatePost />,
  },
  {
    path: "requests",
    element: <FollowReqs />,
  },
  {
    path: "post/:postId",
    element: <Post />,
  },
  {
    path: "/:userId",
    element: <Profile />,
  },
];

export default routes;