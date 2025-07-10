"use client";

import { useCSV } from "@/context/CSVContext";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import dataTypes from "../utils/dataTypes";
import { read, utils } from "xlsx";
import "./CSVUploader.css";
import Link from "next/link";

export default function CSVUploader() {
  const { setCsvData, setValidationErrors, setFileName } = useCSV();

  const [errors, setErrors] = useState([]);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [fileType, setFileType] = useState("CSV");

  const validateCSV = (data) => {
    const errorCounts = {}; // { 'column|error': count }
    const missingColumns = new Set();

    data.forEach((row, rowIndex) => {
      Object.keys(dataTypes).forEach((column) => {
        const expected = dataTypes[column];
        const value = row[column];

        if (!(column in row) && rowIndex === 0) {
          // Mark missing columns to report later
          missingColumns.add(column);
          return;
        }

        if (
          rowIndex !== 0 &&
          value !== undefined &&
          value !== null &&
          expected
        ) {
          if (!value || value === "") return;

          let actualType;

          if (!isNaN(value) && String(value).trim() !== "") {
            actualType = "number";
          } else if (
            value.toLowerCase() === "true" ||
            value.toLowerCase() === "false"
          ) {
            actualType = "boolean";
          } else {
            actualType = "string";
          }

          const expectedTypes = Array.isArray(expected) ? expected : [expected];
          if (!expectedTypes.includes(actualType)) {
            // For format errors, append "# errors" to error message
            const errorMsg = `Expected ${expectedTypes.join(
              " or "
            )}, got ${actualType}`;
            const key = `${column}|${errorMsg}`;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
          }
        }
      });
    });

    // Build issues array
    const issues = [];

    // Add missing column errors, count as "Column missing"
    missingColumns.forEach((column) => {
      issues.push({ column, error: "Missing column", count: "Column missing" });
    });

    // Add format errors with counts
    Object.entries(errorCounts).forEach(([key, count]) => {
      const [column, error] = key.split("|");
      issues.push({ column, error, count });
    });

    setErrors(issues);
    setValidationErrors(issues);
    setCsvUploaded(issues.length === 0);
    return issues;
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      console.log(file);
      setFileName(file.name);

      setFileName(file.name);

      const reader = new FileReader();

      reader.onload = async ({ target }) => {
        const data = target.result;

        const handleParsedData = (parsedData) => {
          const transformedData = parsedData.map((row) => {
            const newRow = { ...row };

            // Add "Screened/not screened" column if it doesn't exist
            if (!("Screened/not screened" in newRow)) {
              const autoHold = parseInt(newRow["Auto_Hold"]);
              const riskLevel = String(newRow["RiskLevel"] || "").toLowerCase();

              if (autoHold === 1) {
                newRow["Screened/not screened"] = "Auto Hold";
              } else if (riskLevel === "not screened") {
                newRow["Screened/not screened"] = "Not Screened";
              } else {
                newRow["Screened/not screened"] = "Screened";
              }
            }
            // Rename "Intake_Decision" to "Intake Decision" if it exists
            if ("Intake_Decision" in newRow && !("Intake Decision" in newRow)) {
              newRow["Intake Decision"] = newRow["Intake_Decision"];
            }
            if (!("DST Recommendation" in newRow)) {
              const rawScore = newRow["DST_Score"];
              const score =
                rawScore !== undefined && rawScore !== null && rawScore !== ""
                  ? Number(rawScore)
                  : null;

              if (typeof score === "number" && !isNaN(score)) {
                if (score > 14) {
                  newRow["DST Recommendation"] = "Detained";
                } else if (score >= 7 && score <= 14) {
                  newRow["DST Recommendation"] = "Released with Conditions";
                } else if (score <= 6) {
                  newRow["DST Recommendation"] = "Released";
                }
              } else {
                newRow["DST Recommendation"] = ""; // If score is invalid or missing
              }
            }
            // Add "DST v Actual comparison" column if it doesn't exist
            if (!("DST v Actual comparison" in newRow)) {
              const dst = newRow["DST Recommendation"] || "";
              const intake = newRow["Intake Decision"] || "";

              if (
                (dst === "Released" &&
                  (intake === "Detained" ||
                    intake === "Released with Conditions")) ||
                (dst === "Released with Conditions" && intake === "Detained")
              ) {
                newRow["DST v Actual comparison"] =
                  "DST recommends less restrictive";
              } else if (
                (dst === "Detained" &&
                  (intake === "Released" ||
                    intake === "Released with Conditions")) ||
                (dst === "Released with Conditions" && intake === "Released")
              ) {
                newRow["DST v Actual comparison"] =
                  "DST recommends more restrictive";
              } else if (dst === intake && dst !== "") {
                newRow["DST v Actual comparison"] = "Same";
              } else {
                newRow["DST v Actual comparison"] = ""; // fallback if undefined or doesn't match rules
              }
            }

            // Normalize date fields
            const dateFields = [
              "Date_of_Birth",
              "ATD_Entry_Date",
              "Admission_Date",
              "Release_Date",
              "Intake_Date",
              "ATD_Exit_Date",
              "DispositionDate",
            ];

            dateFields.forEach((field) => {
              if (newRow[field]) {
                const val = newRow[field];

                if (!isNaN(val) && typeof val === "number") {
                  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                  const parsedDate = new Date(
                    excelEpoch.getTime() + val * 86400000
                  );
                  newRow[field] = parsedDate.toISOString().split("T")[0];
                }

                if (typeof val === "string") {
                  const parsedDate = new Date(val);
                  if (!isNaN(parsedDate)) {
                    newRow[field] = parsedDate.toISOString().split("T")[0];
                  }
                }
              }
            });

            return newRow;
          });

          const validationErrors = validateCSV(transformedData);
          if (validationErrors.length === 0) {
            setCsvData(transformedData);
          }
        };

        setFileType(file.name.split(".")[file.name.split(".").length - 1]);
        if (file.name.endsWith(".csv")) {
          Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => handleParsedData(result.data),
          });
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const workbook = read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet, { defval: "" });
          handleParsedData(jsonData);
        } else {
          alert("Unsupported file format. Please upload a CSV or XLSX file.");
        }
      };

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    },
    [setCsvData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <div className="container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drop CSV or XLSX file here or click to upload.</p>
        )}
      </div>

      {csvUploaded && errors.length === 0 && (
        <div>
          <div className="success-message">
            <span>{fileType.toUpperCase()} uploaded successfully</span>
            <Link href="/overview">Go to overview →</Link>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-table">
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Error</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((err, index) => (
                <tr key={index}>
                  <td>{err.column}</td>
                  <td>{err.error}</td>
                  <td>{`${err.count} error${err.count > 1 ? "s" : ""}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
