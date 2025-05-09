import { mean, median } from "d3-array"; // If you're using D3
import { differenceInCalendarDays, parse, getYear } from "date-fns";

const analyzeByProgramType = (filteredData, selectedYear) => {
  // First, create a map of program name -> list of lengths of stay

  const lengthsByProgram = {};

  filteredData.forEach((row) => {
    const intake = row.ATD_Entry_Date
      ? parse(row.ATD_Entry_Date, "MM/dd/yy", new Date())
      : null;
    const release = row.ATD_Exit_Date
      ? parse(row.ATD_Exit_Date, "MM/dd/yy", new Date())
      : null;

    // Only include records where both dates are in 2024
    if (
      intake &&
      release &&
      +getYear(intake) === +selectedYear &&
      +getYear(release) === +selectedYear
    ) {
      const program = row.ATD_Program_Name || "Unknown";
      const los = differenceInCalendarDays(release, intake);

      if (!lengthsByProgram[program]) lengthsByProgram[program] = [];
      lengthsByProgram[program].push(los);
    }
  });

  // Compute average and median LOS by program
  const stayByProgram = Object.entries(lengthsByProgram).map(
    ([category, lengths]) => ({
      category,
      count: lengths.length,
      averageLengthOfStay: mean(lengths),
      medianLengthOfStay: median(lengths),
    })
  );

  return stayByProgram;
};

export default analyzeByProgramType;
