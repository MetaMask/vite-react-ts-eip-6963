import './App.css'
import { Eip6963Provider } from '~/hooks/Eip6963Provider'
import { SelectedWallet } from './components/SelectedWallet'
import { WalletList } from './components/WalletList'
import { WalletError } from './components/WalletError'

function App() {
  return (
    <Eip6963Provider>
      <WalletList />
      <hr />
      <SelectedWallet />
      <WalletError />
    </Eip6963Provider>
  )
}

export default App
