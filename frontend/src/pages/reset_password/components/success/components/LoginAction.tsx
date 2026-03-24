import { Link } from "react-router";

interface LoginActionProps {
  onReset: () => void;
}

export default function LoginAction({ onReset }: LoginActionProps) {
  return (
    <Link
      to="/login"
      className="reset-btn reset-btn--primary"
      onClick={onReset}
    >
      Go to login
    </Link>
  );
}
