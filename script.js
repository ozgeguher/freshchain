let provider;
let signer;
let contract;

/* ====== CONFIG ====== */

const CONTRACT_ADDRESS = "0x7C48367b70fE982c0eA157A8A338F566782e0041";

const ABI = [
  {
    "inputs":[
      {"internalType":"uint256","name":"batchId","type":"uint256"},
      {"internalType":"int256","name":"temperature","type":"int256"},
      {"internalType":"int256","name":"humidity","type":"int256"},
      {"internalType":"string","name":"location","type":"string"}
    ],
    "name":"addSensorData",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[
      {"internalType":"uint256","name":"batchId","type":"uint256"},
      {"internalType":"string","name":"productName","type":"string"},
      {"internalType":"uint256","name":"quantity","type":"uint256"}
    ],
    "name":"createBatch",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[
      {"internalType":"uint256","name":"batchId","type":"uint256"},
      {"internalType":"bool","name":"passedInspection","type":"bool"}
    ],
    "name":"markAsArrived",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"}],
    "name":"getBatchLog",
    "outputs":[
      {"type":"uint256"},
      {"type":"string"},
      {"type":"uint256"},
      {"type":"address"},
      {"type":"bool"},
      {"type":"bool"},
      {
        "components":[
          {"name":"temperature","type":"int256"},
          {"name":"humidity","type":"int256"},
          {"name":"location","type":"string"},
          {"name":"timestamp","type":"uint256"}
        ],
        "type":"tuple[]"
      }
    ],
    "stateMutability":"view",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"a","type":"address"}],
    "name":"registerProducer",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"a","type":"address"}],
    "name":"registerTransporter",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"a","type":"address"}],
    "name":"registerDistributor",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"a","type":"address"}],
    "name":"registerRetailer",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  }
];

/* ====== CONNECT WALLET ====== */

async function connectWallet(){
  if(!window.ethereum){
    alert("MetaMask not installed");
    return;
  }

  await window.ethereum.request({ method:"eth_requestAccounts" });

  // 🔴 UMD BUILD İÇİN DOĞRUSU
  provider = new ethers.ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  if(network.chainId !== 11155111){
    alert("Please switch MetaMask to Sepolia network");
    return;
  }

  signer = provider.getSigner();
  const address = await signer.getAddress();

  contract = new ethers.ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    signer
  );

  document.getElementById("wallet").innerText =
    "Wallet: " + address;
}

/* ====== GUARD ====== */

function checkWallet(){
  if(!contract){
    alert("Please connect MetaMask first");
    return false;
  }
  return true;
}

/* ====== ADMIN ====== */

async function registerProducer(){
  if(!checkWallet()) return;
  const tx = await contract.registerProducer(roleAddress.value);
  await tx.wait();
  alert("Producer registered");
}

async function registerTransporter(){
  if(!checkWallet()) return;
  const tx = await contract.registerTransporter(roleAddress.value);
  await tx.wait();
}

async function registerDistributor(){
  if(!checkWallet()) return;
  const tx = await contract.registerDistributor(roleAddress.value);
  await tx.wait();
}

async function registerRetailer(){
  if(!checkWallet()) return;
  const tx = await contract.registerRetailer(roleAddress.value);
  await tx.wait();
}

/* ====== PRODUCER ====== */

async function createBatch(){
  console.log("Create Batch clicked");

  if(!checkWallet()) return;

  const tx = await contract.createBatch(
    batchId.value,
    productName.value,
    quantity.value
  );

  // 🔥 BURADA METAMASK AÇILIR
  await tx.wait();
  alert("Batch created successfully");
}

/* ====== TRANSPORTER ====== */

async function addSensor(){
  if(!checkWallet()) return;

  const tx = await contract.addSensorData(
    sBatchId.value,
    temp.value,
    hum.value,
    loc.value
  );
  await tx.wait();
}

/* ====== RETAILER ====== */

async function markArrived(){
  if(!checkWallet()) return;

  const tx = await contract.markAsArrived(
    rBatchId.value,
    inspection.value === "true"
  );
  await tx.wait();
}

/* ====== CUSTOMER ====== */

async function viewBatch(){
  let readContract = contract;

  if(!contract){
    provider = new ethers.ethers.providers.Web3Provider(window.ethereum);
    readContract = new ethers.ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );
  }

  const d = await readContract.getBatchLog(vBatchId.value);
  output.innerText = JSON.stringify(d, null, 2);
}

/* ====== QR AUTO LOAD (READ ONLY) ====== */

window.addEventListener("load", async ()=>{
  const params = new URLSearchParams(window.location.search);
  const bid = params.get("batchId");

  if(bid){
    provider = new ethers.ethers.providers.Web3Provider(window.ethereum);
    const readOnly = new ethers.ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );
    const d = await readOnly.getBatchLog(bid);
    output.innerText = JSON.stringify(d, null, 2);
  }
});
