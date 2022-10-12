//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Token.sol';

contract Dex {

  ERC20 public token;

  mapping (uint => TokenStore) tokenStores;
  mapping (string => uint) reverseTokenStore;
  uint tokenIndex;
  mapping(address => mapping(uint => uint)) tokenBalanceForAddress;

  struct TokenStore {
    address contractAddress;
    string symbolName;
    OrderBook sellOrderBook;
    OrderBook buyOrderBook;
    uint orderCount;
  }

  struct OrderBook {
    mapping (uint => MarketOrder) marketOrders; 
  }

  struct MarketOrder {
    string symbol;
    address owner;
    uint amount;
  }

  constructor(string memory _name, string memory _symbol) {
    token = new Token(_name, _symbol);
    tokenIndex = 0;
  }

  // Helper functions
  // hasToken
  // getBalanceForToken

  // Add Token into tokenStore
  function addToken(string memory _symbolName, address _contractAddress) public returns (uint) {
     tokenStores[tokenIndex].contractAddress = _contractAddress;
     tokenStores[tokenIndex].symbolName = _symbolName;
     tokenStores[tokenIndex].orderCount = 0;
     
     reverseTokenStore[_symbolName] = tokenIndex;
     tokenIndex++;
     return tokenIndex;
  }

  // Deposit Token
  function depositToken(string memory _symbolName, uint amount) public {
    // TODO require msg.sender has token, and sufficient balance
    uint temp = reverseTokenStore[_symbolName];
    tokenBalanceForAddress[msg.sender][temp] += amount;
  }

  // Withdraw Token
  function withdrawToken(string memory _symbolName, uint amount) public {
    // TODO require msg.sender has token, and sufficient balance
    uint temp = reverseTokenStore[_symbolName];
    tokenBalanceForAddress[msg.sender][temp] -= amount;
  }

  // Create orders
  function createOrder(string memory buySymbol, uint buyAmount, string memory sellSymbol, uint sellAmount) public {
    // TODO check for price condition
    uint buySymbolIndex = reverseTokenStore[buySymbol];
    uint orderIndex = tokenStores[buySymbolIndex].orderCount;
    createBuyOrder(buySymbolIndex, orderIndex, buySymbol, buyAmount);
    createSellOrder(buySymbolIndex, orderIndex, buySymbol, sellSymbol, sellAmount);
    tokenStores[buySymbolIndex].orderCount++;
  }

  function createBuyOrder(uint buySymbolIndex, uint orderIndex, string memory buySymbol, uint buyAmount) public {
    tokenStores[buySymbolIndex].buyOrderBook.marketOrders[orderIndex].symbol = buySymbol;
    tokenStores[buySymbolIndex].buyOrderBook.marketOrders[orderIndex].amount = buyAmount;
    tokenStores[buySymbolIndex].buyOrderBook.marketOrders[orderIndex].owner = msg.sender;
  }

  function createSellOrder(uint buySymbolIndex, uint orderIndex, string memory buySymbol, string memory sellSymbol, uint sellAmount) public {
    tokenStores[buySymbolIndex].sellOrderBook.marketOrders[orderIndex].symbol = sellSymbol;
    tokenStores[buySymbolIndex].sellOrderBook.marketOrders[orderIndex].amount = sellAmount;
    tokenStores[buySymbolIndex].sellOrderBook.marketOrders[orderIndex].owner = msg.sender;
  }

  function buy() payable public {
    uint256 amountTobuy = msg.value;
    uint256 dexBalance = token.balanceOf(address(this));
    require(amountTobuy > 0, "You need to send some ether");
    require(amountTobuy <= dexBalance, "Not enough tokens in the reserve");
    token.transfer(msg.sender, amountTobuy);
    // emit Bought(amountTobuy);
  }

  function sell(uint256 amount) public {
    // TODO
  }
}