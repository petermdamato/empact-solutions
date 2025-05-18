import React from "react";
import "./RecordsTable.css";

const thStyle = {
  padding: "8px",
  textAlign: "left",
};

const tdStyle = {
  padding: "8px",
};

const RecordsTable = ({ data }) => {
  if (!data || data.length === 0) return <p>No records available.</p>;

  const parseDate = (str) => (str ? new Date(str) : null);

  // Sort data by Admission_Date descending
  const sorted = [...data].sort((a, b) => {
    const d1 = parseDate(b.Admission_Date);
    const d2 = parseDate(a.Admission_Date);
    return d1 - d2;
  });

  const shownDates = new Set();

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "600px",
        overflow: "hidden",
      }}
    >
      {/* Sticky Header */}
      <div style={{ overflow: "hidden" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f8f8" }}>
              <th style={thStyle}>Intake Date</th>
              <th style={thStyle}>DST Recommendation</th>
              <th style={thStyle}>Intake Decision</th>
              <th style={thStyle}>Risk Level</th>
              <th style={thStyle}>Auto Hold</th>
              <th style={thStyle}>DST Score</th>
              <th style={thStyle}>Override Reason</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div style={{ overflowY: "scroll", maxHeight: "540px" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <tbody>
            {sorted.map((record, idx) => {
              const intakeDate = record.Admission_Date;
              const showDate = !shownDates.has(intakeDate);
              if (showDate) shownDates.add(intakeDate);

              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#fff" : "#f0f0f0",
                  }}
                >
                  <td style={tdStyle}>{showDate ? intakeDate : ""}</td>
                  <td style={tdStyle}>{record["DST Recommendation"]}</td>
                  <td style={tdStyle}>{record.Intake_Decision}</td>
                  <td style={tdStyle}>{record.RiskLevel}</td>
                  <td style={tdStyle}>{record.Auto_Hold}</td>
                  <td style={tdStyle}>{record.DST_Score}</td>
                  <td style={tdStyle}>{record.Override_Reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsTable;
