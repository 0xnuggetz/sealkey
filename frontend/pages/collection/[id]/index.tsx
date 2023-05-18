import {
  HStack,
  VStack,
  Text,
  Image,
  SimpleGrid,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { tokens } from "@data/static";
import styles from "@styles/Collection.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { abridgeAddress } from "@utils/helpers";
import { useTron } from "@components/TronProvider";

function Collection() {
  const router = useRouter();
  const { address } = useTron();
  const { id: collectionAddress } = router.query;

  if (!address) {
    return (
      <VStack className={styles.main}>
        <VStack w="100%">
          <Text className={styles.title}>Oops! Wait a minute.</Text>
          <Text className={styles.inputHeader}>
            Please connect your wallet before you proceed.
          </Text>
        </VStack>
      </VStack>
    );
  }

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
      <VStack className={styles.gridContainer}>
        <SimpleGrid columns={4} w="100%" spacingX={10} spacingY={10}>
          {[...tokens].map(({ image, name }, idx) => (
            <Link
              href={`/collection/${collectionAddress}/${idx + 1}`}
              key={idx}
            >
              <VStack className={styles.tokenCardContainer}>
                <Image
                  alt={name}
                  // src={`https:ipfs.io/ipfs/${image.split("//")[1]}`}
                  src={image}
                  className={styles.tokenImage}
                ></Image>
                <VStack w="100%" padding="4px 12px 2px 12px">
                  <HStack w="100%" justifyContent="space-between">
                    <Text className={styles.tokenTitle}>{name}</Text>
                    <Text className={styles.tokenId}>{`ID: ${idx + 1}`}</Text>
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
    </VStack>
  );
}

export default Collection;
