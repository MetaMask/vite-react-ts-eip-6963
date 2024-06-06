import { useEip6963Provider } from '~/hooks/useEip6963Provider'
import styles from './WalletError.module.css'

export const WalletError = () => {
  const { errorMessage, clearError  } = useEip6963Provider()
  const isError = !!errorMessage

  return (
    <div className={styles.walletError} style={isError ? { backgroundColor: 'brown' } : {}}>
      {isError &&
        <div onClick={clearError}>
          <strong>Error:</strong> {errorMessage}
        </div>
      }
    </div>
  )
}