"use client";

import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [selectedMenu, setSelectedMenu] = useState("User Guide");
  const [selectedElement, setSelectedElement] = useState("user-guide");
  const [selectedSubItemLabel, setSelectedSubItemLabel] = useState("");

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const selectMenu = (menuLabel, elementSlug, subItemLabel = "") => {
    setSelectedMenu(menuLabel);
    setSelectedElement(elementSlug);
    setSelectedSubItemLabel(subItemLabel);
  };

  return (
    <SidebarContext.Provider
      value={{
        openMenus,
        toggleMenu,
        selectedMenu,
        selectedElement,
        selectedSubItemLabel,
        selectMenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
