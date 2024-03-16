declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}

let providers: EIP6963ProviderDetail[] = [];

export const store = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    console.log("Subscribe function called"); // Debugging log

    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      console.log("onAnnouncement event triggered", event.detail); // Debugging log

      if (providers.map(p => p.info.uuid).includes(event.detail.info.uuid)) {
        console.log("Provider already exists, skipping"); // Debugging log
        return;
      }

      providers = [...providers, event.detail];
      console.log("Provider added", providers); // Debugging log

      callback();
    }

    console.log("Adding event listener for eip6963:announceProvider"); // Debugging log
    window.addEventListener("eip6963:announceProvider", onAnnouncement);

    console.log("Dispatching eip6963:requestProvider event"); // Debugging log
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      console.log("Removing event listener for eip6963:announceProvider"); // Debugging log
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
    };
  },
};
