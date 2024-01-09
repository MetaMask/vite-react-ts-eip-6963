/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './DiscoverWalletProviders.module.css'
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'

export const  DiscoverWalletProviders = () => {

  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')

  const providers = useSyncProviders()
  
  const handleConnect = async(providerWithInfo: EIP6963ProviderDetail)=> {
    const accounts = await providerWithInfo.provider
    .request({method:'eth_requestAccounts'})
    .catch(console.error)

    if(accounts?.[0]){
      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    }
  }
 
  return (
    <>
      <div className={styles.detectedWallets}>
        <div>Wallets Detected:</div>
        <div className={styles.display}>
          {
            providers.length > 0 ? providers?.map((provider: any)=>(
            <button className={styles.button} key={provider.info.uuid} onClick={()=>handleConnect(provider)} >
              <span>{provider.info.name}</span>
            </button>
            )) :
            <div>
              there are no Announced Providers
            </div>
          }
        </div>
      </div>
      <div className={styles.userAccount} >Account Details: {formatAddress(userAccount)} </div>
      { (userAccount && selectedWallet.provider) &&
        <div className={styles.walletDetails}>
          <div>name: {selectedWallet.info.name}</div>
          <div>uuid: {selectedWallet.info.uuid}</div>
        </div>
      }
    </>
  )
}