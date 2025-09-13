import { useState } from "react";
import styles from "./Signup.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Home } from "../Icons/Icons";

function Signup() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  async function onSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        mode: "cors",
      });

      if (response.ok) {
        navigate("/");
      } else {
        setError("Signup failed please try again");
      }
    } catch (err) {
      console.error("Network or server error:", err);
    }
  }

  return (
    <>
      <main className={styles.container}>
        <h2>Sign Up</h2>
        {error && (
          <div role="alert" style={{ color: "red" }}>
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="username">
            <span>Username: </span>
          </label>
          <input type="text" name="username" id="username" required />

          <label htmlFor="password">
            <span>Password: </span>
          </label>
          <input type="password" name="password" id="password" required />

          <label htmlFor="confirmPassword">
            <span>Confirm Password: </span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
          />

          <label htmlFor="firstName">
            <span>First Name: </span>
          </label>
          <input type="text" name="firstName" id="firstName" required />

          <label htmlFor="lastName">
            <span>Last Name: </span>
          </label>
          <input type="text" name="lastName" id="lastName" required />

          <button type="submit" className={styles.submit}>
            Submit
          </button>
        </form>

        <Link to={"/"}>
          <span className={styles.home}>
            <Home></Home>
          </span>
        </Link>
      </main>
    </>
  );
}

export { Signup };