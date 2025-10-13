"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SimpleTooltip from "../SimpleTooltip/SimpleTooltip";
import { FaFileImport } from "react-icons/fa";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Modal from "../Modal/Modal";
import SettingsPage from "@/app/settings/page";
import UploadPage from "@/app/upload/page";
import { useCSV } from "@/context/CSVContext";
import { useFirstLogin } from "@/context/FirstLoginContext";
import { useSession } from "next-auth/react";
import { useModal } from "@/context/ModalContext";
import { useSidebar } from "@/context/SidebarContext";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import "./Sidebar.css";

const menuItems = [
  { label: "Detention Screening", access: "Inactive" },
  {
    label: "Secure Detention",
    subItems: [
      "Detention Overview",
      "Table",
      "Admissions",
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
  { label: "Account", access: "Active" },
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

  const { firstLogin } = useFirstLogin();
  const { data: session } = useSession();
  const navRef = useRef(null);
  const pathname = usePathname();

  const [firstTime, setFirstTime] = useState(false);

  // Auto-expand parent menus when a submenu item is active
  useEffect(() => {
    // Check if current path matches any submenu item
    menuItems.forEach((item) => {
      if (item.subItems) {
        const isSubItemActive = item.subItems.some((subItem) => {
          const subItemPath =
            "/" +
            subItem
              .toLowerCase()
              .replaceAll(" ", "-")
              .replace("(", "")
              .replace(")", "");
          return pathname === subItemPath;
        });

        // If a subitem is active but the parent menu isn't open, open it
        if (csvData?.length > 0 && isSubItemActive && !openMenus[item.label]) {
          toggleMenu(item.label);
        }
      }
    });
  }, [pathname, openMenus, toggleMenu]);

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
    if (csvData?.length === 0) {
      setShowUpload(true);
      sessionStorage.setItem("hasShownUpload", "true");
    }
  }, [csvData, setShowUpload]);

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

  const handleModalClose = (modalType) => {
    switch (modalType) {
      case "settings":
        setShowSettings(false);
        break;
      case "upload":
        setShowUpload(false);
        break;
      default:
        break;
    }
  };

  // Function to determine if a menu item should be active
  const isMenuItemActive = (item) => {
    if (pathname === "/account") {
      return item.label === "Account";
    }

    if (item.subItems) {
      return item.subItems.some((subItem) => {
        const subItemPath =
          "/" +
          subItem
            .toLowerCase()
            .replaceAll(" ", "-")
            .replace("(", "")
            .replace(")", "");
        return pathname === subItemPath;
      });
    } else {
      const itemPath =
        "/" +
        item.label
          .toLowerCase()
          .replaceAll(" ", "-")
          .replace("(", "")
          .replace(")", "");
      return pathname === itemPath;
    }
  };

  // Function to determine if a submenu item should be active
  const isSubMenuItemActive = (subItem) => {
    const subItemPath =
      "/" +
      subItem
        .toLowerCase()
        .replaceAll(" ", "-")
        .replace("(", "")
        .replace(")", "");
    return pathname === subItemPath;
  };

  return (
    <div
      className={`sidebar sidebar-${
        selectedMenu.includes("Alternative") || pathname.includes("atd")
          ? "alternative-to-detention"
          : "secure-detention"
      }`}
    >
      <div className="header">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <img src="./logo_upper_color.png" alt="Empact Solutions Logo" />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              margin: "0 12px",
            }}
          >
            <button
              onClick={() => setShowSettings(true)}
              className="circular-button"
            >
              <SimpleTooltip tooltipText="Settings" positioning={"right"}>
                <SettingsIcon style={{ cursor: "pointer", color: "white" }} />
              </SimpleTooltip>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="circular-button circular-button-import"
            >
              <SimpleTooltip tooltipText="Import" positioning={"right"}>
                <FaFileImport style={{ cursor: "pointer", color: "white" }} />
              </SimpleTooltip>
            </button>

            <button
              onClick={async () => {
                try {
                  await firebaseSignOut(firebaseAuth);
                  await nextAuthSignOut({ callbackUrl: "/auth/signin" });
                } catch (error) {
                  console.error("Signout error:", error);
                  await nextAuthSignOut({ callbackUrl: "/auth/signin" });
                }
              }}
              className="circular-button circular-button-logout"
            >
              <SimpleTooltip tooltipText="Log Out" positioning={"right"}>
                <LogoutIcon style={{ cursor: "pointer", color: "white" }} />
              </SimpleTooltip>
            </button>
          </div>
        </div>

        <h1
          className={`sidebar-menu sidebar-menu-${
            selectedMenu.includes("Alternative") || pathname.includes("atd")
              ? "alternative-to-detention"
              : "secure-detention"
          }`}
        >
          {["User Guide", "Upload", "Settings", "Glossary", "Account"].includes(
            selectedMenu
          ) || pathname === "/account"
            ? "youth detention analytics"
            : selectedMenu}
        </h1>
      </div>

      <nav ref={navRef}>
        <ul>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <li
                className={`${
                  item.subItems && openMenus[item.label]
                    ? "expanded"
                    : item.subItems
                    ? "collapsed"
                    : isMenuItemActive(item)
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
                    <div className="inner-text">
                      <span>{item.label}</span>
                      {item.subItems && (
                        <span className="menu-toggle">
                          {openMenus[item.label] ? "▼" : "▶"}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={
                      item.label === "Account"
                        ? "/account?fromSidebar=true"
                        : `/${item.label
                            .toLowerCase()
                            .replaceAll(" ", "-")
                            .replace("(", "")
                            .replace(")", "")}`
                    }
                  >
                    <button>{item.label}</button>
                  </Link>
                )}
                {item.subItems && openMenus[item.label] && (
                  <ul className="submenu">
                    {item.subItems.map((subItem) => {
                      const isSubItemActive = isSubMenuItemActive(subItem);

                      return (
                        <li
                          key={subItem}
                          className={`${
                            isSubItemActive
                              ? selectedMenu.includes("Alternative") ||
                                pathname.includes("atd")
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
                      );
                    })}
                  </ul>
                )}
              </li>

              {/* Add divider after Alternatives to Detention */}
              {item.label === "Alternatives to Detention" && (
                <div className="menu-divider" />
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>

      <footer>
        <div style={{ display: "flex" }}>
          <a href="https://empactsolutions.org" rel="noopener noreferrer">
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
                      listStyleType: "disc",
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
      <Modal isOpen={showSettings} onClose={() => handleModalClose("settings")}>
        <SettingsPage />
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => handleModalClose("upload")}>
        <UploadPage />
      </Modal>
    </div>
  );
};

export default Sidebar;
