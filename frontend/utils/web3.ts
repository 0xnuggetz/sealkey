import { TokenMetadata } from "./types";

export const SEALKEY_API_URL =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? process.env.NEXT_PUBLIC_API_PROD
    : process.env.NEXT_PUBLIC_API_DEV;

export async function fetchAssets() {
  try {
    const response = await fetch(`${SEALKEY_API_URL}/assets`);
    if (response.status === 200) {
      const assets = await response.json();
      return assets;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function fetchAsset(address: string, tokenId: string) {
  try {
    const response = await fetch(
      `${SEALKEY_API_URL}/assets/${address}/${tokenId}`
    );
    if (response.status === 200) {
      const asset = await response.json();
      return asset;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function createAsset(
  address: string,
  tokenId: string,
  metadata: TokenMetadata,
  userAddress: string
) {
  try {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        tokenId,
        metadata,
        userAddress,
      }),
    };
    await fetch(`${SEALKEY_API_URL}/assets/create`, requestOptions);
  } catch (err) {
    console.log(err);
  }
}

export async function handleConnect(setLoading, setAddress, provider) {
  setLoading(true);
  try {
    await provider.request({
      method: "tron_requestAccounts",
    });
    if (provider && provider.defaultAddress) {
      setTimeout(() => {
        setAddress(provider.defaultAddress.base58);
        setLoading(false);
      }, 500);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handleDisconnect(
  setIsLoading,
  setAddress,
  handleNavigate
) {
  setIsLoading(true);
  try {
    setTimeout(() => {
      setAddress("");
      window.localStorage.removeItem("TRON_ADDRESS");
      handleNavigate();
      setIsLoading(false);
    }, 500);
  } catch (error) {
    console.error(error);
  }
}
