# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 **Challenge 4: Minimum Viable Exchange (WITH SLIPPAGE PROTECTION**

This repo builds on the [Speed Run Ethereum Challenge 4: Minimum Viable Exchange](https://speedrunethereum.com/)[GitHub Repo](https://github.com/scaffold-eth/scaffold-eth-challenges/tree/challenge-4-dex) and adds Minimum Viable Slippage Protection to the dex. This repo assumes you've already completed the previously mentioned challenge. 

To add slippage protection, both the `tokensToEth` and `EthToTokens` functions add `minEthBack` and `minTokensBack` arguments respectively. The front end is then responsible for calculating 1% slippage from the current price and adding it to the transaction without the user having to worry about it. Then when the function it called the price is rechecked onchain to make sure that `price` will return at least `minTokensBack`/`minEthBack`, otherwise it reverts if there's been too much slippage.

---

### ** Checkpoint 0: 📦 install 📚**

Pull down the appropriate challenge repo/branch to get started.

```bash
git clone https://github.com/McCoady/scaffold-eth-challenges challenge-4-dex-w-slippage
cd challenge-4-dex
git checkout challenge-4-dex-w-slippage
yarn install
```

---

### ** 🔭 Environment 📺**

You'll have three terminals up for:

`yarn start` (react app frontend)

`yarn chain` (hardhat backend)

`yarn deploy` (to compile, deploy, and publish your contracts to the frontend)


### ** 🥼 Possible Improvements **

- Adding an 'advanced' option which gives the user the ability to select their own accepted slippage percentage.
- Better UI to show interested users whats going on under the hood (currently just console.log's current `price` and `minTokensBack` calculated on the front end.
