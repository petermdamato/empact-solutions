"use client";
import React from "react";
import { Tooltip } from "@mui/material";
import "./Sidebar.css";
import Link from "next/link";
import { useCSV } from "@/context/CSVContext";
import { useSidebar } from "@/context/SidebarContext";

const menuItems = [
  { label: "User Guide", access: "Active" },
  { label: "Glossary", access: "Active" },
  { label: "Upload", access: "Active" },
  { label: "Settings", access: "Active" },
  {
    label: "Secure Detention",
    subItems: [
      "Overview",
      "Table",
      "Admissions",
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
  const {
    openMenus,
    toggleMenu,
    selectedMenu,
    selectedElement,
    selectedSubItemLabel,
    selectMenu,
  } = useSidebar();

  const handleSelect = (label, menuElement = "", subItemLabel = "") => {
    const navElement = menuElement
      .replace("(", "")
      .replace(")", "")
      .replaceAll(" ", "-")
      .toLowerCase();

    if (menuElement.length > 0) {
      selectMenu(label, navElement, subItemLabel);
    }
  };

  return (
    <div
      className={`sidebar sidebar-${
        selectedMenu.includes("Alternative")
          ? "alternative-to-detention"
          : "secure-detention"
      }`}
    >
      <div className="header">
        <img src="./magnifying_glass.png" alt="Empact Solutions Logo" />
        <h1>
          {selectedMenu === "User Guide" ||
          selectedMenu === "Upload" ||
          selectedMenu === "Glossary"
            ? "Empact Detention Analytics"
            : selectedMenu}
        </h1>
        <h2>{selectedSubItemLabel || selectedMenu}</h2>
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
                    e.stopPropagation();
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
                  href={`/${item.label
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replace("(", "")
                    .replace(")", "")}`}
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
                        `${item.label}-${subItem}`
                          .replace("(", "")
                          .replace(")", "")
                          .replaceAll(" ", "-")
                          .toLowerCase() === selectedElement
                          ? selectedMenu.includes("Alternative")
                            ? "active alternative"
                            : "active"
                          : "single"
                      }`}
                      onClick={() =>
                        handleSelect(
                          item.label,
                          `${item.label}-${subItem}`,
                          subItem
                        )
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
          className="sidebar-logo"
          src="/logo.png"
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
