import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import "./Sidebar.css";
import Link from "next/link";
import { useCSV } from "@/context/CSVContext";
import { useSidebar } from "@/context/SidebarContext";

// const ViewContext = createContext();

// export const ContextManager = ({ children }) => {
//   const [currentView, setCurrentView] = useState("User Guide");
//   return (
//     <ViewContext.Provider value={{ currentView, setCurrentView }}>
//       {children}
//     </ViewContext.Provider>
//   );
// };

// const useView = () => useContext(ViewContext);

const menuItems = [
  { label: "User Guide", access: "Active" },
  { label: "Glossary", access: "Active" },
  { label: "Upload", access: "Active" },
  {
    label: "Secure Detention",
    subItems: [
      "Overview",
      "Table",
      "Admissions",
      // "Releases",
      "Detention Screening",
      "Length of Stay (LOS)",
      "Avg Daily Pop (ADP)",
      "Explore Trends",
      "LOS Distribution",
    ],
    access: "Inactive",
  },
  {
    label: "Alternatives to Detention",
    subItems: [
      "ATD Snapshot",
      "ATD Table",
      "ATD Entries",
      "ATD Exits",
      "ATD Length of Stay (LOS)",
      "ATD Avg Daily Pop (ADP)",
      "ATD Explore",
      "ATD LOS Distribution",
    ],
    access: "Inactive",
  },
];

const Sidebar = () => {
  const { csvData } = useCSV();
  const [selectedMenu, setSelectedMenu] = useState("User Guide");
  const [selectedElement, setSelectedElement] = useState("Overview");
  const { openMenus, toggleMenu } = useSidebar();

  const handleSelect = (label, menuElement = "") => {
    const navElement = menuElement
      .replace("(", "")
      .replace(")", "")
      .replaceAll(" ", "-")
      .toLowerCase();

    if (menuElement.length > 0) {
      setSelectedMenu(label);
      setSelectedElement(navElement);
    }
  };

  return (
    <div className="sidebar">
      <div className="header">
        <img src="./magnifying_glass.png" alt="Empact Solutions Logo" />
        <h1>Secure Detention Dashboard</h1>
        <h2>{selectedMenu}</h2>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.label}
              className={`${
                item.subItems && openMenus[item.label]
                  ? "expanded"
                  : item.subItems
                  ? "collapsed"
                  : item.label
                      .replace("(", "")
                      .replace(")", "")
                      .replaceAll(" ", "-")
                      .toLowerCase() === selectedElement
                  ? "active"
                  : "single"
              } ${
                item.access === "Active" || csvData.length > 0
                  ? ""
                  : "deactivated"
              }`}
              onClick={() =>
                handleSelect(item.label, item.subItems ? "" : item.label)
              }
            >
              {item.subItems ? (
                <button
                  onClick={(e) => {
                    // e.stopPropagation();
                    toggleMenu(item.label);
                  }}
                >
                  {item.subItems && (
                    <span className="menu-toggle">
                      {openMenus[item.label] ? "▼" : "▶"}
                    </span>
                  )}
                  <span>{item.label}</span>
                </button>
              ) : (
                <Link
                  href={`\\${item.label
                    .toLocaleLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  <button>{item.label}</button>
                </Link>
              )}
              {item.subItems && openMenus[item.label] && (
                <ul className="submenu">
                  {item.subItems.map((subItem) => (
                    <li
                      key={subItem}
                      className={`${
                        `${item.label}-${subItem
                          .replace("(", "")
                          .replace(")", "")
                          .replaceAll(" ", "-")}`.toLowerCase() ===
                        selectedElement
                          ? "active"
                          : "single"
                      }`}
                      onClick={() =>
                        handleSelect(item.label, `${item.label}-${subItem}`)
                      }
                    >
                      <Link
                        href={
                          "/" +
                          subItem
                            .toLowerCase()
                            .replaceAll(" ", "-")
                            .replace("(", "")
                            .replace(")", "")
                        }
                      >
                        <button>{subItem}</button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <footer>
        <img
          src="https://empactsolutions.org/wp-content/uploads/2023/03/empact-solutions-logo-web-180x93.png"
          alt="Empact Solutions Logo"
        />
        <p>
          Developed By <br /> Empact Solutions
        </p>
        <Tooltip
          title={
            <div>
              <strong>Release Notes</strong>
              <ul>
                <li>Change 1</li>
                <li>Change 2</li>
                <li>Change 3</li>
              </ul>
            </div>
          }
          arrow
        >
          <p className="version">Version: Mar 2025</p>
        </Tooltip>
      </footer>
    </div>
  );
};

export default Sidebar;
