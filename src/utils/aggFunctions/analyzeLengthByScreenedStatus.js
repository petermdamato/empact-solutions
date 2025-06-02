import { mean, median } from "d3-array"; // If you're using D3
import { differenceInCalendarDays, parse, getYear } from "date-fns";

const analyzeLengthByScreenedStatus = (filteredData, selectedYear) => {
  // First, create a map of status -> list of lengths of stay
  const scrGroups = {};

  filteredData.forEach((row) => {
    const intake = row.Admission_Date
      ? parse(row.Admission_Date, "yyyy-MM-dd", new Date())
      : null;
    const release = row.Release_Date
      ? parse(row.Release_Date, "yyyy-MM-dd", new Date())
      : null;

    // Only include records where both dates are in 2024
    if (
      intake &&
      release &&
      +getYear(intake) === +selectedYear &&
      +getYear(release) === +selectedYear
    ) {
      const scrStatus = row["Screened/not screened"] || "Unknown";
      const los = differenceInCalendarDays(release, intake);

      if (!scrGroups[scrStatus]) scrGroups[scrStatus] = [];
      scrGroups[scrStatus].push(los);
    }
  });

  // Compute average and median LOS by status
  const stayByStatus = Object.entries(scrGroups).map(([category, lengths]) => ({
    category,
    count: lengths.length,
    averageLengthOfStay: mean(lengths),
    medianLengthOfStay: median(lengths),
  }));

  return stayByStatus;
};

export default analyzeLengthByScreenedStatus;
