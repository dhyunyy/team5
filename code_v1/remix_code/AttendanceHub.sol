// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ▼ 한 줄 추가 – Ownable 상속 */
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

interface IAttendanceLog {
    function logAttendanceFor(address user, uint256 date) external;
    function getAttendanceCount(address user) external view returns (uint256);
}
interface IAttendanceToken {
    function mint(address to, uint256 amount) external;
}

/* ▼ Ownable 을 상속하면, 배포한 계정이 자동으로 owner 가 됨 */
contract AttendanceHub is Ownable {
    IAttendanceLog   public log;
    IAttendanceToken public token;

    uint256 public rewardEvery  = 3;
    uint256 public rewardAmount = 1 ether;   // 18 decimals

    constructor(address logAddr, address tokenAddr) {
        log   = IAttendanceLog(logAddr);
        token = IAttendanceToken(tokenAddr);
    }

    /* ⬇️ setter 두 개 – onlyOwner 보호 */
    function setRewardEvery(uint256 n) external onlyOwner {
        require(n > 0, "must be >0");
        rewardEvery = n;
    }
    function setRewardAmount(uint256 weiAmt) external onlyOwner {
        require(weiAmt > 0, "must be >0");
        rewardAmount = weiAmt;
    }

    function logAndReward(uint256 date) external {
        log.logAttendanceFor(msg.sender, date);

        uint256 cnt = log.getAttendanceCount(msg.sender);
        if (cnt % rewardEvery == 0) {
            token.mint(msg.sender, rewardAmount);
        }
    }
}
