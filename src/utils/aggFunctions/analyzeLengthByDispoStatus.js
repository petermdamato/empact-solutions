import { mean, median } from "d3-array"; // If you're using D3
import { differenceInCalendarDays, parse, getYear } from "date-fns";

const analyzeLengthByDispoStatus = (
  filteredData,
  selectedYear,
  detentionType = "secure-detention"
) => {
  const format = "MM/dd/yy";
  // First, create a map of status -> list of lengths of stay
  const dispoGroups = {};

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
      // const dispStatus = row["Pre/post-dispo filter"] || "Unknown";
      const dispStatus =
        row["Post-Dispo Stay Reason"] === null ||
        row["Post-Dispo Stay Reason"] === ""
          ? "Pre-dispo"
          : "Post-dispo";

      const los = differenceInCalendarDays(release, intake);

      if (!dispoGroups[dispStatus]) dispoGroups[dispStatus] = [];
      dispoGroups[dispStatus].push(los);
    }
  });

  // Compute average and median LOS by status
  const stayByStatus = Object.entries(dispoGroups).map(
    ([category, lengths]) => ({
      category,
      count: lengths.length,
      averageLengthOfStay: mean(lengths),
      medianLengthOfStay: median(lengths),
    })
  );

  return stayByStatus;
};

export default analyzeLengthByDispoStatus;
