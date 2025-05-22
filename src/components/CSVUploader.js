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
  const { setCsvData, setValidationErrors } = useCSV();
  const [errors, setErrors] = useState([]);
  const [csvUploaded, setCsvUploaded] = useState(false);

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

      const reader = new FileReader();

      reader.onload = async ({ target }) => {
        const data = target.result;

        const handleParsedData = (parsedData) => {
          const validationErrors = validateCSV(parsedData);
          if (validationErrors.length === 0) {
            setCsvData(parsedData);
          }
        };

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
            <span>CSV uploaded successfully</span>
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
