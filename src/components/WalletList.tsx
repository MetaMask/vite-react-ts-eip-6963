import { useWalletProvider } from '~/hooks/useWalletProvider'
import styles from './WalletList.module.css'

export const WalletList = () => {
  const { wallets, connectWallet } = useWalletProvider()

  return (
    <>
      <h2>Wallets Detected:</h2>
      <div className={styles.walletList}>
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
    </>
  )
}