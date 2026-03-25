import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { authService } from "@/services/auth";
import { useVerifyAccountStore } from "@/stores";
import { VerifyingCard } from "@/components";

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

    const timer = setTimeout(() => {
      authService.verify({ token }).then(
        () => {
          if (!cancelled) setVerifyState("success");
        },
        () => {
          if (!cancelled) setVerifyState("failed");
        },
      );
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  return <VerifyingCard />;
}
