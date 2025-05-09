"use client";

import CSVUploader from "@/components/CSVUploader";
import { useCSV } from "@/context/CSVContext";
import { useEffect } from "react";

export default function View() {
  const { csvData } = useCSV();

  useEffect(() => {
    // console.log(csvData);
  }, [csvData]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-xl font-semibold mb-4">View CSV File</h1>
    </div>
  );
}
