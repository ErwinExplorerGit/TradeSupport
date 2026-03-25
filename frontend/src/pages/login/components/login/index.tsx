import { Link, useNavigate } from "react-router";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Button, Input } from "../../../../components";
import { useLoginStore } from "../../../../stores";

function LoginForm() {
  const navigate = useNavigate();
  const username = useLoginStore((s) => s.username);
  const password = useLoginStore((s) => s.password);
  const loading = useLoginStore((s) => s.loading);
  const error = useLoginStore((s) => s.error);
  const setUsername = useLoginStore((s) => s.setUsername);
  const setPassword = useLoginStore((s) => s.setPassword);
  const reset = useLoginStore((s) => s.reset);
  const submit = useLoginStore((s) => s.submit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(() => navigate("/dashboard"));
  };

  return (
    <div className="login-card">
      <div className="login-card-header">
        <h1 className="login-card-title">Welcome back</h1>
        <p className="login-card-subtitle">
          Sign in to your account to continue
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="login-error" role="alert">
            <AiOutlineExclamationCircle />
            {error}
          </div>
        )}

        <div className="login-field">
          <Input
            id="username"
            label="Username"
            value={username}
            onChange={(value) => setUsername(value)}
            placeholder="Enter your username"
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="login-field">
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(value) => setPassword(value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" loading={loading} loadingText="Signing in…">
          Sign In
        </Button>
      </form>

      <div className="login-footer">
        <Link to="/forgot-password" className="login-link">
          Forgot your password?
        </Link>
        <span className="login-divider">·</span>
        <p className="login-register-text">
          Don't have an account?{" "}
          <Link to="/register" onClick={reset}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
