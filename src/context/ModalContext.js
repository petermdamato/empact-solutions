"use client";

import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        showUpload,
        setShowUpload,
        showSettings,
        setShowSettings,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
