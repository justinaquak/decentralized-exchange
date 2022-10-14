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
        uint256 higherPriority; // TODO
        uint256 lowerPriority; // TODO
    }

    struct OrderBook {
        uint256 higherPrice; // TODO, do we need both?
        uint256 lowerPrice; // TODO, do we need both? 
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
                        // approve exchange to move token to owner
                        baseToken.approve(msg.sender, address(this), etherAmount); // address(this) is the smart contract itself
                        // send weth to maker
                        baseToken.transferFrom(msg.sender, 
                                            loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner,
                                             etherAmount);
                        // send token to taker
                        token.transferFrom(loadedToken.sellOrderBook[buyPrice].orders[offerPointer].owner,
                                            msg.sender,
                                            volumeAtPointer);
                        
                        loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount = 0;

                        loadedToken.sellOrderBook[buyPrice]
                            .highestPriority = loadedToken.sellOrderBook[buyPrice].orders[offerPointer].lowerPriority; // TODO

                        remainingAmount = remainingAmount.sub(volumeAtPointer);
                    } else {
                        feedback[1] = true; // insufficient ether
                    }
                } else {
                    if (loadedToken.sellOrderBook[buyPrice].orders[offerPointer].amount > remainingAmount) {
                        // current offer has more than enough to fulfill this order's volume
                        etherAmount = (remainingAmount.mul(buyPrice)).div(1e18);
                    }
                }
            }
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

    function getTokenBalance(address user, address _tokenAddress) public view returns (uint256)
    {
        ERC20 tokenLoaded = ERC20(_tokenAddress);
        return tokenLoaded.balanceOf(user);
    }

}