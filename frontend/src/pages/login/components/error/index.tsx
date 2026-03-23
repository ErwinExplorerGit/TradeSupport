import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useLoginStore } from "../../../../stores";

function Error() {
  const { error } = useLoginStore();
  if (!error) return null;

  return (
    <div className="login-error" role="alert">
      <AiOutlineExclamationCircle />
      {error}
    </div>
  );
}

export default Error;
