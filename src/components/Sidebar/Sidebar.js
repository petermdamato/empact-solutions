"use client";

import React, { useEffect, useRef } from "react";
import { Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SimpleTooltip from "../SimpleTooltip/SimpleTooltip";
import UploadIcon from "@mui/icons-material/Upload";
import Link from "next/link";
import Modal from "../Modal/Modal";
import SettingsPage from "@/app/settings/page";
import UploadPage from "@/app/upload/page";
import { useCSV } from "@/context/CSVContext";
import { useModal } from "@/context/ModalContext";
import { useSidebar } from "@/context/SidebarContext";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import "./Sidebar.css";

const menuItems = [
  {
    label: "Secure Detention",
    subItems: [
      "Detention Overview",
      "Table",
      "Admissions",
      "Length of Stay (LOS)",
      "Avg Daily Pop (ADP)",
      "Detention Screening",
      "Explore Trends",
      "LOS Distribution",
    ],
    access: "Inactive",
  },
  {
    label: "Alternatives to Detention",
    subItems: [
      "ATD Overview",
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
  { label: "User Guide", access: "Active" },
  { label: "Glossary", access: "Active" },
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
  const { showSettings, setShowSettings, showUpload, setShowUpload } =
    useModal();

  const navRef = useRef(null);

  // save scroll position before unmount
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const handleScroll = () => {
      sessionStorage.setItem("sidebarScroll", String(navEl.scrollTop));
    };

    navEl.addEventListener("scroll", handleScroll);
    return () => navEl.removeEventListener("scroll", handleScroll);
  }, []);

  // restore on mount
  useEffect(() => {
    const navEl = navRef.current;
    if (navEl) {
      const saved = sessionStorage.getItem("sidebarScroll");
      if (saved) navEl.scrollTop = parseInt(saved, 10);
    }
  }, []);

  useEffect(() => {
    const hasShownUpload = sessionStorage.getItem("hasShownUpload");
    if (!hasShownUpload) {
      setShowUpload(true);
      sessionStorage.setItem("hasShownUpload", "true");
    }
  }, []);

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
          <img src="./logo_upper.png" alt="Empact Solutions Logo" />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => setShowSettings(true)}>
              <SimpleTooltip tooltipText="Settings" positioning={"right"}>
                <SettingsIcon style={{ cursor: "pointer", color: "white" }} />
              </SimpleTooltip>
            </button>
            <button onClick={() => setShowUpload(true)}>
              <SimpleTooltip tooltipText="Upload" positioning={"right"}>
                <UploadIcon style={{ cursor: "pointer", color: "white" }} />
              </SimpleTooltip>
            </button>
            <button
              onClick={async () => {
                try {
                  // Sign out from Firebase client-side first
                  await firebaseSignOut(firebaseAuth);

                  // Then sign out from NextAuth (triggers server-side revocation)
                  await nextAuthSignOut({ callbackUrl: "/auth/signin" });
                } catch (error) {
                  console.error("Signout error:", error);
                  // Still try to clear NextAuth session even if Firebase fails
                  await nextAuthSignOut({ callbackUrl: "/auth/signin" });
                }
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
            ? "Youth Detention Analytics"
            : selectedMenu}
        </h1>
        <h2>{selectedSubItemLabel || selectedMenu}</h2>
      </div>

      <nav ref={navRef}>
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
          <a
            href="https://empactsolutions.org"
            // target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="sidebar-logo"
              src="/logo.png"
              alt="Empact Solutions Logo"
              style={{ height: "72px", width: "92px" }}
            />
          </a>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "8px",
              fontSize: "12px",
              color: "#979ca4",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            <p>
              © 2025 Empact Solutions
              <br />
              Empulse Data Studio™
              <br />
              All rights reserved
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
                    <li>Bar charts left aligned across pages</li>
                  </ul>
                </div>
              }
              arrow
            >
              <p className="version">Version: August 2025</p>
            </Tooltip>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)}>
        <SettingsPage />
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)}>
        <UploadPage />
      </Modal>
    </div>
  );
};

export default Sidebar;
