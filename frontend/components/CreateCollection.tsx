import {
  HStack,
  VStack,
  Text,
  Input,
  Button,
  Box,
  Image,
  Switch,
  Spinner,
  Link as ChakraLink,
} from "@chakra-ui/react";
import styles from "../styles/Create.module.css";
import { useState } from "react";
import { Web3Storage } from "web3.storage";
import SuccessLottie from "@components/SuccessLottie";
import Link from "next/link";
import { CollectionMetadata } from "@utils/types";
import { InfoIcon } from "@chakra-ui/icons";
import { useTron } from "@components/TronProvider";

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

const client = new Web3Storage({
  token: WEB3_STORAGE_TOKEN,
  endpoint: new URL("https://api.web3.storage"),
});

function CreateCollection() {
  const { address } = useTron();
  const [uploadedImage, setUploadedImage] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [publishedContract, setPublishedContract] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [collection, setCollection] = useState<string>("");
  const [externalURL, setExternalURL] = useState<string>("");
  const [baseURI, setBaseURI] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState<number>();
  const [symbol, setSymbol] = useState<string>("");
  const [royalties, setRoyalties] = useState<string>("");
  const [txnHash, setTxnHash] = useState<string>("");

  const [isViewSuccessPage, setViewSuccessPage] = useState<boolean>(false);

  function handleImageUpload(e) {
    setUploadedImage(e.target.files[0]);
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleBaseURIChange(e) {
    setBaseURI(e.target.value);
  }

  function handleSymbolChange(e) {
    setSymbol(e.target.value);
  }

  function handleRoyaltiesChange(e) {
    setRoyalties(e.target.value);
  }

  function handleTokenSupplyChange(e) {
    setTokenSupply(e.target.value);
  }

  const NFT_ADDRESS = "";

  async function uploadImage() {
    if (!uploadedImage) return;

    const blob = new Blob([uploadedImage], { type: "image/png" });
    const imageToUpload = [new File([blob], "file.png")];
    const imageCID = await client.put(imageToUpload);
    const imageLink = `https://${imageCID}.ipfs.w3s.link/file.png`;

    return imageLink;
  }

  async function uploadJSON() {
    const imageCID = await uploadImage();

    // construct JSON metadata object
    const jsonObject: CollectionMetadata = {
      name: name,
      description: description,
      symbol: symbol,
      base_uri: baseURI,
      image:
        imageCID ??
        "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
      seller_fee_basis_points: royalties.toString(),
      fee_recipient: address,
    };

    const blob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });

    const files = [new File([blob], "metadata.json")];
    const jsonCID = await client.put(files);
    const jsonLink = `https://${jsonCID}.ipfs.w3s.link/metadata.json`;

    return { jsonLink, jsonObject };
  }

  //   const handleDeploy = () => {}

  //   async function deployContract() {
  //     if (!signer) return;
  //     setLoading(true);

  //     try {
  //       const { jsonLink: uploadedJSON, jsonObject: metadata } =
  //         await uploadJSON();

  //       console.log("collection metdata successfully uploaded: ", uploadedJSON);

  //       const contract = ...
  //       console.log("contract deployed");
  //       console.log("contract address: ", contract.address);

  //       setPublishedContract(contract.address);
  //       // saveContract(contract.address, imageURI);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     setLoading(false);
  //   }

  const deployContract = () => {};

  if (publishedContract) {
    return (
      <main className={styles.main}>
        <VStack>
          <HStack pb="2rem">
            <Text className={styles.title}>CREATE NEW COLLECTION</Text>
          </HStack>
          <VStack h="400px" position="relative">
            <VStack className={styles.lottieContainer}>
              <SuccessLottie />
            </VStack>
          </VStack>
          <Text fontSize="16px" pb="1rem">
            Your collection was successfully deployed.
          </Text>

          <HStack>
            <ChakraLink
              href={`https://explorer.testnet.mantle.xyz/address/${publishedContract}`}
              isExternal
            >
              <Button className={styles.successButton}>View contract</Button>
            </ChakraLink>
            <Link href={`/collection/${publishedContract}`}>
              <Button className={styles.successButton}>View collection</Button>
            </Link>
          </HStack>
        </VStack>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <VStack>
        <HStack pb="2rem">
          <Text className={styles.title}>CREATE NEW COLLECTION</Text>
        </HStack>
        <HStack gap={10} alignItems="flex-start">
          <VStack gap={2}>
            <VStack>
              <Text w="100%">Cover Image</Text>
              {!uploadedImage ? (
                <VStack className={styles.uploadContainer}>
                  <input
                    type="file"
                    name="images"
                    id="images"
                    required
                    multiple
                    onChange={handleImageUpload}
                    className={styles.uploadInput}
                  />

                  <VStack className={styles.uploadTextContainer}>
                    <Text className={styles.uploadTitle}>Upload media</Text>
                    <Text className={styles.uploadTitle2}>
                      File types supported: png, jpg, gif
                    </Text>
                    <Text className={styles.uploadSubtitle}>
                      Max size: 100MB
                    </Text>
                  </VStack>
                </VStack>
              ) : (
                <Image
                  alt="preview"
                  src={uploadedImage ? URL.createObjectURL(uploadedImage) : ""}
                  className={styles.previewContainer}
                ></Image>
              )}
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Token Supply</Text>
              <Input
                className={styles.input}
                onChange={handleTokenSupplyChange}
                value={tokenSupply}
                placeholder="10"
              ></Input>
            </VStack>
          </VStack>
          <VStack alignItems="flex-end" gap={1}>
            <VStack alignItems="flex-start">
              <Text>Name</Text>
              <Input
                className={styles.input}
                onChange={handleNameChange}
                value={name}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Symbol</Text>
              <Input
                className={styles.input}
                onChange={handleSymbolChange}
                value={symbol}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Description</Text>
              <Input
                className={styles.input}
                onChange={handleDescriptionChange}
                value={description}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <HStack>
                <Text>Base URI</Text>
                <ChakraLink
                  href="https://github.com/0xnuggetz/sealkey"
                  isExternal
                >
                  <InfoIcon opacity={0.8} />
                </ChakraLink>
              </HStack>
              <Input
                className={styles.input}
                onChange={handleBaseURIChange}
                value={baseURI}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Secrets (JSON)</Text>
              <Input
                className={styles.input}
                onChange={handleRoyaltiesChange}
                value={royalties.toString()}
                placeholder={`{ 1: "message1", 2: "message2" }`}
              ></Input>
            </VStack>
            <Box h=".5rem"></Box>
            <HStack w="100%" justifyContent="space-between">
              <VStack>
                <Text>Create mint drop</Text>
                <Switch size="lg" colorScheme="blue" variant="custom" />
              </VStack>
              <Button className={styles.button} onClick={deployContract}>
                {isLoading ? <Spinner color="white" /> : "CREATE"}
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </main>
  );
}

export default CreateCollection;
