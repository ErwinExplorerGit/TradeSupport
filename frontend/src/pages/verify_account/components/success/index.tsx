import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { Link } from "react-router";
import { useVerifyAccountStore } from "../../../../stores";

export default function Success() {
  const reset = useVerifyAccountStore((s) => s.reset);

  return (
    <>
      <div className="verify-icon verify-icon--success">
        <IoCheckmarkCircleOutline size={32} />
      </div>
      <div className="verify-card-header">
        <h1 className="verify-card-title">Email verified</h1>
        <p className="verify-card-subtitle">
          Your email has been successfully verified. You can now log in to your
          account.
        </p>
      </div>
      <Link
        to="/login"
        className="verify-btn verify-btn--primary"
        onClick={reset}
      >
        Go to login
      </Link>
    </>
  );
}
