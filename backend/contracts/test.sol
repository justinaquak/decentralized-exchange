//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

contract test {
    address private owner;
  
     // Defining a constructor   
     constructor() public{   
        owner=msg.sender;
    }
  
    // Function to get 
    // address of owner
    function getOwner(
    ) public view returns (address) {    
        return owner;
    }
  
    // Function to return 
    // current balance of owner
    function getBalance(
    ) public view returns(uint256){
        return owner.balance;
    }
}
