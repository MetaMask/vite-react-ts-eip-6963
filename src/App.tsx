import './App.css'
import { DiscoverWalletProviders } from '~/components/DiscoverWalletProviders'
import { Eip6963Provider } from '~/hooks/Eip6963Provider'

function App() {

  return (
    <Eip6963Provider>
      <DiscoverWalletProviders/>
    </Eip6963Provider>
  )
}

export default App
