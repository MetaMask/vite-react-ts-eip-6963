import styles from './DiscoverWalletProviders.module.css';
import { useEffect, useState } from 'react';
import { useSyncProviders } from '../hooks/useSyncProviders';
import { formatAddress } from '~/utils';
import { useLocalStorage } from './setLocalStore';

export const DiscoverWalletProviders = () => {
 console.log("DiscoverWalletProviders component rendered"); // Debugging log
 const [connectedWallet, setConnectedWallet] = useLocalStorage<EIP6963ProviderInfo | null>('connectedWallet', null);
 const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderInfo>();
 const [userAccount, setUserAccount] = useState<string>('');
 const providers = useSyncProviders();

 console.log("Providers fetched", providers); // Debugging log

 // If a connected wallet is found in local storage, set it as the selected wallet
 useEffect(() => {
    if (connectedWallet) {
      setSelectedWallet(connectedWallet);
    }
 }, [connectedWallet]);

 const handleConnect = async (providerWithInfo: EIP6963ProviderDetail, providerInfo: EIP6963ProviderInfo) => {
    console.log("Attempting to connect to provider:", providerInfo.rdns); // Debugging log
    try {
      const accounts = await providerWithInfo.provider
        .request({ method: 'eth_requestAccounts' })
        .catch(error => {
          console.error("Error requesting accounts:", error); // Debugging log for errors
          throw error; // Rethrow the error to ensure it's caught by the catch block
        });

      console.log("Accounts fetched:", accounts); // Debugging log for successful account fetch

      if (accounts?.[0]) {
        console.log("Setting selected wallet and user account:", providerInfo, accounts[0]); // Debugging log
        setSelectedWallet(providerInfo);
        setUserAccount(accounts[0]);
        setConnectedWallet(providerInfo);
      } else {
        console.log("No accounts returned from provider."); // Debugging log for no accounts
      }
    } catch (error) {
      console.error("Failed to connect to provider:", error); // Debugging log for connection failure
    }
 };

 return (
    <>
      <h2>Wallets Detected:</h2>
      <div className={styles.display}>
        {providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
          <button key={provider.info.rdns} onClick={() => {
            console.log("Provider RDNS:", provider.info.rdns); // Log the RDNS value
            handleConnect(provider, provider.info);
          }}>
            <img src={provider.info.icon} alt={provider.info.name} />
            <div>{provider.info.name}</div>
          </button>
        )) : (
          <div>
            there are no Announced Providers
          </div>
        )}
      </div>
      <hr />

      <h2 className={styles.userAccount}>{userAccount ? "" : "No "}Wallet Selected</h2>
      {userAccount && selectedWallet && (
        <div className={styles.walletDetails}>
          <div className={styles.logo}>
            <img src={selectedWallet.icon} alt={selectedWallet.name} />
            <div>{selectedWallet.name}</div>
            <div>({formatAddress(userAccount)})</div>
            <div><strong>uuid:</strong> {selectedWallet.uuid}</div>
            <div><strong>rdns:</strong> {selectedWallet.rdns}</div>
          </div>
        </div>
      )}
    </>
 );
};
