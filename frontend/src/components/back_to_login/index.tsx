import { IoArrowBackSharp } from "react-icons/io5";
import { Link } from "react-router";

interface BackToLoginProps {
  onClick?: () => void;
}

/**
 * Reusable "← Back to sign in" footer link.
 * Used by ForgotPasswordPage, VerifyAccountPage and ResetPasswordPage.
 */
export function BackToLoginLink({ onClick }: BackToLoginProps) {
  return (
    <div className="auth-footer">
      <Link to="/login" className="auth-back-link" onClick={onClick}>
        <IoArrowBackSharp size={16} />
        Back to sign in
      </Link>
    </div>
  );
}
