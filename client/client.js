const contractAddress = "0x06995CFA0098456302643b27BFF10c78585bab40";
async function loadContract() {
  const response = await fetch("./MetaTransactionStorage.json");
  const contractData = await response.json();
  return contractData;
}

function formatHash(str) {
  if (str.length <= 6) {
    return str;
  }

  const firstPart = str.slice(0, 4);
  const lastPart = str.slice(-2);

  return `${firstPart}...${lastPart}`;
}

function formatPhone(str) {
  if (str.length <= 6) {
    return str;
  }

  const firstPart = str.slice(0, 3);
  const lastPart = str.slice(-2);
  return `${firstPart}xxxxx${lastPart}`;
}

async function renderBlocks(events) {
  const blockContainer = document.querySelector(".block-container");
  blockContainer.innerHTML = "";

  events.forEach((event) => {
    const blockNumber = event.blockNumber;
    const blockHash = event.transactionHash;
    const signer = event.args.signer;
    const name = event.args.name;
    const phoneNumber = event.args.phoneNumber;

    const blockCard = document.createElement("div");
    blockCard.classList.add("block-card");
    blockCard.innerHTML = `
      <i class="fa fa-long-arrow-right"></i>
          <div class="block-no">${blockNumber}</div>
          <div class="block-hash">Hash:<span>${formatHash(
            blockHash
          )}</span></div>
          <div class="block-data">
            <div>Signer: <span>${formatHash(signer)}</span></div>
            <div>UserName: <span>${name}</span></div>
            <div>PhoneNumber:<span>${formatPhone(phoneNumber)}</span></div>
          </div>
    `;

    blockContainer.appendChild(blockCard);
  });
}

async function checkMetaMaskConnection() {
  if (!window.ethereum) {
    showNotification(
      {
        textContent: "MetaMask not Installed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.log("MetaMask is not installed.");
    return false;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.listAccounts();

  if (accounts.length > 0) {
    console.log("User is connected:", accounts[0]);
    document.querySelector(".connect-btn").classList.add("hide");
    getContract();
    return true;
  } else {
    console.log("User is NOT connected.");
    document.querySelector(".connect-btn").classList.remove("hide");
    return false;
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showNotification(
      {
        textContent: "MetaMask not Installed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.log("MetaMask is not installed.");
    return false;
  }
  const contractData = await loadContract();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  checkMetaMaskConnection();
}
async function getContract() {
  if (!window.ethereum) {
    showNotification(
      {
        textContent: "MetaMask not Installed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.log("MetaMask is not installed.");
    return false;
  }

  const contractData = await loadContract();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();

  const contract = new ethers.Contract(
    contractAddress,
    contractData.abi,
    signer
  );

  const filter = contract.filters.UserDataStored();
  const events = await contract.queryFilter(filter, 0, "latest");
  console.log(events);
  renderBlocks(events);
}
checkMetaMaskConnection();

async function signAndSendTransaction() {
  const name = document.getElementById("name").value;
  const phoneNumber = document.getElementById("phone").value;

  if (!window.ethereum) {
    showNotification(
      {
        textContent: "MetaMask not Installed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.error("MetaMask not found!");
    return;
  }

  const contractData = await loadContract();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();

  const contract = new ethers.Contract(
    contractAddress,
    contractData.abi,
    signer
  );

  const messageHash = await contract.getMessageHash(
    signerAddress,
    name,
    phoneNumber
  );
  console.log("Message Hash from Contract:", messageHash);

  // Sign the Hash from the Contract
  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );
  console.log("Signed Message:", signature);

  try {
    // end Transaction to Smart Contract
    const tx = await contract.storeData(
      signerAddress,
      name,
      phoneNumber,
      signature
    );
    showNotification(
      {
        textContent: "transaction Sent",
        address: formatHash(tx.hash),
        type: "Success",
      },
      2000
    );
    console.log("Transaction sent:", tx.hash);

    // Wait for confirmation
    await tx.wait();

    showNotification(
      {
        textContent: "transaction confirmed",
        address: formatHash(tx.hash),
        type: "Success",
      },
      2000
    );
    console.log("Transaction confirmed:", tx.hash);

    const filter = contract.filters.UserDataStored();
    const events = await contract.queryFilter(filter, 0, "latest");

    events.forEach((event) => {
      console.log(
        `Signer: ${event.args.signer}, Name: ${event.args.name}, Phone: ${event.args.phoneNumber}`
      );
    });
  } catch (error) {
    showNotification(
      {
        textContent: "transaction failed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.error("Error sending transaction:", error);
  }
}

//same as above.. but gas is payed by the relayer server
async function gasLessSignAndSendTransaction() {
  const name = document.getElementById("name").value;
  const phoneNumber = document.getElementById("phone").value;

  if (!window.ethereum) {
    showNotification(
      {
        textContent: "MetaMask not Installed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.error("MetaMask not found!");
    return;
  }

  const contractData = await loadContract();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();

  const contract = new ethers.Contract(
    contractAddress,
    contractData.abi,
    signer
  );

  const messageHash = await contract.getMessageHash(
    signerAddress,
    name,
    phoneNumber
  );
  console.log("Message Hash from Contract:", messageHash);

  // Sign the Hash from the Contract
  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );
  console.log("Signed Message:", signature);

  try {
    const response = await fetch("http://localhost:3000/relay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signer: signerAddress,
        name: name,
        phoneNumber: phoneNumber,
        signature: signature,
      }),
    });

    const responseData = await response.json();
    console.log(responseData);
    showNotification(
      {
        textContent: "transaction confirmed",
        address: formatHash(responseData.txHash),
        type: "success",
      },
      2000
    );
    const filter = contract.filters.UserDataStored();
    const events = await contract.queryFilter(filter, 0, "latest");
    console.log(events);
    events.forEach((event) => {
      console.log(
        `Signer: ${event.args.signer}, Name: ${event.args.name}, Phone: ${event.args.phoneNumber}`
      );
    });

    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    renderBlocks(events);
  } catch (error) {
    showNotification(
      {
        textContent: "transaction failed",
        address: "None",
        type: "error",
      },
      2500
    );
    console.error("Error sending transaction:", error);
  }
}
