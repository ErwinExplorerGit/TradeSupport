import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { Link } from "react-router";
import { Button, Input } from "../../../../components";
import { useResetPasswordStore } from "../../../../stores/resetPasswordStore";

export default function Success() {
  // const password = useResetPasswordStore((s) => s.password);
  // const confirmPassword = useResetPasswordStore((s) => s.confirmPassword);
  // const errors = useResetPasswordStore((s) => s.errors);
  // const loading = useResetPasswordStore((s) => s.loading);
  // const submitted = useResetPasswordStore((s) => s.submitted);
  // const setPassword = useResetPasswordStore((s) => s.setPassword);
  // const setConfirmPassword = useResetPasswordStore((s) => s.setConfirmPassword);
  // const submit = useResetPasswordStore((s) => s.submit);
  const reset = useResetPasswordStore((s) => s.reset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // submit();
  };

  return <></>;
  // if (submitted) {
  //   return (
  //     <>
  //       <div className="reset-icon reset-icon--success">
  //         <IoCheckmarkCircleOutline size={32} />
  //       </div>
  //       <div className="reset-card-header">
  //         <h1 className="reset-card-title">Password reset</h1>
  //         <p className="reset-card-subtitle">
  //           Your password has been successfully updated.
  //         </p>
  //       </div>
  //       <Link
  //         to="/login"
  //         className="reset-btn reset-btn--primary"
  //         onClick={reset}
  //       >
  //         Go to login
  //       </Link>
  //     </>
  //   );
  // }

  // return (
  //   <>
  //     <div className="reset-card-header">
  //       <h1 className="reset-card-title">Reset your password</h1>
  //       <p className="reset-card-subtitle">
  //         Enter a new password for your account.
  //       </p>
  //     </div>
  //     <form className="reset-form" onSubmit={handleSubmit} noValidate>
  //       <Input
  //         id="reset-password"
  //         label="New password"
  //         type="password"
  //         value={password}
  //         onChange={setPassword}
  //         placeholder="Min. 8 characters"
  //         autoComplete="new-password"
  //         error={errors.password}
  //         autoFocus
  //       />
  //       <Input
  //         id="reset-confirm-password"
  //         label="Confirm password"
  //         type="password"
  //         value={confirmPassword}
  //         onChange={setConfirmPassword}
  //         placeholder="Re-enter your password"
  //         autoComplete="new-password"
  //         error={errors.confirmPassword}
  //       />
  //       <Button type="submit" disabled={loading}>
  //         {loading ? "Resetting…" : "Reset password"}
  //       </Button>
  //     </form>
  //   </>
  // );
}
