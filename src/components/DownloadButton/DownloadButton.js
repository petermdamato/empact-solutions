"use client";

import { exportElementToPdf } from "@/utils/exportToPdf";
import { Download } from "lucide-react";

export default function DownloadButton({
  elementRef,
  filename = "export.pdf",
  orientation = "landscape",
  scale = 1,
  onBeforeDownload,
  onAfterDownload,
}) {
  const handleClick = async () => {
    if (!elementRef?.current) {
      console.error("Missing elementRef for PDF export");
      return;
    }

    if (onBeforeDownload) onBeforeDownload();

    try {
      await exportElementToPdf(
        elementRef.current,
        filename,
        scale,
        orientation
      );
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      if (onAfterDownload) {
        // Wait 10 seconds before calling onAfterDownload
        setTimeout(() => {
          onAfterDownload();
        }, 10000);
      }
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
