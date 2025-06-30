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
const analyzeExits = (data, year, detentionType = "secure-detention") => {
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  const results = {
    totalEntries: 0,
    previousTotalEntries: 0,
    avgLengthOfStay: null,
    medianLengthOfStay: null,
    entriesByProgramType: {}, // { type: { total: n, successful: x, unsuccessful: y } }
  };

  const overallLengths = [];
  const successLengths = [];
  const unsuccessLengths = [];

  data.forEach((row) => {
    const entryDate =
      detentionType === "secure-detention"
        ? parseDate(row.Admission_Date)
        : parseDate(row.ATD_Entry_Date);
    const exitDate =
      detentionType === "secure-detention"
        ? parseDate(row.Release_Date)
        : parseDate(row.ATD_Exit_Date);

    if (exitDate && exitDate.getFullYear() === year - 1) {
      results.previousTotalEntries++;
    }

    if (!exitDate || exitDate.getFullYear() !== year || !exitDate) return;

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

export default analyzeExits;
