import styles from './DiscoverWalletProviders.module.css';
import { useState } from 'react';
import { useSyncProviders } from '../hooks/useSyncProviders';
import { formatAddress } from '~/utils';

export const DiscoverWalletProviders = () => {
 console.log("DiscoverWalletProviders component rendered"); // Debugging log

 const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
 const [userAccount, setUserAccount] = useState<string>('');
 const providers = useSyncProviders();

 console.log("Providers fetched", providers); // Debugging log

 const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    console.log("handleConnect called with provider", providerWithInfo); // Debugging log

    const accounts = await providerWithInfo.provider
      .request({ method: 'eth_requestAccounts' })
      .catch(console.error);

    console.log("Accounts fetched", accounts); // Debugging log

    if (accounts?.[0]) {
      setSelectedWallet(providerWithInfo);
      setUserAccount(accounts[0]);
      console.log("Wallet selected and user account set", providerWithInfo, accounts[0]); // Debugging log
    }
 };

 return (
    <>
      <h2>Wallets Detected:</h2>
<div className={styles.display}>
 {providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
    <button key={provider.info.rdns} onClick={() => {
      console.log("Provider RDNS:", provider.info.rdns); // Log the RDNS value
      handleConnect(provider);
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
      {userAccount && (
        <div className={styles.walletDetails}>
          <div className={styles.logo}>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
            <div>{selectedWallet.info.name}</div>
            <div>({formatAddress(userAccount)})</div>
          </div>
        </div>
      )}
    </>
 );
};
