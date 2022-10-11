//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Token.sol';

contract Dex {

  ERC20 public token;

  event Bought(uint256 amount);
  event Sold(uint256 amount);

  constructor(string memory _name, string memory _symbol) {
    token = new Token(_name, _symbol);
  }

  function buy() payable public {
    uint256 amountTobuy = msg.value;
    uint256 dexBalance = token.balanceOf(address(this));
    require(amountTobuy > 0, "You need to send some ether");
    require(amountTobuy <= dexBalance, "Not enough tokens in the reserve");
    token.transfer(msg.sender, amountTobuy);
    emit Bought(amountTobuy);
  }

  function sell(uint256 amount) public {
    // TODO
  }
}