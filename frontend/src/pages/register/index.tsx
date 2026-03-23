import { useState } from "react";
import { Link } from "react-router";
import "./styles.scss";
import FirstName from "./components/firstname";
import LastName from "./components/lastname";
import Email from "./components/email";
import Password from "./components/password";
import ConfirmPassword from "./components/c_password";
import RegisterButton from "./components/button";
import { useRegisterStore } from "../../stores";

export default function RegisterPage() {
  const firstName = useRegisterStore((s) => s.firstName);
  const lastName = useRegisterStore((s) => s.lastName);
  const email = useRegisterStore((s) => s.email);
  const password = useRegisterStore((s) => s.password);
  const confirmPassword = useRegisterStore((s) => s.confirmPassword);
  const reset = useRegisterStore((s) => s.reset);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
  };

  return (
    <div className="register-page">
      <main className="register-body">
        <div className="register-card">
          <div className="register-card-header">
            <h1 className="register-card-title">Create an account</h1>
            <p className="register-card-subtitle">
              Fill in the details below to get started
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="register-row">
              <div className="register-field">
                <FirstName error={errors.firstName} />
              </div>
              <div className="register-field">
                <LastName error={errors.lastName} />
              </div>
            </div>

            <Email error={errors.email} />
            <Password error={errors.password} />
            <ConfirmPassword error={errors.confirmPassword} />

            <RegisterButton />
          </form>

          <div className="register-footer">
            <p className="register-login-text">
              Already have an account?{" "}
              <Link to="/login" onClick={reset}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
