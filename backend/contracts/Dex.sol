//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;
import "./ERC20.sol";
import "./SafeMath.sol";

contract Dex {
    using SafeMath for uint256;

    struct Order {
        uint256 amount;
        address owner;
        uint256 higherPriority; // TODO is this a linked list ??
        uint256 lowerPriority; // TODO is this a linked list ?? where instantiate 
    }

    struct OrderBook {
        uint256 higherPrice; // TODO 
        uint256 lowerPrice; // TODO
        mapping(uint256 => Order) orders; // what the key be
        uint256 highestPriority; // lowest number/value
        uint256 lowestPriority; // highest number/value
        uint256 numOfOrders;
    }

    struct Token {
        address tokenContract;
        mapping(uint256 => OrderBook) buyOrderBook; // key is price
        uint256 maxBuyPrice;
        uint256 minBuyPrice;
        uint256 numOfBuyPrices; // TODO
        mapping(uint256 => OrderBook) sellOrderBook; // key is price
        uint256 minSellPrice;
        uint256 maxSellPrice;
        uint256 numOfSellPrices; // TODO
    }

    mapping(address => Token) tokenList; 

    mapping(address => uint256) etherBalanceOfAddress;

    mapping(address => string[]) tokensInAddress;

    event BuyMarketResult(bool fulfilled, bool insufficientEth, bool insufficientOrder);

    event SellMarketResult(bool fulfilled, bool insufficientToken, bool insufficientOrder);

    // eg WETH to GOLD
    function buyTokenMarket(address _baseToken, address _token, uint256 _amount) public returns (bool[] memory) {
        Token storage loadedToken = tokenList[_token];
        uint256 remainingAmount = _amount; // order volume
        uint256 buyPrice = loadedToken.minSellPrice;
        uint256 etherAmount = 0;
        uint256 offerPointer;

        bool[] memory feedback = new bool[](3);
        feedback[0] = false; // fulfilled
        feedback[1] = false; // insufficient eth
        feedback[2] = false; // insufficient sell orders

        ERC20 baseToken = ERC20(_baseToken); // WETH
        ERC20 token = ERC20(_token); // new token

        while (remainingAmount > 0 && !feedback[1] && !feedback[2]) { // while sufficient eth and sell orders
            if (buyPrice == 0){
                feedback[2] = true; // insufficient sell orders
                break;
            }
            offerPointer = loadedToken.sellOrderBook[buyPrice].highestPriority; // TODO
            while (
                offerPointer <= loadedToken.sellOrderBook[buyPrice].lowestPriority &&
                remainingAmount > 0 &&  // while there is still volume to clear
                !feedback[1] && !feedback[2] // while sufficient eth and sell orders
            ) {
                uint256 volumeAtPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount;

                if (volumeAtPointer <= remainingAmount) { // if current offer's volume <= order's volume
                    etherAmount = (volumeAtPointer.mul(buyPrice)).div(1e18);

                    if (getTokenBalance(msg.sender, _baseToken) >= etherAmount) { // sufficient ether
                        approveAndExchangeBuy(baseToken, token, etherAmount, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, volumeAtPointer);
                        
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = 0;

                        loadedToken.sellOrderBook[buyPrice].highestPriority = loadedToken.sellOrderBook[buyPrice] // Reassign LL pointer
                                                                                        .orders[offerPointer].lowerPriority; 

                        remainingAmount = remainingAmount.sub(volumeAtPointer);
                    } else {
                        feedback[1] = true; // insufficient ether
                    }
                } else { // current offer's volume > order's volume
                    etherAmount = (remainingAmount.mul(buyPrice)).div(1e18);
                    if (getTokenBalance(msg.sender, _baseToken) >= etherAmount) { // sufficient ether
                        approveAndExchangeBuy(baseToken, token, etherAmount, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, volumeAtPointer);
                        // remove the volume bought from the offer
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount.sub(remainingAmount);
                        remainingAmount = 0;
                    } else {
                        feedback[1] = true; // insufficient ether 
                    }
                }
                if (!feedback[1] && // sufficient ether
                    offerPointer == loadedToken.sellOrderBook[buyPrice].lowestPriority && // no more orders
                    loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount == 0) { // this current sell order has no volume alr
                    loadedToken.numOfSellPrices = loadedToken.numOfSellPrices.sub(1); 
                    loadedToken.sellOrderBook[buyPrice].numOfOrders = 0; // basically some post processing
                    if (buyPrice == loadedToken.sellOrderBook[buyPrice].higherPrice) { // highest price in sell order book, ie orderbook empty
                        loadedToken.sellOrderBook[buyPrice].higherPrice = 0;
                        loadedToken.sellOrderBook[buyPrice].lowerPrice = 0;
                        loadedToken.numOfSellPrices = 0;
                        loadedToken.maxSellPrice = 0;
                        loadedToken.minSellPrice = 0;
                    } else {
                        uint currBuyPriceHigherPrice = loadedToken.sellOrderBook[buyPrice].higherPrice;
                        loadedToken.minSellPrice = currBuyPriceHigherPrice;
                        loadedToken.sellOrderBook[currBuyPriceHigherPrice].lowerPrice = 0;
                    }
                    break;
                }
                offerPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].lowerPriority; // go to the next in line 
            }
            buyPrice = loadedToken.minSellPrice;
        } 
        if (remainingAmount == 0) {
            feedback[0] = true; // order fulfilled
        }
        emit BuyMarketResult(feedback[0], feedback[1], feedback[2]);
        return feedback;
    }

    function sellTokenMarket(address _baseToken, address _token, uint256 _amount) public returns (bool[] memory) {
        Token storage loadedToken = tokenList[_token];
        uint256 remainingAmount = _amount; // order volume
        uint256 sellPrice = loadedToken.maxBuyPrice;
        uint256 etherAmount = 0;
        uint256 offerPointer;

        bool[] memory feedback = new bool[](3);
        feedback[0] = false; // fulfilled
        feedback[1] = false; // insufficient eth
        feedback[2] = false; // insufficient buy orders

        ERC20 baseToken = ERC20(_baseToken); // new token
        ERC20 token = ERC20(_token); // WETH

        while (remainingAmount > 0 && !feedback[1] && !feedback[2]) { // while sufficient eth and buy orders
            if (sellPrice == 0){
                feedback[2] = true; // insufficient buy orders
                break;
            }
            offerPointer = loadedToken.buyOrderBook[sellPrice].highestPriority;
            while (
                offerPointer <= loadedToken.buyOrderBook[sellPrice].lowestPriority &&
                remainingAmount > 0 &&
                !feedback[1] // sufficient eth
            ) {
                uint volumeAtPointer = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount;
                if (volumeAtPointer <= remainingAmount) { // if current offer's volumne is <= order's volume
                    if (getTokenBalance(msg.sender, _token) >= volumeAtPointer) {
                        etherAmount = (volumeAtPointer.mul(sellPrice)).div(1e18);
                        approveAndExchangeSell(token, baseToken, volumeAtPointer, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, etherAmount);
                        
                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = 0;

                        loadedToken.buyOrderBook[sellPrice].highestPriority = loadedToken.buyOrderBook[sellPrice]
                                                                                        .orders[offerPointer]
                                                                                        .lowerPriority;
                        
                        remainingAmount = remainingAmount.sub(volumeAtPointer);
                    } else {
                        feedback[1] = true; // insufficient eth
                    }
                } else { // current offer's volume is more than enough
                    if ((volumeAtPointer.sub(remainingAmount) > 0) && (getTokenBalance(msg.sender, _token) >= remainingAmount)) {
                        etherAmount = (remainingAmount.mul(sellPrice)).div(1e18);
                        approveAndExchangeSell(token, baseToken, volumeAtPointer, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, etherAmount);
                        
                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = loadedToken.buyOrderBook[sellPrice]
                                                                                                    .orders[offerPointer]
                                                                                                    .amount.sub(remainingAmount);
                        
                        remainingAmount = 0;
                    }
                }

                if (!feedback[1] &&
                    offerPointer == loadedToken.buyOrderBook[sellPrice].lowestPriority &&
                    loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount == 0) {
                    loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices.sub(1);
                    loadedToken.buyOrderBook[sellPrice].numOfOrders = 0;
                    if (loadedToken.buyOrderBook[sellPrice].lowerPrice == 0) {
                        loadedToken.buyOrderBook[sellPrice].higherPrice = 0;
                        loadedToken.buyOrderBook[sellPrice].lowerPrice = 0;
                        loadedToken.numOfBuyPrices = 0;
                        loadedToken.minBuyPrice = 0;
                        loadedToken.maxBuyPrice = 0;
                    } else {
                        uint buyOrderBookLowerPrice = loadedToken.buyOrderBook[sellPrice].lowerPrice;
                        loadedToken.maxBuyPrice = buyOrderBookLowerPrice;
                        loadedToken.buyOrderBook[buyOrderBookLowerPrice].higherPrice = loadedToken.maxBuyPrice;
                    }
                    break;
                }
                offerPointer = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].lowerPriority;
            } 
            sellPrice = loadedToken.maxBuyPrice;
        }
        if (remainingAmount == 0) {
            feedback[0] = true; // order fulfilled
        }
        emit SellMarketResult(feedback[0], feedback[1], feedback[2]);
        return feedback;
    }

    function buyTokenLimit(address _baseToken, address _token, uint256 _price, uint256 _amount) public returns (bool) {
        emit SellMarketResult(true, true, true);
        Token storage loadedToken = tokenList[_token];

        require(getTokenBalance(msg.sender, _baseToken) >= ((_price.mul(_amount)).div(1e18)), 
                                "buyTokenLimit: WETH balance is less than ETH required");

        if (loadedToken.numOfSellPrices == 0 || loadedToken.minSellPrice > _price) { // no available/suitable sell orders
            emit BuyMarketResult(true, true, true);
            storeBuyOrder(_token, _price, _amount, msg.sender);
            emit SellMarketResult(false, false, true);
        } else {
            emit BuyMarketResult(false, false, false);
            ERC20 baseToken = ERC20(_baseToken); // WETH Token
            ERC20 token = ERC20(_token); // New token

            uint256 etherAmount = 0;
            uint256 remainingAmount = _amount;
            uint256 buyPrice = loadedToken.minSellPrice;
            uint256 offerPointer;

            while (buyPrice != 0 && buyPrice <= _price && remainingAmount > 0) {
                // lowest selling price is lower than this current buy price, and still has volume to fill
                offerPointer = loadedToken.sellOrderBook[buyPrice].highestPriority;
                while (offerPointer<=loadedToken.sellOrderBook[buyPrice].lowestPriority && 
                        remainingAmount > 0) {
                    uint256 volumeAtPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount;
                    if (volumeAtPointer <= remainingAmount) {
                        etherAmount = (volumeAtPointer.mul(buyPrice)).div(1e18);
                        require(getTokenBalance(msg.sender, _baseToken) >= etherAmount, 
                                                "buyTokenLimit: WETH balance is less than ETH required");

                        exchangeTokens(baseToken, token, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, 
                                        etherAmount, volumeAtPointer);

                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = 0;

                        loadedToken.sellOrderBook[buyPrice].highestPriority = loadedToken.sellOrderBook[buyPrice]
                                                                                        .orders[offerPointer]
                                                                                        .lowerPriority;
                        remainingAmount = remainingAmount.sub(volumeAtPointer);
                    } else {
                        require(loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount > remainingAmount,
                                "buyTokenLimit: Current offer's amount < remaining amount");
                        etherAmount = (remainingAmount.mul(buyPrice)).div(1e18);

                        exchangeTokens(baseToken, token, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, 
                                        etherAmount, volumeAtPointer);
                        
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = loadedToken.sellOrderBook[buyPrice]
                                                                                                    .orders[offerPointer]
                                                                                                    .amount.sub(remainingAmount);
                        
                        remainingAmount = 0;
                    }

                    if (offerPointer == loadedToken.sellOrderBook[buyPrice].lowestPriority && 
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount == 0) {
                        loadedToken.numOfSellPrices = loadedToken.numOfSellPrices.sub(1);
                        loadedToken.sellOrderBook[buyPrice].numOfOrders = 0;

                        if (buyPrice == loadedToken.sellOrderBook[buyPrice].higherPrice ||
                            loadedToken.sellOrderBook[buyPrice].higherPrice == 0 ) {
                            loadedToken.sellOrderBook[buyPrice].higherPrice = 0;
                            loadedToken.sellOrderBook[buyPrice].lowerPrice = 0;
                            loadedToken.numOfSellPrices = 0;
                            loadedToken.maxSellPrice = 0;
                            loadedToken.minSellPrice = 0;
                        } else {
                            uint currBuyPriceHigherPrice = loadedToken.sellOrderBook[buyPrice].higherPrice;
                            loadedToken.minSellPrice = currBuyPriceHigherPrice;
                            loadedToken.sellOrderBook[currBuyPriceHigherPrice].lowerPrice = 0;
                        }
                        break;
                    }
                    offerPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].lowerPriority;
                }
                buyPrice = loadedToken.minSellPrice;
            }
            if (remainingAmount > 0) {
                buyTokenLimit(_baseToken, _token, _price, remainingAmount);
            }
        }
        return true;
    }

    function storeBuyOrder(
        address _token,
        uint256 _price,
        uint256 _amount,
        address _maker
    ) private {
        tokenList[_token].buyOrderBook[_price].numOfOrders = tokenList[_token]
            .buyOrderBook[_price]
            .numOfOrders
            .add(1);

        if (tokenList[_token].buyOrderBook[_price].numOfOrders == 1) {
            tokenList[_token].buyOrderBook[_price].highestPriority = 1;
            tokenList[_token].buyOrderBook[_price].lowestPriority = 1;
            tokenList[_token].numOfBuyPrices = tokenList[_token]
                .numOfBuyPrices
                .add(1);
            tokenList[_token].buyOrderBook[_price].orders[tokenList[_token]
                .buyOrderBook[_price]
                .numOfOrders] = Order(_amount, _maker, 0, 1);

            uint256 currentBuyPrice = tokenList[_token].maxBuyPrice;
            uint256 lowestBuyPrice = tokenList[_token].minBuyPrice;

            if (lowestBuyPrice == 0 || lowestBuyPrice > _price) {
                if (currentBuyPrice == 0) {
                    tokenList[_token].maxBuyPrice = _price;
                    tokenList[_token].buyOrderBook[_price].higherPrice = _price;
                    tokenList[_token].buyOrderBook[_price].lowerPrice = 0;
                } else {
                    tokenList[_token].buyOrderBook[lowestBuyPrice]
                        .lowerPrice = _price;
                    tokenList[_token].buyOrderBook[_price]
                        .higherPrice = lowestBuyPrice;
                    tokenList[_token].buyOrderBook[_price].lowerPrice = 0;
                }
                tokenList[_token].minBuyPrice = _price;
            } else if (currentBuyPrice < _price) {
                tokenList[_token].buyOrderBook[currentBuyPrice].higherPrice = _price;
                tokenList[_token].buyOrderBook[_price].higherPrice = _price;
                tokenList[_token].buyOrderBook[_price].lowerPrice = currentBuyPrice;
                tokenList[_token].maxBuyPrice = _price;
            } else {
                uint256 buyPrice = tokenList[_token].maxBuyPrice;
                bool finished = false;
                while (buyPrice > 0 && !finished) {
                    if (
                        buyPrice < _price &&
                        tokenList[_token].buyOrderBook[buyPrice].higherPrice > _price
                    ) {
                        tokenList[_token].buyOrderBook[_price].lowerPrice = buyPrice;
                        tokenList[_token].buyOrderBook[_price]
                            .higherPrice = tokenList[_token].buyOrderBook[buyPrice]
                            .higherPrice;
                        tokenList[_token].buyOrderBook[tokenList[_token]
                            .buyOrderBook[buyPrice]
                            .higherPrice]
                            .lowerPrice = _price;
                        tokenList[_token].buyOrderBook[buyPrice]
                            .higherPrice = _price;
                        finished = true;
                    }
                    buyPrice = tokenList[_token].buyOrderBook[buyPrice].lowerPrice;
                }
            }
        } else {
            uint256 currentLowest = tokenList[_token].buyOrderBook[_price]
                .lowestPriority
                .add(1);
            tokenList[_token].buyOrderBook[_price].orders[currentLowest] = Order(
                _amount,
                _maker,
                tokenList[_token].buyOrderBook[_price].lowestPriority,
                currentLowest
            );
            tokenList[_token].buyOrderBook[_price].orders[tokenList[_token]
                .buyOrderBook[_price]
                .lowestPriority]
                .lowerPriority = currentLowest;
            tokenList[_token].buyOrderBook[_price].lowestPriority = currentLowest;
        }
    }

    function approveAndExchangeBuy(ERC20 baseToken, ERC20 token, uint etherAmount, address owner, uint volumeAtPointer) public {
        // approve exchange to move token to owner
        baseToken.approve(msg.sender, address(this), etherAmount); // address(this) is the smart contract itself

        exchangeTokens(baseToken, token, owner, etherAmount, volumeAtPointer);
    }

    function approveAndExchangeSell(ERC20 token, ERC20 baseToken, uint volumeAtPointer, address owner, uint etherAmount) public {
        // approve exchange to move token to owner
        token.approve(msg.sender, address(this), volumeAtPointer);
        // send token to owner
        token.transferFrom(msg.sender, owner, volumeAtPointer);
        // send weth to owner
        baseToken.transferFrom(owner, msg.sender, etherAmount);
    }

    function exchangeTokens(ERC20 baseToken, ERC20 token, address owner, uint etherAmount, uint volumeAtPointer) public {
        // send weth to maker
        baseToken.transferFrom(msg.sender, owner, etherAmount);
        // send token to owner
        token.transferFrom(owner, msg.sender, volumeAtPointer);
    }

    function retrieveTokenPriceInfo(address tokenAddress) public view returns (uint256[] memory) {
        uint256[] memory tokenInfo = new uint256[](6);
        tokenInfo[0] = tokenList[tokenAddress].minSellPrice;
        tokenInfo[1] = tokenList[tokenAddress].maxSellPrice;
        tokenInfo[2] = tokenList[tokenAddress].numOfSellPrices;
        tokenInfo[3] = tokenList[tokenAddress].minBuyPrice;
        tokenInfo[4] = tokenList[tokenAddress].maxBuyPrice;
        tokenInfo[5] = tokenList[tokenAddress].numOfBuyPrices;

        return tokenInfo;
    }

    function getTokenBalance(address user, address _tokenAddress) public view returns (uint256)
    {
        ERC20 tokenLoaded = ERC20(_tokenAddress);
        return tokenLoaded.balanceOf(user);
    }
}