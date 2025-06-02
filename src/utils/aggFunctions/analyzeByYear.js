import getSimplifiedOffenseCategory from "../helper";

function analyzeByYear(data, { detentionType, breakdown = "none" } = {}) {
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

  data.forEach((record) => {
    const { entry, exit } = getDates(record);
    if (!entry) return;

    const key = groupKey(record, entry);
    const year = entry.getFullYear();
    const los = exit
      ? Math.max(0, Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)))
      : null;

    if (!results[year]) results[year] = {};
    if (!results[year][key]) {
      results[year][key] = {
        entries: 0,
        exits: 0,
        totalLOS: 0,
        countLOS: 0,
        lengthOfStays: [],
        dailyCounts: {}, // { 'YYYY-MM-DD': count }
      };
    }

    const yearObj = results[year][key];
    yearObj.entries += 1;
    if (exit && exit.getFullYear() === year) yearObj.exits += 1;
    if (los !== null) {
      yearObj.totalLOS += los;
      yearObj.countLOS += 1;
      yearObj.lengthOfStays.push(los);
    }

    // Daily counts for ADP
    const range = yearRange(
      new Date(`${year}-01-01`),
      new Date(`${year}-12-31`)
    );
    for (const date of range) {
      const dateStr = date.toISOString().slice(0, 10);
      if (entry <= date && (!exit || exit >= date)) {
        yearObj.dailyCounts[dateStr] = (yearObj.dailyCounts[dateStr] || 0) + 1;
      }
    }
  });

  // Finalize metrics
  const final = {};
  for (const year in results) {
    final[year] = {};
    for (const key in results[year]) {
      const obj = results[year][key];
      const adp =
        Object.values(obj.dailyCounts).reduce((sum, val) => sum + val, 0) /
        Object.keys(obj.dailyCounts).length;

      obj.lengthOfStays.sort((a, b) => a - b);
      const mid = Math.floor(obj.lengthOfStays.length / 2);
      const medianLOS =
        obj.lengthOfStays.length % 2 === 0
          ? (obj.lengthOfStays[mid - 1] + obj.lengthOfStays[mid]) / 2
          : obj.lengthOfStays[mid];

      final[year][key] = {
        entries: obj.entries,
        exits: obj.exits,
        averageDailyPopulation: Number(adp.toFixed(2)),
        averageLengthOfStay: obj.countLOS
          ? Number((obj.totalLOS / obj.countLOS).toFixed(2))
          : null,
        medianLengthOfStay: medianLOS || null,
      };
    }
  }

  return final;
}

export default analyzeByYear;
