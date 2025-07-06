const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
};

/**
 * Analyze unsuccessful exits by disruption type in a given year.
 *
 * @param {Array} data - Array of records with ATD_Entry_Date, ATD_Exit_Date, ATD_Successful_Exit, and disruption flags
 * @param {number} year - The year to analyze
 * @returns {Object} - Exit stats by disruption type for the year
 */
const analyzeExitsByDisruptionType = (data, year) => {
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  const results = {
    totalUnsuccessfulExits: 0,
    byDisruptionType: {
      FTA: { count: 0 },
      "New Offense": { count: 0 },
      Technical: { count: 0 },
      //   Other: { count: 0 },
    },
  };

  data.forEach((row) => {
    const entryDate = parseDate(row.ATD_Entry_Date);
    const exitDate = parseDate(row.ATD_Exit_Date);

    // const isSuccessful =
    //   row.ATD_Successful_Exit === "1" || row.ATD_Successful_Exit === 1;

    if (
      !exitDate ||
      exitDate < startOfYear ||
      exitDate > endOfYear ||
      !entryDate
      //   || isSuccesful
    )
      return;

    // Only analyze unsuccessful exits
    results.totalUnsuccessfulExits++;

    // Determine disruption type
    // if (
    //   row.ATD_Exit_New_Offense !== "1" &&
    //   row.ATD_Exit_New_Offense !== 1 &&
    //   row.ATD_Exit_FTA !== "1" &&
    //   row.ATD_Exit_FTA !== 1 &&
    //   row.ATD_Exit_Other !== "1" &&
    //   row.ATD_Exit_Other !== 1
    // ) {
    //   console.log(row);
    // }
    if (row.ATD_Exit_FTA === "1" || row.ATD_Exit_FTA === 1) {
      results.byDisruptionType.FTA.count++;
    } else if (
      row.ATD_Exit_New_Offense === "1" ||
      row.ATD_Exit_New_Offense === 1
    ) {
      results.byDisruptionType["New Offense"].count++;
    } else if (
      row["ATD_Exit_Technical"] === "1" ||
      row["ATD_Exit_Technical"] === 1
    ) {
      results.byDisruptionType.Technical.count++;
    }
    // else if (row.ATD_Exit_Other === "1" || row.ATD_Exit_Other === 1) {
    //   results.byDisruptionType.Other.count++;
    // }
  });

  return results;
};

export default analyzeExitsByDisruptionType;
