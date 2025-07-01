// Useful for looking at data over a time-period

import { parseISO, differenceInCalendarDays } from "date-fns";

const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
};

const median = (arr) => {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/**
 * Analyze entries in a given year.
 *
 * @param {Array} data - Array of records with ATD_Entry_Date,and ATD_Program_Type
 * @param {number} year - The year to analyze
 * @returns {Object} - Entry stats for the year
 */
const analyzeLOSByYear = (data, year, detentionType = "secure-detention") => {
  const results = {
    totalEntries: 0,
    previousTotalEntries: 0,
    avgLengthOfStay: null,
    medianLengthOfStay: null,
    entriesByProgramType: {}, // { type: { total: n, successful: x, unsuccessful: y } }
  };

  const overallLengths = [];

  const intakeStart = `${year}-01-01`;
  const intakeEnd = `${year}-12-31`;
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);

  // Previous year range
  const prevStartDate = new Date(intakeStart);
  prevStartDate.setFullYear(intakeStartDate.getFullYear() - 1);
  const prevEndDate = new Date(intakeEnd);
  prevEndDate.setFullYear(intakeEndDate.getFullYear() - 1);

  data.forEach((row) => {
    const entryDate =
      detentionType === "secure-detention"
        ? parseDate(row.Admission_Date)
        : parseDate(row.ATD_Entry_Date);
    const exitDate =
      detentionType === "secure-detention"
        ? parseDate(row.Release_Date)
        : parseDate(row.ATD_Exit_Date);

    if (exitDate && exitDate >= prevStartDate && exitDate <= prevEndDate) {
      results.previousTotalEntries++;
    }

    if (!exitDate || exitDate < intakeStartDate || exitDate > intakeEndDate)
      return;

    // Count exits
    results.totalEntries++;

    // Length of stay
    const lengthOfStay = differenceInCalendarDays(exitDate, entryDate) + 1;
    if (!isNaN(lengthOfStay) && lengthOfStay > 0) {
      overallLengths.push(lengthOfStay);
    }

    // By Program Type
    const type = row.Facility || "Unknown";
    if (!results.entriesByProgramType[type]) {
      results.entriesByProgramType[type] = {
        total: 0,
      };
    }
    results.entriesByProgramType[type].total++;
  });

  // Compute averages and medians
  const average = (arr) =>
    arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : null;

  results.avgLengthOfStay = average(overallLengths);
  results.medianLengthOfStay = median(overallLengths);

  return results;
};

export default analyzeLOSByYear;
