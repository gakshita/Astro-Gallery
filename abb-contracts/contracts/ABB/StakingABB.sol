// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingABB {
    ERC20 public tokenX;
    uint256 public totalStakedAmount;
    struct StakedAmount {
        uint256 depositTimestamp;
        uint256 amount;
        uint256 lockUpPeriod;
        address solanaAddress;
    }
    struct StakeDetail {
        uint256 withdrawnAmount;
        StakedAmount[] stakedAmounts;
    }
    event Stake(
        address indexed account,
        uint256 amount,
        uint256 lockUpPeriod,
        address solanaAddress
    );
    event Withdraw(
        address indexed account,
        uint256 amount,
        uint256 lockUpPeriod,
        uint256 depositTimestamp,
        address solanaAddress,
        uint256 reward
    );

    mapping(address => StakeDetail) public stakeDetailPerUser;
    mapping(uint256 => uint256) public lockupDaysToAPY;

    // Sets the lock-up days with their corresponding APY in the constructor
    constructor(ERC20 _tokenX) {
        tokenX = _tokenX;
        lockupDaysToAPY[30] = 500;
        lockupDaysToAPY[60] = 1000;
        lockupDaysToAPY[90] = 1500;
    }

    // Reward will be returned with a factor of 1e18 (ABB token decimals)
    function _calculateReward(
        uint256 amount,
        uint256 lockUpDays,
        uint256 dayCount
    ) internal view returns (uint256 reward) {
        dayCount = dayCount > lockUpDays ? lockUpDays : dayCount;
        reward =
            (lockupDaysToAPY[lockUpDays] * amount * dayCount) /
            (365 * 1e4);
    }

    // lockUpDays : Input in number of days
    // Reward will be returned with a factor of 1e18 (ABB token decimals)
    function calculateReward(uint256 amount, uint256 lockUpDays)
        external
        view
        returns (uint256 reward)
    {
        uint256 dayCount = lockUpDays;
        reward = _calculateReward(amount, lockUpDays, dayCount);
    }

    function calculateUserReward(address account)
        external
        view
        returns (uint256 reward)
    {
        StakedAmount[] memory userStakingDetails = stakeDetailPerUser[account]
            .stakedAmounts;
        for (uint256 n = 0; n < userStakingDetails.length; n++) {
            uint256 dayCount = (block.timestamp -
                userStakingDetails[n].depositTimestamp) / 86400;
            reward += _calculateReward(
                userStakingDetails[n].amount,
                userStakingDetails[n].lockUpPeriod,
                dayCount
            );
        }
    }

    function claimableTokens(address account)
        external
        view
        returns (uint256 tokens)
    {
        StakedAmount[] memory userStakingDetails = stakeDetailPerUser[account]
            .stakedAmounts;
        for (uint256 n = 0; n < userStakingDetails.length; n++) {
            if (
                userStakingDetails[n].depositTimestamp +
                    (userStakingDetails[n].lockUpPeriod * 86400) <=
                block.timestamp
            ) {
                tokens += userStakingDetails[n].amount;
            }
        }
    }

    // Lockup period is in days
    function stake(
        uint256 amount,
        uint256 lockUpPeriod,
        address solanaAddress
    ) external {
        address account = msg.sender;
        bool success = tokenX.transferFrom(account, address(this), amount);
        require(success, "Staking didn't go through");
        StakedAmount memory amountStaked = StakedAmount(
            block.timestamp,
            amount,
            lockUpPeriod,
            solanaAddress
        );
        stakeDetailPerUser[account].stakedAmounts.push(amountStaked);
        totalStakedAmount += amount;
        emit Stake(account, amount, lockUpPeriod, solanaAddress);
    }

    function withdraw() external {
        StakedAmount[] memory userStakingDetails = stakeDetailPerUser[
            msg.sender
        ].stakedAmounts;
        StakedAmount[] memory revisedUserStakingDetails;
        for (uint256 n = 0; n < userStakingDetails.length; n++) {
            if (
                userStakingDetails[n].depositTimestamp +
                    userStakingDetails[n].lockUpPeriod <=
                block.timestamp
            ) {
                bool success = tokenX.transfer(
                    msg.sender,
                    userStakingDetails[n].amount
                );
                require(success, "The Withdrawal didn't go through");
                totalStakedAmount -= userStakingDetails[n].amount;
                uint256 reward = _calculateReward(
                    userStakingDetails[n].amount,
                    userStakingDetails[n].lockUpPeriod,
                    userStakingDetails[n].lockUpPeriod
                );

                emit Withdraw(
                    msg.sender,
                    userStakingDetails[n].amount,
                    userStakingDetails[n].lockUpPeriod,
                    userStakingDetails[n].depositTimestamp,
                    userStakingDetails[n].solanaAddress,
                    reward
                );
            } else {
                revisedUserStakingDetails[
                    userStakingDetails.length
                ] = userStakingDetails[n];
            }
        }
        for (uint256 n = 0; n < revisedUserStakingDetails.length; n++) {
            stakeDetailPerUser[msg.sender].stakedAmounts[
                    n
                ] = revisedUserStakingDetails[n];
        }
    }
}
