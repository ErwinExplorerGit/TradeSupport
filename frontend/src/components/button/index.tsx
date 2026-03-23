import "./styles.scss";
import type { ButtonProps } from "./types";

export const Button = ({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  loadingText,
  onClick,
  className = "",
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading && <span className="btn-spinner" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};
