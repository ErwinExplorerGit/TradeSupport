import { useEffect } from "react";
import { useResetPasswordStore } from "../../stores/resetPasswordStore";
import Failed from "./components/failed";
import Success from "./components/success";
import Verifying from "./components/verify";
import "./styles.scss";

export default function ResetPasswordPage() {
  const verifyState = useResetPasswordStore((s) => s.verifyState);
  const reset = useResetPasswordStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, []);

  return (
    <div className="reset-page">
      <main className="reset-body">
        <div className="reset-card">
          {verifyState === "verifying" && <Verifying />}
          {verifyState === "success" && <Success />}
          {verifyState === "failed" && <Failed />}
        </div>
      </main>
    </div>
  );
}
