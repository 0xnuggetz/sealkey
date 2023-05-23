import { createContext, useContext, useEffect, useState } from "react";

type TronContextType = {
  provider: any;
  address: string;
  setAddress: (address: string) => void;
  balance: string;
};

const initContext: TronContextType = {
  provider: null,
  address: "",
  setAddress: () => {},
  balance: "",
};

const TronContext = createContext<TronContextType>(initContext);

// hook that allows any component to access the Tron context
export const useTron = () => useContext(TronContext);

export const TronProvider = ({ children }: any) => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  let provider: any = null;

  if (typeof window !== "undefined" && typeof window.tronWeb !== "undefined") {
    provider = window["tronWeb"];
  }

  // hook to handle address changes
  useEffect(() => {
    const fetchedAddress = window.localStorage.getItem("TRON_ADDRESS");
    console.log("here1");
    if (!address && fetchedAddress) {
      console.log("here2");
      setAddress(fetchedAddress);
    }
    if (address && address !== fetchedAddress)
      window.localStorage.setItem("TRON_ADDRESS", address);
  }, [address]);

  console.log("address in provider: ", address);
  return (
    <TronContext.Provider value={{ provider, address, setAddress, balance }}>
      {children}
    </TronContext.Provider>
  );
};
