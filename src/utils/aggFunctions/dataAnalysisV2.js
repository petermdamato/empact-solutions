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

import { getReasonForDetention } from "../categories";

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
  const startDate = new Date(`${targetYear}-01-01`);
  const endDate = new Date(`${targetYear}-12-31`);
  const isTargetYear = (date) => date && date >= startDate && date <= endDate;
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
    "OffenseCategoryAligned",
    "RaceEthnicity", // Detailed race/ethnicity breakdown
    "RaceSimplified", // Simplified White vs Youth of Color breakdown
    "Facility",
    "Referral_Source",
    "AgeBracket",
    "AgeDetail",
    "ReasonForDetention",
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
      } else if (group === "OffenseCategory") {
        const postDispoReason = row["Post-Dispo Stay Reason"];
        if (
          postDispoReason &&
          postDispoReason.toLowerCase().includes("other")
        ) {
          val = "Other";
        } else if (postDispoReason) {
          val = postDispoReason;
        } else {
          val = row.OffenseCategory || "Unknown";
        }
      } else if (group === "OffenseCategoryAligned") {
        val = row.OffenseCategory || "Unknown";
      } else if (group === "ReasonForDetention") {
        val = getReasonForDetention(row);
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
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    return { error: "No data provided or invalid data format" };
  }

  if (!calculationType || !year) {
    return { error: "Calculation type and year are required" };
  }

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

  const parseDate = (str) => (str ? new Date(str) : null);

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

    if (!entryDate || entryDate < startDate || entryDate > endDate) return acc;

    const dispo =
      row["Post-Dispo Stay Reason"] === null ||
      row["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    let key;
    switch (groupBy) {
      case "Gender":
        key = row.Gender || "Unknown";
        break;
      case "Age":
      case "AgeDetail":
        key = getAgeAtAdmission(
          row.Date_of_Birth,
          entryDate,
          groupBy === "Age"
        );
        break;
      case "RaceEthnicity":
        key = getRaceEthnicity(row.Race, row.Ethnicity);
        break;
      case "RaceSimplified":
        key = getRaceSimplified(row.Race, row.Ethnicity);
        break;
      case "OffenseCategory":
        key =
          row["Post-Dispo Stay Reason"] &&
          row["Post-Dispo Stay Reason"].length > 0
            ? row["Post-Dispo Stay Reason"].toLowerCase().includes("other")
              ? "Other"
              : row["Post-Dispo Stay Reason"]
            : row.OffenseCategory || "Unknown";
        break;
      case "OffenseOverall":
        key =
          row["Post-Dispo Stay Reason"] &&
          row["Post-Dispo Stay Reason"].length > 0
            ? row["Post-Dispo Stay Reason"].toLowerCase().includes("other")
              ? "Other"
              : row["Post-Dispo Stay Reason"]
            : offenseMap[row.OffenseCategory] || "Other";
        break;
      case "SimplifiedOffense":
        key = getSimplifiedOffenseCategory(row.OffenseCategory);
        break;
      case "Facility":
        key = row.Facility || "Unknown";
        break;
      case "Referral_Source":
        key = row.Referral_Source || "Unknown";
        break;
      case "simplifiedReferralSource":
        key = getSimplifiedReferralSource(row.Referral_Source || "Unknown");
        break;
      default:
        key = "All";
    }

    if (!acc[key]) {
      acc[key] = {
        "Pre-dispo": { entries: 0, lengthsOfStay: [] },
        "Post-dispo": { entries: 0, lengthsOfStay: [] },
      };
    }

    acc[key][dispo].entries++;

    if (exitDate && !isNaN(exitDate)) {
      const lengthOfStay = differenceInCalendarDays(exitDate, entryDate) + 1;
      if (lengthOfStay >= 0) {
        acc[key][dispo].lengthsOfStay.push(lengthOfStay);
      }
    }

    return acc;
  }, {});

  const results = Object.entries(grouped).map(([key, group]) => {
    const preDispo = group["Pre-dispo"];
    const postDispo = group["Post-dispo"];

    let preValue = null;
    let postValue = null;
    let overallValue = null;

    if (calculationType === "countAdmissions") {
      preValue = preDispo.entries || 0;
      postValue = postDispo.entries || 0;
      overallValue = preValue + postValue;
    } else if (calculationType === "averageLengthOfStay") {
      const preAvg = preDispo.lengthsOfStay.length
        ? preDispo.lengthsOfStay.reduce((sum, v) => sum + v, 0) /
          preDispo.lengthsOfStay.length
        : null;
      const postAvg = postDispo.lengthsOfStay.length
        ? postDispo.lengthsOfStay.reduce((sum, v) => sum + v, 0) /
          postDispo.lengthsOfStay.length
        : null;

      const combinedLOS = preDispo.lengthsOfStay.concat(
        postDispo.lengthsOfStay
      );
      const overallAvg = combinedLOS.length
        ? combinedLOS.reduce((sum, v) => sum + v, 0) / combinedLOS.length
        : null;

      preValue = preAvg;
      postValue = postAvg;
      overallValue = overallAvg;
    } else if (calculationType === "medianLengthOfStay") {
      const median = (arr) => {
        if (!arr.length) return null;
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      };

      const preMedian = median(preDispo.lengthsOfStay);
      const postMedian = median(postDispo.lengthsOfStay);
      const combinedMedian = median(
        preDispo.lengthsOfStay.concat(postDispo.lengthsOfStay)
      );

      preValue = preMedian;
      postValue = postMedian;
      overallValue = combinedMedian;
    }

    // Round if requested
    if (options.round) {
      if (typeof preValue === "number")
        preValue = Math.round(preValue * 100) / 100;
      if (typeof postValue === "number")
        postValue = Math.round(postValue * 100) / 100;
      if (typeof overallValue === "number")
        overallValue = Math.round(overallValue * 100) / 100;
    }

    return {
      category: key,
      "Pre-dispo": preValue,
      "Post-dispo": postValue,
      total: overallValue,
    };
  });

  // Optional sort
  if (options.sort) {
    results.sort((a, b) => {
      const aTotal = (a["Pre-dispo"] || 0) + (a["Post-dispo"] || 0);
      const bTotal = (b["Pre-dispo"] || 0) + (b["Post-dispo"] || 0);
      return options.sort === "desc" ? bTotal - aTotal : aTotal - bTotal;
    });
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
