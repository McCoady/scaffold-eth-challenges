import { ethers } from "ethers";
import { dexAddress, balloonAddress, getSigner } from "./utils.js";
import { balloonAbi } from "./abi/balloonsAbi.js";

// Create a signer for the transaction
const goerliSigner = getSigner();


// Set up an instance of the balloon contract
const balloonContract = new ethers.Contract(
    balloonAddress,
    balloonAbi,
    goerliSigner
)

// Set spend approval for the dex address to be MaxUnit256 so you only need to approve once.
const approveTx = await balloonContract.approve(dexAddress, ethers.constants.MaxUint256)

// Wait for confirmation
await approveTx.wait();
console.log("TX MINED");