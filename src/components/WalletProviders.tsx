import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'

export const DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')
  const providers = useSyncProviders()

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts = await providerWithInfo.provider.request({
        method: 'eth_requestAccounts'
      });

      setSelectedWallet(providerWithInfo);
      setUserAccount(accounts?.[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const handleDisconnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      await providerWithInfo.provider.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {}
          }
        ]
      });
      if (selectedWallet?.info.name.includes("MetaMask")) {
        setSelectedWallet(undefined);
        setUserAccount('')
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <h2>Wallets Detected:</h2>
      <div className="providers">
        {
          providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
            <div key={`buttons-${provider.info.uuid}`}>
              <button key={`connect-${provider.info.uuid}`} onClick={() => handleConnect(provider)} >
                <img src={provider.info.icon} alt={provider.info.name} />
                <div>{provider.info.name}</div>
              </button>
              {provider.info.name.includes("MetaMask") &&
                <button key={`disconnect-${provider.info.uuid}`} onClick={() => handleDisconnect(provider)} >Disconnect MetaMask</button>
              }
            </div>
          )) :
            <div>
              No Announced Wallet Providers
            </div>
        }
      </div>
      <hr />
      <h2>{userAccount ? "" : "No "}Wallet Selected</h2>
      {userAccount &&
        <div>
          <div>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
            <div>{selectedWallet.info.name}</div>
            <div>({formatAddress(userAccount)})</div>
          </div>
        </div>
      }
    </>
  )
}