"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function SimpleTooltip({
  children,
  tooltipText,
  positioning = "left",
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (showTooltip && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 60, // 60px above the button
        left: rect.left + rect.width / 2,
      });
    }
  }, [showTooltip]);

  return (
    <>
      <span
        ref={wrapperRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ display: "inline-block" }}
      >
        {children}
      </span>

      {showTooltip &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: `${position.top + 110}px`,
              left: `${position.left - (positioning === "right" ? 0 : 70)}px`,
              fontSize: "14px",
              transform: "translateX(-50%)",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "200px",
              maxWidth: "320px",
              zIndex: 9999,
              pointerEvents: "none",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            <strong>{tooltipText}</strong>
          </div>,
          document.body
        )}
    </>
  );
}
