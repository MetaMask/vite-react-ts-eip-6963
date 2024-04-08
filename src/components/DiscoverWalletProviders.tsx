import { useEip6963Provider } from '~/hooks/useEip6963Provider'
import { formatAddress } from '~/utils'
import styles from './DiscoverWalletProviders.module.css'

export const  DiscoverWalletProviders = () => {
 
  const { wallets, selectedWallet, selectedAccount, connectWallet } = useEip6963Provider();

  return (
    <>
      <h2>Wallets Detected:</h2>
      <div className={styles.display}>
        {
          Object.keys(wallets).length > 0 ? Object.values(wallets).map((provider: EIP6963ProviderDetail)=>(
            <button key={provider.info.uuid} onClick={()=>connectWallet(provider.info.uuid)}>
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
      <h2 className={styles.userAccount}>{ selectedAccount ? "" : "No " }Wallet Selected</h2>
      { selectedAccount &&
        <div className={styles.walletDetails}>
          <div className={styles.logo}>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
            <div>{selectedWallet.info.name}</div>
            <div>({formatAddress(selectedAccount)})</div>
            <div><strong>uuid:</strong> {selectedWallet.info.uuid}</div>
            <div><strong>rdns:</strong> {selectedWallet.info.rdns}</div>
          </div>
        </div>
      }
    </>
  )
}