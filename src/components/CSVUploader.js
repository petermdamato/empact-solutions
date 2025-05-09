"use client";

import { useCSV } from "@/context/CSVContext";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import dataTypes from "../utils/dataTypes";
import "./CSVUploader.css"; // Import the CSS file
import Link from "next/link";

export default function CSVUploader() {
  const { setCsvData, setValidationErrors } = useCSV();
  const [errors, setErrors] = useState([]);
  const [csvUploaded, setCsvUploaded] = useState(false);

  const validateCSV = (data) => {
    const missingOrMismatched = [];

    data.forEach((row, rowIndex) => {
      Object.keys(dataTypes).forEach((column) => {
        if (!(column in row) && rowIndex === 0) {
          missingOrMismatched.push({
            column,
            error: "Missing column",
          });
        } else if (rowIndex !== 0) {
          const expectedType = dataTypes[column];
          const value = row[column];
          let actualType;

          if (!value) return;

          if (!isNaN(value) && value.trim() !== "") {
            actualType = "number";
          } else if (
            value.toLowerCase() === "true" ||
            value.toLowerCase() === "false"
          ) {
            actualType = "boolean";
          } else {
            actualType = "string";
          }

          if (
            actualType !== expectedType &&
            !missingOrMismatched.some((item) => item["column"] === column)
          ) {
            missingOrMismatched.push({
              column,
              error: `Expected ${expectedType}, got ${actualType}`,
            });
          }
        }
      });
    });

    setErrors(missingOrMismatched);
    setValidationErrors(missingOrMismatched);

    setCsvUploaded(missingOrMismatched.length === 0);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file && file.type === "text/csv") {
        const reader = new FileReader();

        reader.onload = ({ target }) => {
          const text = target.result;
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              setCsvData(result.data);
              validateCSV(result.data);
            },
          });
        };

        reader.readAsText(file);
      } else {
        alert("Please upload a valid CSV file.");
      }
    },
    [setCsvData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  return (
    <div className="container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drop CSV file here or click to upload.</p>
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
              </tr>
            </thead>
            <tbody>
              {errors.map((err, index) => (
                <tr key={index}>
                  <td>{err.column}</td>
                  <td>{err.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
