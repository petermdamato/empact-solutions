import {
  getAgeBracket,
  getSimplifiedOffenseCategory,
} from "@/utils/categorizationUtils";

const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
};

const getRaceSimplified = (race, ethnicity) => {
  if (ethnicity === "Hispanic") return "Youth of Color";
  if (race === "White") return "White";
  return "Youth of Color";
};

const getRaceEthnicity = (race, ethnicity) =>
  ethnicity === "Hispanic" ? "Hispanic" : race || "Unknown";

const getAge = (dob, intake) => {
  if (!dob || !intake) return null;
  return Math.floor((intake - dob) / (365.25 * 24 * 60 * 60 * 1000));
};

/**
 * Analyze exits in a given year, with breakdowns.
 *
 * @param {Array} data - Array of records with ATD_Entry_Date, ATD_Exit_Date, ATD_Successful_Exit, and ATD_Program_Type
 * @param {number} year - The year to analyze
 * @param {string} breakdownType - Breakdown type: "Race/Ethnicity", "YOC/White", "Gender", "Age at Intake", "Offense Category", "Exit To"
 * @returns {Object} - Exit stats for the year
 */
const analyzeExitsByYear = (data, year, breakdownType) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  const results = {
    exitsByBreakdown: {}, // { breakdownValue: { total, successful, unsuccessful } }
  };

  data.forEach((row) => {
    const entryDate = parseDate(row.ATD_Entry_Date);
    const exitDate = parseDate(row.ATD_Exit_Date);

    const isSuccessful =
      row.ATD_Successful_Exit === "1" || row.ATD_Successful_Exit === 1;

    if (!exitDate || exitDate.getFullYear() !== year || !entryDate) return;

    // By Breakdown Type
    let breakdownValue = "Unknown";

    switch (breakdownType) {
      case "Race/Ethnicity":
        breakdownValue = getRaceEthnicity(row.Race, row.Ethnicity);
        break;
      case "YOC/White":
        breakdownValue = getRaceSimplified(row.Race, row.Ethnicity);
        break;
      case "Gender":
        breakdownValue = row.Gender || "Unknown";
        break;
      case "Exit To":
        breakdownValue = row["Exit_To"] || "Unknown";
        break;
      case "Age at Intake":
        const dob = parseDate(row.Date_of_Birth);
        const entry = parseDate(row.ATD_Entry_Date);
        if (dob && entry) {
          const age = getAge(dob, entry);
          breakdownValue = getAgeBracket(age);
        }
        break;
      case "Offense Category":
        breakdownValue = getSimplifiedOffenseCategory(row.OffenseCategory);
        break;
      default:
        breakdownValue = "Unknown";
    }

    if (!results.exitsByBreakdown[breakdownValue]) {
      results.exitsByBreakdown[breakdownValue] = {
        total: 0,
        undisrupted: 0,
        disrupted: 0,
      };
    }
    results.exitsByBreakdown[breakdownValue].total++;
    if (isSuccessful) results.exitsByBreakdown[breakdownValue].undisrupted++;
    else results.exitsByBreakdown[breakdownValue].disrupted++;
  });

  return results;
};

export default analyzeExitsByYear;
