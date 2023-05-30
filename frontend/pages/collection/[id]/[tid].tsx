import { useCallback, useEffect, useState } from "react";
import {
  HStack,
  VStack,
  Text,
  Image,
  Box,
  Link as ChakraLink,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import styles from "@styles/Token.module.css";
import Link from "next/link";
import * as crypto from "crypto";
import { useRouter } from "next/router";
import { abridgeAddress } from "@utils/helpers";
import { useTron } from "@components/TronProvider";

const SECRET_TOKEN_ADDRESS = "TMBdWU9ek3XYpAJFc887Uk17bDKg69zFFV";

function Asset() {
  const router = useRouter();
  const { address } = useTron();
  const [owner, setOwner] = useState<string>();
  const [sealedStatus, setSealedStatus] = useState<boolean>();
  const [tokenURI, setTokenURI] = useState<string>();
  const [metadata, setMetadata] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [secret, setSecret] = useState<string>("false");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { id: collectionAddress, tid: tokenId } = router.query;

  const fetchSealedStatus = useCallback(async () => {
    const secretTokenContract = await window.tronWeb
      .contract()
      .at(SECRET_TOKEN_ADDRESS);

    const status = await secretTokenContract.getSealedStatus(tokenId).call();
    setSealedStatus(status);
  }, [tokenId]);

  const fetchOwner = useCallback(async () => {
    const secretTokenContract = await window.tronWeb
      .contract()
      .at(SECRET_TOKEN_ADDRESS);

    const owner = await secretTokenContract.ownerOf(tokenId).call();
    const base58Owner = window.tronWeb.address.fromHex(owner);
    setOwner(base58Owner);
  }, [tokenId]);

  const fetchToken = useCallback(async () => {
    const secretTokenContract = await window.tronWeb
      .contract()
      .at(SECRET_TOKEN_ADDRESS);

    const tokenURI = await secretTokenContract.tokenURI(tokenId).call();
    setTokenURI(tokenURI);

    const response = await fetch(tokenURI as string);
    const result = await response.json();
    setMetadata(result);
  }, [tokenId]);

  async function signMessage(message) {
    try {
      if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        throw new Error("Please connect to a TRON wallet");
      }

      const signature = await window.tronWeb.trx.signMessageV2(message);

      return signature;
    } catch (error) {
      console.error("Error signing message:", error.message);
      return null;
    }
  }

  const handleUnsealToken = async () => {
    setLoading(true);
    const message = crypto.randomBytes(32).toString("hex");

    if (!address) return null;

    try {
      const signature = await signMessage(message);

      if (!signature) {
        throw new Error("Error signing message");
      }

      const response = await fetch("http://localhost:8888/oracle/unseal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, tokenId, message, signature }),
      });

      if (response.ok) {
        const decryptedMessage = await response.text();
        setSecret(decryptedMessage);
        setSealedStatus(false);
        onOpen();
      } else {
        throw new Error("Error fetching encrypted message");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error while unsealing token:", error);
    }
  };

  useEffect(() => {
    if (tokenId && !metadata) {
      fetchToken();
    }
    if (tokenId && !owner) {
      fetchOwner();
    }
    if (tokenId && !sealedStatus) {
      fetchSealedStatus();
    }
  }, [
    fetchOwner,
    fetchSealedStatus,
    fetchToken,
    metadata,
    owner,
    sealedStatus,
    tokenId,
  ]);

  if (!tokenId || !metadata || !owner)
    return (
      <VStack className={styles.main}>
        <Spinner />
      </VStack>
    );

  return (
    <VStack className={styles.main}>
      <VStack className={styles.tokenContainer}>
        <VStack className={styles.tokenImageContainer}>
          <Image
            alt="token image"
            src={
              !metadata.image.startsWith("ipfs://")
                ? metadata.image
                : `https:ipfs.io/ipfs/${metadata.image.split("//")[1]}`
            }
            className={`${styles.image} ${
              !sealedStatus ? styles.unsealed : ""
            }`}
          ></Image>
          {!sealedStatus && (
            <Image
              alt="token image"
              src="/unsealed.png"
              className={styles.lock}
            ></Image>
          )}
        </VStack>
        <VStack className={styles.tokenDetailContainer}>
          <HStack w="100%" justifyContent="space-between">
            <Text className={styles.name}>{metadata.name}</Text>
            <HStack>
              <ChakraLink
                href={`https://tronscan.org/#/token721/${collectionAddress}/${tokenId}`}
                isExternal
              >
                <Image
                  alt="explorer"
                  src="/explorer.png"
                  className={styles.explorerIcon}
                ></Image>
              </ChakraLink>
              <ChakraLink href={tokenURI as string} isExternal>
                <Image
                  alt="ipfs"
                  src="/ipfs.png"
                  className={styles.ipfsIcon}
                ></Image>
              </ChakraLink>
              <ChakraLink href={metadata.external_url} isExternal>
                <Image
                  alt="web"
                  src="/website.png"
                  className={styles.webIcon}
                ></Image>
              </ChakraLink>
            </HStack>
          </HStack>
          <Text className={styles.description}>{metadata.description}</Text>
          <Accordion w="100%" variant="custom" allowToggle>
            <AccordionItem border="none">
              <AccordionButton border="none !important">
                <HStack
                  w="100%"
                  justifyContent="space-between"
                  alignItems="flex-end"
                >
                  <VStack className={styles.fieldContainer}>
                    <Text className={styles.header}>OWNED BY</Text>
                    <ChakraLink
                      href={`https://tronscan.org/#/address/${owner}`}
                      isExternal
                    >
                      <Text className={styles.value}>
                        {abridgeAddress(owner as string)}
                      </Text>
                    </ChakraLink>
                  </VStack>

                  <Text className={styles.header}>View details</Text>
                </HStack>
              </AccordionButton>
              <AccordionPanel>
                {
                  <VStack w="100%">
                    <HStack w="100%" justifyContent="center" p="20px 0 10px 0">
                      <Box className={styles.divider}></Box>
                    </HStack>
                    <HStack w="100%" alignItems="flex-end">
                      <VStack className={styles.fieldContainerPadded}>
                        <Text className={styles.header}>COLLECTION</Text>
                        <Link href={`/collection/${collectionAddress}`}>
                          <Text className={styles.value}>
                            {metadata.collection
                              ? metadata.collection
                              : "SealKey Collection 1"}
                          </Text>
                        </Link>
                      </VStack>
                      <Box w="3rem" />
                      <VStack className={styles.fieldContainerPadded}>
                        <Text className={styles.header}>TOKEN ID</Text>
                        <Text className={styles.value}>{tokenId}</Text>
                      </VStack>
                    </HStack>
                    <HStack w="100%" alignItems="flex-end">
                      <VStack className={styles.fieldContainerPadded}>
                        <Text className={styles.header}>CONTRACT ADDRESS</Text>
                        <Text className={styles.value}>
                          {abridgeAddress(collectionAddress as string)}
                        </Text>
                      </VStack>
                      <Box w="3rem" />
                      <VStack className={styles.fieldContainerPadded}>
                        <Text className={styles.header}>STATUS</Text>
                        <Text className={styles.value}>
                          {sealedStatus ? "SEALED" : "UNSEALED"}
                        </Text>
                      </VStack>
                    </HStack>
                    <Box h=".5rem" />
                    <Button
                      onClick={handleUnsealToken}
                      className={styles.unsealButton}
                    >
                      {isLoading ? (
                        <Spinner color="white" />
                      ) : !sealedStatus ? (
                        "VIEW SECRET"
                      ) : (
                        "UNSEAL"
                      )}
                    </Button>
                  </VStack>
                }
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay className={styles.modalOverlay} />
        <ModalContent className={styles.modalContent}>
          <ModalHeader className={styles.modalHeader}>
            View Your Secret
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack className={styles.secretContainer}>
              <Image
                src="/scratch.png"
                className={styles.scratch}
                alt="scratch"
              ></Image>
              <Text className={styles.secretMessage}>{secret}</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default Asset;
