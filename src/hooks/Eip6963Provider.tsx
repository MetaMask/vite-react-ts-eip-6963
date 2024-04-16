import { PropsWithChildren, createContext, useCallback, useEffect, useState } from "react";

// A React component leveraging React `context` to manage state and interaction with EIP-6963 compliant wallets.

type SelectedAccountByWallet = Record<string, string | null>;

// Defines the shape of the context
interface Eip6963ProviderContext {
  wallets: Record<string, EIP6963ProviderDetail>;        // Record of wallets by UUID
  selectedWallet: EIP6963ProviderDetail | null;          // Currently selected wallet
  selectedAccount: string | null;                        // Account address of selected wallet
  connectWallet: (walletUuid: string) => Promise<void>;  // Function to trigger wallet connection
}

/*
  The WindowEventMap interface is extended to include the custom event "eip6963:announceProvider". 
  Helps TypeScript understand a new event type, for type safety when attaching event listeners or dispatching these events.
*/
declare global{
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

export const Eip6963ProviderContext = createContext<Eip6963ProviderContext>(null);

export const Eip6963Provider: React.FC<PropsWithChildren> = ({ children }) => {
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({}); // State to hold all detected wallets
  
  // States to keep track of the "currently selected wallet" and the "account address" selected within each wallet
  const [selectedWalletUuid, setSelectedWalletUuid] = useState<string | null>(null);
  const [selectedAccountByWalletUuid, setSelectedAccountByWalletUuid] = useState<SelectedAccountByWallet>({});

  /* 
    This useEffect handles side effects related to setting up and tearing down event listeners for wallet announcements.
    We want to auto-manage and react to external events (wallet announcements) as soon as the component mounts.
    We also handle the clean up for those listeners (removing them) when the component unmounts (in the return).

    In short this useEffect:
    - Listens for "eip6963:announceProvider" events, which should be dispatched by wallet providers announcing their presence.
    - Updates the wallets state with new or updated wallet details.
    - Dispatches an "eip6963:requestProvider" event to request wallet providers to announce themselves.
  */
  useEffect(() => {
    function onAnnouncement(event: EIP6963AnnounceProviderEvent){
      setWallets(currentWallets => ({
        ...currentWallets,
        [event.detail.info.uuid]: event.detail
      }));
    }

    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    
    return () => window.removeEventListener("eip6963:announceProvider", onAnnouncement)
  }, []);


  /*
    connectWallet is a callback function to handle connecting to a specified wallet using its UUID.

    We use a callback to ensure it retains a stable reference across renders, it optimizes performance 
    and prevents unnecessary re-renders of components that depend on it.

    Requests account access ('eth_requestAccounts') from the wallet's provider.
    Updates the state with the selected wallet `uuid` and the first account returned by the provider.
  */
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


  /*
    Wraps children in `Eip6963ProviderContext.Provider`, passing down the contextValue that includes the wallets state, 
    the selected wallet and account, and the connectWallet function.

    Usage:
      Any component within the tree wrapped by <Eip6963Provider> can use useContext(Eip6963ProviderContext) to access 
      and manipulate wallets, connect to them, and keep track of the selected account.
  */
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

/*
  Considerations (What else can we do?)

    Error Handling: You handle errors in the connectWallet function by logging them. 
      Consider how you might want to communicate these errors to the user.
    Asynchronous Effects: Your setup assumes wallets will always correctly announce themselves in response to "eip6963:requestProvider". 
      We might want to consider timeout or retry logic if wallets do not announce themselves as expected.
    Performance: The use of spreading in state updates (setWallets and setSelectedAccountByWalletUuid) 
      could potentially be optimized if you find performance issues with large numbers of wallets or frequent updates.

  This file sets up a foundation for managing wallet connections in a React application using modern React patterns like hooks and context, aligned with the standards proposed in EIP-6963.
*/