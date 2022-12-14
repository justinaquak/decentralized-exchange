//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./ERC20.sol";

contract SILVER is ERC20 {

  uint256 private constant MAX_UINT256 = 2**256 - 1;
  mapping(address => uint256) private balanceOfAddress;
  mapping(address => mapping(address => uint256)) private allowed;

  string public name; 
  uint8 public decimals; 
  string public symbol; 
  uint256 public totalSupply;
  bool result;
  mapping(address => uint256) last_giveaway;

  constructor() {
    name = "SILVER";
    symbol = "AG";
    decimals = 18;
    totalSupply = 1000000e18; // 1 million

    balanceOfAddress[msg.sender] = totalSupply; // Give the creator all initial tokens
  }

  function faucet(address _from, address _to) public returns (bool success) {
    result = false;
    // Only allow to drip every two minutes to limit abuse
    if (block.timestamp - last_giveaway[msg.sender] < 2 minutes) {
        return false;
    }
    last_giveaway[msg.sender] = block.timestamp;
    allowed[_from][_to] = allowed[_from][_to] + (10 * 1e18);
    balanceOfAddress[_to] += (10 * 1e18);
    balanceOfAddress[_from] -= (10 * 1e18);
    result = true;
    return true;
  }

  function allowance(address _from, address _to) external view returns (uint256) {
    return allowed[_from][_to];
  }

  function approve(address _from, address _to, uint256 _value) public returns (bool success) {
    allowed[_from][_to] = allowed[_from][_to] + (_value * 1e18);
    emit Approval(_from, _to, (_value * 1e18), allowed[_from][_to]);
    return true;
  }

  function balanceOf(address _owner) external view returns (uint256 _balance) {
    return balanceOfAddress[_owner];
  }

  function transfer(address _to, uint256 _numberOfTokens) external returns (bool) {
    require(balanceOfAddress[msg.sender] >= (_numberOfTokens * 1e18));
    balanceOfAddress[msg.sender] -= (_numberOfTokens * 1e18);
    balanceOfAddress[_to] += (_numberOfTokens * 1e18);
    emit Transfer(msg.sender, _to, (_numberOfTokens * 1e18));
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _tokens) public returns (bool) {
    uint256 allowedAmount = allowed[_from][_to];
    require(balanceOfAddress[_from] >= (_tokens * 1e18) && allowedAmount >= (_tokens * 1e18));
    balanceOfAddress[_to] += (_tokens * 1e18);
    balanceOfAddress[_from] -= (_tokens * 1e18);
    if (allowedAmount < MAX_UINT256) {
      allowed[_from][_to] -= (_tokens * 1e18);
    }
    emit Transfer(_from, _to, (_tokens * 1e18)); 
    return true;
  }

  function reduceAllowance(address _from, address _to, uint256 _value) external returns (uint256 currentAllowance) {
    allowed[_from][_to] = allowed[_from][_to] - (_value * 1e18);
    emit Approval(_from, _to, (_value * 1e18), allowed[_from][_to]);
    return allowed[_from][_to];
  }

  function getResult() external view returns (bool){
    return result;
  }
}