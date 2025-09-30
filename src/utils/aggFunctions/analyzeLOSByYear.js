import { parseISO, differenceInCalendarDays } from "date-fns";

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return parseISO(dateStr);
  } catch {
    return null;
  }
};

const median = (arr) => {
  if (!arr || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const average = (arr) =>
  arr && arr.length > 0
    ? arr.reduce((sum, val) => sum + val, 0) / arr.length
    : null;

/**
 * Analyze entries in a given year.
 *
 * @param {Array} data - Array of records with Admission_Date/Release_Date or ATD_Entry_Date/ATD_Exit_Date
 * @param {number} year - The year to analyze
 * @param {string} detentionType - "secure-detention" or other
 * @returns {Object}
 */
const analyzeLOSByYear = (data, year, detentionType = "secure-detention") => {
  const results = {
    totalEntries: 0,
    previousTotalEntries: 0,
    avgLengthOfStay: null,
    medianLengthOfStay: null,
    entriesByProgramType: {}, // { type: { total: n } }
  };

  const overallLengths = [];

  const intakeStartDate = parseISO(`${year}-01-01`);
  const intakeEndDate = parseISO(`${year}-12-31`);

  const prevStartDate = parseISO(`${year - 1}-01-01`);
  const prevEndDate = parseISO(`${year - 1}-12-31`);

  data.forEach((row) => {
    const entryDate =
      detentionType === "secure-detention"
        ? parseDate(row.Admission_Date)
        : parseDate(row.ATD_Entry_Date);
    const exitDate =
      detentionType === "secure-detention"
        ? parseDate(row.Release_Date)
        : parseDate(row.ATD_Exit_Date);

    if (!entryDate || !exitDate) return; // skip incomplete rows

    // Previous year exits
    if (exitDate >= prevStartDate && exitDate <= prevEndDate) {
      results.previousTotalEntries++;
    }

    // Current year exits
    if (exitDate >= intakeStartDate && exitDate <= intakeEndDate) {
      results.totalEntries++;

      const lengthOfStay = differenceInCalendarDays(exitDate, entryDate) + 1;
      if (lengthOfStay > 0) {
        overallLengths.push(lengthOfStay);
      }

      const type =
        row.Facility && row.Facility.trim() ? row.Facility : "Unknown";
      if (!results.entriesByProgramType[type]) {
        results.entriesByProgramType[type] = { total: 0 };
      }
      results.entriesByProgramType[type].total++;
    }
  });

  results.avgLengthOfStay = average(overallLengths);
  results.medianLengthOfStay = median(overallLengths);

  return results;
};

export default analyzeLOSByYear;
