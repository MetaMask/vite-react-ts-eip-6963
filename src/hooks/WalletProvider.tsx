import { PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react'

// A React component leveraging React `context` to manage state and interaction with EIP-6963 compliant wallets.

// <rdns => account address>
type SelectedAccountByWallet = Record<string, string | null>

// Defines the shape of the context
interface WalletProviderContext {
  wallets: Record<string, EIP6963ProviderDetail>         // Record of wallets by UUID
  selectedWallet: EIP6963ProviderDetail | null           // Currently selected wallet
  selectedAccount: string | null                         // Account address of selected wallet
  errorMessage: string | null                            // Error message
  connectWallet: (walletUuid: string) => Promise<void>   // Function to trigger wallet connection
  disconnectWallet: () => void                           // Function to trigger wallet disconnection
  clearError: () => void                                 // Function to clear error message
}

/*
  The WindowEventMap interface is extended to include the custom event 'eip6963:announceProvider'. 
  Helps TypeScript understand a new event type, for type safety when attaching event listeners or dispatching these events.
*/
declare global{
  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent
  }
}

export const WalletProviderContext = createContext<WalletProviderContext>(null)

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // State to hold all detected wallets
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({})
  // state of current selected wallet's rdns
  const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(null)
  // state of current selected account by wallet's rdns
  const [selectedAccountByWalletRdns, setSelectedAccountByWalletRdns] = useState<SelectedAccountByWallet>({})

  const [errorMessage, setErrorMessage] = useState('')
  const clearError = () => setErrorMessage('')
  const setError = (error: string) => setErrorMessage(error)

  /* 
    This useEffect handles side effects related to setting up and tearing down event listeners for wallet announcements.
    We want to auto-manage and react to external events (wallet announcements) as soon as the component mounts.
    We also handle the clean up for those listeners (removing them) when the component unmounts (in the return).

    In short this useEffect:
    - Listens for 'eip6963:announceProvider' events, which should be dispatched by wallet providers announcing their presence.
    - Updates the wallets state with new or updated wallet details.
    - Dispatches an 'eip6963:requestProvider' event to request wallet providers to announce themselves.
  */
  useEffect(() => {
    /* NEW: Load state from local storage */
    const savedSelectedWalletRdns = localStorage.getItem('selectedWalletRdns')
    // console.log('saved', savedSelectedWalletRdns)
    const savedSelectedAccountByWalletRdns = localStorage.getItem('selectedAccountByWalletRdns')

    // restore the map of selected accounts by wallet
    // json parse because because localstorage always needs a string
    if (savedSelectedAccountByWalletRdns) {
      setSelectedAccountByWalletRdns(JSON.parse(savedSelectedAccountByWalletRdns))
    }

    function onAnnouncement(event: EIP6963AnnounceProviderEvent){
      setWallets(currentWallets => ({
        ...currentWallets,
        [event.detail.info.rdns]: event.detail
      }))

      // console.log('received', event.detail.info.rdns, savedSelectedWalletRdns)

      // only restore the saved wallet when it is announced
      if (savedSelectedWalletRdns && event.detail.info.rdns === savedSelectedWalletRdns) {
        setSelectedWalletRdns(savedSelectedWalletRdns)
      }
    }

    window.addEventListener('eip6963:announceProvider', onAnnouncement)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    
    return () => window.removeEventListener('eip6963:announceProvider', onAnnouncement)
  }, [])


  /*
    connectWallet is a callback function to handle connecting to a specified wallet using its UUID.

    We use a callback to ensure it retains a stable reference across renders, it optimizes performance 
    and prevents unnecessary re-renders of components that depend on it.

    Requests account access ('eth_requestAccounts') from the wallet's provider.
    Updates the state with the selected wallet `uuid` and the first account returned by the provider.
  */
  const connectWallet = useCallback(async (walletRdns: string) => {
    try {
      const wallet = wallets[walletRdns]
      const accounts = await wallet.provider.request({method:'eth_requestAccounts'}) as string[]

      if(accounts?.[0]) {
        setSelectedWalletRdns(wallet.info.rdns)
        setSelectedAccountByWalletRdns((currentAccounts) => ({
          ...currentAccounts,
          [wallet.info.rdns]: accounts[0],
        }))
        
        // Save state to local storage for persistence
        localStorage.setItem('selectedWalletRdns', wallet.info.rdns)
        localStorage.setItem('selectedAccountByWalletRdns', JSON.stringify({
          ...selectedAccountByWalletRdns,
          [wallet.info.rdns]: accounts[0],
        }))
      }
    } catch (error) {
      console.error('Failed to connect to provider:', error)
      const walletError: WalletError = error as WalletError
      setError(`Code: ${walletError.code} \nError Message: ${walletError.message}`)
    }
  }, [wallets, selectedAccountByWalletRdns])


  const disconnectWallet = useCallback(async () => {
    if (selectedWalletRdns) {
      setSelectedAccountByWalletRdns((currentAccounts) => ({
        ...currentAccounts,
        [selectedWalletRdns]: null,
      }))
      const wallet = wallets[selectedWalletRdns];
      setSelectedWalletRdns(null)

      // Clear state from local storage
      localStorage.removeItem('selectedWalletRdns')

      // Revoke permissions
      try {
        await wallet.provider.request({
          method: 'wallet_revokePermissions',
          params: [{ 'eth_accounts': {} }]
        });
      } catch (error) {
        console.error('Failed to revoke permissions:', error);
      }
    }
  }, [selectedWalletRdns, wallets])


  /*
    Wraps children in `Eip6963ProviderContext.Provider`, passing down the contextValue that includes the wallets state, 
    the selected wallet and account, and the connectWallet function.

    Usage:
      Any component within the tree wrapped by <Eip6963Provider> can use useContext(Eip6963ProviderContext) to access 
      and manipulate wallets, connect to them, and keep track of the selected account.
  */
  const contextValue: WalletProviderContext = {
    wallets,
    selectedWallet: selectedWalletRdns === null ? null : wallets[selectedWalletRdns],
    selectedAccount: selectedWalletRdns === null ? null : selectedAccountByWalletRdns[selectedWalletRdns],
    errorMessage,
    connectWallet,
    disconnectWallet,
    clearError,
  }

  return (
    <WalletProviderContext.Provider value={contextValue}>
      {children}
    </WalletProviderContext.Provider>
  )
}

/*
  Considerations (What else can we do?)

    Error Handling: You handle errors in the connectWallet function by logging them. 
      Consider how you might want to communicate these errors to the user.
    Asynchronous Effects: Your setup assumes wallets will always correctly announce themselves in response to 'eip6963:requestProvider'. 
      We might want to consider timeout or retry logic if wallets do not announce themselves as expected.
    Performance: The use of spreading in state updates (setWallets and setSelectedAccountByWalletUuid) 
      could potentially be optimized if you find performance issues with large numbers of wallets or frequent updates.

  This file sets up a foundation for managing wallet connections in a React application using modern React patterns like hooks and context, aligned with the standards proposed in EIP-6963.
*/