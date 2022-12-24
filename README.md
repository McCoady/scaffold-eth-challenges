# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 **Hacking the Minimum Viable Exchange**

This code will walk you through how the Challenge 4: Minimum Viable Exchange could be [sandwich attacked](https://ethresear.ch/t/improving-front-running-resistance-of-x-y-k-market-makers/1281) by exploiters.  I recommend you work through Scaffold eth challenges [Challenge 4](https://github.com/scaffold-eth/scaffold-eth-challenges/tree/challenge-4-dex) prior to this as this includes code solutions for that challenge to use as our exploitable dex. To go through this yourself I recommend you setting up an [alchemy account](https://www.alchemy.com/) for use of their websockets endpoints to access pending mempool transactions.

### 🔬 **What you'll learn**

- Strengthen your ethers.js script writing skills
- How to read pending mempool transactions before they make it onto blocks.
- Improve your understanding of sandwich attacks, one of the more common defi exploits 

### **⛳️ Checkpoint 0: 📦 install 📚**

Pull down the appropriate challenge repo/branch to get started.

> ❗️ NOTE: The current front-end may need to be refreshed as you carry out transactions to update your balance of balloons in the UI, etc.

```bash
git clone https://github.com/McCoady/scaffold-eth-challenges sandwich-attack-script
cd sandwich-attack-script
git checkout dex-sandwich-attack-script
yarn install
```

---

### ⛳️ **Checkpoint 1: 🔭 Environment 📺**

Open a terminal and run:

`yarn start` (react app frontend)

You'll need this project running on a testnet to make use of the mempool, so head to `./packages/hardhat/hardhatconfig.js` and change the `defaultNetwork` and the `initialNetwork` in  `./packages/react-app/src/App.jsx` to the network of your choosing (by default it is set to Goerli).

After that's done you're going to need to deploy the `Balloons.sol` and `DEX.sol` contracts. 

First we need a burner address to deploy from.
`yarn generate` will create you a fresh private key
`yarn account` will show you your generated address and balances on various networks.

Next you'll need to send this address some ether to deploy and initialise the dex with some eth and balloons. I recommend sending the address around 0.2eth to be safe. 
Then when you're ready to deploy your contracts.

`yarn deploy` (to compile, deploy, and publish your contracts to the frontend)

Your dex should now be set up and your deployer address has some baloons and some eth to play with for our sandwich attacks.

### ⛳️ **Checkpoint 2: Preparing Your Script** 👨‍🔬

In the `scripts` package you'll find everything we need to run out sandwich attack script. An abi folder which contains the abi for both the balloons and dex contracts. `utils.js` includes functions to make it easier for us generate providers & signers as well as where we will store our contract addresses. On lines 4 & 5 change the `dexAddress` & `balloonAddress` variables to the addresses of your deployed contracts.

To get the private key of your deployer address run 

```
cd packages/scripts
node getPrivateKey.js
```

Next head to `.example.env` and change it to `.env` and enter the private key of your deployer address & your alchemy api key.

Then you should be able to run
`cd packages/scripts`
`node approveToken.js` This will set max balloons spend approval for the dex contract from the deployer address so you won't have to worry again about approvals.

Now we're ready to get into the script itself.


### ⛳️ **Checkpoint 3: Accessing the mempool** 🔎

Jump into the regularSandwich.js script in this folder. First we save the function selectors for the dex contracts ethToToken & tokenToEth functions. For more info on function selectors [here](https://solidity-by-example.org/function-selector/). 

Then we create a signer and provider for our script to work with and create instances of both of our contracts with ethers.

```
provider.on("pending", async (tx) => {
    const txInfo = await provider.getTransaction(tx)
})
``` 
This will get you information on every transaction as it enters the mempool. 
If you wish to see this in action you can comment out the proceeding code and replace it with `console.log(txInfo)` and your terminal will print out all the info for every transaction as it enters the mempool.


### ⛳️ **Checkpoint 4: Finding Relevant Transactions** 👀

First we want to make sure the txInfo received isn't null, as this could cause our script to crash. After that we want to filter down to only transactions where the `to` address is our dex address. We also want to make sure the `from` address isn't our address, as this could cause us to try to sandwich attack ourselves when the script is running later.

Then we want to filter even further to only get transactions calling either the `ethToToken` or `tokenTokEth` functions.

When we find a transaction that matches we want to prepare two transactions, one with a little more gas than the target transaction (so it goes ahead of it in the block) and one with a little less gas than the target transaction (so it goes behind it in the block). The comments in `regularSandwich.js` explain how we do this with more detail.

Then we need to work out how much eth or tokens we're going to be buying in transaction one, so we can sell the same amount on the other side.

Once we've worked this out we can build two transactions. txOne copies the target transaction and just adds a little gas, to make sure it goes ahead of it in the block. Then txTwo sells the tokens or ether bought in txOne after the target transaction. This means that as the price gets moved in one direction by txOne and the target transaction, txTwo sells into that price movement making small (or larger depending on the value of the target transaction) profit on every swap sent to the dex contract.

See the comments in `regularSandwich.js` for more detail on how it's working.

### ⛳️ **Checkpoint 5: Test It Yourself** 🤙

When you're ready to test, call `node regularSandwich.js` from the terminal to start viewing the mempool, then in the scaffold eth browser UI prepare a 'target transaction', to trade a little eth or tokens. Once submitted our script should see and attack this transaction as explained above!

---

### ⛳️ **Improvement Ideas** 🥼

A few things that could be worked on to optimise this script.

- Running your own node, this would pick up mempool transactions quicker than using a third party api, and also avoid you running into rate limit isses.

- Optimising trades, could make more profits on the attacks with different prices, or by adding a second dex to load up on size to sell into the target transactions slippage? **Added bigSandwich.js that attacks with larger size, for more profitable sandwiches**

