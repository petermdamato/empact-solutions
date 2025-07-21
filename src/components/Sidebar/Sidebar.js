"use client";

import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";
import { signOut } from "firebase/auth";

import Modal from "../Modal/Modal";
import SettingsPage from "@/app/settings/page";

import { useCSV } from "@/context/CSVContext";
import { useSidebar } from "@/context/SidebarContext";
import { firebaseAuth } from "@/lib/firebaseClient";

import "./Sidebar.css";

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

  const [showSettings, setShowSettings] = useState(false);

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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <img src="./magnifying_glass.png" alt="Empact Solutions Logo" />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => setShowSettings(true)}>
              <SettingsIcon style={{ color: "white" }} />
            </button>
            <button
              onClick={() => {
                signOut(firebaseAuth)
                  .then(() => {
                    window.location.href = "/api/auth/signin";
                  })
                  .catch(console.error);
              }}
              className="signout-button"
            >
              Sign Out
            </button>
          </div>
        </div>

        <h1>
          {["User Guide", "Upload", "Settings", "Glossary"].includes(
            selectedMenu
          )
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
        <div style={{ display: "flex" }}>
          <img
            className="sidebar-logo"
            src="/logo.png"
            alt="Empact Solutions Logo"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "14px",
            }}
          >
            <p>
              Developed By <br /> Empact Solutions
            </p>
            <Tooltip
              title={
                <div>
                  <strong>Release Notes</strong>
                  <ul
                    style={{
                      paddingLeft: "1em",
                      margin: 0,
                      listStylePosition: "inside",
                    }}
                  >
                    <li>Map function enabled</li>
                    <li>Final ADP Formula developed</li>
                    <li>Hover charts for ATD Exits</li>
                    <li>Final year mark for explore trends charts</li>
                  </ul>
                </div>
              }
              arrow
            >
              <p className="version">Version: July 2025</p>
            </Tooltip>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)}>
        <SettingsPage />
      </Modal>
    </div>
  );
};

export default Sidebar;
