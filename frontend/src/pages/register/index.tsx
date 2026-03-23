import { Link, useNavigate } from "react-router";
import "./styles.scss";
import FirstName from "./components/firstname";
import LastName from "./components/lastname";
import Email from "./components/email";
import Password from "./components/password";
import ConfirmPassword from "./components/c_password";
import RegisterButton from "./components/button";
import { useRegisterStore } from "../../stores";

export default function RegisterPage() {
  const navigate = useNavigate();
  const reset = useRegisterStore((s) => s.reset);
  const submit = useRegisterStore((s) => s.submit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(() => navigate("/login"));
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
                <FirstName />
              </div>
              <div className="register-field">
                <LastName />
              </div>
            </div>

            <Email />
            <Password />
            <ConfirmPassword />

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
