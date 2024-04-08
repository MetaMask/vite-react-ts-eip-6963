import { useContext } from "react";
import { Eip6963ProviderContext } from "./Eip6963Provider";

export const useEip6963Provider = () => useContext(Eip6963ProviderContext);