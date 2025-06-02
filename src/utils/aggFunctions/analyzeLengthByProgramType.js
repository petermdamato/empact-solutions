import { mean, median } from "d3-array"; // If you're using D3
import { differenceInCalendarDays, parse, getYear } from "date-fns";

const analyzeByProgramType = (
  filteredData,
  selectedYear,
  detentionType = "secure-detention"
) => {
  // First, create a map of program name -> list of lengths of stay

  const format = "yyyy-MM-dd";

  const lengthsByProgram = {};

  filteredData.forEach((row) => {
    const intake =
      detentionType === "alternative-to-detention"
        ? row.ATD_Entry_Date
          ? parse(row.ATD_Entry_Date, format, new Date())
          : null
        : row.Admission_Date
        ? parse(row.Admission_Date, format, new Date())
        : null;

    const release =
      detentionType === "alternative-to-detention"
        ? row.ATD_Exit_Date
          ? parse(row.ATD_Exit_Date, format, new Date())
          : null
        : row.Release_Date
        ? parse(row.Release_Date, format, new Date())
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
