const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});
const MetaTransactionStorageJson = require("./abi/MetaTransactionStorage.json");
console.log("flag");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_URL);
const privateKey = process.env.RELAYER_PRIVATE_KEY;

const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = MetaTransactionStorageJson.abi;

const contract = new ethers.Contract(contractAddress, abi, wallet);

app.post("/relay", async (req, res) => {
  try {
    const { signer, name, phoneNumber, signature } = req.body;
    console.log(signer, name, phoneNumber, signature);

    const msgHash = ethers.utils.solidityKeccak256(
      ["address", "string", "string"],
      [signer, name, phoneNumber]
    );

    //logic comment for guide
    //hash the message with getMessageHash
    //call recoverSigner with hashed message and signature
    //check for validity
    //if valid estimate gas fee and also get current gas price
    //call the storeData method with signer,name,phoneNumber, signatur withn gaslimit and gas price

    const hashedMessage = await contract.getMessageHash(
      signer,
      name,
      phoneNumber
    );

    console.log("Hashed Message:", hashedMessage);
    const recoveredSigner = await contract.recoverSigner(
      hashedMessage,
      signature
    );

    console.log("recovered signer:", recoveredSigner);

    if (recoveredSigner.toLowerCase() !== signer.toLowerCase()) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }

    const gasLimit = await contract.estimateGas.storeData(
      signer,
      name,
      phoneNumber,
      signature
    );
    console.log("💸Estimated gas limit:", gasLimit.toString());

    const gasPrice = await provider.getGasPrice();
    console.log("⛽Current gas price:", gasPrice);
    const signatureBytes = ethers.utils.hexlify(signature);
    console.log("Signature in bytes: ", signatureBytes);
    // interacting with contract by updating the state
    const tx = await contract.storeData(signer, name, phoneNumber, signature, {
      gasLimit,
      gasPrice,
    });
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.log("err:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log("Relayer running on port 3000"));
