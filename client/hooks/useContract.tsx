import { ALL_CONTRACTS } from '../config.js'
import { ethers } from 'ethers'
import ABB from '../ABI/ABB.json'
import Multicall from '../ABI/Multicall.json'
import Staking from '../ABI/Staking.json'

declare var window: any

const useABBContract = () => {
  if (window) {
    const { ethereum } = window
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(
      ALL_CONTRACTS[process?.env.ENV]['ABB'],
      ABB,
      signer
    )
  }
}

export const useMulticallContract = () => {
  if (window) {
    const { ethereum } = window
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(
      ALL_CONTRACTS[process.env.ENV]['Multicall'],
      Multicall,
      signer
    )
  }
}

export const useStakingContract = () => {
  if (window) {
    const { ethereum } = window
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(
      ALL_CONTRACTS[process.env.ENV]['Staking'],
      Staking,
      signer
    )
  }
}

export default useABBContract
