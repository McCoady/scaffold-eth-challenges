// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Change from ETH-Token pair to Token-Token pair. Keep slippage (have optional advanced setting)

/**
 * @title Token-Token DEX
 * @author mctoady.eth
 * @notice A simple token to token DEX with built in slippage protection
 */
contract DEX {
    error InitError();

    error TokenTransferError(address _token);

    error ZeroQuantityError();

    error SlippageError();

    error InsufficientLiquidityError(uint256 _liquidityAvailable);

    /* ========== GLOBAL VARIABLES ========== */
    //outlines use of SafeMath for uint256 variables
    IERC20 tokenOne; //instantiates the imported contractOne
    IERC20 tokenTwo; //instantiates the imported contractTwo

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    /* ========== EVENTS ========== */

    /**
     * @notice Emitted when a swap is transacted
     */
    event TokenSwap(
        address _user,
        string _tradeDirection,
        uint256 _tokensSwapped,
        uint256 _tokensReceived
    );

    /**
     * @notice Emitted when liquidity provided to DEX and mints LPTs.
     */
    event LiquidityProvided(
        address _user,
        uint256 _liquidityMinted,
        uint256 _tokenOneAdded,
        uint256 _tokenTwoAdded
    );

    /**
     * @notice Emitted when liquidity removed from DEX and decreases LPT count within DEX.
     */
    event LiquidityRemoved(
        address _user,
        uint256 _liquidityAmount,
        uint256 _tokenOneAmount,
        uint256 _tokenTwoAmount
    );

    /* ========== CONSTRUCTOR ========== */

    constructor(address tokenOne_addr, address tokenTwo_addr) {
        tokenOne = IERC20(tokenOne_addr); //specifies the token address that will hook into the interface and be used through the variable 'token'
        tokenTwo = IERC20(tokenTwo_addr); //specifies the token address that will hook into the interface and be used through the variable 'token'
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice initializes amount of tokens that will be transferred to the DEX itself from the erc20 contract mintee (and only them based on how Balloons.sol is written). Loads contract up with both ETH and Balloons.
     * @param tokens amount to be transferred to DEX
     * @return totalLiquidity is the number of LPTs minting as a result of deposits made to DEX contract
     * NOTE: since ratio is 1:1, this is fine to initialize the totalLiquidity (wrt to balloons) as equal to eth balance of contract.
     */
    function init(uint256 tokens) public returns (uint256) {
        if (totalLiquidity != 0) revert InitError();

        totalLiquidity = tokens;

        liquidity[msg.sender] = totalLiquidity;

        // transfer balloons to the contract
        bool tokenOneTransferred = tokenOne.transferFrom(
            msg.sender,
            address(this),
            tokens
        );
        if (!tokenOneTransferred) revert TokenTransferError(address(tokenOne));

        // transfer rocks to the contract
        bool tokenTwoTransferred = tokenTwo.transferFrom(
            msg.sender,
            address(this),
            tokens
        );
        if (!tokenTwoTransferred) revert TokenTransferError(address(tokenTwo));

        return totalLiquidity;
    }

    /**
     * @notice returns yOutput, or yDelta for xInput (or xDelta)
     * @dev Follow along with the [original tutorial](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90) Price section for an understanding of the DEX's pricing model and for a price function to add to your contract. You may need to update the Solidity syntax (e.g. use + instead of .add, * instead of .mul, etc). Deploy when you are done.
     */
    function price(
        uint256 xInput,
        uint256 xReserves,
        uint256 yReserves
    ) public pure returns (uint256 yOutput) {
        uint256 xInputWithFee = xInput * 997;
        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = (xReserves * 1000) + xInputWithFee;
        return (numerator / denominator);
    }

    /**
     * @notice returns liquidity for a user. Note this is not needed typically due to the `liquidity()` mapping variable being public and having a getter as a result. This is left though as it is used within the front end code (App.jsx).
     * if you are using a mapping liquidity, then you can use `return liquidity[lp]` to get the liquidity for a user.
     *
     */
    function getLiquidity(address lp) public view returns (uint256) {
        return liquidity[lp];
    }

    /**
     * @notice sends tokenOne to DEX in exchange for tokenTwo
     */
    function balloonsToRocks(uint256 tokensIn, uint256 minTokensBack)
        public
        returns (uint256 tokenOutput)
    {
        if (tokensIn == 0) revert ZeroQuantityError();
        uint256 tokenOneReserve = tokenOne.balanceOf(address(this));
        uint256 tokenTwoReserve = tokenTwo.balanceOf(address(this));

        // Calculate how many tokens they'll receive
        tokenOutput = price(tokensIn, tokenOneReserve, tokenTwoReserve);
        // Check received tokens greater than their minimum accepted amount
        if (tokenOutput < minTokensBack) revert SlippageError();

        // transfer balloons from msg.sender to dex
        bool tokenOneTransferred = tokenOne.transferFrom(msg.sender,address(this), tokensIn);
        if (!tokenOneTransferred) revert TokenTransferError(address(tokenOne));

        // transfer rocks from dex to msg.sender
        bool tokenTwoTransferred = tokenTwo.transfer(msg.sender, tokenOutput);
        if (!tokenTwoTransferred) revert TokenTransferError(address(tokenTwo));

        emit TokenSwap(
            msg.sender,
            "balloons to rocks",
            tokensIn,
            tokenOutput
        );
    }

    /**
     * @notice sends tokenTwo to DEX in exchange for tokenOne
     */
    function rocksToBalloons(uint256 tokensIn, uint256 minTokensBack)
        public
        returns (uint256 tokenOutput)
    {
        if (tokensIn == 0) revert ZeroQuantityError();
        uint256 tokenTwoReserve = tokenTwo.balanceOf(address(this));
        uint256 tokenOneReserve = tokenOne.balanceOf(address(this));
        // Calculate how many tokens they'll receive
        tokenOutput = price(tokensIn, tokenTwoReserve, tokenOneReserve);
        // Check received tokens greater than their minimum accepted amount
        if (tokenOutput < minTokensBack) revert SlippageError();

        // transfer rocks from msg.sender to dex
        bool tokenTwoTransferred = tokenTwo.transferFrom(msg.sender,address(this), tokensIn);
        if (!tokenTwoTransferred) revert TokenTransferError(address(tokenTwo));

        // transfer balloons from dex to msg.sender
        bool tokenOneTransferred = tokenOne.transfer(msg.sender, tokenOutput);
        if (!tokenOneTransferred) revert TokenTransferError(address(tokenOne));

        emit TokenSwap(
            msg.sender,
            "rocks to balloons",
            tokensIn,
            tokenOutput
        );
    }

    /**
     * @notice allows deposits of $BAL and $ROCK to liquidity pool
     * NOTE: parameter is the number of $BAL referenced with this function call. That amount is used to determine the amount of $ROCKS needed as well and taken from the depositor.
     * NOTE: user has to make sure to give DEX approval to spend both their tokens on their behalf by calling approve function prior to this function call.
     * NOTE: Equal parts of both assets will be removed from the user's wallet with respect to the price outlined by the AMM.
     */
    function deposit(uint256 tokenOneDeposited) public returns (uint256 liquidityMinted) {
        if (tokenOneDeposited == 0) revert ZeroQuantityError();

        uint256 tokenOneReserve = tokenOne.balanceOf(address(this));
        uint256 tokenTwoReserve = tokenTwo.balanceOf(address(this));
        uint256 tokenTwoDeposited = (tokenOneDeposited * tokenOneReserve) / tokenTwoReserve;

        liquidityMinted = (tokenOneDeposited * totalLiquidity) / tokenOneReserve;
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += tokenOneDeposited;

        // transfer balloons to dex
        bool tokenOneTransferred = tokenOne.transferFrom(
            msg.sender,
            address(this),
            tokenOneDeposited
        );
        if (!tokenOneTransferred) revert TokenTransferError(address(tokenOne));

        // transfer rocks to dex
        bool tokenTwoTransferred = tokenTwo.transferFrom(
            msg.sender,
            address(this),
            tokenTwoDeposited
        );
        if (!tokenTwoTransferred) revert TokenTransferError(address(tokenTwo));


        emit LiquidityProvided(
            msg.sender,
            liquidityMinted,
            tokenOneDeposited,
            tokenTwoDeposited
        );
    }

    /**
     * @notice allows withdrawal of $BAL and $ROCK from liquidity pool
     * NOTE: with this current code, the msg caller could end up getting very little back if the liquidity is super low in the pool. I guess they could see that with the UI.
     */
    function withdraw(uint256 amount)
        public
        returns (uint256 tokenOneAmount, uint256 tokenTwoAmount)
    {
        if (liquidity[msg.sender] < amount)
            revert InsufficientLiquidityError(liquidity[msg.sender]);

        uint256 tokenOneReserve = tokenOne.balanceOf(address(this));
        uint256 tokenTwoReserve = tokenTwo.balanceOf(address(this));

        tokenOneAmount = (amount * tokenOneReserve) / totalLiquidity;
        tokenTwoAmount = (amount * tokenTwoReserve) / totalLiquidity;

        // update liquidity amounts for owner
        liquidity[msg.sender] -= amount;
        // update liquidity amounts of dex
        totalLiquidity -= amount;

        // Send balloons from dex to msg.sender
        bool tokenOneSent = tokenOne.transfer(msg.sender, tokenOneAmount);
        if (!tokenOneSent) revert TokenTransferError(address(tokenOne));
        // Send rocks from dex to msg.sender
        bool tokenTwoSent = tokenTwo.transfer(msg.sender, tokenTwoAmount);
        if (!tokenTwoSent) revert TokenTransferError(address(tokenTwo));

        emit LiquidityRemoved(msg.sender, amount, tokenOneAmount, tokenTwoAmount);
    }
}
