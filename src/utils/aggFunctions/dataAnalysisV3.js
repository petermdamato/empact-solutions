import {
  parse,
  differenceInCalendarDays,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";

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

// Map for offense categories
const offenseMap = {
  "Felony Person": "New Offenses",
  "Felony Property": "New Offenses",
  "Felony Weapons": "New Offenses",
  "Felony Drugs": "New Offenses",
  "Other Felony": "New Offenses",
  "Misdemeanor Person": "New Offenses",
  "Misdemeanor Property": "New Offenses",
  "Misdemeanor Weapons": "New Offenses",
  "Other Misdemeanor": "New Offenses",
  "Status Offense": "New Offenses",
  "ATD Program Failure": "Technicals",
  "Court Order": "Technicals",
  "Probation Violation": "Technicals",
  Warrant: "Technicals",
  "Other Technical Violation": "Technicals",
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

  const getAgeBracket = (dob) => {
    if (!dob) return "Unknown";
    const age = (today - dob) / (365.25 * 24 * 60 * 60 * 1000);
    if (age <= 10) return "10 and younger";
    if (age <= 13) return "11-13";
    if (age <= 17) return "14-17";
    return "18+";
  };

  const groups = [
    "Gender",
    "Race",
    "Ethnicity",
    "OffenseCategory",
    "RaceEthnicity",
    "Facility",
    "Referral_Source",
    "AgeBracket",
  ];

  const dispoTypes = ["Pre-dispo", "Post-dispo"];
  const result = {
    overall: { "Pre-dispo": [], "Post-dispo": [] },
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
    const dob = parseDate(
      programType === "secure-detention" ? row.Release_Date : row.ATD_Exit_Date
    );
    const age = getAge(dob, intake);
    const dispo = dispoTypes.includes(row["Pre/post-dispo filter"])
      ? row["Pre/post-dispo filter"]
      : "Unknown";

    if (!isTargetYear(intake)) continue;

    if (!result.overall[dispo]) result.overall[dispo] = [];
    result.overall[dispo].push(age);

    for (const group of groups) {
      let val;
      if (group === "RaceEthnicity") {
        val = row.Ethnicity === "Hispanic" ? "Hispanic" : row.Race || "Unknown";
      } else if (group === "AgeBracket") {
        val = getAgeBracket(dob);
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
  };

  for (const dispo of Object.keys(result.overall)) {
    output.overall[dispo] = computeStats(result.overall[dispo]);
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

// Function to determine simplified offense category
const getSimplifiedOffenseCategory = (offenseCategory) => {
  if (!offenseCategory) return "Other";

  const category = offenseCategory.toString();

  // Check for Felony categories
  if (/felony/i.test(category)) {
    return "Felonies";
  }

  // Check for Misdemeanor categories
  if (/misdemeanor/i.test(category)) {
    return "Misdemeanors";
  }

  // Check for Technical violations
  const technicalCategories = [
    "Court Order",
    "Warrant",
    "Status Offense",
    "Probation Violation",
    "ATD Program Failure",
    "Other Technical Violation",
    "Contempt of Court",
  ];

  if (technicalCategories.includes(category)) {
    return "Technicals";
  }

  // Return Other for unknown categories
  if (category === "Unknown") {
    return "Other";
  }

  return "Other";
};

// Helper for race/ethnicity
const getRaceEthnicity = (race, ethnicity) => {
  if (ethnicity?.toLowerCase() === "hispanic") return "Hispanic";
  if (/black|african/i.test(race)) return "African American or Black";
  if (/asian/i.test(race)) return "Asian";
  if (/white/i.test(race)) return "White";
  return "Other";
};

// Helper to get age at admission
const getAgeAtAdmission = (dob, intake) => {
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

  if (age >= 11 && age <= 13) return "11–13";
  if (age >= 14 && age <= 17) return "14–17";
  if (age >= 18) return "18+";
  return "Unknown";
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
 *            "OffenseOverall", "Facility", "Referral_Source"
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

  // Convert year to number if it's a string
  year = parseInt(year, 10);
  if (isNaN(year)) {
    return { error: "Year must be a valid number" };
  }

  // Validate groupBy
  const validGroupBys = [
    "Gender",
    "Age",
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

  // Group data according to the specified groupBy
  const grouped = csvData.reduce((acc, row) => {
    // Handle potentially missing or malformed data
    const intakeDate = parseDate(
      programType === "secure-detention"
        ? row.Admission_Date
        : row.ATD_Entry_Date
    );
    const releaseDate = parseDate(
      programType === "secure-detention" ? row.Release_Date : row.ATD_Exit_Date
    );

    // Prepare derived fields
    const age = getAgeAtAdmission(
      row.Date_of_Birth,
      programType === "secure-detention"
        ? row.Admission_Date
        : row.ATD_Entry_Date
    );
    const raceEth = getRaceEthnicity(row.Race, row.Ethnicity);
    const raceSimplified = getRaceSimplified(row.Race, row.Ethnicity);
    const offenseOverall = offenseMap[row.OffenseCategory] || "Other";
    const simplifiedOffenseCategory = getSimplifiedOffenseCategory(
      row.OffenseCategory
    );

    // Get facility and referral source with defaults for missing data
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

    if (!acc[key]) acc[key] = [];
    acc[key].push({
      ...row,
      intakeDate,
      releaseDate,
      age,
      raceEth,
      raceSimplified,
      offenseOverall,
      simplifiedOffenseCategory,
      facility,
      referralSource,
    });
    return acc;
  }, {});

  // Calculate metrics for each group
  for (const [key, group] of Object.entries(grouped)) {
    // Track if we have valid data for this calculation
    let hasValidData = false;

    if (calculationType === "countAdmissions") {
      const admissions = group.filter((d) => {
        return d.intakeDate && d.intakeDate.getFullYear() === year;
      });
      results[key] = admissions.length;
      hasValidData = true;
    } else if (calculationType === "countReleases") {
      const releases = group.filter(
        (d) => d.releaseDate && d.releaseDate.getFullYear() === year
      );
      results[key] = releases.length;
      hasValidData = true;
    } else if (
      ["medianLengthOfStay", "averageLengthOfStay"].includes(calculationType)
    ) {
      const stays = group
        .filter(
          (d) =>
            d.intakeDate &&
            d.releaseDate &&
            // For length of stay calculations, consider all stays that either started or ended in the target year
            (d.intakeDate.getFullYear() === year ||
              d.releaseDate.getFullYear() === year)
        )
        .map((d) => differenceInCalendarDays(d.releaseDate, d.intakeDate));

      if (stays.length > 0) {
        hasValidData = true;

        if (calculationType === "medianLengthOfStay") {
          // Sort stays for median calculation
          stays.sort((a, b) => a - b);
          // Handle even and odd number of stays
          const middle = Math.floor(stays.length / 2);
          results[key] =
            stays.length % 2 === 0
              ? (stays[middle - 1] + stays[middle]) / 2
              : stays[middle];
        } else {
          // Average length of stay
          results[key] =
            stays.reduce((sum, days) => sum + days, 0) / stays.length;
        }
      } else {
        results[key] = null; // No valid stays
      }
    } else if (calculationType === "averageDailyPopulation") {
      // Create an array of dates within the interval
      const allDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
      });

      // For each day, count how many people were present
      const dayCounts = allDays.map((day) => {
        return group.filter((person) => {
          return (
            person.intakeDate &&
            person.intakeDate <= day &&
            (!person.releaseDate || person.releaseDate >= day)
          );
        }).length;
      });

      if (dayCounts.length > 0) {
        hasValidData = true;
        const totalCount = dayCounts.reduce((sum, count) => sum + count, 0);
        results[key] = totalCount / dayCounts.length;
      } else {
        results[key] = 0; // No population on any day
      }
    }

    // If we didn't get valid data for this calculation, set to null
    if (!hasValidData) {
      results[key] = null;
    }
  }

  // Format results as requested in options
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
