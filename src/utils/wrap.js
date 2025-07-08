import * as d3 from "d3";

const wrap = (text, width, labelHeight) => {
  text.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    const lines = [];
    const lineHeight = 0.9; // ems, adjust as desired

    // Build lines array by simulating word wrapping
    let tempText = text.text(null).append("tspan");
    while ((word = words.pop())) {
      line.push(word);
      tempText.text(line.join(" "));
      if (tempText.node().getComputedTextLength() > width) {
        line.pop();
        lines.push(line.join(" "));
        line = [word];
      }
    }
    lines.push(line.join(" "));

    // Remove temp tspan
    tempText.remove();

    // Calculate starting offset based on number of lines and labelHeight
    const totalLineHeightEm = lines.length * lineHeight;
    const startDyEm =
      lines.length === 1
        ? 0.35 // single line, standard vertical centering tweak
        : -((totalLineHeightEm - lineHeight) / 3.5);

    // Render lines
    lines.forEach((lineText, i) => {
      text
        .append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", text.attr("y"))
        .attr("dy", (i === 0 ? startDyEm : lineHeight) + "em")
        .text(lineText);
    });
  });
};

export default wrap;
