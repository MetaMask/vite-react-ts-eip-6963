import styles from './DiscoverWalletProviders.module.css'
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'

export const  DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')
  const providers = useSyncProviders()

  console.log('providers', providers)
  
  const handleConnect = async(providerWithInfo: EIP6963ProviderDetail) => {
    console.log('providerWithInfo', providerWithInfo)
    const accounts = await providerWithInfo.provider
      .request({method:'eth_requestAccounts'})
      .catch(console.error)
      
    if(accounts?.[0]) {
      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    }
  }
 
  return (
    <>
      <h2>Wallets Detected:</h2>
      <div className={styles.display}>
        {
          providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail)=>(
            <button key={provider.info.uuid} onClick={()=>handleConnect(provider)} >
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
          )) :
          <div>
            there are no Announced Providers
          </div>
        }
      </div>
      <hr />
      <h2 className={styles.userAccount}>{ userAccount ? "" : "No " }Wallet Selected</h2>
      { userAccount &&
        <div className={styles.walletDetails}>
          <div className={styles.logo}>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
            <div>{selectedWallet.info.name}</div>
            <div>({formatAddress(userAccount)})</div>
            <div><strong>uuid:</strong> {selectedWallet.info.uuid}</div>
            <div><strong>rdns:</strong> {selectedWallet.info.rdns}</div>
          </div>
        </div>
      }
    </>
  )
}