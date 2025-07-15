import { isLeapYear } from "date-fns";

/**
 * Returns zip-level aggregated values and the count or summary of zip codes not found in the GeoJSON.
 *
 * @param {Array} csvData - Array of admission records.
 * @param {Object} zctaGeoJSON - GeoJSON object containing ZIP shapes.
 * @param {Number} selectedYear - The year to filter records by.
 * @param {String} detentionType - "secure-detention" or other.
 * @param {String} metric - e.g., "admissions", "averageLengthOfStay", "medianLengthOfStay", "averageDailyPopulation"
 * @returns {Object} { zipCounts: Object, outOfStateCount: Number | Object }
 */

const median = (arr) => {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const average = (arr) => {
  return arr && arr.length > 0
    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
    : 0;
};

export function computeZipCounts({
  csvData,
  zctaGeoJSON,
  selectedYear = new Date().getFullYear(),
  detentionType = "secure-detention",
  metric = "admissions",
}) {
  const startOfYear = new Date(`${selectedYear}-01-01`);
  const endOfYear = new Date(`${selectedYear}-12-31`);
  const daysInYear = isLeapYear(endOfYear) ? 366 : 365;

  const zipCounts = {};
  const geoZips = zctaGeoJSON
    ? new Set(zctaGeoJSON.features.map((f) => f.properties.ZCTA5CE10))
    : new Set();

  let outOfState =
    metric.includes("median") ||
    metric.includes("average") ||
    metric === "averageDailyPopulation"
      ? []
      : 0;

  if (metric === "averageDailyPopulation") {
    const zipDays = {};
    for (const entry of csvData) {
      const zip = entry["Home_Zip_Code"];

      const entryDate =
        detentionType === "secure-detention"
          ? new Date(entry["Admission_Date"])
          : new Date(entry["ATD_Entry_Date"]);

      const exitDateRaw =
        detentionType === "secure-detention"
          ? entry["Release_Date"]
          : entry["ATD_Exit_Date"];

      const exitDate = exitDateRaw ? new Date(exitDateRaw) : null;

      if (!zip || isNaN(entryDate)) continue;

      const rangeStart = entryDate < startOfYear ? startOfYear : entryDate;
      const rangeEnd =
        exitDate && !isNaN(exitDate)
          ? exitDate > endOfYear
            ? endOfYear
            : exitDate
          : endOfYear;

      if (rangeStart > endOfYear || rangeEnd < startOfYear) continue;

      const overlapDays =
        Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;

      if (!zipDays[zip]) zipDays[zip] = 0;
      zipDays[zip] += overlapDays;
    }

    // Calculate ADP for each zip
    for (const [zip, totalOverlapDays] of Object.entries(zipDays)) {
      const adp = Number((totalOverlapDays / daysInYear).toFixed(1));
      if (geoZips.has(zip)) {
        zipCounts[zip] = adp;
      } else {
        outOfState.push(totalOverlapDays);
      }
    }

    // Calculate outOfStateCount ADP
    const outOfStateTotal = outOfState.reduce((a, b) => a + b, 0);
    return {
      zipCounts,
      outOfStateCount:
        outOfState.length > 0
          ? Number((outOfStateTotal / daysInYear).toFixed(1))
          : 0,
    };
  }

  // For other metrics: admissions, median/average LOS, releases
  const zipValues = {};

  for (const entry of csvData) {
    const zip = entry["Home_Zip_Code"];

    const entryDate =
      detentionType === "secure-detention"
        ? new Date(entry["Admission_Date"])
        : new Date(entry["ATD_Entry_Date"]);

    const exitDateRaw =
      detentionType === "secure-detention"
        ? entry["Release_Date"]
        : entry["ATD_Exit_Date"];

    const exitDate = exitDateRaw ? new Date(exitDateRaw) : null;

    if (!zip || isNaN(entryDate)) continue;

    let value = 1;

    if (metric.includes("LengthOfStay")) {
      if (!exitDate || isNaN(exitDate)) {
        value = 0;
      } else {
        const diffMs = exitDate - entryDate;
        value = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const targetDate =
      metric.includes("exits") ||
      metric.includes("releases") ||
      metric.includes("LengthOfStay")
        ? exitDate
        : entryDate;

    if (
      metric !== "averageDailyPopulation" &&
      (isNaN(targetDate) || targetDate < startOfYear || targetDate > endOfYear)
    ) {
      continue;
    }

    if (!zipValues[zip]) zipValues[zip] = [];
    zipValues[zip].push(value);
  }

  // Initialize outOfStateValues for LOS metrics
  let outOfStateValues = [];

  for (const [zip, values] of Object.entries(zipValues)) {
    const inGeo = geoZips.has(zip);

    if (metric === "averageLengthOfStay") {
      const avg = average(values);
      if (inGeo) {
        zipCounts[zip] = {
          count: values.length,
          averageLOS: avg,
        };
      } else {
        outOfStateValues.push(...values);
      }
    } else if (metric === "medianLengthOfStay") {
      const med = median(values);
      if (inGeo) {
        zipCounts[zip] = {
          count: values.length,
          medianLOS: med,
        };
      } else {
        outOfStateValues.push(...values);
      }
    } else {
      const total = values.reduce((a, b) => a + b, 0);
      if (inGeo) {
        zipCounts[zip] = total;
      } else {
        outOfState += total;
      }
    }
  }

  // Calculate outOfStateCount for LOS metrics
  let finalOutOfStateCount;
  if (metric === "medianLengthOfStay") {
    finalOutOfStateCount = {
      count: outOfStateValues.length,
      medianLOS: median(outOfStateValues),
    };
  } else if (metric === "averageLengthOfStay") {
    finalOutOfStateCount = {
      count: outOfStateValues.length,
      averageLOS: average(outOfStateValues),
    };
  } else {
    finalOutOfStateCount = outOfState;
  }

  return {
    zipCounts,
    outOfStateCount: finalOutOfStateCount,
  };
}
