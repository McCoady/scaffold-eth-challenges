const dexAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token_addr",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [

        ],
        "name": "EtherTransferError",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_liquidityAvailalbe",
                "type": "uint256"
            }
        ],
        "name": "InsufficientLiquidityError",
        "type": "error"
    },
    {
        "inputs": [

        ],
        "name": "TokenTransferError",
        "type": "error"
    },
    {
        "inputs": [

        ],
        "name": "ZeroQuantityError",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "_tradeDirection",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_ethSwapped",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_tokensReceived",
                "type": "uint256"
            }
        ],
        "name": "EthToTokenSwap",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_liquidityMinted",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_ethAdded",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_tokensAdded",
                "type": "uint256"
            }
        ],
        "name": "LiquidityProvided",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_liquidityAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_ethAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "LiquidityRemoved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "_tradeDirection",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_tokensSwapped",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_ethReceived",
                "type": "uint256"
            }
        ],
        "name": "TokenToEthSwap",
        "type": "event"
    },
    {
        "inputs": [

        ],
        "name": "deposit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "tokensDeposited",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [

        ],
        "name": "ethToToken",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "tokenOutput",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lp",
                "type": "address"
            }
        ],
        "name": "getLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokens",
                "type": "uint256"
            }
        ],
        "name": "init",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "liquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "xInput",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "xReserves",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "yReserves",
                "type": "uint256"
            }
        ],
        "name": "price",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "yOutput",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenInput",
                "type": "uint256"
            }
        ],
        "name": "tokenToEth",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ethOutput",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [

        ],
        "name": "totalLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ethAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

export { dexAbi }