import { useEip6963Provider } from '~/hooks/useEip6963Provider'
import { formatAddress } from '~/utils'
import styles from './DiscoverWalletProviders.module.css'

/*
  This component is structured to display wallet providers that have announced themselves and allow the user 
  It connects to these providers. It also provides information about the currently selected wallet and account. 
*/

export const DiscoverWalletProviders = () => {

  const {
    wallets, selectedWallet, selectedAccount, connectWallet, disconnectWallet 
  } = useEip6963Provider()

  return (
    <>
    {/* this could also be its own component WalletList or something */}
      <h2>Wallets Detected:</h2>
      <div className={styles.display}>
        {
          Object.keys(wallets).length > 0 ? Object.values(wallets).map((provider: EIP6963ProviderDetail) => (
            <button key={provider.info.uuid} onClick={() => connectWallet(provider.info.rdns)}>
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

      {/* put this into its own component which access the provider SelectedWallet */}
      <h2 className={styles.userAccount}>{selectedAccount ? "" : "No "}Wallet Selected</h2>
      {selectedAccount &&
        <div className={styles.walletDetails}>
          <div className={styles.logo}>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
            <div>{selectedWallet.info.name}</div>
            <div>({formatAddress(selectedAccount)})</div>
            <div><strong>uuid:</strong> {selectedWallet.info.uuid}</div>
            <div><strong>rdns:</strong> {selectedWallet.info.rdns}</div>
          </div>
            <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      }
    </>
  )
}