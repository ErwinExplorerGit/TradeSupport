import { Input } from "../../../../components";
import { useLoginStore } from "../../../../stores";

function Username() {
  const { username, setUsername } = useLoginStore();

  return (
    <Input
      id="username"
      label="Username"
      value={username}
      onChange={(value) => setUsername(value)}
      placeholder="Enter your username"
      autoComplete="username"
      autoFocus
    />
  );
}

export default Username;
