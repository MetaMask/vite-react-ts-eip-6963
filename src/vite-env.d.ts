/// <reference types="vite/client" />

// Combines the provider's metadata with an actual provider object
// Creating a complete picture of a wallet provider at a glance and for purposes of working with them
interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

// Describes metadata related to a provider according to EIP-6963
interface EIP6963ProviderInfo {
  walletId: string
  uuid: string
  name: string
  icon: string
}

// Represents the structure of an Ethereum provider based on the EIP-1193 standard
interface EIP1193Provider {
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  send?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  request: (request: { method: string, params?: Array<unknown> }) => Promise<unknown>
}

// This type represents the structure of an event dispatched by a wallet to announce its presence based on EIP-6963
type EIP6963AnnounceProviderEvent = {
  detail:{
    info: EIP6963ProviderInfo
    provider: EIP1193Provider
  }
}
