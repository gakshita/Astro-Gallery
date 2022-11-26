import { ethers } from 'ethers'
import { useMulticallContract } from '../hooks/useContract'
export interface Call {
  address: string // Address of the contract
  name: string // Function name on the contract (example: balanceOf)
  params?: any[] // Function params
  abi: any[] // Abi of the contract
}

export const multicallv2 = async (calls: Call[]) => {
  if (!calls.length) return null

  const calldata = calls.map((call) => {
    const itf = ethers.utils && new ethers.utils.Interface(call.abi)
    return [
      call.address.toLowerCase(),
      itf.encodeFunctionData(call.name, call.params),
    ]
  })

  const contract = useMulticallContract()
  const returnData = contract && (await contract.callStatic.aggregate(calldata))

  if (typeof returnData === 'undefined') return
  const res = returnData.returnData.map((call: any, i: number) => {
    const [data] = call
    if (!call) return null
    const itf = new ethers.utils.Interface(calls[i].abi)
    return itf.decodeFunctionResult(calls[i].name, call)
  })

  return res
}
