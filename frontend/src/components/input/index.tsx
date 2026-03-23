import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import "./styles.scss";
import type { InputProps } from "./types";

export const Input = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  hint,
  autoComplete,
  autoFocus = false,
  className = "",
  suffix,
}: InputProps) => {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputClass = [
    "input-control",
    error ? "input-control--error" : "",
    suffix || isPassword ? "input-control--suffix" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="input-field">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className="input-wrap">
        <input
          id={id}
          type={resolvedType}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />
        {isPassword && (
          <button
            type="button"
            className="input-suffix input-suffix--toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </button>
        )}
        {!isPassword && suffix && <span className="input-suffix">{suffix}</span>}
      </div>

      {error && (
        <span id={`${id}-error`} className="input-error-msg" role="alert">
          {error}
        </span>
      )}

      {!error && hint && (
        <span id={`${id}-hint`} className="input-hint">
          {hint}
        </span>
      )}
    </div>
  );
};
