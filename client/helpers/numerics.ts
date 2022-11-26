import { ethers } from 'ethers'
export const convertBigToNum = (data: any) => {
  let numeric_data: any[] = []

  data.forEach((value: any, key: number) => {
    if (value[0]._isBigNumber) {
      numeric_data.push(
        ethers.utils.formatEther(ethers.utils.formatUnits(value[0]._hex, 0))
      )
    } else {
      numeric_data.push(value)
    }
  })
  return numeric_data
}

export const toWei = (value: number) => {
  return (value * 1e18).toLocaleString('fullwide', {
    useGrouping: false,
  })
}

export const numberWithCommas = (x: any) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
