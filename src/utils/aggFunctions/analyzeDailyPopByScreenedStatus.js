import { parse, eachDayOfInterval, isBefore, isAfter, isEqual } from "date-fns";
import { mean } from "d3-array";

function analyzeDailyPopByScreenedStatus(
  data,
  selectedYear,
  detentionType = "secure-detention"
) {
  const format = "yyyy-MM-dd";

  // Get all days in the year
  const allDays = eachDayOfInterval({
    start: new Date(selectedYear, 0, 1),
    end: new Date(selectedYear, 11, 31),
  });

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

  // Calculate daily counts and ADP per screened status
  for (const [scrStatus, records] of Object.entries(scrGroups)) {
    const dailyCounts = allDays.map((day) => {
      return records.reduce((count, { entry, exit }) => {
        if (!entry) return count;
        const started = isBefore(entry, day) || isEqual(entry, day);
        const notExited = !exit || isAfter(exit, day) || isEqual(exit, day);
        return started && notExited ? count + 1 : count;
      }, 0);
    });

    results[scrStatus] = mean(dailyCounts);
  }

  return results;
}

export default analyzeDailyPopByScreenedStatus;
