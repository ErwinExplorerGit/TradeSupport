import { useSearchParams } from "react-router";
import { Button, Input } from "../../../../../components";
import { useResetPasswordStore } from "../../../../../stores/resetPasswordStore";

export default function PasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const password = useResetPasswordStore((s) => s.password);
  const confirmPassword = useResetPasswordStore((s) => s.confirmPassword);
  const errors = useResetPasswordStore((s) => s.errors);
  const loading = useResetPasswordStore((s) => s.loading);
  const setPassword = useResetPasswordStore((s) => s.setPassword);
  const setConfirmPassword = useResetPasswordStore((s) => s.setConfirmPassword);
  const submit = useResetPasswordStore((s) => s.submit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(token || "");
  };

  return (
    <form className="reset-form" onSubmit={handleSubmit} noValidate>
      <Input
        id="reset-password"
        label="New password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        error={errors.password}
        autoFocus
      />
      <Input
        id="reset-confirm-password"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Re-enter your password"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
      <Button
        type="submit"
        disabled={loading}
        loading={loading}
        loadingText="Resetting…"
      >
        Reset password
      </Button>
    </form>
  );
}
