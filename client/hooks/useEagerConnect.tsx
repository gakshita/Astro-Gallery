import { useState, useEffect } from 'react'
import { network_config } from '../config'
declare var window: any

const useEagerConnect = () => {
  const [account, setAccount] = useState('')

  const connectWallet = async () => {
    const { ethereum } = window
    const config = network_config[process.env.ENV]
    if (ethereum) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainId }],
        })
      } catch (error) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [config],
        })
        console.log('Error connecting to metamask', error)
      }
    }
  }

  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain:' + chainId)
    const env = 'testnet'

    if (chainId !== '0x61') {
      await connectWallet()
    }
  }
  // Checks if wallet is connected
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window
    if (ethereum) {
      await checkCorrectNetwork()
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log(accounts)
      if (accounts.length !== 0) {
        console.log('Found authorized Account: ', accounts[0])
        setAccount(accounts[0])
        return
      } else {
        console.log('No authorized account found')
      }
    } else {
      console.log('No Wallet found. Connect Wallet')
    }
    return null
  }
  useEffect(() => {
    checkIfWalletIsConnected()
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        setAccount('')
        checkIfWalletIsConnected()
      })
      window.ethereum.on('accountsChanged', () => {
        checkIfWalletIsConnected()
      })
    }
  }, [])

  return { account, connectWallet }
}

export default useEagerConnect
