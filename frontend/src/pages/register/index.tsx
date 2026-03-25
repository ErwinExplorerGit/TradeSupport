import { Link, useNavigate } from "react-router";
import { AuthCard } from "@/components";
import { Button, Input } from "@/components";
import { useRegisterStore } from "@/stores";
import "./styles.scss";

export default function RegisterPage() {
  const navigate = useNavigate();
  const firstName = useRegisterStore((s) => s.firstName);
  const lastName = useRegisterStore((s) => s.lastName);
  const email = useRegisterStore((s) => s.email);
  const password = useRegisterStore((s) => s.password);
  const confirmPassword = useRegisterStore((s) => s.confirmPassword);
  const errors = useRegisterStore((s) => s.errors);
  const loading = useRegisterStore((s) => s.loading);
  const setFirstName = useRegisterStore((s) => s.setFirstName);
  const setLastName = useRegisterStore((s) => s.setLastName);
  const setEmail = useRegisterStore((s) => s.setEmail);
  const setPassword = useRegisterStore((s) => s.setPassword);
  const setConfirmPassword = useRegisterStore((s) => s.setConfirmPassword);
  const reset = useRegisterStore((s) => s.reset);
  const submit = useRegisterStore((s) => s.submit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(() => navigate("/login"));
  };

  return (
    <AuthCard maxWidth="460px">
      <div className="register-card-header">
        <h1 className="register-card-title">Create an account</h1>
        <p className="register-card-subtitle">
          Fill in the details below to get started
        </p>
      </div>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-row">
          <div className="register-field">
            <Input
              id="firstName"
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              placeholder="John"
              autoComplete="given-name"
              error={errors.firstName}
              disabled={loading}
            />
          </div>
          <div className="register-field">
            <Input
              id="lastName"
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              placeholder="Doe"
              autoComplete="family-name"
              error={errors.lastName}
              disabled={loading}
            />
          </div>
        </div>

        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="john.doe@example.com"
          autoComplete="email"
          error={errors.email}
          disabled={loading}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          error={errors.password}
          disabled={loading}
        />

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={loading}
        />

        <Button type="submit" loading={loading} loadingText="Creating account…">
          Create Account
        </Button>
      </form>

      <div className="register-footer">
        <p className="register-login-text">
          Already have an account?{" "}
          <Link to="/login" onClick={reset}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
