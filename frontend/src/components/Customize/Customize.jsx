import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "../Header/Header";
import { Home } from "../Icons/Icons";
import styles from "./Customize.module.css";

function Customize() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
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
      setUsername(data.user.username);
      setProfilePic(data.user.profilePic);
      setFirstName(data.user.firstName);
      setLastName(data.user.lastName);
      setBio(data.user.bio);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getUser(userId);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
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
      <main className={styles.main}>
        <h2>Customize Profile</h2>
        <form onSubmit={handleSubmit} enctype="multipart/form-data">
          <label htmlFor="username">
            <span>Username: </span>
          </label>
          <input
            type="text"
            name="username"
            value={username}
            id="username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />

          <label htmlFor="firstName">
            <span>First Name: </span>
          </label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            id="firstName"
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />

          <label htmlFor="lastName">
            <span>Last Name: </span>
          </label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            id="lastName"
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />

          <label htmlFor="bio">
            <span>Bio: </span>
          </label>
          <textarea
            type="text"
            name="bio"
            value={bio}
            id="bio"
            onChange={(e) => {
              setBio(e.target.value);
            }}
            className={styles.bio}
          />

          <label htmlFor="profilePic">
            <span>Profile Picture: </span>
          </label>
          <input type="file" name="profilePic" id="profilePic" />

          <input id="userId" type="hidden" value={userId} name="userId" />

          <button type="Submit" className={styles.update}>
            Update
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

export { Customize };