import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Header } from "../Header/Header";
import { Home } from "../Icons/Icons";
import styles from "./CreatePost.module.css";

function CreatePost() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  async function handleSend(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    // const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        mode: "cors",
      });
      const responseData = await response.json();

      if (responseData.success) {
        navigate("/");
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
      <main className={styles.container}>
        <h2>Create A Post</h2>
        <form
          onSubmit={handleSend}
          enctype="multipart/form-data"
          className={styles.form}
        >
          <div>
            <label htmlFor="content">
              <span>Content:</span>
            </label>
            <textarea
              id="content"
              type="text"
              name="content"
              className={styles.content}
            />
          </div>

          <div>
            <label htmlFor="image">
              <span>Image (Optional): </span>
            </label>
            <input type="file" name="image" />
          </div>

          <input type="hidden" value={userId} name="userId" />

          <button type="submit" className={styles.submit}>
            Submit
          </button>
        </form>
        {error && <div>{error}</div>}
        <Link to={"/"}>
          <span className={styles.home}>
            <Home></Home>
          </span>
        </Link>
      </main>
    </>
  );
}

export { CreatePost };