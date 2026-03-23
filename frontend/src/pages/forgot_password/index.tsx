import { HiOutlineLockClosed } from "react-icons/hi2";
import { IoArrowBackSharp, IoCheckmark } from "react-icons/io5";
import { Link } from "react-router";
import { useForgotPasswordStore } from "../../stores/forgotPasswordStore";
import ForgotPasswordButton from "./components/button";
import ForgotPasswordEmail from "./components/email";
import "./styles.scss";

export default function ForgotPasswordPage() {
  const email = useForgotPasswordStore((s) => s.email);
  const submitted = useForgotPasswordStore((s) => s.submitted);
  const submit = useForgotPasswordStore((s) => s.submit);
  const reset = useForgotPasswordStore((s) => s.reset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="forgot-page">
      <main className="forgot-body">
        <div className="forgot-card">
          <div className="forgot-icon">
            <HiOutlineLockClosed size={26} />
          </div>

          <div className="forgot-card-header">
            <h1 className="forgot-card-title">Forgot password?</h1>
            <p className="forgot-card-subtitle">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="forgot-success">
              <IoCheckmark size={18} />
              <span>
                If an account exists for <strong>{email}</strong>, you'll
                receive a password reset link shortly. Check your inbox.
              </span>
            </div>
          ) : (
            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
              <ForgotPasswordEmail />
              <ForgotPasswordButton />
            </form>
          )}

          <div className="forgot-footer">
            <Link to="/login" className="forgot-back-link" onClick={reset}>
              <IoArrowBackSharp size={16} />
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
