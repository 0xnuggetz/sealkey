import {
  HStack,
  VStack,
  Text,
  Image,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import styles from "@styles/Collection.module.css";
import Link from "next/link";
import { abridgeAddress } from "@utils/helpers";
import { useTron } from "@components/TronProvider";
import { useCallback, useEffect, useState } from "react";

const SECRET_TOKEN_ADDRESS = "TMBdWU9ek3XYpAJFc887Uk17bDKg69zFFV";

function Collection() {
  const { address } = useTron();

  const [isLoading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);

  const fetchTokenURIs = useCallback(async () => {
    setLoading(true);
    if (!address) return;
    const secretTokenContract = await window.tronWeb
      .contract()
      .at(SECRET_TOKEN_ADDRESS);

    const lastTokenIdBigNumber = await secretTokenContract
      .getLastTokenId()
      .call();
    const lastTokenId = lastTokenIdBigNumber.toNumber();

    const tokensOwnerBy: string[] = [];

    for (let tokenId = 1; tokenId <= lastTokenId; tokenId++) {
      const owner = await secretTokenContract.ownerOf(tokenId).call();
      if (
        owner.toLowerCase() ===
        window.tronWeb.address.toHex(address).toLowerCase()
      ) {
        const tokenURI = await secretTokenContract.tokenURI(tokenId).call();
        if (tokenURI) {
          const res = await fetch(tokenURI);
          const metadata = await res.json();
          metadata.id = tokenId;
          tokensOwnerBy.push(metadata);
        }
      }
    }

    setTokens(tokensOwnerBy);
    setLoading(false);
  }, [address]);

  useEffect(() => {
    if (tokens.length === 0) {
      fetchTokenURIs();
    }
  }, [address, fetchTokenURIs, tokens.length]);

  if (!address) {
    return (
      <VStack className={styles.main}>
        <VStack w="100%">
          <Text className={styles.title}>No address detected.</Text>
          <Text className={styles.inputHeader}>
            Please connect your wallet before you proceed.
          </Text>
        </VStack>
      </VStack>
    );
  }

  console.log("isLoading: ", isLoading);

  return (
    <VStack className={styles.main} gap={8}>
      <VStack className={styles.collectionImageContainer}>
        <VStack className={styles.collectionCoverImageContainer}>
          <Image
            alt="cover"
            src={"/cover.jpg"}
            className={styles.collectionCoverImage}
          ></Image>
        </VStack>
        <VStack className={styles.profileImageContainer}>
          <Image
            alt="profile"
            src="/profile.png"
            className={styles.collectionProfileImage}
          ></Image>
          <VStack alignItems="flex-start" pl=".5rem" pt=".5rem">
            <HStack>
              <Image
                alt="trx"
                src="/tron.png"
                className={styles.tronIcon}
              ></Image>
              <Text className={styles.username}>{abridgeAddress(address)}</Text>
            </HStack>
            <Text fontSize="14px">Owner of {tokens.length} secret tokens</Text>
          </VStack>
        </VStack>
      </VStack>
      {isLoading ? (
        <VStack className={styles.gridContainer}>
          <Spinner color="white" size="lg" />
        </VStack>
      ) : (
        <VStack className={styles.gridContainer}>
          <SimpleGrid columns={4} w="100%" spacingX={10} spacingY={10}>
            {[...tokens].map(({ image, name, id }, idx) => (
              <Link
                href={`/collection/${SECRET_TOKEN_ADDRESS}/${id}`}
                key={idx}
              >
                <VStack className={styles.tokenCardContainer}>
                  <Image
                    alt={name}
                    src={image}
                    className={styles.tokenImage}
                  ></Image>
                  <VStack w="100%" padding="4px 12px 2px 12px">
                    <HStack w="100%" justifyContent="space-between">
                      <Text className={styles.tokenTitle}>{name}</Text>
                      <Text className={styles.tokenId}>{`ID: ${id}`}</Text>
                    </HStack>
                    <HStack w="100%">
                      <Text className={styles.tokenOwnerLabel}>OWNER:</Text>
                      <Text className={styles.tokenOwner}>
                        {abridgeAddress(address)}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Link>
            ))}
          </SimpleGrid>
        </VStack>
      )}
    </VStack>
  );
}

export default Collection;
