import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../index.css";
import styles from "./Profile.module.css";
import { Header } from "../Header/Header";
import { Home } from "../Icons/Icons";

function Profile() {
  const { userId } = useParams();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
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
      data.user.posts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setProfile(data.user);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getUser(userId);
  }, []);

  return (
    <>
      <Header></Header>
      <main className={styles.main}>
        {profile && (
          <>
            <h2>{profile.username}'s Profile</h2>
            <img
              className={styles.profilePic}
              src={`${API_URL}/${profile.profilePic}`}
              alt="Profile Picture"
            />
            <span>
              {profile.firstName} {profile.lastName}
            </span>
            <p>{profile.bio}</p>
            <h2>
              <u>Posts</u>
            </h2>
            {profile.posts.length < 1 && <div>No Posts Yet. Create One!</div>}
            {profile.posts.map((post) => {
              return (
                <div key={post.id} className={styles.post}>
                  {post.image && (
                    <img
                      className="postImg"
                      src={`${API_URL}/${post.image}`}
                      alt="Post Image"
                    />
                  )}
                  <p>{post.content}</p>
                  <div>
                    {new Date(post.createdAt).toLocaleTimeString([], {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>Likes: {post.likes}</div>
                  <Link to={`/post/${post.id}`} className="link">
                    <span>View Post / Comments</span>
                  </Link>
                </div>
              );
            })}
          </>
        )}
        <Link to={"/"}>
          <span className={styles.home}>
            <Home></Home>
          </span>
        </Link>
      </main>
    </>
  );
}

export { Profile };