// context/LinkOutContext.js
"use client";
import { createContext, useContext, useState } from "react";

const LinkOutContext = createContext();

export const LinkOutProvider = ({ children }) => {
  const [linkOut, setLinkOut] = useState("");

  return (
    <LinkOutContext.Provider value={{ linkOut, setLinkOut }}>
      {children}
    </LinkOutContext.Provider>
  );
};

export const useLinkOut = () => useContext(LinkOutContext);
