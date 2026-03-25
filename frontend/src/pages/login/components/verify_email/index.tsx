import { MdOutlineEmail } from "react-icons/md";
import { Button } from "../../../../components";
import { useLoginStore } from "../../../../stores";

function VerifyEmail() {
  const reset = useLoginStore((s) => s.reset);
  const resendVerification = useLoginStore((s) => s.resendVerification);
  const resendLoading = useLoginStore((s) => s.resendLoading);
  const resendSuccess = useLoginStore((s) => s.resendSuccess);

  return (
    <div className="login-card verify-email-card">
      <div className="verify-email-icon">
        <MdOutlineEmail size={28} />
      </div>

      <div className="login-card-header">
        <h1 className="login-card-title">Verify your email</h1>
        <p className="login-card-subtitle">
          Your email is not verified yet. Please check your inbox and click the
          verification link to continue.
        </p>
      </div>

      <div className="verify-email-hint">
        <p>
          Didn't receive the email? Check your spam folder or resend the
          verification email.
        </p>
      </div>

      {resendSuccess && (
        <div className="verify-email-success">
          Verification email sent! Please check your inbox.
        </div>
      )}

      <div className="verify-email-actions">
        <Button
          onClick={resendVerification}
          disabled={resendSuccess}
          loading={resendLoading}
          loadingText="Sending…"
        >
          Resend verification email
        </Button>

        <Button variant="secondary" onClick={reset} className="verify-back-btn">
          Back to login
        </Button>
      </div>

      <p className="verify-email-footer">
        If you used the wrong email address, go back and sign in with a
        different one.
      </p>
    </div>
  );
}

export default VerifyEmail;
