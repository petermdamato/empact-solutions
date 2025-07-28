"use client";

import { useState, useEffect } from "react";
import { exportElementToPdf } from "@/utils/exportToPdf";
import { Download } from "lucide-react";
import SimpleTooltip from "./../SimpleTooltip/SimpleTooltip";

export default function DownloadButton({
  elementRef,
  filename = "export.pdf",
  orientation = "landscape",
  scale = 1,
  onBeforeDownload,
  onAfterDownload,
}) {
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (exporting) {
      document.body.style.cursor = "wait";
      document.documentElement.style.cursor = "wait";
    } else {
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
    }

    return () => {
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
    };
  }, [exporting]);

  const handleClick = async () => {
    if (!elementRef?.current) {
      console.error("Missing elementRef for PDF export");
      return;
    }

    if (onBeforeDownload) onBeforeDownload();

    try {
      setExporting(true);
      await exportElementToPdf(
        elementRef.current,
        filename,
        scale,
        orientation,
        setExporting
      );
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      if (onAfterDownload) {
        setTimeout(() => {
          onAfterDownload();
        }, 10000);
      }
    }
  };

  return (
    <SimpleTooltip tooltipText="Download as PDF">
      <button
        style={{ marginLeft: "12px", cursor: exporting ? "wait" : "pointer" }}
        disabled={exporting}
        onClick={handleClick}
        className="download-button"
        aria-label="Download as PDF"
      >
        <Download size={20} />
      </button>
    </SimpleTooltip>
  );
}
