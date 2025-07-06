import { parseISO } from "date-fns";
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
  return (intake - dob) / (365.25 * 24 * 60 * 60 * 1000);
};

/**
 * Analyze exits by year and breakdown type, returning percent disrupted and undisrupted.
 *
 * @param {Array} data - Array of records with ATD_Entry_Date, ATD_Exit_Date, ATD_Successful_Exit, etc.
 * @param {string} breakdownType - Breakdown type: "Overall Total", "Race/Ethnicity", "YOC/White", "Gender", "Age at Intake", "Offense Category"
 * @returns {Object} - { [year]: { [breakdown]: { total, disrupted, undisrupted, percentDisrupted, percentUndisrupted } } }
 */
const analyzeDisruptionPercentsByYear = (data, breakdownType) => {
  const results = {};

  data.forEach((row) => {
    const exitDate = parseDate(row.ATD_Exit_Date);
    const entryDate = parseDate(row.ATD_Entry_Date);

    if (!exitDate || !entryDate) return;

    const year = exitDate.getFullYear();
    const isSuccessful =
      row.ATD_Successful_Exit === "1" || row.ATD_Successful_Exit === 1;

    let breakdownValue = "Overall";

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
      case "Age at Intake":
        const dob = parseDate(row.Date_of_Birth);
        if (dob && entryDate) {
          const age = getAge(dob, entryDate);
          breakdownValue = getAgeBracket(age);
        }
        break;
      case "Offense Category":
        breakdownValue = getSimplifiedOffenseCategory(row.OffenseCategory);
        break;
      case "Overall Total":
      default:
        breakdownValue = "Overall";
    }

    if (!results[year]) results[year] = {};
    if (!results[year][breakdownValue]) {
      results[year][breakdownValue] = {
        total: 0,
        disrupted: 0,
        undisrupted: 0,
      };
    }

    results[year][breakdownValue].total++;
    if (isSuccessful) {
      results[year][breakdownValue].undisrupted++;
    } else {
      results[year][breakdownValue].disrupted++;
    }
  });

  // Calculate percents
  Object.keys(results).forEach((year) => {
    Object.keys(results[year]).forEach((breakdown) => {
      const group = results[year][breakdown];
      group.percentDisrupted = group.total
        ? (group.disrupted / group.total) * 100
        : 0;
      group.percentUndisrupted = group.total
        ? (group.undisrupted / group.total) * 100
        : 0;
    });
  });

  return results;
};

export default analyzeDisruptionPercentsByYear;
