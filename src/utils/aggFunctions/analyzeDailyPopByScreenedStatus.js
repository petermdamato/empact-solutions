import { parse, isLeapYear } from "date-fns";

function analyzeDailyPopByScreenedStatus(
  data,
  selectedYear,
  detentionType = "secure-detention"
) {
  const format = "yyyy-MM-dd";

  const startDate = new Date(`${selectedYear}-01-01`);
  const endDate = new Date(`${selectedYear}-12-31`);

  const daysInYear = isLeapYear(endDate) ? 366 : 365;
  // Group data by screened status
  const scrGroups = {};
  data.forEach((row) => {
    const scrStatus = row["Screened/not screened"] || "Unknown";
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

    if (!scrGroups[scrStatus]) scrGroups[scrStatus] = [];

    scrGroups[scrStatus].push({ entry, exit });
  });

  const results = {};

  // Calculate total overlapping days and ADP per screened status
  for (const [scrStatus, records] of Object.entries(scrGroups)) {
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

    results[scrStatus] = totalOverlapDays / daysInYear;
  }

  return results;
}

export default analyzeDailyPopByScreenedStatus;
