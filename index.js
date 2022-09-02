import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("getBalance");
const withdrawButton = document.getElementById("withdrawButton");
const ethAmountButton = document.getElementById("ethAmount");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("I see a metamask");
    try {
      const stat = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (err) {
      console.log(err);
    }
    console.log("Account connected...");
    connectButton.innerHTML = "connected!";
    connectButton.disabled = true;
  } else {
    console.log("no metamask found");
    connectButton.innerHTML = "Please install metamask!";
  }
}
async function fund() {
  const ethAmount = ethAmountButton.value;
  console.log(`Funding ${ethAmount}`);
  if (typeof window.ethereum !== "undefined") {
    // web3provider is similiar to JsonRpcProvider we used in node
    // wraps around the ethereum object to give us connection to the blockchain

    // connection
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Signers
    const signer = provider.getSigner();

    // contract
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen for the tx to be mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");

      // listen for an event
    } catch (err) {
      console.log(err);
    }
    // console.log(transactionResponse);
  }
}
async function getBalance() {
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`${ethers.utils.formatEther(balance.toString())} ETH`);
  }
}
async function withdraw() {
  if (window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signers = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signers);

    const transactionResponse = await contract.withdraw();
    await listenForTransactionMine(transactionResponse, provider);
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  // listen for the transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionRecipt) => {
      console.log(
        `Completed with ${transactionRecipt.confirmations} confirmation`
      );
      resolve();
    });
  });
}
