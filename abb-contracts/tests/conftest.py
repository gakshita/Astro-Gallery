#!/usr/bin/python3

import time
from enum import IntEnum

import pytest


@pytest.fixture(scope="module")
def contracts(accounts, AstroToken, BFR, StakingABB):

    tokenX = BFR.deploy({"from": accounts[1]})

    staking_contract = StakingABB.deploy(tokenX.address, {"from": accounts[0]})

    return {
        "tokenX": tokenX,
        "staking_contract": staking_contract,
    }
