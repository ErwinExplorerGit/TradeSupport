import { useEffect } from "react";
import { useSearchParams } from "react-router";
import VerifyingCard from "../../../../components/verifying_card";
import { useResetPasswordStore } from "../../../../stores/resetPasswordStore";

export default function Verifying() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const setVerifyState = useResetPasswordStore((s) => s.setVerifyState);
  // const setToken = useResetPasswordStore((s) => s.setToken);

  useEffect(() => {
    let cancelled = false;

    const start = Date.now();

    const verify = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 3000 - elapsed);

      setTimeout(() => {
        if (cancelled) return;

        if (token === "1") {
          // setToken(token);
          setVerifyState("success");
        } else {
          setVerifyState("failed");
        }
      }, remaining);
    };

    if (!token) {
      setTimeout(() => {
        if (!cancelled) setVerifyState("failed");
      }, 3000);
    } else {
      verify();
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  return <VerifyingCard />;
}
