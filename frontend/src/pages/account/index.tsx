import AccountInfo from "./components/account_info";
import ChangePassword from "./components/change_password";
import "./styles.scss";

export default function AccountPage() {
  return (
    <div className="account-page">
      <main className="account-body">
        <div className="account-container">
          <h1 className="account-page-title">My Account</h1>

          <div className="account-cards">
            <div className="account-card">
              <AccountInfo />
            </div>

            <div className="account-card">
              <ChangePassword />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
