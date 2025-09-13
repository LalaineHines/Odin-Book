import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { Home } from "../Icons/Icons";

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        mode: "cors",
      });
      const resData = await response.json();

      if (response.ok) {
        localStorage.setItem("token", resData.token);
        localStorage.setItem("userId", resData.userId);
        localStorage.setItem("username", resData.username);
        navigate("/");
      } else {
        setError("Login failed please try again");
      }
    } catch (err) {
      console.error("Network or server error:", err);
    }
  }

  return (
    <main className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="username">
          <span>Username: </span>
        </label>
        <input id="username" type="text" name="username" />

        <label htmlFor="password">
          <span>Password: </span>
        </label>
        <input id="password" type="password" name="password" />

        <button type="submit" className={styles.submit}>
          Submit
        </button>
      </form>
      {error && (
        <div>
          <span>{error}</span>
        </div>
      )}
      <Link to={"/"}>
        <span className={styles.home}>
          <Home></Home>
        </span>
      </Link>
    </main>
  );
}

export { Login };