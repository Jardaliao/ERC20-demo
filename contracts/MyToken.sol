// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint256 private claimUnit;
    uint256 private claimInterval;
    // address => last claimed timestamp
    mapping(address => uint256) private lastClaimed;

    constructor(
        uint256 initialSupply
    ) ERC20("DemoToken", "DTK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
        claimUnit = 10 * 10 ** decimals();
        claimInterval = 1 days;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function getClaimUnit() external view returns (uint256) {
        return claimUnit;
    }

    function setClaimUnit(uint256 _claimUnit) external onlyOwner {
        claimUnit = _claimUnit;
    }

    function getLastClaimed(address addr) external view returns (uint256) {
        return lastClaimed[addr];
    }

    error ClaimTooEarly(uint256 remainingTime);
    event Claimed(address indexed to, uint256 amount);

    function claim(address to) external {
        require(claimUnit > 0, "Claim unit is 0");
        uint256 lastClaimedTimestamp = lastClaimed[to];
        uint256 currentTimestamp = block.timestamp;

        if (currentTimestamp >= lastClaimedTimestamp + claimInterval) {
            _transfer(owner(), to, claimUnit);
            lastClaimed[to] = currentTimestamp;
            emit Claimed(to, claimUnit);
        } else {
            revert ClaimTooEarly(lastClaimedTimestamp + claimInterval - currentTimestamp);
        }
    }
}
