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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Link from "next/link";
import { useTron } from "@components/TronProvider";
import { handleConnect } from "@utils/web3";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const { address, setAddress, provider } = useTron();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dismissed, setDismissed] = useState(() => {
    const localDismissed = window.localStorage.getItem("modalDismissed");
    return localDismissed === "true";
  });

  useEffect(() => {
    if (!dismissed) {
      onOpen();
    }
  }, [dismissed, onOpen]);

  const handleClose = () => {
    window.localStorage.setItem("modalDismissed", "true");
    setDismissed(true);
    onClose();
  };

  return (
    <div className={styles.container}>
      {!address ? (
        <main className={styles.main}>
          <Text className={styles.title}>SEALKEY</Text>
          <HStack className={styles.subtitleContainer}>
            <Box className={styles.fadeLeft}></Box>
            <Text className={styles.subtitle}>
              EMPOWERING REAL-WORLD ASSETS ON TRON NETWORK EMPOWERING REAL-WORLD
              ASSETS ON TRON NETWORK EMPOWERING REAL-WORLD ASSETS ON TRON
              NETWORK EMPOWERING REAL-WORLD ASSETS ON TRON NETWORK EMPOWERING
              REAL-WORLD ASSETS ON TRON NETWORK
            </Text>
            <Box className={styles.fadeRight}></Box>
          </HStack>
          <Image alt="hero image" src="hero.png" className={styles.heroImage} />
          <Box h="5rem"></Box>
          <Button
            className={styles.connectButton}
            onClick={() => handleConnect(setLoading, setAddress, provider)}
            cursor="pointer"
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
                Create your own keyToken, an NFT that stores a secret message
                on-chain only accessible by the token holder.
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
                View my Secret NFT collection, unlock the secrets only
                accessible through my private key signature.
              </Text>
              <Link href="/mycollection">
                <Button className={styles.button}>VIEW MY COLLECTION</Button>
              </Link>
            </VStack>
          </HStack>
        </main>
      )}
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay className={styles.modalOverlay} />
        <ModalContent className={styles.modalContent}>
          <ModalHeader className={styles.modalHeader}>
            We have exciting news!
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack gap={3}>
              <Text>
                The SealKey team is proud to share that our project won the 4th
                place award in the NFT category at the 2023 TRON Hackathon
                Season 4.
              </Text>
              <ChakraLink
                href="https://forum.trondao.org/t/hackatron-s4-2023-winners-announcements/19094"
                isExternal
              >
                <Image alt="hackatron" src="/hackatron.png" />
              </ChakraLink>
              <Text>
                As a result, we have officially launched our application on TRON
                Mainnet! We hope to have many more exciting features developed
                on our application in the coming months. We would like to thank
                the TRON Community for their ongoing support.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button onClick={handleClose} className={styles.modalBtn}>
              Don&apos;t see again
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Home;
