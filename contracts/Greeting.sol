// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "./ERCInterface.sol";

contract Greeting{
    string name = "Nelson";
    event GreetingUpdate(
        uint date,
        address indexed from,
        string data
    );

    //  to receive eth as transactions
    // function() external payable fallback {}

    function getGreeting()public view returns (string memory) {
        return name;
    }
    
    function setGreeting(string memory _name) payable public {

        if(msg.value < 2000){
            revert();
        }
        name = _name;
        emit GreetingUpdate(now, msg.sender, _name);
    }

    function getBalanceOf(address ercAddress) public view returns (uint) {
        IERC20 tatCoin = IERC20(ercAddress);
        uint val = tatCoin.balanceOf(msg.sender);
        return val;
    }
}
