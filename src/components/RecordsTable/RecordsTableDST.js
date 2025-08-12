"use client";

import React, { useState, useRef, useEffect } from "react";
import "./RecordsTable.css";
import moment from "moment";
import { useLinkOut } from "@/context/LinkOutContext";
import { useRouter } from "next/navigation";
import Modal from "../Modal/Modal";
import { useModal } from "@/context/ModalContext";

const thBaseStyle = {
  padding: "8px",
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  position: "sticky",
  top: 0,
  backgroundColor: "#f8f8f8",
  zIndex: 2,
  userSelect: "none",
};

const tdStyle = {
  padding: "8px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "200px",
};

const columns = [
  { key: "Youth_ID", label: "Youth ID" },
  { key: "Intake_Date", label: "Intake Date" },
  { key: "DST Recommendation", label: "DST Recommendation" },
  { key: "Intake_Decision", label: "Intake Decision" },
  { key: "RiskLevel", label: "Risk Level" },
  { key: "Auto_Hold", label: "Auto Hold" },
  { key: "DST_Score", label: "DST Score" },
  { key: "Override_Reason", label: "Override Reason" },
  { key: "Offense", label: "Offenses" },
  { key: "OffenseCategory", label: "Offense Category" },
  { key: "Exit_To", label: "Exit To" },
  { key: "Exit_To_Detail", label: "Exit To Detail" },
];

const MIN_COL_WIDTH = 60;

const intake = "Intake_Date";
const RecordsTable = ({ data, selectedKey }) => {
  const { showSettings, setShowSettings } = useModal();
  const router = useRouter();
  const linkText = useLinkOut();
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => {
      acc[col.key] = 150; // default initial width in px
      return acc;
    }, {})
  );

  const tableRef = useRef(null);
  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    function handleMouseMove(e) {
      if (!resizingCol.current) return;
      const deltaX = e.clientX - startX.current;
      setColumnWidths((widths) => {
        const newWidth = Math.max(MIN_COL_WIDTH, startWidth.current + deltaX);
        return { ...widths, [resizingCol.current]: newWidth };
      });
    }
    function handleMouseUp() {
      resizingCol.current = null;
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!data || data.length === 0) return <p>No records available.</p>;

  const parseDate = (str) => (str ? new Date(str) : null);

  const filtered = [...data].filter((record) => {
    if (selectedKey) {
      const reason = record.Override_Reason?.toLowerCase().includes("other")
        ? "Other"
        : record.Override_Reason;
      return reason === selectedKey;
    } else {
      return true;
    }
  });

  // Sort data by Admission_Date descending
  const sorted = [...filtered].sort((a, b) => {
    const d1 = parseDate(b[intake]);
    const d2 = parseDate(a[intake]);
    return d1 - d2;
  });

  const shownDates = new Set();

  function onMouseDown(e, key) {
    resizingCol.current = key;
    startX.current = e.clientX;
    startWidth.current = columnWidths[key];
  }

  return (
    <div
      style={{
        width: "calc(100vw - 250px)",
        height: "700px",
        maxHeight: "700px",
        overflowX: "auto",
        overflowY: "auto",
      }}
      ref={tableRef}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: Object.values(columnWidths).reduce((a, b) => a + b, 0),
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f8f8f8" }}>
            {columns.map(({ key, label }) => (
              <th
                key={key}
                style={{
                  ...thBaseStyle,
                  width: columnWidths[key],
                  position: "sticky",
                  top: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    userSelect: "none",
                  }}
                >
                  <span
                    style={{
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      width: "5px",
                      cursor: "col-resize",
                      padding: "4px 0",
                      userSelect: "none",
                    }}
                    onMouseDown={(e) => onMouseDown(e, key)}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((record, idx) => {
            const intakeDate = record[intake];

            const showDate = !shownDates.has(intakeDate);
            if (showDate) shownDates.add(intakeDate);

            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#fff" : "#f0f0f0",
                }}
              >
                {columns.map(({ key }) => {
                  let value = record[key];
                  if (key === "Auto_Hold") {
                    value = value === "0" ? "No" : "Yes";
                  }

                  if (key === "Intake_Date") {
                    value = moment(intakeDate).format("M/D/YY");
                  }
                  return (
                    <td
                      key={key}
                      style={{
                        ...tdStyle,
                        maxWidth: columnWidths[key],
                        width: columnWidths[key],
                        cursor: key === "Youth_ID" ? "pointer" : "auto",
                        textDecoration:
                          key === "Youth_ID" ? "underline" : "none",
                      }}
                      title={value}
                      onClick={(e) => {
                        if (key === "Youth_ID") {
                          const inmateId = e.target.innerText;

                          // Build base URL dynamically
                          const baseUrl = window.location.origin; // e.g., "http://localhost:3000" or "https://empact-solutions.onrender.com"

                          // Determine final URL
                          const url =
                            !linkText.linkOut || linkText.linkOut.length === 0
                              ? setShowSettings(true)
                              : // `${baseUrl}/sample-lookup?${inmateId}`
                                (linkText.linkOut.startsWith("http")
                                  ? ""
                                  : "http://") +
                                linkText.linkOut +
                                "/" +
                                inmateId;
                          if (url) {
                            if (
                              !linkText.linkOut ||
                              linkText.linkOut.length === 0
                            ) {
                              router.push(url);
                            } else {
                              window.open(url, "_blank");
                            }
                          }
                        }
                      }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)}>
        <SettingsPage context={"distribution"} />
      </Modal>
    </div>
  );
};

export default RecordsTable;
