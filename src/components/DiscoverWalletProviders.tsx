/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './DiscoverWalletProviders.module.css'
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders';

export const  DiscoverWalletProviders = () => {

  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')

  const providers = useSyncProviders()
  // console.log(`providers: `, providers)
  
  const handleConnect = async(providerWithInfo: EIP6963ProviderDetail)=> {
    console.log(`providerWithInfo: `, providerWithInfo)
    const accounts = await providerWithInfo.provider
    .request({method:'eth_requestAccounts'})
    .catch(console.error)

    console.log(accounts)

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
      <div>User Account: {userAccount}</div>
      { userAccount && selectedWallet.provider
      
      ? <div className={styles.walletDetails}>
          <div>Wallet Details:</div>
          <div className={styles.display}>
            <div>name: {selectedWallet.info.name}</div>
            <div>uuid: {selectedWallet.info.uuid}</div>
            {/* <div>chainId: {selectedWallet.info.chainId}</div>
            export interface EIP6963ProviderInfo {
              name: string;
              uuid: string;
              rpcUrl: string;
              chainId: string; // Add the chainId property
            }
            <div>rpcUrl: {selectedWallet.info.rpcUrl}</div>
            <div>provider: {selectedWallet.provider}</div> */}
          </div>
        </div>
        : <></>
      }
      <div>Selected Wallet: {selectedWallet.info.name}</div>
    </>
  )
}