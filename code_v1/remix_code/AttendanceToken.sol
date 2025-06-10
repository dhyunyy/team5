// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ⬇️ 반드시 4.9.3 접두어 포함 */
import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract AttendanceToken is ERC20, Ownable {
    constructor() ERC20("Attendance Token", "ATTN") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}