import { useEffect } from "react";
import { useSearchParams } from "react-router";
import VerifyingCard from "../../../../components/verifying_card";
import { authService } from "../../../../services/auth";
import { useResetPasswordStore } from "../../../../stores/resetPasswordStore";

export default function Verifying() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const setVerifyState = useResetPasswordStore((s) => s.setVerifyState);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (cancelled) return;

      try {
        await authService.verifyResetPasswordToken({ token: token! });
        if (!cancelled) setVerifyState("success");
      } catch {
        if (!cancelled) setVerifyState("failed");
      }
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
