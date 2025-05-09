"use client"; // Ensure this is at the top!

import { createContext, useState, useContext } from "react";

// Create context
const CSVContext = createContext();

// Provider component
export function CSVProvider({ children }) {
  const [csvData, setCsvData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  return (
    <CSVContext.Provider
      value={{ csvData, setCsvData, validationErrors, setValidationErrors }}
    >
      {children}
    </CSVContext.Provider>
  );
}

// Custom hook for easier usage
export function useCSV() {
  return useContext(CSVContext);
}
