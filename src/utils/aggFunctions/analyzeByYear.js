import getSimplifiedOffenseCategory from "../helper";
import * as d3 from "d3";

function analyzeByYear(data, { detentionType, breakdown = "none" } = {}) {
  const entryYears = data
    .map((item) => {
      const d = new Date(
        detentionType === "alternative-to-detention"
          ? item.ATD_Entry_Date
          : item.Admission_Date
      );
      return isNaN(d) ? null : d.getFullYear();
    })
    .filter((y) => y !== null);

  const exitYears = data
    .map((item) => {
      const d = new Date(
        detentionType === "alternative-to-detention"
          ? item.ATD_Exit_Date
          : item.Release_Date
      );
      return isNaN(d) ? null : d.getFullYear();
    })
    .filter((y) => y !== null);

  const minYear = Math.min(Math.min(...entryYears), Math.min(...exitYears));
  const maxYear = Math.max(Math.max(...entryYears), Math.max(...exitYears));

  const uniqueYears = d3.range(minYear, maxYear + 1);

  const getDates = (record) => {
    if (detentionType === "secure-detention") {
      return {
        entry: record.Admission_Date ? new Date(record.Admission_Date) : null,
        exit: record.Release_Date ? new Date(record.Release_Date) : null,
      };
    } else if (detentionType === "alternative-to-detention") {
      return {
        entry: record.ATD_Entry_Date ? new Date(record.ATD_Entry_Date) : null,
        exit: record.ATD_Exit_Date ? new Date(record.ATD_Exit_Date) : null,
      };
    }
    return { entry: null, exit: null };
  };

  const getAge = (dob, intake) => {
    if (!dob || !intake) return null;
    return (intake - dob) / (365.25 * 24 * 60 * 60 * 1000);
  };

  const getAgeBracket = (age) => {
    if (!age) return "Unknown";
    if (age <= 10) return "10-and-younger";
    if (age <= 13) return "11-13";
    if (age <= 17) return "14-17";
    return "18";
  };

  const groupKey = (record, entry) => {
    switch (breakdown) {
      case "bySuccess":
        return record.ATD_Successful_Exit === "1"
          ? "successful"
          : "unsuccessful";

      case "byDispo":
        return record["Post-Dispo Stay Reason"] === null ||
          record["Post-Dispo Stay Reason"] === ""
          ? "pre"
          : "post";

      case "byYOC":
        const ethnicity = record.Ethnicity;
        const race = record.Race;
        return race === "White" && ethnicity === "Non Hispanic"
          ? "white"
          : "yoc";

      case "byAge":
        const dob = record.Date_of_Birth
          ? new Date(record.Date_of_Birth)
          : null;
        const age = getAge(dob, entry);
        return getAgeBracket(age);

      case "byRaceEthnicity":
        if (
          record.Ethnicity === "Hispanic or Latino" ||
          record.Ethnicity === "Hispanic"
        ) {
          return "Hispanic";
        }
        return record.Race || "Unknown";

      case "byGender":
        return record.Gender || "Unknown";

      case "byOffenseCategory":
        return getSimplifiedOffenseCategory(record.OffenseCategory);

      default:
        return "all";
    }
  };

  const yearRange = (start, end) => {
    const range = [];
    let date = new Date(start);
    while (date <= end) {
      range.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return range;
  };

  const results = {};
  const validYears = new Set();

  data.forEach((record) => {
    const { entry, exit } = getDates(record);
    if (!entry) return;

    const exitYear = exit ? exit.getFullYear() : null;

    const key = groupKey(record, entry);

    // Loop through all years to find the matching bucket by "between" logic
    for (const yr of uniqueYears) {
      const startOfYear = new Date(`${yr}-01-01`);
      const endOfYear = new Date(`${yr}-12-31`);

      if (entry >= startOfYear && entry <= endOfYear) {
        validYears.add(yr);

        if (!results[yr]) results[yr] = {};
        if (!results[yr][key]) {
          results[yr][key] = {
            entries: 0,
            exits: 0,
            totalLOS: 0,
            countLOS: 0,
            lengthOfStays: [],
            dailyCounts: {},
          };
        }

        results[yr][key].entries += 1;

        // Daily counts for ADP within the year
        const range = yearRange(startOfYear, endOfYear);
        for (const date of range) {
          const dateStr = date.toISOString().slice(0, 10);
          if (entry <= date && (!exit || exit >= date)) {
            results[yr][key].dailyCounts[dateStr] =
              (results[yr][key].dailyCounts[dateStr] || 0) + 1;
          }
        }

        break; // once placed in the correct year, stop checking
      }
    }
    // If released, increment exits and LOS in exit year
    if (exitYear) {
      validYears.add(exitYear);
      if (!results[exitYear]) results[exitYear] = {};
      if (!results[exitYear][key]) {
        results[exitYear][key] = {
          entries: 0,
          exits: 0,
          totalLOS: 0,
          countLOS: 0,
          lengthOfStays: [],
          dailyCounts: {},
        };
      }

      const los = Math.max(
        0,
        Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)) + 1
      );

      results[exitYear][key].exits += 1;
      results[exitYear][key].totalLOS += los;
      results[exitYear][key].countLOS += 1;
      results[exitYear][key].lengthOfStays.push(los);
    }
  });

  // Finalize metrics
  const final = {};
  for (const year in results) {
    if (!validYears.has(Number(year))) continue;
    final[year] = {};
    for (const key in results[year]) {
      const obj = results[year][key];
      const adp =
        Object.values(obj.dailyCounts).reduce((sum, val) => sum + val, 0) /
        Object.keys(obj.dailyCounts).length;

      // Calculate median LOS only for released cases
      let medianLOS = null;
      let medianLOSCount = 0;
      if (obj.lengthOfStays.length > 0) {
        obj.lengthOfStays.sort((a, b) => a - b);
        const mid = Math.floor(obj.lengthOfStays.length / 2);
        medianLOS =
          obj.lengthOfStays.length % 2 === 0
            ? (obj.lengthOfStays[mid - 1] + obj.lengthOfStays[mid]) / 2
            : obj.lengthOfStays[mid];
        medianLOSCount = obj.lengthOfStays.length;
      }

      const baseMetrics = {
        averageDailyPopulation: Number(adp.toFixed(1)),
        lengthOfStayCount: obj.countLOS,
        averageLengthOfStay: obj.countLOS
          ? Number((obj.totalLOS / obj.countLOS).toFixed(1))
          : null,
        medianLengthOfStay: medianLOS ? medianLOS : null,
      };

      const detentionMetrics =
        detentionType === "secure-detention"
          ? {
              admissions: obj.entries,
              releases: obj.exits,
            }
          : {
              entries: obj.entries,
              exits: obj.exits,
            };

      final[year][key] = {
        ...detentionMetrics,
        ...baseMetrics,
      };
    }
  }

  return final;
}

export default analyzeByYear;
