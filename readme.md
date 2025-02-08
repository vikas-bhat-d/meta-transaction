# MetaTransactionStorage

MetaTransactionStorage is a Solidity smart contract that allows users to store their name and phone number using meta-transactions. The contract verifies off-chain signed messages and updates on-chain storage accordingly.

## 🚀 Features

- Store user data (name and phone number) without requiring direct transaction signing.
- Supports ECDSA signature verification.
- Prevents replay attacks using transaction hashes.
- Uses `ecrecover` to authenticate the original signer.

---

## 🛠 Tech Stack

- Solidity (`^0.5.16`)
- Ethereum (Ganache for local testing)
- ether.js (for interacting with the contract)
- Truffle (for deployment and testing)
- Node.js & npm

---

## 📌 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Truffle](https://trufflesuite.com/) (`npm install -g truffle`)
- [Ganache](https://trufflesuite.com/ganache/) (for local Ethereum blockchain)
- [MetaMask](https://metamask.io/) (for signing transactions)

---

## 🛠 Setup & Installation

1. **Clone the Repository**

   ```sh
   git clone https://github.com/yourusername/MetaTransactionStorage.git
   cd MetaTransactionStorage
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add:
   ```sh
   JSON_RPC_URL=your_rpc_url
   PRIVATE_KEY=your_wallet_private_key
   CONTRACT_ADDRESS=deployed_contract_address
   ```
   ⚠️ **DO NOT SHARE YOUR PRIVATE KEY PUBLICLY!** Use `.gitignore` to exclude `.env` from commits.

---

## 🚀 Running on Ganache (Local Development)

1. **Start Ganache**

   - Open Ganache UI OR run:
     ```sh
     ganache-cli --deterministic --port 7545
     ```

2. **Compile the Contract**

   ```sh
   truffle compile
   ```

3. **Deploy the Contract**

   ```sh
   truffle migrate --network development
   ```

   > This deploys the contract to the Ganache local blockchain.

4. **Interact with the Contract via Truffle Console**
   ```sh
   truffle console --network development
   ```
   Then, run:
   ```js
   let instance = await MetaTransactionStorage.deployed();
   instance.storeData("0xYourAddress", "Alice", "1234567890", "0xSignature");
   ```

---

<!-- ## 📜 Testing the Smart Contract

To run tests, use:

```sh
truffle test
```

Tests will validate:

- Signature verification
- Correct data storage
- Prevention of replay attacks

--- -->

## 📝 Smart Contract Breakdown

- **`getMessageHash(signer, name, phoneNumber)`** → Returns a unique hash for a transaction.
- **`storeData(signer, name, phoneNumber, signature)`** → Stores user data after verifying the signature.
- **`recoverSigner(message, signature)`** → Recovers the address from the signed message.
- **`splitSignature(signature)`** → Extracts `r`, `s`, and `v` values from the signature.

---

## 🛡️ Security Considerations

- Uses `keccak256` hashing and `ecrecover` for signature verification.
- Ensures transactions cannot be executed twice (`executedTx` mapping).
- Validates signatures before storing user data.

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests.

---

## 🛠 Future Improvements

- Implement EIP-712 for structured message signing.
- Add nonce-based replay protection.
- Provide a frontend for easier interaction.

---

## 📧 Contact

For any questions, reach out via vikasdbhat@gmail.com or open an issue on GitHub.

Happy coding! 🚀
