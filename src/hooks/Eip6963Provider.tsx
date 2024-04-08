import { PropsWithChildren, createContext, useCallback, useEffect, useState } from "react";

type SelectedAccountByWallet = Record<string, string | null>;

interface Eip6963ProviderContext {
  wallets: Record<string, EIP6963ProviderDetail>;
  selectedWallet: EIP6963ProviderDetail | null;
  selectedAccount: string | null;
  connectWallet: (walletUuid: string) => Promise<void>;
}

declare global{
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

export const Eip6963ProviderContext = createContext<Eip6963ProviderContext>(null);

export const Eip6963Provider: React.FC<PropsWithChildren> = ({ children }) => {
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({});
  const [selectedWalletUuid, setSelectedWalletUuid] = useState<string | null>(null);
  const [selectedAccountByWalletUuid, setSelectedAccountByWalletUuid] = useState<SelectedAccountByWallet>({});

  // Find out about all providers by using EIP-6963
  useEffect(() => {
    function onAnnouncement(event: EIP6963AnnounceProviderEvent){
      setWallets(currentWallets => ({
        ...currentWallets,
        [event.detail.info.uuid]: event.detail
      }));
    }

    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    
    return ()=>window.removeEventListener("eip6963:announceProvider", onAnnouncement)
  }, []);

  const connectWallet = useCallback(async (walletUuid: string) => {
    try {
      const wallet = wallets[walletUuid];
      const accounts = await wallet.provider.request({method:'eth_requestAccounts'}) as string[];

      if(accounts?.[0]) {
        setSelectedWalletUuid(wallet.info.uuid);
        setSelectedAccountByWalletUuid((currentAccounts) => ({
          ...currentAccounts,
          [wallet.info.uuid]: accounts[0],
        }));
      }
    } catch (error) {
      console.error("Failed to connect to provider:", error);
    }
  }, [wallets]);

  const contextValue: Eip6963ProviderContext = {
    wallets,
    selectedWallet: selectedWalletUuid === null ? null : wallets[selectedWalletUuid],
    selectedAccount: selectedWalletUuid === null ? null : selectedAccountByWalletUuid[selectedWalletUuid],
    connectWallet,
  }

  return (
    <Eip6963ProviderContext.Provider value={contextValue}>
      {children}
    </Eip6963ProviderContext.Provider>
  )
};