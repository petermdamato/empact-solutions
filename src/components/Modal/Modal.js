"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useSession } from "next-auth/react";
import { useFirstLogin } from "@/context/FirstLoginContext";

const Modal = ({ isOpen, onClose, children }) => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const { firstLogin } = useFirstLogin();

  // Only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  // Function to handle overlay click
  const handleOverlayClick = (e) => {
    // Prevent closing if it's a forced password change during first login
    if (session?.forcePasswordChange && firstLogin) {
      return; // Don't close the modal
    }
    onClose(); // Otherwise, close normally
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={handleOverlayClick} // Use the new handler
    >
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          disabled={session?.forcePasswordChange && firstLogin}
          onClick={
            session?.forcePasswordChange && firstLogin ? undefined : onClose
          }
          style={{
            float: "right",
            fontSize: "28px",
            border: "none",
            background: "none",
            cursor:
              session?.forcePasswordChange && firstLogin
                ? "not-allowed"
                : "pointer",
            color: "black",
            opacity: session?.forcePasswordChange ? 0.6 : 1,
          }}
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
