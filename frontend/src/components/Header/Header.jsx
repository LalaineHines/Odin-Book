import styles from "./Header.module.css";
import { Link } from "react-router-dom";

function Header({ children }) {
  return (
    <header className={styles.header}>
      <Link to={"/"} className="link">
        <h1>Odinstagram</h1>
      </Link>
      {children}
    </header>
  );
}

export { Header };