export function abridgeAddress(address?: string) {
  if (!address) return address;
  const l = address.length;
  if (l < 20) return address;
  return `${address.substring(0, 6)}...${address.substring(l - 6, l)}`;
}

export function abridgeFilename(address?: string) {
  if (!address) return address;
  const l = address.length;
  if (l < 20) return address;
  return `${address.substring(0, 10)}...${address.substring(l - 10, l)}`;
}

export function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
