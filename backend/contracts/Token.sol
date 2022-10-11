//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface ERC20 {
  function getName() external view returns (string memory);
	function getSymbol() external view returns (string memory);
	function getDecimals() external view returns (uint8);
  function getTotalSupply() external view returns (uint);

  function balanceOf(address account) external view returns (uint);
  function transfer(address recipient, uint amount) external returns (bool);

  event Transfer(address indexed from, address indexed to, uint value);
}

contract Token is ERC20 {
  uint8 public decimals = 18; // standard 18
  uint public totalSupply = 100000e18; // instantiates 100,000 tokens
  string public name;
  string public symbol;

  mapping(address => uint) public balanceOf;

  constructor(string memory _name, string memory _symbol) {
    name = _name;
    symbol = _symbol;

    balanceOf[msg.sender] = totalSupply;
  }

  function getName() external view returns (string memory) {return name;}
  function getSymbol() external view returns (string memory) {return symbol;}
  function getDecimals() external view returns (uint8) {return decimals;}
  function getTotalSupply() external view returns (uint) {return totalSupply;}

  function balance(address _owner) external view returns (uint256) {
    return balanceOf[_owner];
  }

  function transfer(address _to, uint _amount) external returns (bool) {
    //TODO
    balanceOf[msg.sender] -= _amount;
    balanceOf[_to] += _amount;
    emit Transfer(msg.sender, _to, _amount);
    return true;
  }
}