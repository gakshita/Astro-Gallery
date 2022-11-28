import ABB from './ABI/ABB.json'
import Staking from './ABI/Staking.json'

export const network_config = {
  testnet: {
    chainId: '0x61',
    rpcUrls: ['https://bsctestapi.terminet.io/rpc'],
    chainName: 'Binance Test Network',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://testnet.bscscan.io'],
  },
  mainnet: {
    chainId: '0x38',
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    chainName: `Binance Smart Chain Mainnet`,
    nativeAsset: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: [`https://bscscan.com/`],
  },
}
export const ALL_CONTRACTS = {
  testnet: {
    ABB: '0xA167211Aa0DcD4453Bc7D05d5CA0667De25fa2f6',
    Multicall: '0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042',
    Staking: '0xD8907242BE96EB5d6f378D311eE0dD058181088f',
  },
  mainnet: {
    ABB: '0x277aE79C42c859cA858d5A92C22222C8b65c6D94',
    Multicall: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb',
    Staking: '0x6e2c2D3a4Fc624C69A5786818A9F2d9E06Dcd5F7',
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
