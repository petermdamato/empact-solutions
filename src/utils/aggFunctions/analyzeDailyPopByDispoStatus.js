import { parse, eachDayOfInterval, isBefore, isAfter, isEqual } from "date-fns";
import { mean } from "d3-array";

function analyzeDailyPopByDispoStatus(
  data,
  selectedYear,
  detentionType = "alternative-to-detention"
) {
  const format = "MM/dd/yy";

  // Get all days in the year
  const allDays = eachDayOfInterval({
    start: new Date(selectedYear, 0, 1),
    end: new Date(selectedYear, 11, 31),
  });

  // Group data by dispo status
  const dispoGroups = {};
  data.forEach((row) => {
    // const dispStatus = row["Pre/post-dispo filter"] || "Unknown";
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

  // Calculate daily counts and ADP per dispo status
  for (const [dispStatus, records] of Object.entries(dispoGroups)) {
    const dailyCounts = allDays.map((day) => {
      return records.reduce((count, { entry, exit }) => {
        if (!entry) return count;
        const started = isBefore(entry, day) || isEqual(entry, day);
        const notExited = !exit || isAfter(exit, day) || isEqual(exit, day);
        return started && notExited ? count + 1 : count;
      }, 0);
    });

    results[dispStatus] = mean(dailyCounts);
  }

  return results;
}

export default analyzeDailyPopByDispoStatus;
