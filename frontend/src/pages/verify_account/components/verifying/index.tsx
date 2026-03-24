import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { authService } from "../../../../services/auth";
import { useVerifyAccountStore } from "../../../../stores/verifyAccountStore";

export default function Verifying() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const setVerifyState = useVerifyAccountStore((s) => s.setVerifyState);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setVerifyState("failed");
      return;
    }

    authService.verify({ token }).then(
      () => {
        if (!cancelled) setVerifyState("success");
      },
      () => {
        if (!cancelled) setVerifyState("failed");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <div className="verify-spinner">
        <div className="verify-spinner-ring" />
      </div>
      <div className="verify-card-header">
        <h1 className="verify-card-title">Verifying your account</h1>
        <p className="verify-card-subtitle">
          Account being verified, please wait…
        </p>
      </div>
    </>
  );
}
