import styles from './WalletProviders.module.css'
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'
import { AiOutlineDisconnect } from 'react-icons/ai';

export const WalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')
  const providers = useSyncProviders()

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    const accounts: string[] | undefined =
      await (
        providerWithInfo.provider
          .request({ method: 'eth_requestAccounts' })
          .catch(console.error)
      ) as string[] | undefined;

    if (accounts?.[0]) {
      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    }
  }

  const handleDisconnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      await providerWithInfo.provider.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      })

      if (selectedWallet?.info.name.toLowerCase().includes("metamask")) {
        setSelectedWallet(undefined)
        setUserAccount('')
      }
    } catch (error) {
      console.error('Failed to revoke permissions:', error)
    }
  }

  return (
    <>
      <h2>Wallets Detected:</h2>
      <div className={styles.buttonDisplay}>
        {providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
          <div key={provider.info.uuid} className={styles.walletButtons}>
            <button 
              disabled={selectedWallet?.info.uuid === provider.info.uuid}
              className={`${styles.walletButton} ${selectedWallet?.info.uuid !== provider.info.uuid ? styles.notSelected : ''}`} 
              onClick={() => handleConnect(provider)}
              title={`${selectedWallet?.info.uuid === provider.info.uuid ? provider.info.name + ' Selected' : 'Select ' + provider.info.name}`}>
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
            {provider.info.name.toLowerCase().includes("metamask") &&
              <button 
                className={styles.iconButton} 
                onClick={() => handleDisconnect(provider)}
                title="Disconnect MetaMask">
                  <AiOutlineDisconnect />
              </button>
            }
          </div>
        )) :
          <div>
            There are no Announced Providers
          </div>
        }
      </div>
      <hr />
      <h2 className={styles.userAccount}>{userAccount ? "" : "No "}Wallet Selected</h2>
      {userAccount && selectedWallet &&
        <div className={styles.selectedWallet}>
          <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
          <div>{selectedWallet.info.name}</div>
          <div>({formatAddress(userAccount)})</div>
        </div>
      }
    </>
  )
}