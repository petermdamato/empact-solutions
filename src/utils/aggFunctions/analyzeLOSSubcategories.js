import { differenceInCalendarDays } from "date-fns";

import { offenseMap } from "../categorizationUtils";

const parseDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
};

const median = (arr) => {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const analyzeLOSBySubgroup = (
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
    "PostDispoGroup",
  ];

  if (groupBy && !validGroupBys.includes(groupBy)) {
    return {
      error: `Invalid groupBy. Must be one of: ${validGroupBys.join(
        ", "
      )} or null`,
    };
  }

  // Special nested grouping for PostDispoGroup + OffenseCategory
  if (groupBy === "PostDispoGroup") {
    const grouped = csvData.reduce((acc, row) => {
      const postDispoStatus = (
        row["Post-Dispo Stay Reason"] || ""
      ).toLowerCase();

      const offenseCategory = row.OffenseCategory || "Unknown";
      const offenseLabel = row.Offense || "Unknown";

      let groupKey;
      if (postDispoStatus.includes("other")) groupKey = "Other";
      else if (postDispoStatus === "awaiting placement")
        groupKey = "Awaiting Placement";
      else if (postDispoStatus === "confinement to secure detention")
        groupKey = "Confinement to secure detention";
      else groupKey = offenseMap[offenseCategory];

      const entryDate = parseDate(
        programType === "secure-detention"
          ? row.Admission_Date
          : row.ATD_Entry_Date
      );
      const exitDate = parseDate(
        programType === "secure-detention"
          ? row.Release_Date
          : row.ATD_Exit_Date
      );

      if (!acc[groupKey]) acc[groupKey] = {};
      if (!acc[groupKey][offenseLabel])
        acc[groupKey][offenseLabel] = { lengthsOfStay: [], count: 0 };

      if (
        entryDate &&
        exitDate &&
        entryDate.getFullYear() === year &&
        exitDate.getFullYear() === year &&
        entryDate <= exitDate
      ) {
        const los = differenceInCalendarDays(exitDate, entryDate) + 1;
        acc[groupKey][offenseLabel].lengthsOfStay.push(los);
        acc[groupKey][offenseLabel].count += 1;
      }

      return acc;
    }, {});

    const results = {};
    for (const groupKey in grouped) {
      results[groupKey] = {};
      for (const offenseCategory in grouped[groupKey]) {
        const losArray = grouped[groupKey][offenseCategory].lengthsOfStay;
        results[groupKey][offenseCategory] = {
          count: grouped[groupKey][offenseCategory].count,
          averageLengthOfStay:
            losArray.length > 0
              ? losArray.reduce((a, b) => a + b, 0) / losArray.length
              : null,
          medianLengthOfStay: median(losArray),
        };
      }
    }

    return results;
  }

  // Default grouping by the single key
  const grouped = csvData.reduce((acc, row) => {
    const entryDate = parseDate(
      programType === "secure-detention"
        ? row.Admission_Date
        : row.ATD_Entry_Date
    );
    const exitDate = parseDate(
      programType === "secure-detention" ? row.Release_Date : row.ATD_Exit_Date
    );

    let key;
    switch (groupBy) {
      case "Gender":
        key = row.Gender || "Unknown";
        break;
      case "Age":
      case "AgeDetail":
        // Calculate age at admission (you might want to extract this helper)
        if (row.Date_of_Birth && entryDate) {
          const dob = new Date(row.Date_of_Birth);
          const age =
            entryDate.getFullYear() -
            dob.getFullYear() -
            (entryDate <
            new Date(entryDate.getFullYear(), dob.getMonth(), dob.getDate())
              ? 1
              : 0);
          key = age;
        } else {
          key = "Unknown";
        }
        break;
      case "RaceEthnicity":
        key = row.Ethnicity === "Hispanic" ? "Hispanic" : row.Race || "Unknown";
        break;
      case "RaceSimplified":
        if (row.Ethnicity === "Hispanic") key = "Youth of Color";
        else if (row.Race === "White") key = "White";
        else key = "Youth of Color";
        break;
      case "OffenseCategory":
        key = row.OffenseCategory || "Unknown";
        break;
      case "OffenseOverall":
        key =
          row["Post-Dispo Stay Reason"] &&
          row["Post-Dispo Stay Reason"].length > 0
            ? row["Post-Dispo Stay Reason"]
            : "Other";
        break;
      case "SimplifiedOffense":
        // You would implement your simplified offense logic here or fallback
        key = row.OffenseCategory || "Unknown";
        break;
      case "Facility":
        key = row.Facility || "Unknown";
        break;
      case "Referral_Source":
        key = row.Referral_Source || "Unknown";
        break;
      case "simplifiedReferralSource":
        // Implement your simplified referral source function here
        key = row.Referral_Source ? row.Referral_Source : "Unknown";
        break;
      default:
        key = "All";
    }

    if (!acc[key]) {
      acc[key] = {
        entries: 0,
        releases: 0,
        lengthsOfStay: [],
      };
    }

    if (entryDate && entryDate.getFullYear() === year) {
      acc[key].entries++;
    }

    if (exitDate && exitDate.getFullYear() === year) {
      acc[key].releases++;
      if (entryDate && entryDate <= exitDate) {
        const los = differenceInCalendarDays(exitDate, entryDate) + 1;
        acc[key].lengthsOfStay.push(los);
      }
    }

    return acc;
  }, {});

  const results = {};
  for (const key in grouped) {
    if (calculationType === "countAdmissions") {
      results[key] = grouped[key].entries;
    } else if (calculationType === "countReleases") {
      results[key] = grouped[key].releases;
    } else if (calculationType === "averageLengthOfStay") {
      const arr = grouped[key].lengthsOfStay;
      results[key] =
        arr.length > 0
          ? arr.reduce((sum, val) => sum + val, 0) / arr.length
          : null;
    } else if (calculationType === "medianLengthOfStay") {
      results[key] = median(grouped[key].lengthsOfStay);
    } else if (calculationType === "averageDailyPopulation") {
      results[key] = null; // Placeholder, implement if needed
    }
  }

  if (options.round) {
    for (const key in results) {
      if (results[key] !== null && typeof results[key] === "number") {
        results[key] = Math.round(results[key] * 100) / 100;
      }
    }
  }

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

export default analyzeLOSBySubgroup;
