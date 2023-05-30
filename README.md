# SealKey

This repository contains the source code for SealKey, a decentralized application built on the TRON blockchain, which allows users to mint unique tokens with a secret message encrypted within them. The secret message can only be revealed by the owner of the token.

![](/frontend/public/landing.png)

Deploy Secret Token contracts:
- TRON Mainnet: [TY32c2eSKPY6hNigxMTcCFcYtF8eU95saw](https://tronscan.org/#/address/TY32c2eSKPY6hNigxMTcCFcYtF8eU95saw)
- TRON Shasta Testnet: [TMBdWU9ek3XYpAJFc887Uk17bDKg69zFFV](https://shasta.tronscan.org/#/address/TMBdWU9ek3XYpAJFc887Uk17bDKg69zFFV)

## Overview

The repository consists of the following components:

1. **Client Side Code:** A React application that provides a user interface for minting tokens with secret messages, signing messages, and unsealing tokens to reveal the secret message.
2. **Smart Contract:** A Solidity-based TRC721 token implementation that includes functionality for minting tokens with encrypted secret messages, and unsealing tokens to reveal the secret messages.
3. **Server:** An Express.js server that handles encryption and decryption of secret messages using AES, and interacts with the TRON blockchain.

Read more about the SecretToken contract [here](/tronbox/README.md).

### Client Side Code

The client side code is a React application that provides the user with the ability to connect to their TRON wallet, enter a secret message, and mint a token with the encrypted secret message. The user can also unseal tokens by providing a signed message.

### Smart Contract

The smart contract is a TRC721 token implementation with additional functionality for associating encrypted secret messages with token IDs. It also provides a way to unseal tokens to reveal the secret messages, which can only be done by the token owner.

### Server

The server is an Express.js application that handles the following tasks:

- Generating a random secret key for encrypting and decrypting messages.
- Encrypting user-provided secret messages using AES and the generated secret key.
- Decrypting encrypted messages associated with unsealed tokens.
- Verifying signatures to ensure the message is signed by the token owner.
- Interacting with the TRON blockchain to mint and unseal tokens.

## Technology Stack

- React
- Chakra UI
- Solidity
- TRON
- TronWeb
- Express.js
- Firebase
- CryptoJS