"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const FirstLoginContext = createContext();

export const FirstLoginProvider = ({ children }) => {
  const { data: session } = useSession();
  const [firstLogin, setFirstLogin] = useState(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only set firstLogin once when session is available and we haven't initialized yet
    if (session && !hasInitialized.current) {
      setFirstLogin(Boolean(session?.forcePasswordChange));
      hasInitialized.current = true;
    }
  }, [session]);

  return (
    <FirstLoginContext.Provider value={{ firstLogin, setFirstLogin }}>
      {children}
    </FirstLoginContext.Provider>
  );
};

export const useFirstLogin = () => useContext(FirstLoginContext);
