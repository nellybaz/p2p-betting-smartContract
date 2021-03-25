// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract IERC20 {
    function approve(address spender, uint256 amount) public returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool);
    function balanceOf(address account) public view returns (uint256);
}