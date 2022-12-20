import { ethers } from "ethers";

const myMnemonic = "YOUR MNEMONIC HERE"

const wallet = ethers.Wallet.fromMnemonic(myMnemonic)

console.log(wallet.privateKey)