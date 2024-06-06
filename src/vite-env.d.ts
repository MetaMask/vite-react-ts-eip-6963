/// <reference types="vite/client" />

// We've set up some foundational TypeScript interfaces and types to interact with an Ethereum wallet 
// in a manner compliant with EIP-6963.

// A standardized way for DApps to interact with Ethereum nodes, including this interface enables you to 
// leverage common methods like request in a way that works seamlessly with any Ethereum provider
interface EIP1193Provider {
  // Optional properties for enhanced control/monitoring of a provider's status and config
  isStatus?: boolean; // Example: Before a transaction, check isStatus to confirm provider is synchronized or configured
  host?: string; // Example: You would switch host to connect to a different Ethereum network (mainnet to testnet)
  path?: string; // Example: DApp uses a specific path to access a custom API feature provided by an Ethereum node or service
  
  // Legacy methods largely replaced by `request` in newer API designs and kept for backward compatibility with older Ethereum providers
  sendAsync?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  send?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  // The modern, promise-based method that should be used for making requests to the Ethereum provider
  // It takes a request object and returns a promise that resolves with the response
  // This aligns with the latest practices encouraging asynchronous, promise-based interactions
  request: (request: { method: string, params?: Array<unknown> }) => Promise<unknown>
}

// Describes metadata related to a provider according to EIP-6963:
interface EIP6963ProviderInfo {
  // For identifying a wallet provider formally and to verify legitimacy or origin. It acts somewhat like a namespace, 
  // ensuring wallets from the same provider or organizational domain are correctly grouped and recognized
  rdns: string;

  // Distinguishes between multiple instances/sessions of wallet providers that might have similar  rdns or name
  // This is useful in environments where multiple wallet providers or sessions might be active, such as in browsers with multiple 
  // wallet extensions installed or in DApps that support several connection options
  uuid: string;

  name: string; // The human-readable name of the provider for displaying in UIs where users choose among multiple providers
  icon: string; // A URL to an icon representing the provider in a UI (visual identification)
}

// Combines the provider's metadata with an actual provider object
// Combining `info` and`provider` creates a complete picture of a wallet provider at a glance. 
// metadata about the wallet and the functional interface needed to interact with the Ethereum blockchain via this wallet. 
// This makes it easier for developers and the system to handle wallet information and operations together as a single, cohesive unit.
interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

// Defines the structure of a custom browser event detail for announcing a provider compliant with EIP-6963:
type EIP6963AnnounceProviderEvent = {
  detail:{
    info: EIP6963ProviderInfo,
    provider: Readonly<EIP1193Provider>
  }
}

/*

Both `EIP6963AnnounceProviderEvent` and `EIP6963ProviderDetail` look similar, as they both contain details about 
  a wallet provider (info) 
  and the provider object itself (provider). 
  
  However, their use cases and the context in which they are employed differ significantly, making both necessary 
  for comprehensive DApp development under the EIP-6963 standard. Here’s a breakdown of their distinct roles:

  EIP6963ProviderDetail
    State Management: Once detected and handled, the EIP6963ProviderDetail INTERFACE could be used to store and manage 
    this provider within the application’s state, allowing interaction and management capabilities beyond initial detection.

  EIP6963AnnounceProviderEvent
    Event-Driven Detection: When new providers are detected, this TYPE is used to announce this across the system, 
    enabling different components to react to new options dynamically.

  Both type and interface can be used to define the shape of an object or a contract in TypeScript, but they have different 
  capabilities and are suitable for different scenarios. 

  EIP6963ProviderDetail uses an interface to allow a clear definition of an object's structure that classes can implement, 
  useful if different parts of a dApp or different plugins/extensions are expected to provide their own concrete implementations.
*/

// An error object with optional properties, commonly encountered when handling MetaMask `eth_requestAccounts` errors
interface WalletError {
  code?: string
  message?: string
}