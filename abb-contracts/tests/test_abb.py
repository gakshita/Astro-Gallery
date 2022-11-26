from math import isclose

import brownie


def test_nft_creation(contracts, accounts, chain):

    tokenX = contracts["tokenX"]
    bfr_deployer = accounts[1]
    staking_contract = contracts["staking_contract"]
    user_1 = accounts[2]
    ONE_DAY = 86400
    transfer_amount = 1000 * int(1e18)
    amount = 100 * int(1e18)
    solana_address = accounts[3]
    apy = {
        "30" : 0.05,
        "60" : 0.1,
        "90" : 0.15
    }

    def test_all_reward_calculations():
        lock_up_period = 30
        assert (
            staking_contract.calculateReward(1000 * 1e18, lock_up_period) / 1e18
        ) == 4.109589041095891
        lock_up_period = 60
        assert (
            staking_contract.calculateReward(1000 * 1e18, lock_up_period) / 1e18
        ) == 16.438356164383563
        lock_up_period = 90
        assert (
            staking_contract.calculateReward(1000 * 1e18, lock_up_period) / 1e18
        ) == 36.986301369863014

    def test_user_flow_pre_staking():
        assert staking_contract.calculateUserReward(user_1) == 0
        assert staking_contract.totalStakedAmount() == 0
        assert staking_contract.claimableTokens(user_1) == 0
        assert tokenX.balanceOf(
            staking_contract.address
        ) == 0
        assert tokenX.balanceOf(user_1) == 0

    def test_initital_set_up(lock_up_period,amount_to_stake):
        assert tokenX.balanceOf(user_1) == 0
        initial_deployer_balance = tokenX.balanceOf(bfr_deployer) 

        with brownie.reverts("ERC20: transfer amount exceeds balance"):
            staking_contract.stake(
                amount_to_stake, lock_up_period, solana_address, {"from": user_1}
            )
        tokenX.transfer(user_1, amount_to_stake, {"from": bfr_deployer})
        initial_tokenX_balance_user_1 = tokenX.balanceOf(user_1)
        assert tokenX.balanceOf(user_1) == amount_to_stake
        assert tokenX.balanceOf(bfr_deployer) == initial_deployer_balance - amount_to_stake

        assert initial_tokenX_balance_user_1 == amount_to_stake
        with brownie.reverts("ERC20: transfer amount exceeds allowance"):
            staking_contract.stake(
                amount_to_stake, lock_up_period, solana_address, {"from": user_1}
            )
        tokenX.approve(staking_contract.address, amount_to_stake, {"from": user_1})

    def test_staking_flow(lock_up_period, amount_to_stake):
        initial_tokenX_balance_of_staking_contract = tokenX.balanceOf(
            staking_contract.address
        )
        initial_total_staked_amount = staking_contract.totalStakedAmount()
        stake_transaction = staking_contract.stake(
            amount_to_stake, lock_up_period, solana_address, {"from": user_1}
        )

        assert tokenX.balanceOf(staking_contract.address) == initial_tokenX_balance_of_staking_contract+amount_to_stake
        assert staking_contract.totalStakedAmount() == initial_total_staked_amount+ amount_to_stake

        assert stake_transaction.events["Stake"]["account"] == user_1
        assert stake_transaction.events["Stake"]["amount"] == amount_to_stake
        assert stake_transaction.events["Stake"]["lockUpPeriod"] == lock_up_period
        assert stake_transaction.events["Stake"]["solanaAddress"] == solana_address

    
    def test_rewards(lock_up_period,amount_to_stake):
        # TODO: Removed a view from calculateUserReward function since the chain.sleep does not work on view txns
        chain.snapshot()
        assert (
            staking_contract.calculateUserReward(user_1) == 0
        ), "Wrong user reward"
        chain.sleep(int(lock_up_period/2) * ONE_DAY)
        chain.mine(2)
        assert isclose(
            staking_contract.calculateUserReward(user_1),
            (apy[str(lock_up_period)] * amount_to_stake * lock_up_period/2) / 365,
            abs_tol=10,
        )
        chain.sleep(lock_up_period * ONE_DAY)
        chain.mine(2)
        assert isclose(
            staking_contract.calculateUserReward(user_1),
            (apy[str(lock_up_period)] * amount_to_stake * lock_up_period) / 365,
            abs_tol=10,
        )
        chain.sleep((lock_up_period+35) * ONE_DAY)
        chain.mine(2)
        assert isclose(
            staking_contract.calculateUserReward(user_1),
            (apy[str(lock_up_period)] * amount_to_stake * lock_up_period) / 365,
            abs_tol=10,
        )
        chain.revert()

    def test_claimable_tokens(amount_to_stake):
        # TODO: Removed a view from claimableTokens function since the chain.sleep does not work on view txns
        chain.snapshot()
        assert (
            staking_contract.claimableTokens(user_1) == 0
        ), "Incorrect claimable tokens"
        chain.sleep(15 * ONE_DAY)
        chain.mine(2)
        assert (
            staking_contract.claimableTokens(user_1) == 0
        ), "Incorrect claimable tokens"
        chain.sleep(30 * ONE_DAY)
        chain.mine(2)
        assert (
            staking_contract.claimableTokens(user_1) == amount_to_stake
        ), "Incorrect claimable tokens"
        chain.sleep(95 * ONE_DAY)
        chain.mine(2)
        assert (
            staking_contract.claimableTokens(user_1) == amount_to_stake
        ), "Incorrect claimable tokens"
        chain.revert()

    def test_withdraw_flow(lock_up_period):
        # Withdraw before lock up period
        initial_tokenX_balance_of_staking_contract = tokenX.balanceOf(
            staking_contract.address
        )
        initial_total_staked_amount = staking_contract.totalStakedAmount()
        initial_user_balance = tokenX.balanceOf(user_1)
        claimable_tokens = staking_contract.claimableTokens(user_1) 
        withdraw_transaction = staking_contract.withdraw(
            {"from": user_1}
        )
        assert tokenX.balanceOf(user_1) == initial_user_balance
        assert claimable_tokens == 0
        assert tokenX.balanceOf(staking_contract.address) == initial_tokenX_balance_of_staking_contract
        assert staking_contract.totalStakedAmount() == initial_total_staked_amount 
        assert staking_contract.calculateUserReward(user_1) == 0
        # assert withdraw_transaction.events["Withdraw"]["account"] == user_1

        # Withdraw after lock up period
        chain.sleep(lock_up_period * ONE_DAY)
        chain.mine(2)
        initial_tokenX_balance_of_staking_contract = tokenX.balanceOf(
            staking_contract.address
        )
        initial_total_staked_amount = staking_contract.totalStakedAmount()
        initial_user_balance = tokenX.balanceOf(user_1)
        claimable_tokens = staking_contract.claimableTokens(user_1) 
        withdraw_transaction = staking_contract.withdraw(
            {"from": user_1}
        )
        assert tokenX.balanceOf(user_1) == initial_user_balance + amount
        assert claimable_tokens == amount
        assert tokenX.balanceOf(staking_contract.address) == initial_tokenX_balance_of_staking_contract - amount
        assert staking_contract.totalStakedAmount() == initial_total_staked_amount - amount
        assert withdraw_transaction.events["Withdraw"]["account"] == user_1
        assert withdraw_transaction.events["Withdraw"]["amount"] == amount
        assert withdraw_transaction.events["Withdraw"]["lockUpPeriod"] == lock_up_period
        assert withdraw_transaction.events["Withdraw"]["solanaAddress"] == solana_address
        assert isclose(
            staking_contract.calculateUserReward(user_1),
            withdraw_transaction.events["Withdraw"]["reward"],
            abs_tol=10,
        )

    # Flow before staking
    test_all_reward_calculations()
    test_user_flow_pre_staking()

    
    # Staking flow testing
    lock_up_period = 30
    test_initital_set_up(lock_up_period, transfer_amount)
    test_staking_flow(lock_up_period, amount)
    test_rewards(lock_up_period, amount)
    test_claimable_tokens(amount)

    # Withdraw flow testing
    # test_withdraw_flow(lock_up_period)

    # Staking flow testing
    lock_up_period = 60
    test_staking_flow(lock_up_period, amount)

    # Staking flow testing
    lock_up_period = 90
    test_staking_flow(lock_up_period, amount)
    