import Link from "next/link";
import styles from "@styles/Navbar.module.css";
import { Button, HStack, Image, Spinner } from "@chakra-ui/react";
import { abridgeAddress } from "@utils/abridgeAddress";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTron } from "./TronProvider";
import { handleDisconnect } from "@utils/web3";

const Navbar = () => {
  const router = useRouter();
  const { address, setAddress } = useTron();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  function handleNavigate() {
    router.push("/");
  }

  if (!address) return;

  return (
    <HStack className={styles.navbar}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          cursor="pointer"
          className={styles.logo}
        ></Image>
      </Link>

      {address && (
        <Button
          className={styles.button}
          onClick={() =>
            handleDisconnect(setLoading, setAddress, handleNavigate)
          }
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          {isLoading ? (
            <Spinner color="white" />
          ) : isHover ? (
            "DISCONNECT"
          ) : (
            abridgeAddress(address)
          )}
        </Button>
      )}
    </HStack>
  );
};

export default Navbar;
