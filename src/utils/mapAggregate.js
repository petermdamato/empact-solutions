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

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export function computeZipCounts({
  csvData,
  zctaGeoJSON,
  selectedYear = new Date().getFullYear(),
  detentionType = "secure-detention",
  metric = "admissions",
}) {
  const startOfYear = new Date(`${selectedYear}-01-01`);
  const endOfYear = new Date(`${selectedYear}-12-31`);
  const daysInYear = isLeapYear(selectedYear) ? 366 : 365;

  const zipValues = {};
  const fallbackOutOfState =
    metric.includes("median") ||
    metric.includes("average") ||
    metric === "averageDailyPopulation"
      ? []
      : 0;

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

    if (metric === "averageDailyPopulation") {
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

      value = Math.max(overlapDays, 0);
    } else if (metric.includes("LengthOfStay")) {
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

  const zipCounts = {};
  let outOfState =
    metric.includes("median") ||
    metric.includes("average") ||
    metric === "averageDailyPopulation"
      ? []
      : 0;

  const geoZips = zctaGeoJSON
    ? new Set(zctaGeoJSON.features.map((f) => f.properties.ZCTA5CE10))
    : new Set();

  for (const [zip, values] of Object.entries(zipValues)) {
    const inGeo = geoZips.has(zip);

    if (metric === "averageLengthOfStay") {
      const avg = average(values);
      if (inGeo) zipCounts[zip] = avg;
      else outOfState.push(...values);
    } else if (metric === "medianLengthOfStay") {
      const med = median(values);
      if (inGeo) zipCounts[zip] = med;
      else outOfState.push(...values);
    } else if (metric === "averageDailyPopulation") {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = Number((sum / daysInYear).toFixed(1));
      if (inGeo) zipCounts[zip] = avg;
      else outOfState.push(sum);
    } else {
      const total = values.reduce((a, b) => a + b, 0);
      if (inGeo) zipCounts[zip] = total;
      else outOfState += total;
    }
  }

  return {
    zipCounts,
    outOfStateCount:
      metric === "medianLengthOfStay"
        ? median(outOfState)
        : metric === "averageLengthOfStay"
        ? average(outOfState)
        : metric === "averageDailyPopulation"
        ? Number(
            (outOfState.reduce((a, b) => a + b, 0) / daysInYear).toFixed(1)
          )
        : outOfState,
  };
}
