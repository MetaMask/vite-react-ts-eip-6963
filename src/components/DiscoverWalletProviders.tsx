/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './DiscoverWalletProviders.module.css'
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders';

export const  DiscoverWalletProviders = () => {

  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')

  const providers = useSyncProviders()
  
  const handleConnect = async(providerWithInfo: EIP6963ProviderDetail)=> {
    console.log(`providerWithInfo: `, providerWithInfo)
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
      <div className={styles.display}>
        {
          providers.length > 0 ? providers?.map((provider: any)=>(
          <div key={provider.info.uuid} onClick={()=>handleConnect(provider)} >
            <span>{provider.info.name}</span>
          </div>
          )) :
          <div>
            there are no Announced Providers
          </div>
        }
      </div>
      User Account: {userAccount}
    </>
  )
}