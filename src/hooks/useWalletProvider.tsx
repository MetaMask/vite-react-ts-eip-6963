import { useContext } from 'react'
import { WalletProviderContext } from './WalletProvider'

export const useWalletProvider = () => useContext(WalletProviderContext)