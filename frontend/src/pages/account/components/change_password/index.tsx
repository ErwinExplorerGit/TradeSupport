import {
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { Button, Input } from "../../../../components";
import { useAccountStore } from "../../../../stores/accountStore";
import "./styles.scss";

export default function ChangePassword() {
  const currentPassword = useAccountStore((s) => s.currentPassword);
  const newPassword = useAccountStore((s) => s.newPassword);
  const confirmPassword = useAccountStore((s) => s.confirmPassword);
  const loading = useAccountStore((s) => s.loading);
  const error = useAccountStore((s) => s.error);
  const success = useAccountStore((s) => s.success);
  const setCurrentPassword = useAccountStore((s) => s.setCurrentPassword);
  const setNewPassword = useAccountStore((s) => s.setNewPassword);
  const setConfirmPassword = useAccountStore((s) => s.setConfirmPassword);
  const submitChangePassword = useAccountStore((s) => s.submitChangePassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitChangePassword();
  };

  return (
    <div className="change-password-card">
      <h2 className="account-section-title">Change Password</h2>

      <form className="change-password-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="account-alert account-alert--error" role="alert">
            <AiOutlineExclamationCircle />
            {error}
          </div>
        )}

        {success && (
          <div className="account-alert account-alert--success" role="status">
            <AiOutlineCheckCircle />
            {success}
          </div>
        )}

        <Input
          id="current-password"
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Enter your current password"
          autoComplete="current-password"
        />

        <Input
          id="new-password"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        <Input
          id="confirm-password"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat your new password"
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} loadingText="Saving…">
          Save New Password
        </Button>
      </form>
    </div>
  );
}
