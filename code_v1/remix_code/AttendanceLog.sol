// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttendanceLog {
    address public hub;                // 최초엔 0x0, 나중에 setHub 로 지정
    constructor() { hub = address(0); }

    mapping(address => mapping(uint256 => bool)) public hasCheckedIn;
    mapping(address => uint256[]) private _datesByUser;

    event AttendanceLogged(address indexed user,
                           uint256 indexed date,
                           uint256 timestamp);

    modifier onlyHub() {
        require(msg.sender == hub, "Only Hub");
        _;
    }

    /* 한번만 호출: Hub 배포 후 소유권 설정 */
    function setHub(address hubAddr) external {
        require(hub == address(0), "Hub already set");
        require(hubAddr != address(0), "Zero addr");
        hub = hubAddr;
    }

    /* Hub 가 호출 */
    function logAttendanceFor(address user, uint256 date)
        external onlyHub
    {
        require(date > 20200000, "Date too old");
        require(!hasCheckedIn[user][date], "dup");

        hasCheckedIn[user][date] = true;
        _datesByUser[user].push(date);
        emit AttendanceLogged(user, date, block.timestamp);
    }

    function getAttendanceCount(address user)
        external view returns (uint256)
    {
        return _datesByUser[user].length;
    }
}
