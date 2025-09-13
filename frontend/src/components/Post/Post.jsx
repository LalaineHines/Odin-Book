import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./Post.module.css";
import { Home, Like } from "../Icons/Icons";
import { Header } from "../Header/Header";

function Post() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const { postId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  async function getPost(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setPost(data.post);
      } else {
        return setError(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getPost(postId);
  }, []);

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
      getPost(postId);
    } catch (err) {
      console.error("Network or server error:", err);
    }
  }

  async function postComment(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_URL}/posts/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        mode: "cors",
      });
      const responseData = await response.json();

      if (responseData.success) {
        getPost(postId);
        e.target.comment.value = "";
      } else {
        setError(responseData.message);
      }
    } catch (err) {
      console.error("Network or server error:", err);
    }
  }

  return (
    <>
      <Header></Header>
      <main>
        {error && (
          <div>
            <span>{error}</span>
          </div>
        )}
        {post && (
          <div key={post.id} className={styles.post}>
            <Link to={`/${post.userId}`} className="link">
              <span>
                <u>
                  <strong>{post.username}</strong>
                </u>
              </span>
            </Link>
            {post.image && (
              <img
                className="postImg"
                src={`${API_URL}/${post.image}`}
                alt="Post Image"
              />
            )}
            <p>{post.content}</p>
            <div>
              <div>
                <span>Likes: {post.likes}</span>
              </div>
              <button
                aria-label="like post"
                onClick={() => {
                  likePost(post.id);
                }}
              >
                <Like></Like>
              </button>
            </div>
            <div>
              {new Date(post.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <form onSubmit={postComment}>
              <label htmlFor="comment">Comment: </label>
              <input id="comment" type="text" name="comment" />
              <input type="hidden" value={userId} name="userId" />
              <input type="hidden" value={postId} name="postId" />
              <button type="submit">
                <span className={styles.send}>Send</span>
              </button>
            </form>
            <div>
              <h2>Comments</h2>
              {post.comments
                .map((comment) => {
                  return (
                    <div key={comment.id} className={styles.comment}>
                      {comment.username}: {comment.text}
                    </div>
                  );
                })
                .reverse()}
            </div>
            <Link to={"/"} aria-label="home">
              <span>
                <Home></Home>
              </span>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

export { Post };