import { IoArrowBackSharp, IoMailOutline } from "react-icons/io5";
import { Link } from "react-router";
import { Button } from "../../../../components";
import { useVerifyAccountStore } from "../../../../stores/verifyAccountStore";

export default function ResendVerification() {
  const email = useVerifyAccountStore((s) => s.email);
  const emailError = useVerifyAccountStore((s) => s.emailError);
  const resendLoading = useVerifyAccountStore((s) => s.resendLoading);
  const resendSent = useVerifyAccountStore((s) => s.resendSent);
  const resend = useVerifyAccountStore((s) => s.resend);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    resend("login");
  };

  return (
    <>
      <div className="verify-icon verify-icon--pending">
        <IoMailOutline size={32} />
      </div>
      <div className="verify-card-header">
        <h1 className="verify-card-title">Verify your email</h1>
        <p className="verify-card-subtitle">
          Your login was successful, but you need to verify your email before
          continuing. We sent a link to <strong>{email}</strong>.
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
        <form onSubmit={handleResend} style={{ width: "100%" }}>
          {emailError && (
            <p
              className="verify-field-error"
              style={{ marginBottom: "0.75rem" }}
            >
              {emailError}
            </p>
          )}
          <Button type="submit" loading={resendLoading}>
            Resend verification email
          </Button>
        </form>
      )}

      <div className="verify-footer">
        <Link to="/login" className="verify-back-link">
          <IoArrowBackSharp size={16} />
          Back to sign in
        </Link>
      </div>
    </>
  );
}
