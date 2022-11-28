import { useState, useEffect } from 'react'
import { network_config } from '../config'
import { ToastContainer, toast } from 'react-toastify'
declare var window: any

const useEagerConnect = () => {
  const [account, setAccount] = useState('')

  const connectWallet = async () => {
    const { ethereum } = window
    const config = network_config[process.env.ENV]
    if (ethereum) {
      await ethereum.enable()
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainId }],
        })
      } catch (error: any) {
        if (error.code == 4902)
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          })
        console.log('Error connecting to metamask', error)
      }
    } else {
      toast.error('No wallet found')
    }
  }

  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain:' + chainId)

    if (chainId !== network_config[process.env.ENV].chainId) {
      await connectWallet()
    }
  }
  // Checks if wallet is connected
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window
    if (ethereum) {
      await ethereum.enable()
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
