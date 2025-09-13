import { Link } from "react-router-dom";
import styles from "./App.module.css";
import { useEffect, useState } from "react";
import "./index.css";
import { Home, Like, Comment } from "./components/Icons/Icons";
import { Header } from "./components/Header/Header";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [notFollowing, setNotFollowing] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const API_URL = import.meta.env.VITE_API_URL;

  async function getUser(userId) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (token) {
      setLoggedIn(true);
      getUser(userId);
    }
  }, [token]);

  async function getFeed() {
    try {
      const response = await fetch(`${API_URL}/posts?id=${userId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error(error);
    }
  }

  async function getNotFollowing() {
    try {
      const response = await fetch(`${API_URL}/user?id=${userId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setNotFollowing(data.users);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (loggedIn) {
      getFeed();
      getNotFollowing();
    }
  }, [loggedIn]);

  async function sendFollowReq(followId) {
    try {
      setError(null);
      const data = {
        senderId: userId,
        followId: followId,
      };

      const response = await fetch(`${API_URL}/user/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        mode: "cors",
      });
      const responseData = await response.json();

      if (!responseData.success) {
        setError(responseData.message);
      }
    } catch (err) {
      console.error("Network or server error:", err);
    }
  }

  async function likePost(id) {
    try {
      const data = {
        postId: id,
      };

      await fetch(`${API_URL}/posts/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        mode: "cors",
      });
      getFeed();
    } catch (err) {
      console.error("Network or server error:", err);
    }
  }

  function signOut() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <>
      <header className={styles.header}>
        <Link to={"/"} className="link">
          <h1>Odinstagram</h1>
        </Link>
        {loggedIn && user && (
          <div>
            <Link to={`/${user.id}`} className="link">
              <div className={styles.user}>
                <span>
                  <strong>{user.username}</strong>
                </span>
                <img
                  className={styles.profilePic}
                  src={`${API_URL}/${user.profilePic}`}
                  alt="Profile Picture"
                />
              </div>
            </Link>
            <Link to={"customize"} className={styles.headerButton}>
              Customize Profile
            </Link>
            <Link to={"requests"} className={styles.headerButton}>
              Follow Requests
            </Link>
            <Link to={"create"} className={styles.headerButton}>
              Create Post
            </Link>
            <button onClick={signOut} className={styles.headerButton}>
              Sign Out
            </button>
          </div>
        )}
      </header>
      <main className={styles.main}>
        {!loggedIn && (
          <div>
            <div className={styles.buttonContainer}>
              <Link to={"signup"} className={styles.button}>
                Sign Up
              </Link>
              <Link to={"login"} className={styles.button}>
                Log In
              </Link>
            </div>
            <h2>Welcome To Odinstagram!</h2>
            <h3>Sign Up To Get Started</h3>
          </div>
        )}

        {loggedIn && (
          <div className={styles.container}>
            <div>
              <h2>
                <u>Your Feed</u>
              </h2>
              {posts.length < 1 && (
                <span>No posts yet create one or follow some people :)</span>
              )}
              {posts &&
                posts.map((post) => {
                  return (
                    <div key={post.id} className={styles.post}>
                      <Link to={`/${post.userId}`} className="link">
                        <img
                          className={styles.postProfilePic}
                          src={`${API_URL}/${post.profilePic}`}
                          alt="Profile Picture"
                        />
                        <div className={styles.username}>
                          <u>{post.username}</u>
                        </div>
                      </Link>
                      {post.image && (
                        <img
                          src={`${API_URL}/${post.image}`}
                          alt="Post Image"
                        />
                      )}
                      <p>{post.content}</p>
                      <div className={styles.postIcons}>
                        <button
                          onClick={() => {
                            likePost(post.id);
                          }}
                          className={styles.likes}
                        >
                          <Like></Like>
                          {post.likes}
                        </button>
                        <Link to={`post/${post.id}`}>
                          <Comment></Comment>
                        </Link>
                      </div>
                      <Link to={`post/${post.id}`} className="link">
                        <span>
                          <strong>View Post / Comments</strong>
                        </span>
                      </Link>
                      <div>
                        {new Date(post.createdAt).toLocaleTimeString([], {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className={styles.peopleToFollow}>
              <h2>
                <u>People To Follow</u>
              </h2>
              {error && (
                <span style={{ color: "rgb(170, 19, 19)" }}>{error}</span>
              )}
              {notFollowing.length < 1 && (
                <span>You're following everyone :)</span>
              )}
              {notFollowing &&
                notFollowing.map((user) => {
                  return (
                    <div key={user.id}>
                      <div>
                        <span>{user.username}</span>
                      </div>
                      <button
                        onClick={() => {
                          sendFollowReq(user.id);
                        }}
                        className={styles.follow}
                      >
                        Follow
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;