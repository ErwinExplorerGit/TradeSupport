import { HiOutlineLockClosed } from "react-icons/hi2";
import { IoCheckmark } from "react-icons/io5";
import { AuthCard, BackToLoginLink, Button, Input } from "@/components";
import { useForgotPasswordStore } from "@/stores";
import "./styles.scss";

export default function ForgotPasswordPage() {
  const email = useForgotPasswordStore((s) => s.email);
  const emailError = useForgotPasswordStore((s) => s.emailError);
  const loading = useForgotPasswordStore((s) => s.loading);
  const submitted = useForgotPasswordStore((s) => s.submitted);
  const setEmail = useForgotPasswordStore((s) => s.setEmail);
  const submit = useForgotPasswordStore((s) => s.submit);
  const reset = useForgotPasswordStore((s) => s.reset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <AuthCard>
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
            If an account exists for <strong>{email}</strong>, you'll receive a
            password reset link shortly. Check your inbox.
          </span>
        </div>
      ) : (
        <form className="forgot-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="forgot-email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            error={emailError}
            autoFocus
          />
          <Button type="submit" loading={loading} loadingText="Sending…">
            Send reset link
          </Button>
        </form>
      )}

      <BackToLoginLink onClick={reset} />
    </AuthCard>
  );
}
