import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home } from "../Icons/Icons";
import { Header } from "../Header/Header";
import styles from "./FollowReqs.module.css";

function FollowReqs() {
  const [reqs, setReqs] = useState([]);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  async function showReqs() {
    try {
      const response = await fetch(`${API_URL}/user/requests?id=${userId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      }
      setReqs(data.reqs);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    showReqs();
  }, []);

  async function acceptReq(username) {
    try {
      const data = { username: username, userId: userId };
      const response = await fetch(`${API_URL}/user/requests/accept`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      showReqs();
    } catch (error) {
      console.error(error);
    }
    // this is removing all the follow requests
  }

  async function declineReq(username) {
    try {
      const data = { username: username, userId: userId };
      const response = await fetch(`${API_URL}/user/requests/decline`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      showReqs();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Header></Header>
      <main className={styles.container}>
        <h2>Follow Requests</h2>
        {reqs.length < 1 && (
          <div>
            <span>No requests</span>
          </div>
        )}
        {reqs &&
          reqs.map((req) => {
            return (
              <div key={req} className={styles.req}>
                <div>{req}</div>
                <div>
                  <button
                    onClick={() => {
                      acceptReq(req);
                    }}
                    className={styles.accept}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      declineReq(req);
                    }}
                    className={styles.decline}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        <Link to={"/"}>
          <span className={styles.home}>
            <Home></Home>
          </span>
        </Link>
      </main>
    </>
  );
}

export { FollowReqs };