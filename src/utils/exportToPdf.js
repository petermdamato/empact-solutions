import domtoimage from "dom-to-image";
import jsPDF from "jspdf";

export async function exportElementToPdf(
  element,
  filename = "download.pdf",
  scale = 1,
  orientation = "l"
) {
  if (!element) return;

  document.body.classList.add("pdf-export-mode");

  // 1. First, modify all select elements to show their selected options
  const selects = element.querySelectorAll("select");
  const originalSelects = [];

  selects.forEach((select) => {
    // Save original state
    originalSelects.push({
      element: select,
      style: select.style.cssText,
      className: select.className,
    });

    // Create a dummy div to show the selected value
    const dummy = document.createElement("div");
    dummy.className = select.className;
    dummy.style.cssText = select.style.cssText;
    dummy.style.padding = "6px 12px";
    dummy.style.border = "1px solid #ccc";
    dummy.style.borderRadius = "4px";
    dummy.style.backgroundColor = "#fff";
    dummy.textContent = select.options[select.selectedIndex]?.text || "";

    // Hide original select and show dummy
    select.style.visibility = "hidden";
    select.style.position = "absolute";
    select.parentNode.insertBefore(dummy, select.nextSibling);
  });

  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 500));

  try {
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

    await new Promise((resolve) => {
      img.onload = () => {
        const pdf = new jsPDF(orientation, "pt", "a5");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
        pdf.save(filename);
        resolve();
      };
    });
  } finally {
    // 3. Restore original selects
    originalSelects.forEach((original) => {
      const { element, style, className } = original;
      element.style.cssText = style;
      element.className = className;

      // Remove the dummy element we added
      if (element.nextSibling && element.nextSibling.className === className) {
        element.parentNode.removeChild(element.nextSibling);
      }
    });

    document.body.classList.remove("pdf-export-mode");
  }
}
