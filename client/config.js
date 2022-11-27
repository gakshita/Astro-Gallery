import ABB from './ABI/ABB.json'
import Staking from './ABI/Staking.json'

export const network_config = {
  testnet: {
    chainId: '0x61',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    chainName: 'Binance Test Network',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://testnet.bscscan.io'],
  },
}
export const ALL_CONTRACTS = {
  testnet: {
    ABB: '0xA167211Aa0DcD4453Bc7D05d5CA0667De25fa2f6',
    Multicall: '0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042',
    Staking: '0xD0D8f998323F9686Bf077b1b19C1642bDE45A8c6',
  },
}

export const getCallData = (account) => {
  var contracts = ALL_CONTRACTS[process.env.ENV]
  return [
    {
      address: contracts.ABB,
      abi: ABB,
      name: 'balanceOf',
      params: [account],
    },
    {
      address: contracts.ABB,
      abi: ABB,
      name: 'allowance',
      params: [account, contracts.Staking],
    },
    {
      address: contracts.Staking,
      abi: Staking,
      name: 'claimableTokens',
      params: [account],
    },
    {
      address: contracts.Staking,
      abi: Staking,
      name: 'calculateUserReward',
      params: [account],
    },
  ]
}
