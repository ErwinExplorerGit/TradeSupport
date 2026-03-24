import { IoArrowBackSharp, IoCloseCircleOutline } from "react-icons/io5";
import { Link } from "react-router";
import { useResetPasswordStore } from "../../../../stores/resetPasswordStore";

export default function Failed() {
  const reset = useResetPasswordStore((s) => s.reset);

  return (
    <>
      <div className="reset-icon reset-icon--error">
        <IoCloseCircleOutline size={32} />
      </div>
      <div className="reset-card-header">
        <h1 className="reset-card-title">Link expired</h1>
        <p className="reset-card-subtitle">
          This password reset link has expired or is no longer valid. Please
          request a new one.
        </p>
      </div>
      <Link
        to="/forgot-password"
        className="reset-btn reset-btn--primary"
        onClick={reset}
      >
        Request new link
      </Link>
      <div className="reset-footer">
        <Link to="/login" className="reset-back-link" onClick={reset}>
          <IoArrowBackSharp size={16} />
          Back to sign in
        </Link>
      </div>
    </>
  );
}
