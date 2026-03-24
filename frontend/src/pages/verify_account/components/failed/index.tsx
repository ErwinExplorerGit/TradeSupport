import {
  IoArrowBackSharp,
  IoCloseCircleOutline,
  IoMailOutline,
} from "react-icons/io5";
import { Link } from "react-router";
import { useVerifyAccountStore } from "../../../../stores/verifyAccountStore";
import ResendButton from "./components/button";
import Email from "./components/email";

export default function Failed() {
  const email = useVerifyAccountStore((s) => s.email);
  const resendSent = useVerifyAccountStore((s) => s.resendSent);
  const resend = useVerifyAccountStore((s) => s.resend);
  const reset = useVerifyAccountStore((s) => s.reset);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    resend("expired");
  };

  return (
    <>
      <div className="verify-icon verify-icon--error">
        <IoCloseCircleOutline size={32} />
      </div>
      <div className="verify-card-header">
        <h1 className="verify-card-title">Verification link expired</h1>
        <p className="verify-card-subtitle">
          This link has expired or is no longer valid. Click below to receive a
          new verification email.
        </p>
      </div>

      {resendSent ? (
        <div className="verify-resend-success">
          <IoMailOutline size={18} />
          <span>
            A new verification link has been sent to <strong>{email}</strong>.
            Check your inbox.
          </span>
        </div>
      ) : (
        <form className="verify-form" onSubmit={handleResend} noValidate>
          <Email />
          <ResendButton />
        </form>
      )}

      <div className="verify-footer">
        <Link to="/login" className="verify-back-link" onClick={reset}>
          <IoArrowBackSharp size={16} />
          Back to sign in
        </Link>
      </div>
    </>
  );
}
