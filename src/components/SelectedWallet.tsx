import { useEip6963Provider } from '~/hooks/useEip6963Provider'
import { formatAddress } from '~/utils'
import styles from './SelectedWallet.module.css'

export const SelectedWallet = () => {
  const { selectedWallet, selectedAccount, disconnectWallet } = useEip6963Provider()

  return (
    <>
      <h2 className={styles.userAccount}>{selectedAccount ? '' : 'No '}Wallet Selected</h2>
      {selectedAccount &&
        <>
          <div className={styles.logo}>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
            <div>{selectedWallet.info.name}</div>
            <div>({formatAddress(selectedAccount)})</div>
            <div><strong>uuid:</strong> {selectedWallet.info.uuid}</div>
            <div><strong>rdns:</strong> {selectedWallet.info.rdns}</div>
          </div>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      }
    </>
  )
}