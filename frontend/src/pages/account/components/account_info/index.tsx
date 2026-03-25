import { useAuthStore } from "@/stores";
import "./styles.scss";

export default function AccountInfo() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="account-info-card">
      <h2 className="account-section-title">Account Details</h2>
      <div className="account-info-grid">
        <div className="account-info-item">
          <span className="account-info-label">User ID</span>
          <span className="account-info-value account-info-value--mono">
            {user.id}
          </span>
        </div>
        <div className="account-info-item">
          <span className="account-info-label">Name</span>
          <span className="account-info-value">{user.username}</span>
        </div>
        <div className="account-info-item">
          <span className="account-info-label">Email</span>
          <span className="account-info-value">{user.email}</span>
        </div>
      </div>
    </div>
  );
}
