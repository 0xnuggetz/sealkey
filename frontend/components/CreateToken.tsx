import {
  HStack,
  VStack,
  Text,
  Input,
  Button,
  Box,
  Image,
  Spinner,
  Link as ChakraLink,
} from "@chakra-ui/react";
import styles from "../styles/Create.module.css";
import { AddIcon, InfoIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Web3Storage } from "web3.storage";
import SuccessLottie from "@components/SuccessLottie";
import Link from "next/link";
import { TokenMetadata } from "@utils/types";
import { createAsset } from "@utils/web3";
import { useTron } from "@components/TronProvider";
import { abridgeFilename, isValidURL } from "@utils/helpers";

const SECRET_TOKEN_ADDRESS = "TMBdWU9ek3XYpAJFc887Uk17bDKg69zFFV";

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

const client = new Web3Storage({
  token: WEB3_STORAGE_TOKEN,
  endpoint: new URL("https://api.web3.storage"),
});

function CreateToken() {
  const { address } = useTron();
  const [unsealedImage, setUnsealedImage] = useState<any>();
  const [uploadedImage, setUploadedImage] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [collection, setCollection] = useState<string>("");
  const [externalURL, setExternalURL] = useState<string>("");
  const [externalURLError, setExternalURLError] = useState<string>("");
  const [secretMessage, setSecretMessage] = useState<string>("");
  const [nextTokenId, setNextTokenId] = useState<string>("");
  const [txnHash, setTxnHash] = useState<string>("");
  const [trait, setTrait] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const debounceTimeoutRef = useRef<any>();

  function handleInputChange(setter) {
    return (e) => {
      setter(e.target.value);
    };
  }

  function handleImageUpload(e) {
    setUploadedImage(e.target.files[0]);
  }

  function handleUnsealedImageUpload(e) {
    setUnsealedImage(e.target.files[0]);
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleCollectionChange(e) {
    setCollection(e.target.value);
  }

  function handleExternalURLChange(e) {
    const inputValue = e.target.value;
    setExternalURL(inputValue);

    setExternalURLError("");

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (isValidURL(inputValue) || inputValue === "") {
        setExternalURLError("");
      } else {
        setExternalURLError("Invalid URL. Please enter a valid URL.");
      }
    }, 500); // Adjust the debounce time (in ms) as needed
  }

  function handleTraitChange(e) {
    setTrait(e.target.value);
  }

  function handleValueChange(e) {
    setValue(e.target.value);
  }

  function handleSecretChange(e) {
    console.log("secret");
    setSecretMessage(e.target.value);
  }

  async function uploadImage() {
    if (!uploadedImage) return;

    const fileType = uploadedImage.type || "image/png";
    const fileExtension = fileType.split("/")[1] || "png";
    const fileName = `file.${fileExtension}`;

    const blob = new Blob([uploadedImage], { type: fileType });
    const imageToUpload = [new File([blob], fileName)];
    const imageCID = await client.put(imageToUpload);
    const imageLink = `https://${imageCID}.ipfs.w3s.link/${fileName}`;

    return imageLink;
  }

  async function uploadJSON() {
    const imageURL = await uploadImage();

    const metadataJSON: TokenMetadata = {
      name: name,
      description: description,
      collection: collection != "" ? collection : "SealKey Collection 1",
      external_url: externalURL,
      image:
        imageURL ??
        "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
      original_image:
        imageURL ??
        "https://bafybeie6rfxujzadhx5t3ofso6sckg33jknl5vhobmgby7uetpmbzaojvm.ipfs.w3s.link/preview.png",
      attributes: [
        {
          trait_type: trait,
          value: value,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(metadataJSON)], {
      type: "application/json",
    });

    const files = [new File([blob], "metadata.json")];
    const jsonCID = await client.put(files);
    const metadataURL = `https://${jsonCID}.ipfs.w3s.link/metadata.json`;

    return { metadataURL, metadataJSON };
  }

  const fetchEncryptedMessage = async (message) => {
    const response = await fetch("http://localhost:8888/oracle/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      const encryptedMessage = await response.text();
      return encryptedMessage;
    } else {
      throw new Error("Error fetching encrypted message");
    }
  };

  const handleMintToken = async () => {
    setLoading(true);
    console.log("address: ", address);
    console.log("secretMessage: ", secretMessage);
    if (!address || !secretMessage) return null;

    try {
      const encryptedMessage = await fetchEncryptedMessage(secretMessage);
      console.log("encryptedMessage: ", encryptedMessage);

      const contractInstance = await window.tronWeb
        .contract()
        .at(SECRET_TOKEN_ADDRESS);

      const { metadataURL, metadataJSON } = await uploadJSON();
      console.log("metadataURL: ", metadataURL);

      const transaction = await contractInstance
        .mintWithSecret(address, encryptedMessage, metadataURL)
        .send();

      if (transaction) {
        await createAsset(
          SECRET_TOKEN_ADDRESS,
          nextTokenId,
          metadataJSON,
          address
        );
        setTxnHash(transaction);
      }
      setLoading(false);

      console.log("Transaction successful:", transaction);
      return transaction;
    } catch (error) {
      console.error("Error while minting token:", error);
      return null;
    }
  };

  const navigationLink = useMemo(
    () =>
      nextTokenId
        ? `/collection/${SECRET_TOKEN_ADDRESS}/${nextTokenId}`
        : `/collection/${SECRET_TOKEN_ADDRESS}`,
    [nextTokenId]
  );

  const fetchNextTokenId = useCallback(async () => {
    const secretTokenContract = await window.tronWeb
      .contract()
      .at(SECRET_TOKEN_ADDRESS);

    const tokenId = await secretTokenContract.getLastTokenId().call();
    const newTokenId = (parseInt(tokenId, 10) + 1).toString();
    setNextTokenId(newTokenId);
  }, []);

  useEffect(() => {
    fetchNextTokenId();
  }, [fetchNextTokenId]);

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

  if (txnHash) {
    return (
      <main className={styles.main}>
        <VStack>
          <HStack pb="2rem">
            <Text className={styles.title}>CREATE NEW ITEM</Text>
          </HStack>
          <VStack h="400px" position="relative">
            <VStack className={styles.lottieContainer}>
              <SuccessLottie />
            </VStack>
          </VStack>
          <Text fontSize="16px" pb="1rem">
            Your token was successfully minted.
          </Text>

          <HStack>
            <ChakraLink
              href={`https://shasta.tronscan.org/#/transaction/${txnHash}`}
              isExternal
            >
              <Button className={styles.successButton}>View transaction</Button>
            </ChakraLink>
            <Link href={navigationLink}>
              <Button className={styles.successButton}>View token</Button>
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
          <Text className={styles.title}>CREATE NEW ITEM</Text>
        </HStack>
        <HStack gap={10} alignItems="flex-start">
          <VStack gap={2}>
            <VStack>
              <HStack w="100%" justifyContent="space-between">
                <Text w="100%">Media</Text>
                <VStack className={styles.uploadUnsealedContainer}>
                  <HStack>
                    {unsealedImage ? (
                      <Text className={styles.uploadUnsealedTitle}>
                        {abridgeFilename(unsealedImage.name)}
                      </Text>
                    ) : (
                      <Text className={styles.uploadUnsealedTitle}>
                        Add unsealed image
                      </Text>
                    )}
                    <InfoIcon opacity={0.8} />
                  </HStack>
                  <input
                    type="file"
                    name="images"
                    id="images"
                    required
                    multiple
                    onChange={handleUnsealedImageUpload}
                    className={styles.uploadUnsealedInput}
                  />
                </VStack>
              </HStack>
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
            <VStack>
              <HStack
                w="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                paddingRight=".5rem"
              >
                <Text>Properties</Text>
                <AddIcon w={3} h={3} cursor="pointer" />
              </HStack>
              <HStack>
                <VStack alignItems="flex-start">
                  <Text className={styles.inputSubtitle}>Trait name</Text>
                  <Input
                    className={styles.subinput}
                    onChange={handleInputChange(setTrait)}
                    value={trait}
                  ></Input>
                </VStack>
                <VStack alignItems="flex-start">
                  <Text className={styles.inputSubtitle}>Value</Text>
                  <Input
                    className={styles.subinput}
                    onChange={handleInputChange(setValue)}
                    value={value}
                  ></Input>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
          <VStack alignItems="flex-end" gap={1}>
            <VStack alignItems="flex-start">
              <Text>Name</Text>
              <Input
                className={styles.input}
                onChange={handleInputChange(setName)}
                value={name}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Description</Text>

              <Input
                className={styles.input}
                onChange={handleInputChange(setDescription)}
                value={description}
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>External link</Text>
              <Input
                className={styles.input}
                onChange={handleExternalURLChange}
                value={externalURL}
              ></Input>
              {externalURLError && (
                <Text className={styles.error}>{externalURLError}</Text>
              )}
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Collection</Text>
              <Input
                className={styles.input}
                onChange={handleInputChange(setCollection)}
                value={collection}
                placeholder="SealKey Collection (default)"
              ></Input>
            </VStack>
            <VStack alignItems="flex-start">
              <Text>Secret</Text>
              <Input
                className={styles.input}
                onChange={handleInputChange(setSecretMessage)}
                value={secretMessage}
              ></Input>
            </VStack>
            <Box h="1rem"></Box>
            <Button className={styles.button} onClick={handleMintToken}>
              {isLoading ? <Spinner color="white" /> : "CREATE"}
            </Button>
          </VStack>
        </HStack>
      </VStack>
    </main>
  );
}

export default CreateToken;
