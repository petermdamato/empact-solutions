/**
 * Analyze Post-Dispo population grouped by OffenseCategory
 * Filters for Post-Dispo Stay Reason that includes "Other",
 * equals "Confinement to secure detention", or equals "Awaiting Placement".
 *
 * @param {Array} csvData - Array of data objects
 * @param {number} year - Year to analyze
 * @param {Object} options - Additional options for formatting and sorting
 * @returns {Object} Results broken down by OffenseCategory
 */
const analyzePostDispoGroup = (csvData, year, options = {}) => {
  // Filter records for target Post-Dispo Stay Reasons
  const filtered = csvData.filter((row) => {
    const reason = row["Post-Dispo Stay Reason"];
    if (!reason) return false;

    const reasonLower = reason.toLowerCase();

    return (
      reasonLower.includes("other") ||
      reason === "Confinement to secure detention" ||
      reason === "Awaiting Placement"
    );
  });

  // Call analyzeData to compute averageDailyPopulation grouped by OffenseCategory
  const results = analyzeData(
    filtered,
    "averageDailyPopulation",
    year,
    "OffenseCategory",
    "secure-detention",
    options
  );

  return results;
};

export default analyzePostDispoGroup;
