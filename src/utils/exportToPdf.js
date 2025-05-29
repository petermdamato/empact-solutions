// import html2pdf from "html2pdf.js";

// export function exportElementToPdf(
//   element,
//   filename = "download.pdf",
//   scale = 1,
//   orientation = "landscape"
// ) {
//   if (!element) {
//     console.error("No element provided for PDF export.");
//     return;
//   }

//   const opt = {
//     margin: 0.5,
//     filename,
//     image: { type: "jpeg", quality: 0.98 },
//     html2canvas: { scale: scale },
//     jsPDF: { unit: "in", format: "letter", orientation: orientation },
//   };

//   html2pdf().set(opt).from(element).save();
// }

// utils/exportToPdf.js
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";

export async function exportElementToPdf(
  element,
  filename = "download.pdf",
  scale = 1,
  orientation = "l" // 'l' for landscape, 'p' for portrait
) {
  if (!element) return;

  document.body.classList.add("pdf-export-mode");

  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 500));

  // Use domtoimage with scale to improve resolution
  const dataUrl = await domtoimage.toPng(element, {
    bgcolor: "#f5f7fa",
    width: element.clientWidth * scale,
    height: element.clientHeight * scale,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      width: `${element.clientWidth}px`,
      height: `${element.clientHeight}px`,
    },
  });

  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const pdf = new jsPDF(orientation, "pt", "a5");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaled image size keeping aspect ratio inside PDF page
    let imgWidth = img.width;
    let imgHeight = img.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    imgWidth = imgWidth * ratio;
    imgHeight = imgHeight * ratio;

    // Center image horizontally and vertically (optional)
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);

    document.body.classList.remove("pdf-export-mode");
  };
}
