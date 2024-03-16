import styles from './DiscoverWalletProviders.module.css';
import { useEffect, useState } from 'react';
import { useSyncProviders } from '../hooks/useSyncProviders';
import { formatAddress } from '~/utils';

export const DiscoverWalletProviders = () => {

 const [selectedWallet, setSelectedWallet] = useState<unknown>();
 const [userAccount, setUserAccount] = useState<string>('');
 const providers = useSyncProviders();

 // If a connected wallet is found in local storage, set it as the selected wallet
 useEffect(() => {
  // Function to fetch data from localStorage
  const fetchDataFromLocalStorage = () => {
    const localStorageData = localStorage.getItem('connectedWallet');
    if (localStorageData) {
      setSelectedWallet(JSON.parse(localStorageData));
    }
  };

  // Call the function to fetch data from localStorage
  fetchDataFromLocalStorage();
}, []);

 const handleConnect = async (providerWithInfo: EIP6963ProviderDetail, providerInfo: EIP6963ProviderInfo) => {
    try {
      const accounts = await providerWithInfo.provider
        .request({ method: 'eth_requestAccounts' })
        .catch(error => {
          console.error("Error requesting accounts:", error); // Debugging log for errors
          throw error; // Rethrow the error to ensure it's caught by the catch block
        });

      if (accounts?.[0]) {
        const accountString = accounts[0]
        const extendedProviderInfo = { ...providerInfo, accountString };
        setSelectedWallet(extendedProviderInfo);
        setUserAccount(accounts[0]);
        localStorage.setItem('connectedWallet', JSON.stringify(extendedProviderInfo));
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
      {selectedWallet && (
        <div className={styles.walletDetails}>
          <div className={styles.logo}>
            <img src={selectedWallet.icon} alt={selectedWallet.name} />
            <div>{selectedWallet.name}</div>
            <div>{userAccount ? formatAddress(userAccount) : selectedWallet?.accountString}</div>
            <div><strong>uuid:</strong> {selectedWallet.uuid}</div>
            <div><strong>rdns:</strong> {selectedWallet.rdns}</div>
          </div>
        </div>
      )}
    </>
 );
};
