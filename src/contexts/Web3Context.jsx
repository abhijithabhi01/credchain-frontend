import { createContext, useContext, useState } from 'react'
import { ethers } from 'ethers'

const Web3Context = createContext()
export const useWeb3 = () => useContext(Web3Context)

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    if (!window.ethereum) return
    setIsConnecting(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      setAccount(accounts[0])
    } catch (e) {
      console.error(e)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Web3Context.Provider value={{ account, isConnecting, connectWallet, disconnectWallet: () => setAccount(null) }}>
      {children}
    </Web3Context.Provider>
  )
}
