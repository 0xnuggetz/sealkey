// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./Libs.sol";

contract SecretToken is TRC721Metadata, Ownable {
    // Mapping to store secret messages associated with tokenIds
    mapping(uint256 => string) private secrets;

    // Mapping to store sealed status for each tokenId
    mapping(uint256 => bool) private sealedStatus;

    // Event to be emitted when a new token is minted with a secret
    event MintWithSecret(uint256 tokenId, address to, string secret);

    // Event to be emitted when a token is unsealed
    event UnsealToken(uint256 tokenId);

    constructor(
        string memory name_,
        string memory symbol_
    ) TRC721Metadata(name_, symbol_) {}

    function _mintWithSecret(
        address to,
        string memory secret,
        string memory _tokenURI
    ) internal {
        _mint(to);
        uint256 _tokenId = getLastTokenId();
        secrets[_tokenId] = secret;
        sealedStatus[_tokenId] = true; // Set the token to be sealed by default
        _setLatestTokenURI(_tokenURI);
        emit MintWithSecret(_tokenId, to, secret);
    }

    /**
     * @dev Function to mint a token with a secret message and tokenURI associated with the tokenId
     * @param to The address that will receive the minted token
     * @param secret The secret message to be associated with the tokenId
     * @param tokenURI The tokenURI to be associated with the tokenId
     */
    function mintWithSecret(
        address to,
        string memory secret,
        string memory tokenURI
    ) public {
        _mintWithSecret(to, secret, tokenURI);
    }

    /**
     * @dev Function to batch mint tokens with associated secret messages, tokenURIs, and tokenIds
     * @param to The address that will receive the minted tokens
     * @param secretsArray An array of secret messages to be associated with the tokenIds
     * @param tokenURIsArray An array of tokenURIs to be associated with the tokenIds
     */
    function batchMintWithSecret(
        address to,
        string[] memory secretsArray,
        string[] memory tokenURIsArray
    ) public {
        require(
            secretsArray.length == tokenURIsArray.length,
            "secretsArray and tokenURIsArray lengths must match"
        );

        for (uint256 i = 0; i < secretsArray.length; i++) {
            _mintWithSecret(to, secretsArray[i], tokenURIsArray[i]);
        }
    }

    /**
     * @dev Function to retrieve the secret message associated with a tokenId
     * @param tokenId The tokenId to retrieve the secret message for
     * @return The secret message associated with the given tokenId
     */
    function getSecret(uint256 tokenId) public view returns (string memory) {
        return secrets[tokenId];
    }

    /**
     * @dev Function to unseal a tokenId
     * @param tokenId The tokenId to be unsealed
     */
    function unsealToken(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Token ID does not exist");
        sealedStatus[tokenId] = false;
        emit UnsealToken(tokenId);
    }

    /**
     * @dev Function to retrieve the sealed status of a tokenId
     * @param tokenId The tokenId to retrieve the sealed status for
     * @return The sealed status of the given tokenId
     */
    function getSealedStatus(uint256 tokenId) public view returns (bool) {
        return sealedStatus[tokenId];
    }
}
