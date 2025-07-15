import { parse, isLeapYear } from "date-fns";

function analyzeDailyPopByDispoStatus(
  data,
  selectedYear,
  detentionType = "alternative-to-detention"
) {
  const format = "yyyy-MM-dd";

  const startDate = new Date(`${selectedYear}-01-01`);
  const endDate = new Date(`${selectedYear}-12-31`);
  const daysInYear = isLeapYear(endDate) ? 366 : 365;

  // Group data by dispo status
  const dispoGroups = {};
  data.forEach((row) => {
    const dispStatus =
      row["Post-Dispo Stay Reason"] === null ||
      row["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    const entry =
      detentionType === "alternative-to-detention"
        ? row.ATD_Entry_Date
          ? parse(row.ATD_Entry_Date, format, new Date())
          : null
        : row.Admission_Date
        ? parse(row.Admission_Date, format, new Date())
        : null;

    const exit =
      detentionType === "alternative-to-detention"
        ? row.ATD_Exit_Date
          ? parse(row.ATD_Exit_Date, format, new Date())
          : null
        : row.Release_Date
        ? parse(row.Release_Date, format, new Date())
        : null;

    if (!dispoGroups[dispStatus]) dispoGroups[dispStatus] = [];

    dispoGroups[dispStatus].push({ entry, exit });
  });

  const results = {};

  // Calculate total overlapping days and ADP per dispo status
  for (const [dispStatus, records] of Object.entries(dispoGroups)) {
    const totalOverlapDays = records.reduce((sum, { entry, exit }) => {
      if (!entry) return sum;

      const rangeStart = entry < startDate ? startDate : entry;
      const rangeEnd =
        exit && !isNaN(exit) ? (exit > endDate ? endDate : exit) : endDate;

      if (rangeStart > endDate || rangeEnd < startDate) return sum;

      const overlapDays =
        Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;

      return sum + overlapDays;
    }, 0);

    results[dispStatus] = totalOverlapDays / daysInYear;
  }

  return results;
}

export default analyzeDailyPopByDispoStatus;
