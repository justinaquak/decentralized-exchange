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
            offerPointer = loadedToken.sellOrderBook[buyPrice].highestPriority; 
            while (
                offerPointer <= loadedToken.sellOrderBook[buyPrice].lowestPriority &&
                remainingAmount > 0 &&  // while there is still volume to clear
                !feedback[1] && !feedback[2] // while sufficient eth and sell orders
            ) {
                uint256 volumeAtPointer = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount;

                if (volumeAtPointer <= remainingAmount) { // if current offer's volume <= order's volume
                    etherAmount = (volumeAtPointer.mul(buyPrice)).div(1e18);

                    if (getTokenBalance(msg.sender, _baseToken) >= etherAmount) { // sufficient ether
                        approveAndExchangeTokens(baseToken, token, etherAmount, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, volumeAtPointer);
                        
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
                        approveAndExchangeTokens(baseToken, token, etherAmount, loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner, volumeAtPointer);
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
                        approveAndExchangeTokens(token, baseToken, volumeAtPointer, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, etherAmount);
                        
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
                        approveAndExchangeTokens(token, baseToken, volumeAtPointer, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, etherAmount);
                        
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

    function buyTokenLimit(address _baseToken, address _token, uint256 _price, uint256 _amount) public {
        Token storage loadedToken = tokenList[_token];

        require(getTokenBalance(msg.sender, _baseToken) >= ((_price.mul(_amount)).div(1e18)), 
                                "buyTokenLimit: WETH balance is less than ETH required");

        if (loadedToken.numOfSellPrices == 0 || loadedToken.minSellPrice > _price) { // no available/suitable sell order prices
            storeBuyOrder(_token, _price, _amount, msg.sender);
        } else {
            ERC20 baseToken = ERC20(_baseToken); // WETH Token
            ERC20 token = ERC20(_token); // New token

            uint256 etherAmount = 0;
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
                buyTokenLimit(_baseToken, _token, _price, remainingAmount);
            }
        }
    }

    function sellTokenLimit(address _baseToken, address _token, uint256 _price, uint256 _amount) public {
        Token storage loadedToken = tokenList[_token];

        require(getTokenBalance(msg.sender, _token) >= _amount, "sellTokenLimit: Insufficient Token Balance");

        if (loadedToken.numOfBuyPrices == 0 || loadedToken.maxBuyPrice < _price) { // no avail or suitable buy orders
            storeSellOrder(_token, _price, _amount, msg.sender);
        } else {
            ERC20 baseToken = ERC20(_baseToken); // New token
            ERC20 token = ERC20(_token); // WETH Token

            uint256 sellPrice = loadedToken.maxBuyPrice;
            uint256 remainingAmount = _amount;
            uint256 offerPointer;
            uint256 etherAmount;
            uint256 buyBookSellPriceLowerPrice;
            uint256 volumeAtPointer;

            while (sellPrice != 0 && sellPrice >= _price && remainingAmount > 0){
                // current buy price is higher than the price we wanna sell at ie there are avail orders to fulfil our order
                offerPointer = loadedToken.buyOrderBook[sellPrice].highestPriority;
                while (offerPointer <= loadedToken.buyOrderBook[sellPrice].lowestPriority && remainingAmount > 0) {
                    volumeAtPointer = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount;

                    if (volumeAtPointer <= remainingAmount) {
                        etherAmount = (volumeAtPointer.mul(sellPrice)).div(1e18);
                        require(getTokenBalance(msg.sender, _token) >= volumeAtPointer, 
                                "sellTokenLimit: Insufficient Token Balance 2");

                        exchangeTokens(token, baseToken, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, volumeAtPointer, etherAmount);

                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = 0;
                        loadedToken.buyOrderBook[sellPrice].highestPriority = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].lowerPriority;
                        remainingAmount = remainingAmount.sub(volumeAtPointer);

                    } else {
                        etherAmount = (remainingAmount.mul(sellPrice)).div(1e18);
                        require(volumeAtPointer.sub(remainingAmount)>0, "sellTokenLimit: volumeAtPointer is <= remaining amount");

                        exchangeTokens(token, baseToken, loadedToken.buyOrderBook[sellPrice].orders[offerPointer].owner, volumeAtPointer, etherAmount);

                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount = loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount.sub(remainingAmount);
                        remainingAmount = 0;
                    }
                    if (offerPointer == loadedToken.buyOrderBook[sellPrice].lowestPriority &&
                        loadedToken.buyOrderBook[sellPrice].orders[offerPointer].amount == 0 ) {
                        loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices.sub(1);
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
                sellTokenLimit(_baseToken, _token, _price, remainingAmount);
            }
        }
    } 

    function storeBuyOrder(address _token, uint256 _price, uint256 _amount, address _owner) private {
        Token storage loadedToken = tokenList[_token];
        loadedToken.buyOrderBook[_price].numOfOrders = loadedToken.buyOrderBook[_price].numOfOrders.add(1);
        uint currNumberOfOrders = loadedToken.buyOrderBook[_price].numOfOrders;

        if (currNumberOfOrders == 1) { // this new order is the first order of this price
            loadedToken.buyOrderBook[_price].highestPriority = 1;
            loadedToken.buyOrderBook[_price].lowestPriority = 1;
            loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices.add(1);
            loadedToken.buyOrderBook[_price].orders[currNumberOfOrders] = Order(_amount, _owner, 0, 1);

            uint256 currentBuyPrice = loadedToken.maxBuyPrice;
            uint256 lowestBuyPrice = loadedToken.minBuyPrice;

            if (lowestBuyPrice == 0 || lowestBuyPrice > _price) { // need to make lowestBuyPrice = _price
                if (currentBuyPrice == 0) { // ie no orders at all
                    loadedToken.maxBuyPrice = _price;
                    loadedToken.buyOrderBook[_price].higherPrice = _price; // oooo SETTING THE POINTERS
                    loadedToken.buyOrderBook[_price].lowerPrice = 0; // if it is the lowest price, the LP pointer will point to 0
                } else { // have orders, but this price is the new minimum
                    loadedToken.buyOrderBook[lowestBuyPrice].lowerPrice = _price;
                    loadedToken.buyOrderBook[_price].higherPrice = lowestBuyPrice;
                    loadedToken.buyOrderBook[_price].lowerPrice = 0;
                }
                loadedToken.minBuyPrice = _price;
            } else if (currentBuyPrice < _price) { // price is higher than the current maxBuyPrice
                loadedToken.buyOrderBook[currentBuyPrice].higherPrice = _price;
                loadedToken.buyOrderBook[_price].higherPrice = _price; // if it is the highest price, the HP pointer will point to the same price
                loadedToken.buyOrderBook[_price].lowerPrice = currentBuyPrice;
                loadedToken.maxBuyPrice = _price;
            } else { // price is in between minBuyPrice and maxBuyPrice
                uint256 buyPrice = loadedToken.maxBuyPrice; // starts off at the highest price
                bool finished = false;
                while (buyPrice > 0 && !finished) {
                    if (buyPrice < _price && // if price we are at now is < than the price we want to slot in &&
                        loadedToken.buyOrderBook[buyPrice].higherPrice > _price) { // the next price is > than the price we wanna slot in
                        // ie price is in between !! found a place to slot in
                        loadedToken.buyOrderBook[_price].lowerPrice = buyPrice;
                        loadedToken.buyOrderBook[_price].higherPrice = loadedToken.buyOrderBook[buyPrice].higherPrice;
                        loadedToken.buyOrderBook[loadedToken.buyOrderBook[buyPrice].higherPrice].lowerPrice = _price;
                        loadedToken.buyOrderBook[buyPrice].higherPrice = _price;
                        finished = true;
                    }
                    buyPrice = loadedToken.buyOrderBook[buyPrice].lowerPrice;
                }
            }
        } else { // there are other orders of this price
            uint256 prevLowest = loadedToken.buyOrderBook[_price].lowestPriority;
            uint256 currentLowest = prevLowest.add(1);
            loadedToken.buyOrderBook[_price].orders[currentLowest] = Order(_amount, _owner, prevLowest, currentLowest);
            loadedToken.buyOrderBook[_price].orders[prevLowest].lowerPriority = currentLowest;
            loadedToken.buyOrderBook[_price].lowestPriority = currentLowest;
        }
    }

    function storeSellOrder(address _token,uint256 _price,uint256 _amount,address _owner) private {
        Token storage loadedToken = tokenList[_token];
        loadedToken.sellOrderBook[_price].numOfOrders = loadedToken.sellOrderBook[_price].numOfOrders.add(1);
        uint currNumberOfOrders = loadedToken.sellOrderBook[_price].numOfOrders;

        if (currNumberOfOrders == 1) { // this new order is the first order of this price
            loadedToken.sellOrderBook[_price].highestPriority = 1;
            loadedToken.sellOrderBook[_price].lowestPriority = 1;
            loadedToken.numOfSellPrices = loadedToken.numOfSellPrices.add(1);
            loadedToken.sellOrderBook[_price].orders[currNumberOfOrders] = Order(_amount, _owner, 0, 1);

            uint256 currentSellPrice = loadedToken.minSellPrice;
            uint256 highestSellPrice = loadedToken.maxSellPrice;

            if (highestSellPrice == 0 || highestSellPrice < _price) { // need to make maxSellPrice = _price
                if (currentSellPrice == 0) {
                    loadedToken.minSellPrice = _price;
                    loadedToken.sellOrderBook[_price].higherPrice = _price;
                    loadedToken.sellOrderBook[_price].lowerPrice = 0;
                } else {
                    loadedToken.sellOrderBook[highestSellPrice].higherPrice = _price;
                    loadedToken.sellOrderBook[_price].lowerPrice = highestSellPrice;
                    loadedToken.sellOrderBook[_price].higherPrice = _price;
                }
                loadedToken.maxSellPrice = _price;
            } else if (currentSellPrice > _price) { // _price is lower than current minSellPrice, ie is new minSellPrice
                loadedToken.sellOrderBook[currentSellPrice].lowerPrice = _price;
                loadedToken.sellOrderBook[_price].higherPrice = currentSellPrice;
                loadedToken.sellOrderBook[_price].lowerPrice = 0;
                loadedToken.minSellPrice = _price;
            } else {
                uint256 sellPrice = loadedToken.minSellPrice;
                bool finished = false;
                while (sellPrice > 0 && !finished) {
                    if (sellPrice < _price &&
                        loadedToken.sellOrderBook[sellPrice].higherPrice > _price) {
                        loadedToken.sellOrderBook[_price].lowerPrice = sellPrice;
                        loadedToken.sellOrderBook[_price].higherPrice = loadedToken.sellOrderBook[sellPrice].higherPrice;
                        loadedToken.sellOrderBook[loadedToken.sellOrderBook[sellPrice].higherPrice].lowerPrice = _price;
                        loadedToken.sellOrderBook[sellPrice].higherPrice = _price;
                        finished = true;
                    }
                    sellPrice = loadedToken.sellOrderBook[sellPrice].higherPrice;
                }
            }
        } else { 
            uint256 prevLowest = loadedToken.sellOrderBook[_price].lowestPriority;
            uint256 currentLowest = prevLowest.add(1);
            loadedToken.sellOrderBook[_price].orders[currNumberOfOrders] = Order(_amount, _owner, prevLowest, currentLowest);
            loadedToken.sellOrderBook[_price].orders[prevLowest].lowerPriority = currentLowest;
            loadedToken.sellOrderBook[_price].lowestPriority = currentLowest;
        }
    }

    function removeBuyOrder(address _baseToken, address _token, uint256 _price) public {
        Token storage loadedToken = tokenList[_token];
        uint256 totalOffers = 0;
        ERC20 baseToken = ERC20(_baseToken);

        // remove all offers for this price
        uint256 counter = loadedToken.buyOrderBook[_price].highestPriority;
        uint256 lowerPriorityPointer;
        uint256 higherPriorityPointer;

        while (counter <= loadedToken.buyOrderBook[_price].numOfOrders) {
            if (loadedToken.buyOrderBook[_price].orders[counter].owner == msg.sender) {
                baseToken.reduceAllowance(msg.sender, address(this), ((loadedToken.sellOrderBook[_price].orders[counter].amount.mul(_price)).div(1e18)));
                totalOffers = totalOffers.add(1);
                loadedToken.buyOrderBook[_price].numOfOrders = loadedToken.buyOrderBook[_price].numOfOrders.sub(1);

                lowerPriorityPointer = loadedToken.buyOrderBook[_price].orders[counter].lowerPriority;
                higherPriorityPointer = loadedToken.buyOrderBook[_price].orders[counter].higherPriority;

                if (higherPriorityPointer == 0) {
                    // if this offer is first in queue
                    loadedToken.buyOrderBook[_price].highestPriority = lowerPriorityPointer;
                    loadedToken.buyOrderBook[_price].orders[loadedToken.buyOrderBook[_price].orders[counter].lowerPriority].higherPriority = 0;
                } else if (lowerPriorityPointer == loadedToken.buyOrderBook[_price].lowestPriority) {
                    // if this offer is last in queue
                    loadedToken.buyOrderBook[_price].lowestPriority = higherPriorityPointer;
                    loadedToken.buyOrderBook[_price].orders[higherPriorityPointer].lowerPriority = loadedToken.buyOrderBook[_price].lowestPriority;
                } else {
                    // if offer is in between orders
                    loadedToken.buyOrderBook[_price].orders[higherPriorityPointer].lowerPriority = lowerPriorityPointer;
                    loadedToken.buyOrderBook[_price].orders[lowerPriorityPointer].higherPriority = higherPriorityPointer;
                }
            }
            if (counter == loadedToken.buyOrderBook[_price].lowestPriority) {
                break;
            }
            counter = loadedToken.buyOrderBook[_price].orders[counter].lowerPriority;
        }

        uint256 lowerPricePointer = loadedToken.buyOrderBook[_price].lowerPrice;
        uint256 higherPricePointer = loadedToken.buyOrderBook[_price].higherPrice;

        if (loadedToken.buyOrderBook[_price].numOfOrders == 0 && totalOffers > 0) {
            // if no. of offers for this price is 0, this price is empty, remove this order book
            if (lowerPricePointer == 0 && higherPricePointer == _price) {
                // if this is the only price left
                loadedToken.buyOrderBook[_price].numOfOrders = 0;
                clearOrderBook(_token, _price, false);
            } else if (lowerPricePointer == 0) {
                // if this is the first price in order book list
                loadedToken.buyOrderBook[higherPricePointer].lowerPrice = 0;
                loadedToken.minBuyPrice = higherPricePointer;
                loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices.sub(1);
            } else if (higherPricePointer == _price) {
                // if this is the last price in order book list
                loadedToken.buyOrderBook[lowerPricePointer].higherPrice = lowerPricePointer;
                loadedToken.maxBuyPrice = lowerPricePointer;
                loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices.sub(1);
            } else {
                // if we are in between order book list
                loadedToken.buyOrderBook[lowerPricePointer].higherPrice = higherPricePointer;
                loadedToken.buyOrderBook[higherPricePointer].lowerPrice = lowerPricePointer;
                loadedToken.numOfBuyPrices = loadedToken.numOfBuyPrices.sub(1);
            }
        }
    }

    function removeSellOrder(address _baseToken, address _token, uint256 _price) public {
        Token storage loadedToken = tokenList[_token];
        uint256 totalOffers = 0;
        ERC20 token = ERC20(_token);

        // remove all offers for this price
        uint256 counter = loadedToken.sellOrderBook[_price].highestPriority;
        uint256 lowerPriorityPointer;
        uint256 higherPriorityPointer;

        while (counter <= loadedToken.sellOrderBook[_price].lowestPriority) {
            if (loadedToken.sellOrderBook[_price].orders[counter].owner == msg.sender) {
                token.reduceAllowance(msg.sender, address(this), loadedToken.sellOrderBook[_price].orders[counter].amount);
                totalOffers = totalOffers.add(1);
                loadedToken.sellOrderBook[_price].numOfOrders = loadedToken.sellOrderBook[_price].numOfOrders.sub(1);

                lowerPriorityPointer = loadedToken.sellOrderBook[_price].orders[counter].lowerPriority;
                higherPriorityPointer = loadedToken.sellOrderBook[_price].orders[counter].higherPriority;

                if (higherPriorityPointer == 0) {
                    // if this offer is first in queue                    
                    loadedToken.sellOrderBook[_price].highestPriority = lowerPriorityPointer;
                    loadedToken.sellOrderBook[_price].orders[lowerPriorityPointer].higherPriority = 0;
                } else if (lowerPriorityPointer == loadedToken.sellOrderBook[_price].lowestPriority) {
                    // if this offer is the last in queue
                    loadedToken.sellOrderBook[_price].lowestPriority = loadedToken.sellOrderBook[_price].orders[counter].higherPriority;
                    loadedToken.sellOrderBook[_price].orders[higherPriorityPointer].lowerPriority = loadedToken.sellOrderBook[_price].lowestPriority;
                } else {
                    //loadedToken.sellBook[_price].offers[counter].amount = 0;
                    // Set lower priority's higherPriority to current higherPriority
                    loadedToken.sellOrderBook[_price].orders[lowerPriorityPointer].higherPriority = higherPriorityPointer;
                    // Set higher priority's lowerPriority to current lowerPriority
                    loadedToken.sellOrderBook[_price].orders[higherPriorityPointer].lowerPriority = lowerPriorityPointer;
                }
            }
            if (counter == loadedToken.sellOrderBook[_price].lowestPriority) {
                break;
            }
            counter = loadedToken.sellOrderBook[_price].orders[counter].lowerPriority;
        } 

        uint256 lowerPricePointer = loadedToken.sellOrderBook[_price].lowerPrice;
        uint256 higherPricePointer = loadedToken.sellOrderBook[_price].higherPrice;

        if (loadedToken.sellOrderBook[_price].numOfOrders == 0 && totalOffers > 0){
            if (lowerPricePointer == 0 && higherPricePointer == _price) {
                // if this is the only price left
                loadedToken.sellOrderBook[_price].numOfOrders = 0;
                clearOrderBook(_token, _price, true);
            } else if (lowerPricePointer == 0) {
                // if this is the first price in orderbook list
                loadedToken.sellOrderBook[higherPricePointer].lowerPrice = 0;
                loadedToken.minSellPrice = higherPricePointer;
                loadedToken.numOfSellPrices = loadedToken.numOfSellPrices.sub(1);
            } else if (higherPricePointer == _price){
                // if this is the last price in the orderbook list
                loadedToken.sellOrderBook[lowerPricePointer].higherPrice = lowerPricePointer;
                loadedToken.maxSellPrice = lowerPricePointer;
                loadedToken.numOfSellPrices = loadedToken.numOfSellPrices.sub(1);
            } else {
                // if we are in between order book list
                loadedToken.sellOrderBook[lowerPricePointer].higherPrice = higherPricePointer;
                loadedToken.sellOrderBook[higherPricePointer].lowerPrice = lowerPricePointer;
                loadedToken.numOfSellPrices = loadedToken.numOfSellPrices.sub(1);
            }
        } 
    }

    function getUserSellOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        Token storage loadedToken = tokenList[_token];

        uint256 sellPrice = loadedToken.minSellPrice;
        uint256 counter = 0;
        if (loadedToken.minSellPrice > 0) {
            while (sellPrice <= loadedToken.maxSellPrice) {
                uint256 offerPointer = loadedToken.sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= loadedToken.sellOrderBook[sellPrice].numOfOrders) {
                    if (loadedToken.sellOrderBook[sellPrice].orders[offerPointer].owner == msg.sender) {
                        counter = counter.add(1);
                    }
                    offerPointer = offerPointer.add(1);
                }
                if (sellPrice == loadedToken.sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = loadedToken.sellOrderBook[sellPrice].higherPrice;
                }
            }
        }

        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        sellPrice = loadedToken.minSellPrice;
        counter = 0;
        bool offered;
        if (loadedToken.minSellPrice > 0) {
            while (sellPrice <= loadedToken.maxSellPrice) {
                offered = false;
                uint256 priceVolume = 0;
                uint256 offerPointer = loadedToken.sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= loadedToken.sellOrderBook[sellPrice].numOfOrders) {
                    if (loadedToken.sellOrderBook[sellPrice].orders[offerPointer].owner == msg.sender) {
                        ordersPrices[counter] = sellPrice;
                        priceVolume = priceVolume.add(loadedToken.sellOrderBook[sellPrice].orders[offerPointer].amount);
                        offered = true;
                    }
                    offerPointer = offerPointer.add(1);
                }
                if (offered) {
                    ordersVolumes[counter] = priceVolume;
                }
                if (sellPrice == loadedToken.sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = loadedToken.sellOrderBook[sellPrice].higherPrice;
                }
                counter = counter.add(1);
            }
        }
        return (ordersPrices, ordersVolumes);
    }

    function getUserBuyOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        Token storage loadedToken = tokenList[_token];

        uint256 buyPrice = loadedToken.minBuyPrice;
        uint256 counter = 0;
        if (loadedToken.maxBuyPrice > 0) {
            while (buyPrice <= loadedToken.maxBuyPrice) {
                uint256 offerPointer = loadedToken.buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= loadedToken.buyOrderBook[buyPrice].numOfOrders) {
                    if (loadedToken.buyOrderBook[buyPrice].orders[offerPointer].owner == msg.sender) {
                        counter = counter.add(1);
                    }
                    offerPointer = offerPointer.add(1);
                }

                if (buyPrice == loadedToken.buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = loadedToken.buyOrderBook[buyPrice].higherPrice;
                }
            }
        }

        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        buyPrice = loadedToken.minBuyPrice;
        counter = 0;
        bool offered;

        if (loadedToken.maxBuyPrice > 0) {
            while (buyPrice <= loadedToken.maxBuyPrice) {
                offered = false;

                uint256 priceVolume = 0;
                uint256 offerPointer = loadedToken.buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= loadedToken.buyOrderBook[buyPrice].numOfOrders) {
                    if (loadedToken.buyOrderBook[buyPrice].orders[offerPointer].owner == msg.sender) {
                        ordersPrices[counter] = buyPrice;
                        priceVolume = priceVolume.add(loadedToken.buyOrderBook[buyPrice].orders[offerPointer].amount);
                        offered = true;
                    }
                    offerPointer = offerPointer.add(1);
                }
                if (offered) {
                    ordersVolumes[counter] = priceVolume;
                }

                if (buyPrice == loadedToken.buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = loadedToken.buyOrderBook[buyPrice].higherPrice;
                }
                counter = counter.add(1);
            }
        }

        return (ordersPrices, ordersVolumes);
    }

    function getSellOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        Token storage loadedToken = tokenList[_token];

        uint256 sellPrice = loadedToken.minSellPrice;
        uint256 counter = 0;

        if (loadedToken.minSellPrice > 0) {
            while (sellPrice <= loadedToken.maxSellPrice) {
                uint256 offerPointer = loadedToken.sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= loadedToken.sellOrderBook[sellPrice].numOfOrders) {
                    offerPointer = offerPointer.add(1);
                    counter = counter.add(1);
                }
                if (sellPrice == loadedToken.sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = loadedToken.sellOrderBook[sellPrice].higherPrice;
                }
            }
        }

        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        sellPrice = loadedToken.minSellPrice;
        counter = 0;

        if (loadedToken.minSellPrice > 0) {
            while (sellPrice <= loadedToken.maxSellPrice) {
                // uint256 priceVolume = 0;
                uint256 offerPointer = loadedToken.sellOrderBook[sellPrice].highestPriority;

                while (offerPointer <= loadedToken.sellOrderBook[sellPrice].numOfOrders) {
                    // priceVolume = priceVolume.add(
                    //     loadedToken.sellOrderBook[sellPrice].offers[offerPointer]
                    //         .amount
                    // );

                    ordersPrices[counter] = sellPrice;
                    ordersVolumes[counter] = loadedToken.sellOrderBook[sellPrice].orders[offerPointer].amount;
                    offerPointer = offerPointer.add(1);
                    counter = counter.add(1);
                }
                if (sellPrice == loadedToken.sellOrderBook[sellPrice].higherPrice) {
                    break;
                } else {
                    sellPrice = loadedToken.sellOrderBook[sellPrice].higherPrice;
                }
            }
        }
        return (ordersPrices, ordersVolumes);
    }

    function getBuyOrders(address _token) public view returns (uint256[] memory, uint256[] memory) {
        Token storage loadedToken = tokenList[_token];

        uint256 buyPrice = loadedToken.minBuyPrice;
        uint256 counter = 0;

        if (loadedToken.maxBuyPrice > 0) {
            while (buyPrice <= loadedToken.maxBuyPrice) {
                uint256 offerPointer = loadedToken.buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= loadedToken.buyOrderBook[buyPrice].numOfOrders) {
                    counter = counter.add(1);
                    offerPointer = offerPointer.add(1);
                }

                if (buyPrice == loadedToken.buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = loadedToken.buyOrderBook[buyPrice].higherPrice;
                }
            }
        }
        uint256[] memory ordersPrices = new uint256[](counter);
        uint256[] memory ordersVolumes = new uint256[](counter);

        buyPrice = loadedToken.minBuyPrice;
        counter = 0;

        if (loadedToken.maxBuyPrice > 0) {
            while (buyPrice <= loadedToken.maxBuyPrice) {
                // uint256 priceVolume = 0;
                uint256 offerPointer = loadedToken.buyOrderBook[buyPrice].highestPriority;

                while (offerPointer <= loadedToken.buyOrderBook[buyPrice].numOfOrders) {
                    // priceVolume = priceVolume.add(
                    //     loadedToken.buyOrderBook[buyPrice].offers[offerPointer]
                    //         .amount
                    // );

                    ordersPrices[counter] = buyPrice;
                    ordersVolumes[counter] = loadedToken.buyOrderBook[buyPrice].orders[offerPointer].amount;

                    counter = counter.add(1);
                    offerPointer = offerPointer.add(1);
                }

                if (buyPrice == loadedToken.buyOrderBook[buyPrice].higherPrice) {
                    break;
                } else {
                    buyPrice = loadedToken.buyOrderBook[buyPrice].higherPrice;
                }
            }
        }

        return (ordersPrices, ordersVolumes);
    }

    // fallback() external payable {
    //     etherBalanceOfAddress[msg.sender] = etherBalanceOfAddress[msg.sender].add(msg.value);
    // }

    // function withdrawEth(uint256 _wei) public {
    //     etherBalanceOfAddress[msg.sender] = etherBalanceOfAddress[msg.sender].sub(_wei);
    //     msg.sender.transfer(_wei);
    // }

    // function ethToWethSwap(address _address) public payable {
    //     ERC20 tokenLoaded = ERC20(_address);
    //     tokenLoaded.mint.value(msg.value)(msg.sender);
    // }

    // function wethToEthSwap(address _address, uint256 amt) public {
    //     ERC20 tokenLoaded = ERC20(_address);
    //     tokenLoaded.burn(msg.sender, amt);
    // }

    modifier ethRequiredCheck(uint256 _price, uint256 _amount) {
        uint256 ethRequired = _price.mul(_amount);
        require(
            ethRequired >= _amount,
            "buy/sell TokenLimit: Eth required is < than amount"
        );
        require(
            ethRequired >= _price,
            "buy/sell TokenLimit: Eth required is < than price"
        );
        _;
    }

    function approveAndExchangeTokens(ERC20 firstToken, ERC20 secToken, uint firstTokenAmt, address owner, uint secTokenAmt) public {
        // in BUY ORDER: firstToken = weth, secToken = token
        // in SELL ORDER: firstToken = token, secToken = WETH
        // approve exchange to move token to owner
        firstToken.approve(msg.sender, address(this), firstTokenAmt); // address(this) is the smart contract itself

        exchangeTokens(firstToken, secToken, owner, firstTokenAmt, secTokenAmt);
    }

    function exchangeTokens(ERC20 firstToken, ERC20 secToken, address owner, uint firstTokenAmt, uint secTokenAmt) public {
        // send weth to maker
        firstToken.transferFrom(msg.sender, owner, firstTokenAmt);
        // send token to owner
        secToken.transferFrom(owner, msg.sender, secTokenAmt);
    }

    function clearOrderBook(address _token, uint price, bool isBuy) public {
        Token storage loadedToken = tokenList[_token];

        if (isBuy) {
            loadedToken.sellOrderBook[price].higherPrice = 0;
            loadedToken.sellOrderBook[price].lowerPrice = 0;
            loadedToken.numOfSellPrices = 0;
            loadedToken.maxSellPrice = 0;
            loadedToken.minSellPrice = 0;
        } else {
            loadedToken.buyOrderBook[price].higherPrice = 0;
            loadedToken.buyOrderBook[price].lowerPrice = 0;
            loadedToken.numOfBuyPrices = 0;
            loadedToken.minBuyPrice = 0;
            loadedToken.maxBuyPrice = 0;
        }
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

    function getTokenBalance(address user, address _tokenAddress) public view returns (uint256) {
        ERC20 tokenLoaded = ERC20(_tokenAddress);
        return tokenLoaded.balanceOf(user);
    }
}