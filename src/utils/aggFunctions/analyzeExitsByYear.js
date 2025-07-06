import { differenceInCalendarDays } from "date-fns";

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
 * Analyze exits in a given year.
 *
 * @param {Array} data - Array of records with ATD_Entry_Date, ATD_Exit_Date, ATD_Successful_Exit, and ATD_Program_Type
 * @param {number} year - The year to analyze
 * @returns {Object} - Exit stats for the year
 */
const analyzeExitsByYear = (data, year) => {
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  const results = {
    totalExits: 0,
    previousTotalExits: 0,
    successfulExits: 0,
    unsuccessfulExits: 0,
    avgLengthOfStay: null,
    medianLengthOfStay: null,
    successfulAvgLengthOfStay: null,
    successfulMedianLengthOfStay: null,
    unsuccessfulAvgLengthOfStay: null,
    unsuccessfulMedianLengthOfStay: null,
    exitsByProgramType: {}, // { type: { total: n, successful: x, unsuccessful: y } }
  };

  const overallLengths = [];
  const successLengths = [];
  const unsuccessLengths = [];

  data.forEach((row) => {
    const entryDate = parseDate(row.ATD_Entry_Date);
    const exitDate = parseDate(row.ATD_Exit_Date);

    const isSuccessful =
      row.ATD_Successful_Exit === "1" || row.ATD_Successful_Exit === 1;

    if (exitDate && exitDate.getFullYear() === year - 1) {
      results.previousTotalExits++;
    }

    if (!exitDate || exitDate.getFullYear() !== year || !entryDate) return;

    // Count exits
    results.totalExits++;
    if (isSuccessful) results.successfulExits++;
    else results.unsuccessfulExits++;

    // Length of stay
    const lengthOfStay = differenceInCalendarDays(exitDate, entryDate);
    if (!isNaN(lengthOfStay)) {
      overallLengths.push(lengthOfStay);
      if (isSuccessful) successLengths.push(lengthOfStay);
      else unsuccessLengths.push(lengthOfStay);
    }

    // By Program Type
    const type = row.Facility || "Unknown";
    if (!results.exitsByProgramType[type]) {
      results.exitsByProgramType[type] = {
        total: 0,
        successful: 0,
        unsuccessful: 0,
      };
    }
    results.exitsByProgramType[type].total++;
    if (isSuccessful) results.exitsByProgramType[type].successful++;
    else results.exitsByProgramType[type].unsuccessful++;
  });

  // Compute averages and medians
  const average = (arr) =>
    arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : null;

  results.avgLengthOfStay = average(overallLengths);
  results.medianLengthOfStay = median(overallLengths);

  results.successfulAvgLengthOfStay = average(successLengths);
  results.successfulMedianLengthOfStay = median(successLengths);

  results.unsuccessfulAvgLengthOfStay = average(unsuccessLengths);
  results.unsuccessfulMedianLengthOfStay = median(unsuccessLengths);

  return results;
};

export default analyzeExitsByYear;
