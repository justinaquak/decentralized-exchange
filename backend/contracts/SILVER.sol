//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./SafeMath.sol";
import "./ERC20.sol";

contract SILVER is ERC20 {

  using SafeMath for uint256;

  uint256 private constant MAX_UINT256 = 2**256 - 1;
  mapping(address => uint256) private balanceOfAddress;
  mapping(address => mapping(address => uint256)) private allowed;

  string public name; 
  uint8 public decimals; 
  string public symbol; 
  uint256 public totalSupply;

  constructor() {
    name = "SILVER";
    symbol = "AG";
    decimals = 18;
    totalSupply = 1000000e18; // 1 million

    balanceOfAddress[msg.sender] = totalSupply; // Give the creator all initial tokens
  }

  function allowance(address _owner, address _spender) external view returns (uint256) {
    return allowed[_owner][_spender];
  }

  function approve(address _owner, address _spender, uint256 _value) external returns (bool success) {
    allowed[_owner][_spender] = allowed[_owner][_spender].add(_value);
    emit Approval(_owner, _spender, _value, allowed[_owner][_spender]);
    return true;
  }

  function balanceOf(address _owner) external view returns (uint256 _balance) {
    return balanceOfAddress[_owner];
  }

  function transfer(address _to, uint256 _numberOfTokens) external returns (bool) {
    require(balanceOfAddress[msg.sender] >= _numberOfTokens);
    balanceOfAddress[msg.sender] -= _numberOfTokens;
    balanceOfAddress[_to] += _numberOfTokens;
    emit Transfer(msg.sender, _to, _numberOfTokens);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _tokens) external returns (bool) {
    uint256 allowedAmount = allowed[_from][msg.sender];
    require(balanceOfAddress[_from] >= _tokens && allowedAmount >= _tokens);
    balanceOfAddress[_to] += _tokens;
    balanceOfAddress[_from] -= _tokens;
    if (allowedAmount < MAX_UINT256) {
      allowed[_from][msg.sender] -= _tokens;
    }
    emit Transfer(_from, _to, _tokens); 
    return true;
  }

  function reduceAllowance(address _owner, address _spender, uint256 _value) external returns (uint256 currentAllowance) {
    allowed[_owner][_spender] = allowed[_owner][_spender].sub(_value);
    emit Approval(_owner, _spender, _value, allowed[_owner][_spender]);
    return allowed[_owner][_spender];
  }
}