import { IoArrowBackSharp } from "react-icons/io5";
import { Link } from "react-router";

interface FailedFooterProps {
  onReset: () => void;
}

export default function FailedFooter({ onReset }: FailedFooterProps) {
  return (
    <div className="reset-footer">
      <Link to="/login" className="reset-back-link" onClick={onReset}>
        <IoArrowBackSharp size={16} />
        Back to sign in
      </Link>
    </div>
  );
}
