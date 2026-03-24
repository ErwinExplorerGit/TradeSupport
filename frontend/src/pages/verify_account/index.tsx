import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useVerifyAccountStore } from "../../stores/verifyAccountStore";
import Failed from "./components/failed";
import ResendVerification from "./components/resend_verification";
import Success from "./components/success";
import Verifying from "./components/verifying";
import "./styles.scss";

export default function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");

  const verifyState = useVerifyAccountStore((s) => s.verifyState);
  const setEmailFromUrl = useVerifyAccountStore((s) => s.setEmailFromUrl);
  const reset = useVerifyAccountStore((s) => s.reset);

  useEffect(() => {
    reset();

    // If an email is in the URL, skip verification and show resend UI
    if (emailParam) {
      setEmailFromUrl(emailParam);
    }
  }, [emailParam]);

  return (
    <div className="verify-page">
      <main className="verify-body">
        <div className="verify-card">
          {verifyState === "verifying" && <Verifying />}
          {verifyState === "success" && <Success />}
          {verifyState === "failed" && <Failed />}
          {verifyState === "resend" && <ResendVerification />}
        </div>
      </main>
    </div>
  );
}
