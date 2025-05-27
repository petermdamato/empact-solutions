"use client";

import { exportElementToPdf } from "@/utils/exportToPdf";
import { Download } from "lucide-react";

export default function DownloadButton({
  elementRef,
  filename = "export.pdf",
  orientation = "landscape",
}) {
  const scale = 1;
  const handleClick = () => {
    if (elementRef?.current) {
      exportElementToPdf(elementRef.current, filename, scale, orientation);
    } else {
      console.error("Missing elementRef for PDF export");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="download-button"
      aria-label="Download as PDF"
    >
      <Download size={20} />
    </button>
  );
}
