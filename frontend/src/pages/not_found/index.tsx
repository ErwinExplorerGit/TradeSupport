import { Link } from "react-router";
import "./styles.scss";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          Sorry, we couldn't find what you were looking for.
        </p>
        <Link to="/" className="not-found-btn">
          Go Home
        </Link>
      </div>
    </div>
  );
}
