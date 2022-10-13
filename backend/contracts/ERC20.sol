//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface ERC20 {
    function allowance(address _owner, address _spender) external view returns (uint256);

    function approve(address _owner, address _spender, uint256 _value) external returns (bool success);

    function balanceOf(address _owner) external view returns (uint256 _balance);

    function transfer(address _to, uint256 _numberOfTokens) external returns (bool);

    function transferFrom(address _from, address _to, uint256 _tokens) external returns (bool);

    function reduceAllowance(address _owner, address _spender, uint256 _value) external returns (uint256 currentAllowance);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value, uint256 _currentApproval);
}