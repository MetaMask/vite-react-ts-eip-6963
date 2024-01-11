# A Guide to EIP-6963 for Developers

This article will fast track your understanding of EIP-6963, answer questions about how to implement, and provide example code for those who'd like to skip the chit chat.

GitHub Demo Repo: [vite-react-ts-eip-6963](https://github.com/MetaMask/vite-react-ts-eip-6963)

The Example code repo above will help you create a simple implementation of EIP-6963 for detecting multiple injected providers (browser installed wallets (Externally Owned Accounts)) using ViteJS React + TypeScript.

The crux of what we will be doing is implementing the interfaces outlined in the EIP and listening to `eip6963:announceProvider` events in our dapp and storing the returned providers so they can be used anywhere and at anytime in our dApp giving us the ability to  distinguish between providers.

Here is a preview of what we will build:

![EIP-6963 React Demo](https://imgur.com/j79GvQ9.gif)

## The EIP-6963 Abstract

> An alternative discovery mechanism to `window.ethereum` for [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) providers which **_supports discovering multiple injected Wallet Providers_** in a web page using Javascript’s window events.

Before trying to understand any EIP, read and fully understand the [abstract](https://eips.ethereum.org/EIPS/eip-6963#abstract) (Quoted above), [motivation](https://eips.ethereum.org/EIPS/eip-6963#motivation), and do a full read through even if there are aspects that you don't understand. 

> Note: If you don't understand any part, you can get further information through sites like Ethereum Magicians ([EIP-6963 MIPD](https://ethereum-magicians.org/t/eip-6963-multi-injected-provider-discovery/14076)) where you can get additional context from the authors and the community on most EIPs. 

It would also be helpful to understand [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193).

IMO, the most important line from the [EIP-6963 abstract](https://eips.ethereum.org/EIPS/eip-6963#abstract) is:

**_"An alternative discovery mechanism to `window.ethereum` for EIP-1193 providers"_**

Immediately this tells me that EIP-6963's Multi Injected Provider Discovery proposal aims to introduce a different approach or method for **discovering and interacting with EIP-1193 providers (in this case, Ethereum wallet providers)** in contrast to the existing method relying on the `window.ethereum` object.

As a developer with `window.ethereum` littered throughout my dapps and the UX issues around that object getting clobbered in a tag you're it kind of way, they have my attention.

Hopefully this info has helped to frame our thining as we progress through the EIP.

## Issues Predating EIP-6963

In Ethereum decentralized applications (dApps), wallets traditionally expose their APIs using a JavaScript object known as 'the Provider.' The initial EIP created to standardize this interface was [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193), and conflicts have risen among different wallet implementations.

While EIP-1193 aimed to establish a common convention, the user experience suffered due to race conditions caused by wallets injecting their providers (clobbering) window's (Ethereum Object). This has been a huge criticism of Web3 UX and it's shortcomings around wallet onboarding and connection.

These race conditions resulted in multiple wallet extensions enabled in the same browser having conflicts, where the last injected provider typically took precedence.

## What you need to know

As a developer, the first thing you should do in order to get familiar with [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), is to understand the initial motive, basic description, and more importantly the (TypeScript) interfaces and objects needed to implement this new approach.

## Implementing EIP-6963 in a ViteJS React + TS Application

The Provider MUST implement and expose the interfaces defined in the EIP. Let's review them real quick, i have also provided links to each section of the original EIP for reference.

[Provider Info](https://eips.ethereum.org/EIPS/eip-1193#request)

> Each Wallet Provider will be announced with the following interface:

```ts=
/**
 * Represents the assets needed to display a wallet
 */
interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}
```

[Provider Detail](https://eips.ethereum.org/EIPS/eip-1193#provider-detail)

> used as a composition interface to announce a Wallet Provider and related metadata about the Wallet Provider

```ts=
interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}
```

[Announce](https://eips.ethereum.org/EIPS/eip-1193#announce-and-request-events)

> The `EIP6963AnnounceProviderEvent` interface MUST be a `CustomEvent` object with a `type` property containing a string value of `eip6963:announceProvider` and a detail property with an object value of type `EIP6963ProviderDetail`.

```ts=
// Announce Event dispatched by a Wallet
interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: EIP6963ProviderDetail;
}
```

[Request Events](https://eips.ethereum.org/EIPS/eip-1193#announce-and-request-events)

> The `EIP6963RequestProviderEvent` interface MUST be an Event object with a type property containing a string value of `eip6963:requestProvider`.

```ts=
// Request Event dispatched by a DApp
interface EIP6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}
```

With these interfaces defined for us, we can spin up a ViteJS React + TypeScript application and update the `src/vite-env.d.ts` with those interfaces:

### vite-env.d.ts

```ts=
/// <reference types="vite/client" />

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

interface EIP6963ProviderInfo {
  walletId: string;
  uuid: string;
  name: string;
  icon: string;
}

interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  send?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  request: (request: { method: string, params?: Array<unknown> }) => Promise<unknown>
}

type EIP6963AnnounceProviderEvent = {
  detail:{
    info: EIP6963ProviderInfo,
    provider: EIP1193Provider
  }
}
```

We can then create a `hooks` directory and add the two following files:

### useSyncProviders.tsx

```ts=
import { useSyncExternalStore } from "react";
import { store } from "./store";

export const useSyncProviders = ()=> useSyncExternalStore(store.subscribe, store.value, store.value)
```

### store.tsx

```ts=
declare global{
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

let providers: EIP6963ProviderDetail[] = []

export const store = {
  value: ()=>providers,
  subscribe: (callback: ()=>void)=>{
    function onAnnouncement(event: EIP6963AnnounceProviderEvent){
      if(providers.map(p => p.info.uuid).includes(event.detail.info.uuid)) return
      providers = [...providers, event.detail]
      callback()
    }
    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    
    return ()=>window.removeEventListener("eip6963:announceProvider", onAnnouncement)
  }
}
```

With this hook and store in place, we can now create a basic compnentat the following location: `src/components/DiscoverWalletProviders.tsx` this component will map over those discovered providers and list them using a button that handles connections to those wallets:

### DiscoverWalletProviders.tsx

```ts=
import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { formatAddress } from '~/utils'

export const  DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>('')
  const providers = useSyncProviders()
  
  const handleConnect = async(providerWithInfo: EIP6963ProviderDetail)=> {
    const accounts = await providerWithInfo.provider
      .request({method:'eth_requestAccounts'})
      .catch(console.error)
      
    if(accounts?.[0]){
      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    }
  }
 
  return (
    <>
      <h2>Wallets Detected:</h2>
      <div>
        {
          providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail)=>(
            <button key={provider.info.uuid} onClick={()=>handleConnect(provider)} >
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
          )) :
          <div>
            there are no Announced Providers
          </div>
        }
      </div>
      <hr />
      <h2>{ userAccount ? "" : "No " }Wallet Selected</h2>
      { userAccount &&
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
```

In the code above, as soon as the page is rendered we are logging the providers that we have detected. See lline 11. We can loop over these providers and create a button for each one, this button will be used to call `eth_requestAccounts`.

Finally we can link to this coomponent from `src/App.tsx`

### App.tsx

```ts=
import './App.css'
import { DiscoverWalletProviders } from './components/DiscoverWalletProviders'

function App() {

  return (
    <>
      <DiscoverWalletProviders/>
    </>
  )
}

export default App

```

With these few steps we have implemented EIP-6963 into a React application utilizing the TypeScript interfaces outlined in the EIP. At a basic level, that's it. You can see the source code here: [vite-react-ts-eip-6963
](https://github.com/MetaMask/vite-react-ts-eip-6963)

## Third Party Library Support

The easiest ways for developers building in Web3 to start using EIP-6963 (Multi Injected Provider Discovery) is by taking advantage of Third Party connection libraries (convenience libraries) that already support it. At the time of this writing, here is the list:

- [Wallet Connect's Web3Modal (v3.1+)](https://docs.walletconnect.com/web3modal)
- [WAGMI Release Candidate](https://beta.wagmi.sh)


If you are building Wallet COnnection Libraries you will be happy to know that incorporating MetaMask's SDK will ensure that the connection to MetaMask supports EIP-6963 for the detection of MetaMask

You can get the injected providers using Wagmi's [MIPD Store](https://github.com/wevm/mipd) With Vanilla JS and React examples. 


I believe the SDK, which also supports EIP-6963, will be integrated into Web3Onboard
WalletConnect supports it via Web3Modal
Not sure about Web3 React, but looks like we’re trying to integrate the SDK there as well.

### MetaMask SDK

The MetaMask SDK not only supports EIP-6963 on it's own for detecting MetaMask, but is also being integrated into Web3 Onboard (alpha) and WAGMI (coming soon)

The SDKs integration of EIP-6963 is for the efficient discovery and connection with the MetaMask Extension. This enhancement is pivotal in streamlining the user experience and promoting seamless interactions with the Ethereum blockchain. 

#### Automatic Detection

The MetaMask JS SDK now automatically checks for the presence of the MetaMask Extension that supports EIP-6963. This eliminates the need for manual configuration or detection methods, thereby simplifying the initial setup process for developers and users alike. 
Conflict Resolution: By adhering to the standards set by EIP-6963, the SDK unambiguously identifies and connects to the MetaMask Extension. This approach effectively resolves potential conflicts that might arise with other wallet extensions, ensuring a more stable and reliable interaction for users. 

#### Enhanced User Experience

This update is designed to provide a more intuitive and frictionless experience for users. By automatically connecting to the MetaMask Extension, users can effortlessly engage with decentralized applications (dApps) without the worry of extension conflicts or compatibility issues. 

#### Commitment to Standards

Incorporating EIP-6963 demonstrates our ongoing commitment to align with industry standards and best practices. This ensures that our tools and services remain at the forefront of technological advancements in the blockchain domain. 

#### Integration with third-party libraries

You can use convenience libraries (Link to our docs) that support wallet interoperability.
We recommend using the SDK for the best MetaMask user experience.

## Community Support
		
The alternative discovery mechanism works for wallets that have implemented support for EIP-6963.
This includes MetaMask, Coinbase, Trust Wallet, OKX, and other major wallets.

See the [list of wallets that support EIP-6963](https://github.com/WalletConnect/EIP6963/blob/master/src/utils/constants.ts).
		
## Backwards compatibility

Dapps that do not support EIP-6963 can still detect MetaMask using the `window.ethereum` provider.
However, we recommend adding support to improve the user experience for multiple installed wallets.
Read more about [EIP-6963 backwards compatibility](https://eips.ethereum.org/EIPS/eip-6963#backwards-compatibility).

## Resources for Reading on EIP-6963

[NextJS Version of this same App by the Wallet Connect team](https://github.com/WalletConnect/EIP6963)
[Overview of EIP-6963: A Possible Solution for Multiple Wallet Conflict](https://mundus.dev/tpost/76iu0k1ot1-overview-of-eip-6963-a-possible-solution)
[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963)
[EIP-6963 Standardizes Your Browser Wallet Experience](https://www.youtube.com/watch?v=SWmknCUwr3Y&t=281s)

## A History of Injected Provider (Where does this section go??)

Before EIP 6963 we have had an unofficial standard through EIP-1193, 

Before it, a common convention in the Ethereum dApps was for wallets to expose their API via a JavaScript object in the web page called “the Provider”. Historically, Provider implementations had exhibited conflicting interfaces and behaviors between wallets. EIP-1193 formalized an Ethereum Provider API to promote wallet interoperability. The API was designed to be minimal, event-driven, and agnostic of transport and RPC protocols, and easily extended by defining new RPC methods and message event types.

Although it provided a common convention for wallets to expose their API, user experience still suffered as a wallet would inject its provider into your browser window (Ethereum Object) but it was still causing race conditions and having multiple wallet extensions installed meant that the last one to inject it’s provider typically was the one that would be detected and available for use.

EIP-5749 attempted to solve this issue with a `window.evmprovider` solution, and was a step in the right direction but ultimately was not adopted by enough wallets to solve our UX issue.

This is where we end up with EIP 6963 bringing a standard to propose a way of doing Multi Injected Provider Discovery. 

Demos and Information:

WalletConnect has already done something like this, although it's not a tutorial, it's a Twitter thread and example code repo and demo:
https://eip6963.org/
Example code repo: https://github.com/WalletConnect/EIP6963

Twitter Thread: https://twitter.com/boidushya/status/1714389971778552128
EIP-6963 in MetaMask Extension


<END OF ARTICLE EVERYTHING FROM HERE DOWN WILL BE REMOVED BEFORE PUBLISHING...></END>

Blog Post Action Items:

[ ] Collaborate with the team to update technical docs related to the recent rollout of support for EIP-6963. At least, the following docs pages may need to be updated: 
[ ] Ethereum Provider API (maybe we could add a note to this page on provider discovery)
[ ] Ethereum Provider API Reference (would be nice to add interactivity here, but not needed) 
[ ] HowTo Connect to MetaMask Convenience Libraries


Actionable items:
Get to a lower level of detail in our docs. We want our reference documentation updated. 
Can we create a demo that can connect to multiple wallets and target which one is active or selected to use.

Update any existing tutorials.

We have a developer call coming up. We want to touch briefly on this call and reintroduce MIPs in this call and wallet_revokePermissions in collab with portfolio dapp team.

Docs pages that need to be updates:
1. Tutorials 1 & 2 on wallet?
    2. We can update these tutorials in order to iincorporate implementing EIP-6963. 
3. Detect MetaMask should we promote the EIP-6963 method of detecting MM or should we show both?


Questions for Jiexi and 