import { useRouter } from "next/router";
import { Web3Storage } from "web3.storage";
import CreateToken from "@components/CreateToken";
import CreateCollection from "@components/CreateCollection";

function Create() {
  const router = useRouter();
  const { type } = router.query;

  if (type === "token") {
    return <CreateToken />;
  } else {
    return <CreateCollection />;
  }
}

export default Create;
