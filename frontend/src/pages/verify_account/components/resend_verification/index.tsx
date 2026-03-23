import { IoArrowBackSharp, IoMailOutline } from "react-icons/io5";
import { Link } from "react-router";
import { Button } from "../../../../components";
import { useVerifyAccountStore } from "../../../../stores/verifyAccountStore";

export default function ResendVerification() {
  const email = useVerifyAccountStore((s) => s.email);
  const resendLoading = useVerifyAccountStore((s) => s.resendLoading);
  const resendSent = useVerifyAccountStore((s) => s.resendSent);
  const resend = useVerifyAccountStore((s) => s.resend);

  const handleResend = () => resend();

  return (
    <>
      <div className="verify-icon verify-icon--pending">
        <IoMailOutline size={32} />
      </div>
      <div className="verify-card-header">
        <h1 className="verify-card-title">Verify your email</h1>
        <p className="verify-card-subtitle">
          Your login was successful, but you need to verify your email before
          continuing.
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
        <Button type="button" loading={resendLoading} onClick={handleResend}>
          Resend verification email
        </Button>
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
