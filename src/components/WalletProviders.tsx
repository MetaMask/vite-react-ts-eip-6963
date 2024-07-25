import styles from './WalletProviders.module.css'
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'
import { FaRegCircleCheck } from "react-icons/fa6"
import { MdLogout } from "react-icons/md"

export const WalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')
  const [metamaskConnected, setMetamaskConnected] = useState<boolean>(false)
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
    if (providerWithInfo.info.name.toLowerCase().includes("metamask") && accounts?.[0]) {
      setMetamaskConnected(providerWithInfo.info.name.toLowerCase().includes("metamask") ? true : false)
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
      if (providerWithInfo.info.name.toLowerCase().includes("metamask")) {
        setMetamaskConnected(false)
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
              {selectedWallet?.info.uuid === provider.info.uuid
                ? <>
                  <div className="address"> {formatAddress(userAccount)}</div>
                  <div className="check"><FaRegCircleCheck /></div>
                </>
                : <div>{provider.info.name}</div>
              }
            </button>
            {provider.info.name.toLowerCase().includes("metamask") && (selectedWallet?.info.uuid === provider.info.uuid
              || (selectedWallet?.info.uuid !== provider.info.uuid && metamaskConnected)) &&
              <button className={styles.iconButton} onClick={() => handleDisconnect(provider)} title="Disconnect / Revoke Permission">
                <MdLogout />
              </button>
            }
          </div>
        )) :
          <div>
            There are no Announced Providers
          </div>
        }
      </div>
    </>
  )
}