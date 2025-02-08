// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract MetaTransactionStorage {
    struct User {
        string name;
        string phoneNumber;
    }

    mapping(address => User) public users;
    mapping(bytes32 => bool) public executedTx;

    event UserDataStored(address indexed signer, string name, string phoneNumber);
    event SignerRecovered(address indexed recoveredSigner);


    function getMessageHash(
        address signer,
        string memory name,
        string memory phoneNumber
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(signer, name, phoneNumber));
    }

    function storeData(
        address signer,
        string memory name,
        string memory phoneNumber,
        bytes memory signature
    ) public {
        require(signer != address(0), "Invalid signer");

        bytes32 messageHash = getMessageHash(signer, name, phoneNumber);
        require(!executedTx[messageHash], "Transaction already executed");

        address recoveredSigner = recoverSigner(messageHash, signature);
        require(recoveredSigner == signer, "Invalid signature");

        users[signer] = User(name, phoneNumber);
        executedTx[messageHash] = true;

        emit UserDataStored(signer, name, phoneNumber);
        emit SignerRecovered(recoveredSigner);
    }

    function recoverSigner(bytes32 message, bytes memory signature) public pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
