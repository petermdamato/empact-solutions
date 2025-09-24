import getSimplifiedOffenseCategory from "../helper";
import * as d3 from "d3";
import { isLeapYear } from "date-fns";
import { getLosForUnreleased } from "@/constants";

function analyzeByYear(
  data,
  { detentionType, breakdown = "none", fileName = "" } = {}
) {
  const dateMatch = fileName.match(/(\d{8}).*?(\d{8})/);

  let endDateString;
  if (dateMatch) {
    endDateString = dateMatch[2];
  }

  // Filter data based on getLosForUnreleased setting
  const filteredData = data.filter((record) => {
    if (detentionType === "alternative-to-detention") {
      return getLosForUnreleased || record.ATD_Exit_Date;
    } else {
      return getLosForUnreleased || record.Release_Date;
    }
  });

  const entryYears = filteredData
    .map((item) => {
      const d = new Date(
        detentionType === "alternative-to-detention"
          ? item.ATD_Entry_Date
          : item.Admission_Date
      );
      return isNaN(d) ? null : d.getFullYear();
    })
    .filter((y) => y !== null);

  const exitYears = filteredData
    .map((item) => {
      const exitDate = getLosForUnreleased
        ? detentionType === "alternative-to-detention"
          ? item.ATD_Exit_Date || endDateString
          : item.Release_Date || endDateString
        : detentionType === "alternative-to-detention"
        ? item.ATD_Exit_Date
        : item.Release_Date;

      const d = new Date(exitDate);
      return isNaN(d) ? null : d.getFullYear();
    })
    .filter((y) => y !== null);

  const minYear = Math.min(Math.min(...entryYears), Math.min(...exitYears));
  const maxYear = Math.max(Math.max(...entryYears), Math.max(...exitYears));

  const uniqueYears = d3.range(minYear, maxYear + 1);

  const getDates = (record) => {
    if (detentionType === "secure-detention") {
      const entry = record.Admission_Date
        ? new Date(record.Admission_Date)
        : null;
      let exit = record.Release_Date ? new Date(record.Release_Date) : null;

      // If getLosForUnreleased is true and no release date, use endDateString
      if (getLosForUnreleased && !exit && endDateString) {
        exit = new Date(
          `${endDateString.slice(0, 4)}-${endDateString.slice(
            4,
            6
          )}-${endDateString.slice(6, 8)}`
        );
      }

      return { entry, exit };
    } else if (detentionType === "alternative-to-detention") {
      const entry = record.ATD_Entry_Date
        ? new Date(record.ATD_Entry_Date)
        : null;
      let exit = record.ATD_Exit_Date ? new Date(record.ATD_Exit_Date) : null;

      // If getLosForUnreleased is true and no exit date, use endDateString
      if (getLosForUnreleased && !exit && endDateString) {
        exit = new Date(
          `${endDateString.slice(0, 4)}-${endDateString.slice(
            4,
            6
          )}-${endDateString.slice(6, 8)}`
        );
      }

      return { entry, exit };
    }
    return { entry: null, exit: null };
  };

  const getAge = (dob, intake) => {
    if (!dob || !intake) return null;
    return Math.floor((intake - dob) / (365.25 * 24 * 60 * 60 * 1000));
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
        return record.ATD_Successful_Exit === "1" ? "undisrupted" : "disrupted";

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

  const results = {};
  const validYears = new Set();

  filteredData.forEach((record) => {
    const { entry, exit } = getDates(record);

    if (!entry) return;

    const exitYear = exit ? exit.getFullYear() : null;
    const key = groupKey(record, entry);

    for (const yr of uniqueYears) {
      const startOfYear = new Date(`${yr}-01-01`);
      const endOfYear = new Date(`${yr}-12-31`);
      const daysInYear = isLeapYear(endOfYear) ? 366 : 365;

      const rangeStart = entry < startOfYear ? startOfYear : entry;
      const rangeEnd =
        exit && !isNaN(exit)
          ? exit > endOfYear
            ? endOfYear
            : exit
          : endOfYear;

      if (rangeStart > endOfYear || rangeEnd < startOfYear) continue;

      validYears.add(yr);

      if (!results[yr]) results[yr] = {};
      if (!results[yr][key]) {
        results[yr][key] = {
          entries: 0,
          exits: 0,
          totalLOS: 0,
          countLOS: 0,
          lengthOfStays: [],
          totalOverlapDays: 0,
          daysInYear: daysInYear,
        };
      }

      // Increment entries if entry is within this year
      if (entry >= startOfYear && entry <= endOfYear) {
        results[yr][key].entries += 1;
      }

      // Calculate overlapping days for ADP
      const overlapDays =
        Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
      results[yr][key].totalOverlapDays += overlapDays;
    }

    // Calculate LOS - include unreleased records if getLosForUnreleased is true
    if (exit) {
      const los = Math.max(
        0,
        Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)) + 1
      );

      // For unreleased records, only count them in the exit year if we're using getLosForUnreleased
      const isUnreleased =
        detentionType === "alternative-to-detention"
          ? !record.ATD_Exit_Date
          : !record.Release_Date;

      if (!isUnreleased || getLosForUnreleased) {
        const targetYear = exitYear;
        validYears.add(targetYear);
        if (!results[targetYear]) results[targetYear] = {};
        if (!results[targetYear][key]) {
          results[targetYear][key] = {
            entries: 0,
            exits: 0,
            totalLOS: 0,
            countLOS: 0,
            lengthOfStays: [],
            totalOverlapDays: 0,
            daysInYear: isLeapYear(exit) ? 366 : 365,
          };
        }

        // Only count as exit if the record was actually released (not using endDateString)
        if (!isUnreleased) {
          results[targetYear][key].exits += 1;
        }

        results[targetYear][key].totalLOS += los;
        results[targetYear][key].countLOS += 1;
        results[targetYear][key].lengthOfStays.push(los);
      }
    }
  });

  // Finalize metrics
  const final = {};
  for (const year in results) {
    if (!validYears.has(Number(year))) continue;
    final[year] = {};
    for (const key in results[year]) {
      const obj = results[year][key];
      const adp = obj.totalOverlapDays / obj.daysInYear;

      // Calculate median LOS only for released cases
      let medianLOS = null;
      if (obj.lengthOfStays.length > 0) {
        obj.lengthOfStays.sort((a, b) => a - b);
        const mid = Math.floor(obj.lengthOfStays.length / 2);
        medianLOS =
          obj.lengthOfStays.length % 2 === 0
            ? (obj.lengthOfStays[mid - 1] + obj.lengthOfStays[mid]) / 2
            : obj.lengthOfStays[mid];
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
