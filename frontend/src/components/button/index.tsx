import "./styles.scss";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonType = "button" | "submit" | "reset";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  onClick?: () => void;
  className?: string;
}

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
