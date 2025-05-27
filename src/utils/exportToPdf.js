import html2pdf from "html2pdf.js";

export function exportElementToPdf(
  element,
  filename = "download.pdf",
  scale = 1,
  orientation = "landscape"
) {
  if (!element) {
    console.error("No element provided for PDF export.");
    return;
  }

  const opt = {
    margin: 0.5,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: scale },
    jsPDF: { unit: "in", format: "letter", orientation: orientation },
  };

  html2pdf().set(opt).from(element).save();
}
