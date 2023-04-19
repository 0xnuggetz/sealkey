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
} from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import styles from "@styles/Token.module.css";
import { abridgeAddress } from "@utils/helpers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContractRead } from "wagmi";
import SilicateNFT from "@data/SilicateNFT.json";
import { useCallback, useEffect, useState } from "react";

function Asset() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<any>();
  const { id: collectionAddress, tid: tokenId } = router.query;

  const { data: tokenURI } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: SilicateNFT.abi,
    functionName: "tokenURI",
    args: [tokenId ?? "1"],
  });

  const { data: owner } = useContractRead({
    address:
      (collectionAddress as `0x${string}`) ??
      "0xB499Bc2AD48b86fd4AA9C94e081C213eDFD4bDf2",
    abi: SilicateNFT.abi,
    functionName: "ownerOf",
    args: [tokenId ?? "1"],
  });

  const fetchToken = useCallback(async () => {
    if (!tokenURI) return;
    const response = await fetch(tokenURI as string);
    const result = await response.json();

    setMetadata(result);
  }, [tokenURI]);

  useEffect(() => {
    if (!metadata) {
      fetchToken();
    }
  }, [fetchToken, metadata]);

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
    const tokenId = 3;
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

      console.log("response: ", response);

      if (response.ok) {
        console.log("Unseal request successful:", response.json());
        return response.json();
      } else {
        throw new Error("Error unsealing token");
      }
    } catch (error) {
      console.error("Error while unsealing token:", error);
    }
  };

  if (!tokenId || !metadata || !owner)
    return (
      <VStack className={styles.main}>
        <Spinner />
      </VStack>
    );

  console.log("metadata: ", metadata);

  return (
    <VStack className={styles.main}>
      <VStack className={styles.tokenContainer}>
        <Image
          alt="mantle token"
          src={
            !metadata.image.startsWith("ipfs://")
              ? metadata.image
              : `https:ipfs.io/ipfs/${metadata.image.split("//")[1]}`
          }
          className={styles.image}
        ></Image>
        <VStack className={styles.tokenDetailContainer}>
          <HStack w="100%" justifyContent="space-between">
            <Text className={styles.name}>{metadata.name}</Text>
            <HStack>
              <ChakraLink
                href={`https://explorer.testnet.mantle.xyz/token/${collectionAddress}/instance/${tokenId}/token-transfers`}
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
                    <Text className={styles.value}>
                      {abridgeAddress(owner as string)}
                    </Text>
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
                              : "Azuki (Mantle Edition)"}
                          </Text>
                        </Link>
                      </VStack>
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
                      <VStack className={styles.fieldContainerPadded}>
                        <Text className={styles.header}>CREATOR ROYALTIES</Text>
                        <Text className={styles.value}>5%</Text>
                      </VStack>
                    </HStack>
                    <Button onClick={handleUnsealToken}>Unseal Token</Button>
                  </VStack>
                }
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </VStack>
    </VStack>
  );
}

export default withTransition(Asset);
