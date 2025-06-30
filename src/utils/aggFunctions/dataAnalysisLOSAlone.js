import {
  parse,
  differenceInCalendarDays,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";

import {
  getAgeBracket,
  getSimplifiedOffenseCategory,
  offenseMap,
} from "@/utils/categorizationUtils";

const getSimplifiedReferralSource = (source) => {
  if (!source) return "Other";
  const s = source.toLowerCase();

  if (
    s.includes("police") ||
    s.includes("sheriff") ||
    s.includes("law enforcement") ||
    s.includes("officer") ||
    s.includes("deputy")
  ) {
    return "Law Enforcement";
  }

  if (
    s.includes("court") ||
    s.includes("judge") ||
    s.includes("probation") ||
    s.includes("magistrate")
  ) {
    return "Court";
  }

  if (s.includes("school")) {
    return "School";
  }

  return "Other";
};

// Utility to parse dates safely
const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
};

// Helper to determine if youth is White or Youth of Color
const getRaceSimplified = (race, ethnicity) => {
  if (ethnicity === "Hispanic") return "Youth of Color";
  if (race === "White") return "White";
  return "Youth of Color"; // All others are Youth of Color
};

function analyzeAdmissionsOnly(
  rows,
  targetYear,
  programType = "secure-detention"
) {
  const parseDate = (str) => (str ? new Date(str) : null);
  const isTargetYear = (date) => date && date.getFullYear() === targetYear;
  const today = new Date();

  const getAge = (dob, intake) => {
    if (!dob || !intake) return null;
    return (intake - dob) / (365.25 * 24 * 60 * 60 * 1000);
  };

  const groups = [
    "Gender",
    "Race",
    "Ethnicity",
    "OffenseCategory",
    "RaceEthnicity", // Detailed race/ethnicity breakdown
    "RaceSimplified", // Simplified White vs Youth of Color breakdown
    "Facility",
    "Referral_Source",
    "AgeBracket",
    "AgeDetail",
  ];

  const dispoTypes = ["Pre-dispo", "Post-dispo"];
  const screenedType = ["Screened", "Not Screened", "Auto Hold"];
  const result = {
    overall: { "Pre-dispo": [], "Post-dispo": [] },
    screened: { Screened: [], "Not Screened": [], "Auto Hold": [] },
    byGroup: {},
  };

  for (const group of groups) {
    result.byGroup[group] = {};
  }

  for (const row of rows) {
    const intake = parseDate(
      programType === "secure-detention"
        ? row.Admission_Date
        : row.ATD_Entry_Date
    );
    const dob = parseDate(row.Date_of_Birth);

    const age = Math.floor(getAge(dob, intake));

    const dispo =
      row["Post-Dispo Stay Reason"] === null ||
      row["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    const screened = screenedType.includes(row["Screened/not screened"])
      ? row["Screened/not screened"]
      : "Unknown";

    if (!isTargetYear(intake)) continue;

    if (!result.overall[dispo]) result.overall[dispo] = [];
    result.overall[dispo].push(age);

    if (!result.screened[screened]) result.screened[screened] = [];
    result.screened[screened].push(age);

    for (const group of groups) {
      let val;
      if (group === "RaceEthnicity") {
        val = row.Ethnicity === "Hispanic" ? "Hispanic" : row.Race || "Unknown";
      } else if (group === "RaceSimplified") {
        val = getRaceSimplified(row.Race, row.Ethnicity);
      } else if (group === "AgeBracket") {
        val = getAgeBracket(age);
      } else if (group === "AgeDetail") {
        val = age;
      } else {
        val = row[group] || "Unknown";
      }

      if (!result.byGroup[group][val]) {
        result.byGroup[group][val] = {};
      }

      if (!result.byGroup[group][val][dispo]) {
        result.byGroup[group][val][dispo] = [];
      }

      result.byGroup[group][val][dispo].push(age);
    }
  }

  const computeStats = (arr) => {
    const values = arr.filter((v) => v != null);
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.length;
  };

  const output = {
    overall: {},
    byGroup: {},
    screened: {},
  };

  for (const dispo of Object.keys(result.overall)) {
    output.overall[dispo] = computeStats(result.overall[dispo]);
  }

  for (const scr of Object.keys(result.screened)) {
    output.screened[scr] = computeStats(result.screened[scr]);
  }

  for (const group of groups) {
    output.byGroup[group] = {};
    for (const val in result.byGroup[group]) {
      output.byGroup[group][val] = {};
      for (const dispo in result.byGroup[group][val]) {
        output.byGroup[group][val][dispo] = computeStats(
          result.byGroup[group][val][dispo]
        );
      }
    }
  }

  return output;
}

// Helper for race/ethnicity
const getRaceEthnicity = (race, ethnicity) => {
  if (ethnicity?.toLowerCase() === "hispanic") return "Hispanic";
  if (/black|african/i.test(race)) return "African American or Black";
  if (/asian/i.test(race)) return "Asian";
  if (/white/i.test(race)) return "White";
  return "Other";
};

// Helper to get age at admission
const getAgeAtAdmission = (dob, intake, bracketed = true) => {
  if (!dob || !intake) return null;
  const birth = parseDate(dob);
  const intakeDate = parseDate(intake);
  if (!birth || !intakeDate) return "Unknown";

  const age =
    intakeDate.getFullYear() -
    birth.getFullYear() -
    (intakeDate <
    new Date(intakeDate.getFullYear(), birth.getMonth(), birth.getDate())
      ? 1
      : 0);
  if (bracketed) {
    if (age < 11) return "10 and younger";
    if (age >= 11 && age <= 13) return "11-13";
    if (age >= 14 && age <= 17) return "14-17";
    if (age >= 18) return "18+";
    return "Unknown";
  } else {
    return age;
  }
};

/**
 * Analyze juvenile detention data with various breakdown options and metrics
 * @param {Array} csvData - Array of data objects
 * @param {string} calculationType - Type of calculation to perform
 *   Options: "countAdmissions", "countReleases", "averageLengthOfStay",
 *            "medianLengthOfStay", "averageDailyPopulation"
 * @param {number} year - Year to analyze
 * @param {string} groupBy - Column to group by
 *   Options: "Gender", "Age", "RaceEthnicity", "RaceSimplified", "OffenseCategory",
 *            "OffenseOverall", "Facility", "Referral_Source", "simplifiedReferralSource", "AgeDetail"
 * @param {Object} options - Additional options
 * @returns {Object} Results of the analysis
 */
const analyzeData = (
  csvData,
  calculationType,
  year,
  groupBy = null,
  programType = "secure-detention",
  options = {}
) => {
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    return { error: "No data provided or invalid data format" };
  }

  if (!calculationType || !year) {
    return { error: "Calculation type and year are required" };
  }

  // Validate calculation type
  const validCalculations = [
    "countAdmissions",
    "countReleases",
    "averageLengthOfStay",
    "medianLengthOfStay",
    "averageDailyPopulation",
  ];

  if (!validCalculations.includes(calculationType)) {
    return {
      error: `Invalid calculation type. Must be one of: ${validCalculations.join(
        ", "
      )}`,
    };
  }

  year = parseInt(year, 10);
  if (isNaN(year)) {
    return { error: "Year must be a valid number" };
  }

  // Validate groupBy
  const validGroupBys = [
    "Gender",
    "Age",
    "AgeDetail",
    "RaceEthnicity",
    "RaceSimplified",
    "OffenseCategory",
    "OffenseOverall",
    "SimplifiedOffense",
    "Facility",
    "Referral_Source",
    "simplifiedReferralSource",
  ];

  if (groupBy && !validGroupBys.includes(groupBy)) {
    return {
      error: `Invalid groupBy. Must be one of: ${validGroupBys.join(
        ", "
      )} or null`,
    };
  }

  const results = {};
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  // Helper to calculate median
  const median = (arr) => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  // Group data
  const grouped = csvData.reduce((acc, row) => {
    const entryDate = parseDate(
      programType === "secure-detention"
        ? row.Admission_Date
        : row.ATD_Entry_Date
    );
    const exitDate = parseDate(
      programType === "secure-detention" ? row.Release_Date : row.ATD_Exit_Date
    );

    // Skip if entry date is invalid or not in target year
    if (!entryDate || !exitDate || exitDate.getFullYear() !== year) return acc;

    // Prepare derived fields
    const age = getAgeAtAdmission(
      row.Date_of_Birth,
      entryDate,
      groupBy === "Age"
    );
    const raceEth = getRaceEthnicity(row.Race, row.Ethnicity);
    const raceSimplified = getRaceSimplified(row.Race, row.Ethnicity);
    const offenseOverall =
      row["Post-Dispo Stay Reason"] && row["Post-Dispo Stay Reason"].length > 0
        ? row["Post-Dispo Stay Reason"].toLowerCase().includes("other")
          ? "Other"
          : row["Post-Dispo Stay Reason"]
        : offenseMap[row.OffenseCategory] || "Other";
    const simplifiedOffenseCategory = getSimplifiedOffenseCategory(
      row.OffenseCategory
    );
    const facility = row.Facility || "Unknown";
    const referralSource = row.Referral_Source || "Unknown";

    // Determine the key based on groupBy
    let key;
    switch (groupBy) {
      case "Gender":
        key = row.Gender || "Unknown";
        break;
      case "Age":
        key = age;
        break;
      case "AgeDetail":
        key = age;
        break;
      case "RaceEthnicity":
        key = raceEth;
        break;
      case "RaceSimplified":
        key = raceSimplified;
        break;
      case "OffenseCategory":
        key = row.OffenseCategory || "Unknown";
        break;
      case "OffenseOverall":
        key = offenseOverall;
        break;
      case "SimplifiedOffense":
        key = simplifiedOffenseCategory;
        break;
      case "Facility":
        key = facility;
        break;
      case "Referral_Source":
        key = referralSource;
        break;
      case "simplifiedReferralSource":
        key = getSimplifiedReferralSource(referralSource);
        break;
      default:
        key = "All";
    }

    if (!acc[key]) {
      acc[key] = {
        entries: 0,
        lengthsOfStay: [],
      };
    }

    acc[key].entries++;

    // Calculate length of stay if exit date is valid
    if (exitDate && !isNaN(exitDate)) {
      const lengthOfStay = differenceInCalendarDays(exitDate, entryDate) + 1;
      if (lengthOfStay >= 0) {
        acc[key].lengthsOfStay.push(lengthOfStay);
      }
    }

    return acc;
  }, {});

  // Calculate metrics for each group
  for (const [key, group] of Object.entries(grouped)) {
    if (calculationType === "countAdmissions") {
      results[key] = group.entries;
    } else if (calculationType === "averageLengthOfStay") {
      results[key] =
        group.lengthsOfStay.length > 0
          ? group.lengthsOfStay.reduce((sum, days) => sum + days, 0) /
            group.lengthsOfStay.length
          : null;
    } else if (calculationType === "medianLengthOfStay") {
      results[key] = median(group.lengthsOfStay);
    } else if (calculationType === "countReleases") {
      // Not implemented in analyzeEntriesByYear; you can add logic here if needed
      results[key] = null;
    } else if (calculationType === "averageDailyPopulation") {
      // Not implemented in analyzeEntriesByYear; you can add logic here if needed
      results[key] = null;
    }
  }

  // Round results if requested
  if (options.round) {
    for (const key in results) {
      if (results[key] !== null && typeof results[key] === "number") {
        results[key] = Math.round(results[key] * 100) / 100;
      }
    }
  }

  // Sort results if requested
  if (options.sort) {
    const sortedResults = {};
    Object.keys(results)
      .sort((a, b) => {
        if (options.sort === "desc") {
          return (results[b] || 0) - (results[a] || 0);
        }
        return (results[a] || 0) - (results[b] || 0);
      })
      .forEach((key) => {
        sortedResults[key] = results[key];
      });
    return sortedResults;
  }

  return results;
};

/**
 * Analyze data by simplified offense categories (Technicals, Misdemeanors, Felonies, Other)
 * This function is a specialized wrapper around analyzeData that always groups by simplified offense categories
 *
 * @param {Array} csvData - Array of data objects
 * @param {string} calculationType - Type of calculation to perform
 * @param {number} year - Year to analyze
 * @param {Object} options - Additional options for formatting and sorting
 * @returns {Object} Results broken down by the four specified offense categories
 */
const analyzeOffenseCategories = (
  csvData,
  calculationType,
  year,
  options = {}
) => {
  // Call the main analysis function with SimplifiedOffense grouping
  const results = analyzeData(
    csvData,
    calculationType,
    year,
    "SimplifiedOffense",
    options
  );

  // Ensure all four categories are represented even if some have no data
  const categories = ["Technicals", "Misdemeanors", "Felonies", "Other"];
  const completeResults = {};

  categories.forEach((category) => {
    completeResults[category] =
      results[category] !== undefined ? results[category] : null;
  });

  return completeResults;
};

/**
 * Analyze data by reason for detention based on the offenseMap categories
 * This function is a specialized wrapper around analyzeData that groups by overall offense type
 *
 * @param {Array} csvData - Array of data objects
 * @param {string} calculationType - Type of calculation to perform
 * @param {number} year - Year to analyze
 * @param {Object} options - Additional options for formatting and sorting
 * @returns {Object} Results broken down by detention reason categories (New Offenses, Technicals, Other)
 */
const analyzeReasonForDetention = (
  csvData,
  calculationType,
  year,
  options = {}
) => {
  // Call the main analysis function with OffenseOverall grouping
  const results = analyzeData(
    csvData,
    calculationType,
    year,
    "OffenseOverall",
    options
  );

  // Ensure all reason categories are represented
  const reasons = ["New Offenses", "Technicals", "Other"];
  const completeResults = {};

  reasons.forEach((reason) => {
    completeResults[reason] =
      results[reason] !== undefined ? results[reason] : null;
  });

  return completeResults;
};

export {
  analyzeData as default,
  analyzeOffenseCategories,
  analyzeReasonForDetention,
  analyzeAdmissionsOnly,
};
