//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;
import "./ERC20.sol";

contract Dex {
    struct Order {
        uint256 amount;
        address owner;
        uint256 higherPriority; // TODO is this a linked list ??
        uint256 lowerPriority; // TODO is this a linked list ?? where instantiate 
    }

    // key for OrderBook is price
    struct OrderBook {
        uint256 higherPrice; // TODO 
        uint256 lowerPrice; // TODO
        mapping(uint256 => Order) orders; // key is number of orders
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

    event approveAndExchangeTokenResult(address _tokenA, address _tokenB, address ownerA, address ownerB, uint256 amountA, uint256 amountB);

    function buyTokenMarket(address _baseToken, address _token, uint256 _amount, uint256 baseTokenValue) public returns (bool[] memory) {
        Token storage loadedToken = tokenList[_token];
        uint256 remainingAmount = _amount; // order volume
        uint256 buyPrice = loadedToken.minSellPrice;
        uint256 baseTokenAmount = 0;
        uint256 offerPointer;

        bool[] memory feedback = new bool[](3);
        feedback[0] = false; // fulfilled
        feedback[1] = false; // insufficient eth
        feedback[2] = false; // insufficient sell orders
        
        while (remainingAmount > 0 && !feedback[1] && !feedback[2]) { // while sufficient eth and sell orders
            if (buyPrice == 0){
                feedback[2] = true; // insufficient sell orders
                break;
            }
            offerPointer = loadedToken.sellOrderBook[buyPrice].highestPriority; 
            while (
                offerPointer <= loadedToken.sellOrderBook[buyPrice].lowestPriority &&
                remainingAmount > 0 &&  // while there is still volume to clear
                !feedback[1] && !feedback[2] // while sufficient eth and sell orders
            ) {
                uint256 volumeAtPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount;

                if (volumeAtPointer <= remainingAmount) { // if current offer's volume <= order's volume
                    baseTokenAmount = (volumeAtPointer * buyPrice)/(baseTokenValue);
                    // baseToken

                    if (getTokenBalance(msg.sender, _baseToken) >= baseTokenAmount) { // sufficient ether
                        sacrifice(_baseToken, msg.sender, baseTokenAmount);
                        approveAndExchangeToken(_baseToken, _token, msg.sender, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, baseTokenAmount, volumeAtPointer);
                                                loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = 0;
                        loadedToken.sellOrderBook[buyPrice].highestPriority = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].lowerPriority; // Reassign LL pointer

                        remainingAmount = remainingAmount- volumeAtPointer;
                    } else {
                        feedback[1] = true; // insufficient ether
                    }
                } else { // current offer's volume > order's volume
                    baseTokenAmount = (remainingAmount * buyPrice)/(baseTokenValue);
                    if (getTokenBalance(msg.sender, _baseToken) >= baseTokenAmount) { // sufficient ether
                        sacrifice(_baseToken, msg.sender, baseTokenAmount);
                        approveAndExchangeToken(_baseToken, _token, msg.sender, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, baseTokenAmount, remainingAmount);
                        // remove the volume bought from the offer
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount -= remainingAmount;
                        remainingAmount = 0;
                    } else {
                        feedback[1] = true; // insufficient ether 
                    }
                }
                if (!feedback[1] && // sufficient ether
                    offerPointer == loadedToken.sellOrderBook[buyPrice].lowestPriority && // no more orders
                    loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount == 0) { // this current sell order has no volume alr
                    loadedToken.numOfSellPrices = loadedToken.numOfSellPrices - 1; 
                    loadedToken.sellOrderBook[buyPrice].numOfOrders = 0; // basically some post processing
                    if (buyPrice == loadedToken.sellOrderBook[buyPrice].higherPrice) { // highest price in sell order book, ie orderbook empty
                        clearOrderBook(_token, buyPrice, true); // clear sellorderbook at buyprice
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

    function sellTokenMarket(address _baseToken, address _token, uint256 _amount, uint256 baseTokenValue) public returns (bool[] memory) {
        Token storage loadedToken = tokenList[_token];
        uint256 remainingAmount = _amount; // order volume
        uint256 sellPrice = loadedToken.maxBuyPrice;
        uint256 baseTokenAmount = 0;
        uint256 offerPointer;

        bool[] memory feedback = new bool[](3);
        feedback[0] = false; // fulfilled
        feedback[1] = false; // insufficient eth
        feedback[2] = false; // insufficient buy orders

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
                if (volumeAtPointer <= remainingAmount) { // if current offer's volume is <= order's volume
                    if (getTokenBalance(msg.sender, _token) >= volumeAtPointer) {
                        baseTokenAmount = (volumeAtPointer * sellPrice) / (baseTokenValue);
                        sacrifice(_token, msg.sender, volumeAtPointer);
                        approveAndExchangeToken(_baseToken, _token, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, msg.sender, baseTokenAmount, volumeAtPointer);
                        
                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = 0;

                        loadedToken.buyOrderBook[sellPrice].highestPriority = loadedToken.buyOrderBook[sellPrice]
                                                                                        .orders[offerPointer]
                                                                                        .lowerPriority;
                        
                        remainingAmount = remainingAmount - (volumeAtPointer);
                    } else {
                        feedback[1] = true; // insufficient eth
                    }
                } else { // current offer's volume is more than enough
                    if ((volumeAtPointer - (remainingAmount) > 0) && (getTokenBalance(msg.sender, _token) >= remainingAmount)) {
                        baseTokenAmount = (remainingAmount * sellPrice) / (baseTokenValue);
                        sacrifice(_token, msg.sender, remainingAmount);
                        approveAndExchangeToken(_baseToken, _token, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, msg.sender, baseTokenAmount, remainingAmount);
                        
                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = loadedToken.buyOrderBook[sellPrice]
                                                                                                    .orders[offerPointer]
                                                                                                    .amount - (remainingAmount);
                        
                        remainingAmount = 0;
                    }
                }

                if (!feedback[1] &&
                    offerPointer == loadedToken.buyOrderBook[sellPrice].lowestPriority &&
                    loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount == 0) {
                    loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices - 1;
                    loadedToken.buyOrderBook[sellPrice].numOfOrders = 0;
                    if (loadedToken.buyOrderBook[sellPrice].lowerPrice == 0) {
                        clearOrderBook(_token, sellPrice, false); // clear buyorderbook at sellprice
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

    function buyTokenLimit(address _baseToken, address _token, uint256 _price, uint256 _amount, uint256 baseTokenValue) public {
        Token storage loadedToken = tokenList[_token];

        require(getTokenBalance(msg.sender, _baseToken) >= ((_price * (_amount))/(1e18)), 
                                "buyTokenLimit: WETH balance is less than ETH required");

        if (loadedToken.numOfSellPrices == 0 || loadedToken.minSellPrice > _price) { // no available/suitable sell order prices
            sacrifice(_baseToken, msg.sender, _price*_amount/baseTokenValue);
            storeBuyOrder(_token, _price, _amount, msg.sender);
        } else {
            uint256 baseTokenAmount = 0;
            uint256 remainingAmount = _amount;
            uint256 buyPrice = loadedToken.minSellPrice;
            uint256 offerPointer;
            uint256 volumeAtPointer;
            uint256 currBuyPriceHigherPrice;

            while (buyPrice != 0 && buyPrice <= _price && remainingAmount > 0) {
                // lowest selling price is lower than this current buy price, and still has volume to fill
                offerPointer = loadedToken.sellOrderBook[buyPrice].highestPriority;
                while (offerPointer<=loadedToken.sellOrderBook[buyPrice].lowestPriority && 
                        remainingAmount > 0) {
                    volumeAtPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount;
                    if (volumeAtPointer <= remainingAmount) {
                        baseTokenAmount = (volumeAtPointer * (buyPrice))/(baseTokenValue);
                        require(getTokenBalance(msg.sender, _baseToken) >= baseTokenAmount, 
                                "buyTokenLimit: WETH balance is less than ETH required");
                        sacrifice(_baseToken, msg.sender, baseTokenAmount);
                        approveAndExchangeToken(_baseToken, _token, msg.sender, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, baseTokenAmount, volumeAtPointer);

                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = 0;
                        loadedToken.sellOrderBook[buyPrice].highestPriority = loadedToken.sellOrderBook[buyPrice]
                                                                                        .orders[offerPointer]
                                                                                        .lowerPriority;
                        remainingAmount = remainingAmount - (volumeAtPointer);
                    } else {
                        require(loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount > remainingAmount,
                                "buyTokenLimit: Current offer's amount < remaining amount");
                        baseTokenAmount = (remainingAmount * (buyPrice))/(baseTokenValue);
                        sacrifice(_baseToken, msg.sender, baseTokenAmount);
                        approveAndExchangeToken(_baseToken, _token, msg.sender, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, baseTokenAmount, remainingAmount);
                        
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = loadedToken.sellOrderBook[buyPrice]
                                                                                                    .orders[offerPointer]
                                                                                                    .amount - (remainingAmount);
                        
                        remainingAmount = 0;
                    }

                    if (offerPointer == loadedToken.sellOrderBook[buyPrice].lowestPriority && 
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount == 0) {
                        loadedToken.numOfSellPrices = loadedToken.numOfSellPrices - 1;
                        loadedToken.sellOrderBook[buyPrice].numOfOrders = 0;

                        if (buyPrice == loadedToken.sellOrderBook[buyPrice].higherPrice ||
                            loadedToken.sellOrderBook[buyPrice].higherPrice == 0 ) {
                            clearOrderBook(_token, buyPrice, true); // clear sellorderbook at buyprice
                        } else {
                            currBuyPriceHigherPrice = loadedToken.sellOrderBook[buyPrice].higherPrice;
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
                buyTokenLimit(_baseToken, _token, _price, remainingAmount, baseTokenValue);
            }
        }
    }

    function sellTokenLimit(address _baseToken, address _token, uint256 _price, uint256 _amount, uint256 baseTokenValue) public {
        Token storage loadedToken = tokenList[_token];

        require(getTokenBalance(msg.sender, _token) >= _amount, "sellTokenLimit: Insufficient Token Balance");

        if (loadedToken.numOfBuyPrices == 0 || loadedToken.maxBuyPrice < _price) { // no avail or suitable buy orders
            sacrifice(_token, msg.sender, _amount);
            storeSellOrder(_token, _price, _amount, msg.sender);
        } else {
            uint256 sellPrice = loadedToken.maxBuyPrice;
            uint256 remainingAmount = _amount;
            uint256 offerPointer;
            uint256 baseTokenAmount;
            uint256 buyBookSellPriceLowerPrice;
            uint256 volumeAtPointer;

            while (sellPrice != 0 && sellPrice >= _price && remainingAmount > 0){
                // current buy price is higher than the price we wanna sell at ie there are avail orders to fulfil our order
                offerPointer = loadedToken.buyOrderBook[sellPrice].highestPriority;
                while (offerPointer <= loadedToken.buyOrderBook[sellPrice].lowestPriority && remainingAmount > 0) {
                    volumeAtPointer = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount;

                    if (volumeAtPointer <= remainingAmount) {
                        baseTokenAmount = (volumeAtPointer * (sellPrice)) /(baseTokenValue);
                        require(getTokenBalance(msg.sender, _token) >= volumeAtPointer, 
                                "sellTokenLimit: Insufficient Token Balance 2");

                        sacrifice(_token, msg.sender, volumeAtPointer);
                        approveAndExchangeToken(_baseToken, _token, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, msg.sender, baseTokenAmount, volumeAtPointer);

                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = 0;
                        loadedToken.buyOrderBook[sellPrice].highestPriority = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].lowerPriority;
                        remainingAmount = remainingAmount - volumeAtPointer;

                    } else {
                        baseTokenAmount = (remainingAmount * (sellPrice))/(baseTokenValue);
                        require(volumeAtPointer - remainingAmount > 0, "sellTokenLimit: volumeAtPointer is <= remaining amount");

                        sacrifice(_token, msg.sender, remainingAmount);
                        approveAndExchangeToken(_baseToken, _token, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, msg.sender, baseTokenAmount, remainingAmount);

                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount - remainingAmount;
                        remainingAmount = 0;
                    }
                    if (offerPointer == loadedToken.buyOrderBook[sellPrice].lowestPriority &&
                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount == 0 ) {
                        loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices - 1;
                        if (sellPrice == loadedToken.buyOrderBook[sellPrice].lowerPrice ||
                            loadedToken.buyOrderBook[sellPrice].lowerPrice == 0) {
                            clearOrderBook(_token, sellPrice, false);
                        } else {
                            buyBookSellPriceLowerPrice = loadedToken.buyOrderBook[sellPrice].lowerPrice;
                            loadedToken.maxBuyPrice = buyBookSellPriceLowerPrice;
                            loadedToken.buyOrderBook[buyBookSellPriceLowerPrice].higherPrice = loadedToken.maxBuyPrice;
                        }
                        break;
                    }
                    offerPointer = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].lowerPriority;
                }
                sellPrice = loadedToken.maxBuyPrice;
            }
            if (remainingAmount > 0){
                sellTokenLimit(_baseToken, _token, _price, remainingAmount, baseTokenValue);
            }
        }
    } 

    function storeBuyOrder(address _token, uint256 _price, uint256 _amount, address _owner) private {
        tokenList[_token].buyOrderBook[_price].numOfOrders = tokenList[_token].buyOrderBook[_price].numOfOrders + 1;
        uint currNumberOfOrders = tokenList[_token].buyOrderBook[_price].numOfOrders;

        if (currNumberOfOrders == 1) { // this new order is the first order of this price
            tokenList[_token].buyOrderBook[_price].highestPriority = 1;
            tokenList[_token].buyOrderBook[_price].lowestPriority = 1;
            tokenList[_token].numOfBuyPrices = tokenList[_token].numOfBuyPrices + 1;
            tokenList[_token].buyOrderBook[_price].orders[currNumberOfOrders] = Order(_amount, _owner, 0, 1);

            uint256 currentBuyPrice = tokenList[_token].maxBuyPrice;
            uint256 lowestBuyPrice = tokenList[_token].minBuyPrice;

            if (lowestBuyPrice == 0 || lowestBuyPrice > _price) { // need to make lowestBuyPrice = _price
                if (currentBuyPrice == 0) { // ie no orders at all
                    tokenList[_token].maxBuyPrice = _price;
                    tokenList[_token].buyOrderBook[_price].higherPrice = _price; // oooo SETTING THE POINTERS
                    tokenList[_token].buyOrderBook[_price].lowerPrice = 0; // if it is the lowest price, the LP pointer will point to 0
                } else { // have orders, but this price is the new minimum
                    tokenList[_token].buyOrderBook[lowestBuyPrice].lowerPrice = _price;
                    tokenList[_token].buyOrderBook[_price].higherPrice = lowestBuyPrice;
                    tokenList[_token].buyOrderBook[_price].lowerPrice = 0;
                }
                tokenList[_token].minBuyPrice = _price;
            } else if (currentBuyPrice < _price) { // price is higher than the current maxBuyPrice
                tokenList[_token].buyOrderBook[currentBuyPrice].higherPrice = _price;
                tokenList[_token].buyOrderBook[_price].higherPrice = _price; // if it is the highest price, the HP pointer will point to the same price
                tokenList[_token].buyOrderBook[_price].lowerPrice = currentBuyPrice;
                tokenList[_token].maxBuyPrice = _price;
            } else { // price is in between minBuyPrice and maxBuyPrice
                uint256 buyPrice = tokenList[_token].maxBuyPrice; // starts off at the highest price
                bool finished = false;
                while (buyPrice > 0 && !finished) {
                    if (buyPrice < _price && // if price we are at now is < than the price we want to slot in &&
                        tokenList[_token].buyOrderBook[buyPrice].higherPrice > _price) { // the next price is > than the price we wanna slot in
                        // ie price is in between !! found a place to slot in
                        tokenList[_token].buyOrderBook[_price].lowerPrice = buyPrice;
                        tokenList[_token].buyOrderBook[_price].higherPrice = tokenList[_token].buyOrderBook[buyPrice].higherPrice;
                        tokenList[_token].buyOrderBook[tokenList[_token].buyOrderBook[buyPrice].higherPrice].lowerPrice = _price;
                        tokenList[_token].buyOrderBook[buyPrice].higherPrice = _price;
                        finished = true;
                    }
                    buyPrice = tokenList[_token].buyOrderBook[buyPrice].lowerPrice;
                }
            }
        } else { // there are other orders of this price
            uint256 prevLowest = tokenList[_token].buyOrderBook[_price].lowestPriority;
            uint256 currentLowest = prevLowest + 1;
            tokenList[_token].buyOrderBook[_price].orders[currentLowest] = Order(_amount, _owner, prevLowest, currentLowest);
            tokenList[_token].buyOrderBook[_price].orders[prevLowest].lowerPriority = currentLowest;
            tokenList[_token].buyOrderBook[_price].lowestPriority = currentLowest;
        }
    }

    function storeSellOrder(address _token,uint256 _price,uint256 _amount,address _owner) private {
        tokenList[_token].sellOrderBook[_price].numOfOrders = tokenList[_token].sellOrderBook[_price].numOfOrders + 1;
        uint currNumberOfOrders = tokenList[_token].sellOrderBook[_price].numOfOrders;

        if (currNumberOfOrders == 1) { // this new order is the first order of this price
            tokenList[_token].sellOrderBook[_price].highestPriority = 1;
            tokenList[_token].sellOrderBook[_price].lowestPriority = 1;
            tokenList[_token].numOfSellPrices = tokenList[_token].numOfSellPrices + 1;
            tokenList[_token].sellOrderBook[_price].orders[currNumberOfOrders] = Order(_amount, _owner, 0, 1);

            uint256 currentSellPrice = tokenList[_token].minSellPrice;
            uint256 highestSellPrice = tokenList[_token].maxSellPrice;

            if (highestSellPrice == 0 || highestSellPrice < _price) { // need to make maxSellPrice = _price
                if (currentSellPrice == 0) {
                    tokenList[_token].minSellPrice = _price;
                    tokenList[_token].sellOrderBook[_price].higherPrice = _price;
                    tokenList[_token].sellOrderBook[_price].lowerPrice = 0;
                } else {
                    tokenList[_token].sellOrderBook[highestSellPrice].higherPrice = _price;
                    tokenList[_token].sellOrderBook[_price].lowerPrice = highestSellPrice;
                    tokenList[_token].sellOrderBook[_price].higherPrice = _price;
                }
                tokenList[_token].maxSellPrice = _price;
            } else if (currentSellPrice > _price) { // _price is lower than current minSellPrice, ie is new minSellPrice
                tokenList[_token].sellOrderBook[currentSellPrice].lowerPrice = _price;
                tokenList[_token].sellOrderBook[_price].higherPrice = currentSellPrice;
                tokenList[_token].sellOrderBook[_price].lowerPrice = 0;
                tokenList[_token].minSellPrice = _price;
            } else {
                uint256 sellPrice = tokenList[_token].minSellPrice;
                bool finished = false;
                while (sellPrice > 0 && !finished) {
                    if (sellPrice < _price &&
                        tokenList[_token].sellOrderBook[sellPrice].higherPrice > _price) {
                        tokenList[_token].sellOrderBook[_price].lowerPrice = sellPrice;
                        tokenList[_token].sellOrderBook[_price].higherPrice = tokenList[_token].sellOrderBook[sellPrice].higherPrice;
                        tokenList[_token].sellOrderBook[tokenList[_token].sellOrderBook[sellPrice].higherPrice].lowerPrice = _price;
                        tokenList[_token].sellOrderBook[sellPrice].higherPrice = _price;
                        finished = true;
                    }
                    sellPrice = tokenList[_token].sellOrderBook[sellPrice].higherPrice;
                }
            }
        } else { 
            uint256 prevLowest = tokenList[_token].sellOrderBook[_price].lowestPriority;
            uint256 currentLowest = prevLowest + 1;
            tokenList[_token].sellOrderBook[_price].orders[currNumberOfOrders] = Order(_amount, _owner, prevLowest, currentLowest);
            tokenList[_token].sellOrderBook[_price].orders[prevLowest].lowerPriority = currentLowest;
            tokenList[_token].sellOrderBook[_price].lowestPriority = currentLowest;
        }
    }

    function removeBuyOrder(address _baseToken, address _token, uint256 _price, uint256 baseTokenValue) public {
        uint256 totalOffers = 0;
        ERC20 baseToken = ERC20(_baseToken);

        // remove all offers for this price
        uint256 counter = tokenList[_token].buyOrderBook[_price].highestPriority;

        while (counter <= tokenList[_token].buyOrderBook[_price].numOfOrders) {
            if (tokenList[_token].buyOrderBook[_price].orders[counter].owner == msg.sender) {
                baseToken.reduceAllowance(msg.sender, address(this), ((tokenList[_token].sellOrderBook[_price].orders[counter].amount*(_price))/(baseTokenValue)));
                totalOffers = totalOffers + 1;
                tokenList[_token].buyOrderBook[_price].numOfOrders = tokenList[_token].buyOrderBook[_price].numOfOrders - 1;

                if (tokenList[_token].buyOrderBook[_price].orders[counter].higherPriority == 0) {
                    // if this offer is first in queue
                    tokenList[_token].buyOrderBook[_price].highestPriority = tokenList[_token].buyOrderBook[_price].orders[counter].lowerPriority;
                    tokenList[_token].buyOrderBook[_price].orders[tokenList[_token].buyOrderBook[_price].orders[counter].lowerPriority].higherPriority = 0;
                } else if (tokenList[_token].buyOrderBook[_price].orders[counter].lowerPriority == tokenList[_token].buyOrderBook[_price].lowestPriority) {
                    // if this offer is last in queue
                    tokenList[_token].buyOrderBook[_price].lowestPriority = tokenList[_token].buyOrderBook[_price].orders[counter].higherPriority;
                    tokenList[_token].buyOrderBook[_price].orders[tokenList[_token].buyOrderBook[_price].orders[counter].higherPriority].lowerPriority = tokenList[_token].buyOrderBook[_price].lowestPriority;
                } else {
                    // if offer is in between orders
                    tokenList[_token].buyOrderBook[_price].orders[tokenList[_token].buyOrderBook[_price].orders[counter].higherPriority].lowerPriority = tokenList[_token].buyOrderBook[_price].orders[counter].lowerPriority;
                    tokenList[_token].buyOrderBook[_price].orders[tokenList[_token].buyOrderBook[_price].orders[counter].lowerPriority].higherPriority = tokenList[_token].buyOrderBook[_price].orders[counter].higherPriority;
                }
            }
            if (counter == tokenList[_token].buyOrderBook[_price].lowestPriority) {
                break;
            }
            counter = tokenList[_token].buyOrderBook[_price].orders[counter].lowerPriority;
        }

        if (tokenList[_token].buyOrderBook[_price].numOfOrders == 0 && totalOffers > 0) {
            // if no. of offers for this price is 0, this price is empty, remove this order book
            if (tokenList[_token].buyOrderBook[_price].lowerPrice == 0 && tokenList[_token].buyOrderBook[_price].higherPrice == _price) {
                // if this is the only price left
                tokenList[_token].buyOrderBook[_price].numOfOrders = 0;
                clearOrderBook(_token, _price, false);
            } else if (tokenList[_token].buyOrderBook[_price].lowerPrice == 0) {
                // if this is the first price in order book list
                tokenList[_token].buyOrderBook[tokenList[_token].buyOrderBook[_price].higherPrice].lowerPrice = 0;
                tokenList[_token].minBuyPrice = tokenList[_token].buyOrderBook[_price].higherPrice;
                tokenList[_token].numOfBuyPrices = tokenList[_token].numOfBuyPrices - 1;
            } else if (tokenList[_token].buyOrderBook[_price].higherPrice == _price) {
                // if this is the last price in order book list
                tokenList[_token].buyOrderBook[tokenList[_token].buyOrderBook[_price].lowerPrice].higherPrice = tokenList[_token].buyOrderBook[_price].lowerPrice;
                tokenList[_token].maxBuyPrice = tokenList[_token].buyOrderBook[_price].lowerPrice;
                tokenList[_token].numOfBuyPrices = tokenList[_token].numOfBuyPrices - 1;
            } else {
                // if we are in between order book list
                tokenList[_token].buyOrderBook[tokenList[_token].buyOrderBook[_price].lowerPrice].higherPrice = tokenList[_token].buyOrderBook[_price].higherPrice;
                tokenList[_token].buyOrderBook[tokenList[_token].buyOrderBook[_price].higherPrice].lowerPrice = tokenList[_token].buyOrderBook[_price].lowerPrice;
                tokenList[_token].numOfBuyPrices = tokenList[_token].numOfBuyPrices - 1;
            }
        }
    }

    function removeSellOrder(address _baseToken, address _token, uint256 _price, uint256 baseTokenValue) public {
        uint256 totalOffers = 0;
        ERC20 token = ERC20(_token);

        // remove all offers for this price
        uint256 counter = tokenList[_token].sellOrderBook[_price].highestPriority;

        while (counter <= tokenList[_token].sellOrderBook[_price].lowestPriority) {
            if (tokenList[_token].sellOrderBook[_price].orders[counter].owner == msg.sender) {
                token.reduceAllowance(msg.sender, address(this), tokenList[_token].sellOrderBook[_price].orders[counter].amount/baseTokenValue);
                totalOffers = totalOffers + 1;
                tokenList[_token].sellOrderBook[_price].numOfOrders = tokenList[_token].sellOrderBook[_price].numOfOrders - 1;

                if (tokenList[_token].sellOrderBook[_price].orders[counter].higherPriority == 0) {
                    // if this offer is first in queue                    
                    tokenList[_token].sellOrderBook[_price].highestPriority = tokenList[_token].sellOrderBook[_price].orders[counter].lowerPriority;
                    tokenList[_token].sellOrderBook[_price].orders[tokenList[_token].sellOrderBook[_price].orders[counter].lowerPriority].higherPriority = 0;
                } else if (tokenList[_token].sellOrderBook[_price].orders[counter].lowerPriority == tokenList[_token].sellOrderBook[_price].lowestPriority) {
                    // if this offer is the last in queue
                    tokenList[_token].sellOrderBook[_price].lowestPriority = tokenList[_token].sellOrderBook[_price].orders[counter].higherPriority;
                    tokenList[_token].sellOrderBook[_price].orders[tokenList[_token].sellOrderBook[_price].orders[counter].higherPriority].lowerPriority = tokenList[_token].sellOrderBook[_price].lowestPriority;
                } else {
                    //tokenList[_token].sellBook[_price].offers[counter].amount = 0;
                    // Set lower priority's higherPriority to current higherPriority
                    tokenList[_token].sellOrderBook[_price].orders[tokenList[_token].sellOrderBook[_price].orders[counter].lowerPriority].higherPriority = tokenList[_token].sellOrderBook[_price].orders[counter].higherPriority;
                    // Set higher priority's lowerPriority to current lowerPriority
                    tokenList[_token].sellOrderBook[_price].orders[tokenList[_token].sellOrderBook[_price].orders[counter].higherPriority].lowerPriority = tokenList[_token].sellOrderBook[_price].orders[counter].lowerPriority;
                }
            }
            if (counter == tokenList[_token].sellOrderBook[_price].lowestPriority) {
                break;
            }
            counter = tokenList[_token].sellOrderBook[_price].orders[counter].lowerPriority;
        } 

        if (tokenList[_token].sellOrderBook[_price].numOfOrders == 0 && totalOffers > 0){
            if (tokenList[_token].sellOrderBook[_price].lowerPrice == 0 && tokenList[_token].sellOrderBook[_price].higherPrice == _price) {
                // if this is the only price left
                tokenList[_token].sellOrderBook[_price].numOfOrders = 0;
                clearOrderBook(_token, _price, true);
            } else if (tokenList[_token].sellOrderBook[_price].lowerPrice == 0) {
                // if this is the first price in orderbook list
                tokenList[_token].sellOrderBook[tokenList[_token].sellOrderBook[_price].higherPrice].lowerPrice = 0;
                tokenList[_token].minSellPrice = tokenList[_token].sellOrderBook[_price].higherPrice;
                tokenList[_token].numOfSellPrices = tokenList[_token].numOfSellPrices - 1;
            } else if (tokenList[_token].sellOrderBook[_price].higherPrice == _price){
                // if this is the last price in the orderbook list
                tokenList[_token].sellOrderBook[tokenList[_token].sellOrderBook[_price].lowerPrice].higherPrice = tokenList[_token].sellOrderBook[_price].lowerPrice;
                tokenList[_token].maxSellPrice = tokenList[_token].sellOrderBook[_price].lowerPrice;
                tokenList[_token].numOfSellPrices = tokenList[_token].numOfSellPrices - 1;
            } else {
                // if we are in between order book list
                tokenList[_token].sellOrderBook[tokenList[_token].sellOrderBook[_price].lowerPrice].higherPrice = tokenList[_token].sellOrderBook[_price].higherPrice;
                tokenList[_token].sellOrderBook[tokenList[_token].sellOrderBook[_price].higherPrice].lowerPrice = tokenList[_token].sellOrderBook[_price].lowerPrice;
                tokenList[_token].numOfSellPrices = tokenList[_token].numOfSellPrices - 1;
            }
        } 
    }

    function getUserSellOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        uint256 sellPrice = tokenList[_token].minSellPrice;
        uint256 counter = 0;
        if (tokenList[_token].minSellPrice > 0) {
            while (sellPrice <= tokenList[_token].maxSellPrice) {
                uint256 offerPointer = tokenList[_token].sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= tokenList[_token].sellOrderBook[sellPrice].numOfOrders) {
                    if (tokenList[_token].sellOrderBook[sellPrice].orders[offerPointer].owner == msg.sender) {
                        counter = counter + 1;
                    }
                    offerPointer = offerPointer + 1;
                }
                if (sellPrice == tokenList[_token].sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = tokenList[_token].sellOrderBook[sellPrice].higherPrice;
                }
            }
        }

        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        sellPrice = tokenList[_token].minSellPrice;
        counter = 0;
        bool offered;
        if (tokenList[_token].minSellPrice > 0) {
            while (sellPrice <= tokenList[_token].maxSellPrice) {
                offered = false;
                uint256 priceVolume = 0;
                uint256 offerPointer = tokenList[_token].sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= tokenList[_token].sellOrderBook[sellPrice].numOfOrders) {
                    if (tokenList[_token].sellOrderBook[sellPrice].orders[offerPointer].owner == msg.sender) {
                        ordersPrices[counter] = sellPrice;
                        priceVolume = priceVolume + tokenList[_token].sellOrderBook[sellPrice].orders[offerPointer].amount;
                        offered = true;
                    }
                    offerPointer = offerPointer + 1;
                }
                if (offered) {
                    ordersVolumes[counter] = priceVolume;
                    counter = counter + 1;
                }
                if (sellPrice == tokenList[_token].sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = tokenList[_token].sellOrderBook[sellPrice].higherPrice;
                }
            }
        }
        return (ordersPrices, ordersVolumes);
    }

    function getUserBuyOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        uint256 buyPrice = tokenList[_token].minBuyPrice;
        uint256 counter = 0;
        if (tokenList[_token].maxBuyPrice > 0) {
            while (buyPrice <= tokenList[_token].maxBuyPrice) {
                uint256 offerPointer = tokenList[_token].buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= tokenList[_token].buyOrderBook[buyPrice].numOfOrders) {
                    if (tokenList[_token].buyOrderBook[buyPrice].orders[offerPointer].owner == msg.sender) {
                        counter = counter + 1;
                    }
                    offerPointer = offerPointer + 1;
                }

                if (buyPrice == tokenList[_token].buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = tokenList[_token].buyOrderBook[buyPrice].higherPrice;
                }
            }
        }

        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        buyPrice = tokenList[_token].minBuyPrice;
        counter = 0;
        bool offered;

        if (tokenList[_token].maxBuyPrice > 0) {
            while (buyPrice <= tokenList[_token].maxBuyPrice) {
                offered = false;

                uint256 priceVolume = 0;
                uint256 offerPointer = tokenList[_token].buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= tokenList[_token].buyOrderBook[buyPrice].numOfOrders) {
                    if (tokenList[_token].buyOrderBook[buyPrice].orders[offerPointer].owner == msg.sender) {
                        ordersPrices[counter] = buyPrice;
                        priceVolume = priceVolume + tokenList[_token].buyOrderBook[buyPrice].orders[offerPointer].amount;
                        offered = true;
                    }
                    offerPointer = offerPointer + 1;
                }
                if (offered) {
                    ordersVolumes[counter] = priceVolume;
                    counter = counter + 1;
                }

                if (buyPrice == tokenList[_token].buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = tokenList[_token].buyOrderBook[buyPrice].higherPrice;
                }
            }
        }

        return (ordersPrices, ordersVolumes);
    }

    function getSellOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        uint256 sellPrice = tokenList[_token].minSellPrice;
        uint256 counter = 0;

        if (tokenList[_token].minSellPrice > 0) {
            while (sellPrice <= tokenList[_token].maxSellPrice) {
                uint256 offerPointer = tokenList[_token].sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= tokenList[_token].sellOrderBook[sellPrice].numOfOrders) {
                    offerPointer = offerPointer + 1;
                    counter = counter + 1;
                }
                if (sellPrice == tokenList[_token].sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = tokenList[_token].sellOrderBook[sellPrice].higherPrice;
                }
            }
        }

        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        sellPrice = tokenList[_token].minSellPrice;
        counter = 0;

        if (tokenList[_token].minSellPrice > 0) {
            while (sellPrice <= tokenList[_token].maxSellPrice) {
                // uint256 priceVolume = 0;
                uint256 offerPointer = tokenList[_token].sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= tokenList[_token].sellOrderBook[sellPrice].numOfOrders) {
                    // priceVolume = priceVolume.add(
                    //     tokenList[_token].sellOrderBook[sellPrice].offers[offerPointer]
                    //         .amount
                    // );

                    ordersPrices[counter] = sellPrice;
                    ordersVolumes[counter] = tokenList[_token].sellOrderBook[sellPrice].orders[offerPointer].amount;
                    offerPointer = offerPointer + 1;
                    counter = counter + 1;
                }
                if (sellPrice == tokenList[_token].sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = tokenList[_token].sellOrderBook[sellPrice].higherPrice;
                }
            }
        }
        return (ordersPrices, ordersVolumes);
    }

    function getBuyOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        uint256 buyPrice = tokenList[_token].minBuyPrice;
        uint256 counter = 0;

        if (tokenList[_token].maxBuyPrice > 0) {
            while (buyPrice <= tokenList[_token].maxBuyPrice) {
                uint256 offerPointer = tokenList[_token].buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= tokenList[_token].buyOrderBook[buyPrice].numOfOrders) {
                    counter = counter + 1;
                    offerPointer = offerPointer + 1;
                }

                if (buyPrice == tokenList[_token].buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = tokenList[_token].buyOrderBook[buyPrice].higherPrice;
                }
            }
        }
        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        buyPrice = tokenList[_token].minBuyPrice;
        counter = 0;

        if (tokenList[_token].maxBuyPrice > 0) {
            while (buyPrice <= tokenList[_token].maxBuyPrice) {
                // uint256 priceVolume = 0;
                uint256 offerPointer = tokenList[_token].buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= tokenList[_token].buyOrderBook[buyPrice].numOfOrders) {
                    // priceVolume = priceVolume.add(
                    //     tokenList[_token].buyOrderBook[buyPrice].offers[offerPointer]
                    //         .amount
                    // );

                    ordersPrices[counter] = buyPrice;
                    ordersVolumes[counter] = tokenList[_token].buyOrderBook[buyPrice].orders[offerPointer].amount;

                    counter = counter + 1;
                    offerPointer = offerPointer + 1;
                }

                if (buyPrice == tokenList[_token].buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = tokenList[_token].buyOrderBook[buyPrice].higherPrice;
                }
            }
        }

        return (ordersPrices, ordersVolumes);
    }

    function sacrifice(address _tokenA, address owner, uint256 amountA) public {
        ERC20 tokenA = ERC20(_tokenA);

        tokenA.approve(owner, address(this), amountA);
        tokenA.transferFrom(owner, address(this), amountA);
    }

    function saveTheTribute(address _tokenA, address owner, uint256 amountA) public {
        ERC20 tokenA = ERC20(_tokenA);

        tokenA.approve(address(this), owner, amountA);
        tokenA.transferFrom(address(this), owner, amountA);
    }

    function approveAndExchangeToken(address _tokenA, address _tokenB, address ownerA, address ownerB, uint256 amountA, uint256 amountB) public {
        ERC20 tokenA = ERC20(_tokenA);
        ERC20 tokenB = ERC20(_tokenB);

        tokenA.approve(address(this), ownerB, amountA);
        tokenB.approve(address(this), ownerA, amountB);

        tokenA.transferFrom(address(this), ownerB, amountA);
        tokenB.transferFrom(address(this), ownerA, amountB);
        
        emit approveAndExchangeTokenResult(_tokenA, _tokenB, ownerA, ownerB, amountA, amountB);
    }

    function clearOrderBook(address _token, uint price, bool isBuy) public {
        if (isBuy) {
            tokenList[_token].sellOrderBook[price].higherPrice = 0;
            tokenList[_token].sellOrderBook[price].lowerPrice = 0;
            tokenList[_token].sellOrderBook[price].numOfOrders = 0;
            tokenList[_token].numOfSellPrices = 0;
            tokenList[_token].maxSellPrice = 0;
            tokenList[_token].minSellPrice = 0;
        } else {
            tokenList[_token].buyOrderBook[price].higherPrice = 0;
            tokenList[_token].buyOrderBook[price].lowerPrice = 0;
            tokenList[_token].buyOrderBook[price].numOfOrders = 0;
            tokenList[_token].numOfBuyPrices = 0;
            tokenList[_token].minBuyPrice = 0;
            tokenList[_token].maxBuyPrice = 0;
        }
    }

    function getTokenBalance(address user, address _tokenAddress) public view returns (uint256) {
        ERC20 tokenLoaded = ERC20(_tokenAddress);
        return tokenLoaded.balanceOf(user);
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

    function retrieveOrderBookInfo(address tokenAddress, uint256 price, bool isBuy) public view returns (uint256[] memory) {
        uint256[] memory orderBookInfo = new uint256[](5);
        if (isBuy) {
            orderBookInfo[0] = tokenList[tokenAddress].buyOrderBook[price].higherPrice;
            orderBookInfo[1] = tokenList[tokenAddress].buyOrderBook[price].lowerPrice;
            orderBookInfo[2] = tokenList[tokenAddress].buyOrderBook[price].highestPriority;
            orderBookInfo[3] = tokenList[tokenAddress].buyOrderBook[price].lowestPriority;
            orderBookInfo[4] = tokenList[tokenAddress].buyOrderBook[price].numOfOrders;
        } else {
            orderBookInfo[0] = tokenList[tokenAddress].sellOrderBook[price].higherPrice;
            orderBookInfo[1] = tokenList[tokenAddress].sellOrderBook[price].lowerPrice;
            orderBookInfo[2] = tokenList[tokenAddress].sellOrderBook[price].highestPriority;
            orderBookInfo[3] = tokenList[tokenAddress].sellOrderBook[price].lowestPriority;
            orderBookInfo[4] = tokenList[tokenAddress].sellOrderBook[price].numOfOrders;
        }

        return orderBookInfo;
    }

    function retrieveOrderInfo(address tokenAddress, uint256 price, bool isBuy) public view returns (address) {
        address owner;
        if (isBuy) {
            owner = tokenList[tokenAddress].buyOrderBook[price].orders[1].owner;
        } else {
            owner = tokenList[tokenAddress].sellOrderBook[price].orders[1].owner;
        }

        return owner;
    }
}