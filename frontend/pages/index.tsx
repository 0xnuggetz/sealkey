import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  Button,
  HStack,
  Text,
  Image,
  Box,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import { useTron } from "@components/TronProvider";
import { handleConnect } from "@utils/web3";
import { useState } from "react";

const Home: NextPage = () => {
  const { address, setAddress, provider } = useTron();
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      {!address ? (
        <main className={styles.main}>
          <Text className={styles.title}>SEALKEY</Text>
          <HStack className={styles.subtitleContainer}>
            <Box className={styles.fadeLeft}></Box>
            <Text className={styles.subtitle}>
              EMPOWERING THE WEB3 CREATOR ECONOMY ON MANTLE NETWORK EMPOWERING
              THE WEB3 CREATOR ECONOMY ON MANTLE NETWORK EMPOWERING THE WEB3
              CREATOR ECONOMY ON MANTLE NETWORK
            </Text>
            <Box className={styles.fadeRight}></Box>
          </HStack>
          <Image alt="hero image" src="hero.png" className={styles.heroImage} />
          <Box h="5rem"></Box>
          <Button
            className={styles.connectButton}
            onClick={() => handleConnect(setLoading, setAddress, provider)}
          >
            {isLoading ? <Spinner color="white" /> : "Connect Wallet"}
          </Button>
        </main>
      ) : (
        <main className={styles.main}>
          <HStack>
            <VStack className={styles.optionContainer}>
              <Image
                alt="token"
                src="/token.png"
                className={styles.tokenImage}
              ></Image>
              <Text className={styles.description}>
                Create your own NFT, a digital asset that represents ownership
                of a unique item or piece of content.
              </Text>

              <Link href="/create?type=token">
                <Button className={styles.button}>CREATE TOKEN</Button>
              </Link>
            </VStack>
            <Box className={styles.divider}></Box>
            <VStack className={styles.optionContainer}>
              <Image
                alt="collection"
                src="/collection.png"
                className={styles.collectionImage}
              ></Image>
              <Text className={styles.description}>
                Create your own NFT collection, an entire series of digital
                assets to share ownership with the world.
              </Text>
              <Link href="/create?type=collection">
                <Button className={styles.button}>CREATE COLLECTION</Button>
              </Link>
            </VStack>
          </HStack>
        </main>
      )}
    </div>
  );
};

export default Home;
