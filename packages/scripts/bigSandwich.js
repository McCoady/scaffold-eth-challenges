import { BigNumber, ethers } from "ethers";
import { dexAddress, balloonAddress, getSigner } from "./utils.js";
import { dexAbi } from "./abi/dexAbi.js";
import { balloonAbi } from "./abi/balloonsAbi.js";
import "dotenv/config";

// Function Signatures for the functions we care about
const ethToTokenSig = "0x789770f4";
const tokenToEthSig = "0x70b2a30f";

// Create a signer and a provider
const goerliSigner = getSigner();
const provider = new ethers.providers.WebSocketProvider(`wss://eth-goerli.g.alchemy.com/v2/${process.env.MY_ALCHEMY_KEY}`)

// Set up instances of both contracts
const dexContract = new ethers.Contract(
    dexAddress,
    dexAbi,
    goerliSigner
)

const balloonContract = new ethers.Contract(
    balloonAddress,
    balloonAbi,
    goerliSigner
)

const signerEthToSend = BigNumber.from(await goerliSigner.getBalance()).div(BigNumber.from(10)).mul(BigNumber.from(7));
const signerBalloonBalance = BigNumber.from(await balloonContract.balanceOf(goerliSigner.address)).div(BigNumber.from(100000));

console.log("Signer Eth To Use", ethers.utils.formatEther(signerEthToSend))
console.log("Signer Balloons to Use", ethers.utils.formatEther(signerBalloonBalance))
// Use provider to search for all "pending" mempool transactions
provider.on("pending", async (tx) => {
    // Save each tx object

    const txInfo = await provider.getTransaction(tx);
    // Skip null transactions
    if (txInfo != null) {

        // Search for only transactions to the dex address & NOT from ourselves (or end up with an infinite loop sandwiching yourself)
        if (txInfo.to == dexAddress && txInfo.from != goerliSigner.address) {
            console.log("TRANSACTION FOUND")
            // If the data in the transaction matches the function signature of "ethToToken", then we have a match!
            if (txInfo.data == ethToTokenSig) {
                console.log(txInfo)

                // Prepare gas fees
                // txOne should be slightly more gas than the 'sandwiched' transaction, so it goes ahead of it
                const maxPrio = txInfo.maxPriorityFeePerGas.add(1000);

                // txTwo should be slightly less gas than the 'sandwiched' transaction, so it goes behind it
                const slowPrio = ethers.utils.formatEther(txInfo.maxPriorityFeePerGas.sub(1000));

                // Prepare override info for function with arguments
                const slowOverrides = {
                    maxPriorityFeePerGas: slowPrio
                };

                // Work out how many tokens you'll end up buying (because you need to know how many to sell after)
                const tokensBought = await dexContract.price(
                    signerEthToSend,
                    provider.getBalance(dexAddress),
                    balloonContract.balanceOf(dexAddress)
                )
                console.log(ethers.utils.formatEther(tokensBought))

                // txOne is a copy of the 'sandwiched' transaction, but with slightly more maxFeePerGas & maxPriorityFeePerGas
                const txOne = await dexContract.ethToToken({
                    value: signerEthToSend,
                    maxPriorityFeePerGas: maxPrio
                })

                // Confirm txOne was built without error
                console.log("txOne okay", txOne)

                console.log(slowPrio)

                // txTwo sells the- tokensBought immediately after the 'sandwiched' transaction
                const txTwo = await dexContract.tokenToEth(BigNumber.from(tokensBought, slowOverrides))

                // Confirm txTwo was built without error
                console.log("txTwo okay", txTwo)
                // Else if the first 10 digits of the data (0x + 4 bytes) matches the tokenToEth function signature
            } else if (txInfo.data.slice(0, 10) == tokenToEthSig) {
                // the rest of the data should be the value of the tokens argument 

                // Work out gas fees & overrides again
                const maxPrio = ethers.utils.formatEther(txInfo.maxPriorityFeePerGas) * 10 ** 18 + 1000;

                const slowPrio = ethers.utils.formatEther(txInfo.maxPriorityFeePerGas) * 10 ** 18 - 1000;

                const fastOverrides = {
                    maxPriorityFeePerGas: maxPrio
                };

                // Work out how much eth you're going to get, so you can sell it again later
                const ethReceived = await dexContract.price(
                    signerBalloonBalance,
                    balloonContract.balanceOf(dexAddress),
                    provider.getBalance(dexAddress)

                )
                console.log(ethers.utils.formatEther(ethReceived))

                // txOne is a copy of the 'sandwiched' transaction, but with slightly more maxFeePerGas & maxPriorityFeePerGas
                const txOne = await dexContract.tokenToEth(
                    signerBalloonBalance, fastOverrides
                )
                console.log("txOne okay", txOne)

                // txTwo sells the tokensBought immediately after the 'sandwiched' transaction
                const txTwo = await dexContract.ethToToken({
                    value: ethReceived,
                    maxPriorityFeePerGas: slowPrio
                })
                console.log("txTwo okay", txTwo)

                // Split txInfo.data into two parts (sig & value)
                // match part one above, part two is number of tokens to buy
            }
            // Else not a transaction we care about
        } else {
            console.log("NOT WANTED")
        }
        // Null tx
    } else {
        console.log("NULL")
    }


})