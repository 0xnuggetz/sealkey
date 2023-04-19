# SecretToken Contract

SecretToken is a TRC-721 based token contract that allows you to mint tokens associated with secret messages. Each token has a unique secret message and can be unsealed by the contract owner to reveal its secret message. SecretToken contract is built using Solidity and is based on the TRC-721 standard.

Please note the secret stored on-chain must be encrypted.

## Features

- Mint tokens with associated secret messages and tokenURIs
- Batch mint tokens with associated secret messages and tokenURIs
- Retrieve the secret message associated with a tokenId
- Unseal a token to reveal its secret message
- Retrieve the sealed status of a token

## Usage

### Mint a token with a secret message and tokenURI

To mint a new token with a secret message and tokenURI associated with the tokenId, use the `mintWithSecret` function:

```solidity
function mintWithSecret(
    address to,
    string memory secret,
    string memory tokenURI
) public
```

### Batch mint tokens with associated secret messages and tokenURIs
To batch mint tokens with associated secret messages, tokenURIs, and tokenIds, use the `batchMintWithSecret` function:

```solidity
function batchMintWithSecret(
    address to,
    string[] memory secretsArray,
    string[] memory tokenURIsArray
) public
```

Retrieve the secret message associated with a tokenId
To retrieve the secret message associated with a tokenId, use the `getSecret` function:

```solidity
function getSecret(uint256 tokenId) public view returns (string memory)
```

Unseal a tokenId to reveal its secret message
To unseal a tokenId and reveal its secret message, use the `unsealToken` function. Note that only the contract owner can unseal a token:

```solidity
function unsealToken(uint256 tokenId) public onlyOwner
```

Retrieve the sealed status of a tokenId
To retrieve the sealed status of a tokenId, use the `getSealedStatus` function:

```solidity
function getSealedStatus(uint256 tokenId) public view returns (bool)
```