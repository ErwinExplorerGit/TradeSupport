import { useResetPasswordStore } from "../../../../stores/resetPasswordStore";
import FormHeader from "./components/FormHeader";
import LoginAction from "./components/LoginAction";
import PasswordForm from "./components/PasswordForm";
import SuccessIcon from "./components/SuccessIcon";
import SuccessMessage from "./components/SuccessMessage";

export default function Success() {
  const submitted = useResetPasswordStore((s) => s.submitted);
  const reset = useResetPasswordStore((s) => s.reset);

  if (submitted) {
    return (
      <>
        <SuccessIcon />
        <SuccessMessage />
        <LoginAction onReset={reset} />
      </>
    );
  }

  return (
    <>
      <FormHeader />
      <PasswordForm />
    </>
  );
}
