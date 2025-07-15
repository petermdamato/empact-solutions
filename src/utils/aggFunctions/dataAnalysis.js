import { parse, differenceInCalendarDays } from "date-fns";

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
  "Misdemeanor Drugs": "New Offenses",
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
  const age =
    intakeDate.getFullYear() -
    birth.getFullYear() -
    (intakeDate <
    new Date(intakeDate.getFullYear(), birth.getMonth(), birth.getDate())
      ? 1
      : 0);
  if (age < 11) return "10 and younger";
  if (age >= 11 && age <= 13) return "11-13";
  if (age >= 14 && age <= 17) return "14-17";
  if (age >= 18) return "18+";
  return "Unknown";
};

// Main analysis function
const analyzeData = (
  csvData,
  calculationType,
  year,
  detentionType = "secure-detention",
  groupBy = null
) => {
  const results = {};
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  const daysInYear = new Date(year, 1, 29).getDate() === 29 ? 366 : 365;

  const grouped = csvData.reduce((acc, row) => {
    const intakeDate =
      detentionType === "secure-detention"
        ? parseDate(row.Admission_Date)
        : parseDate(row.ATD_Entry_Date);

    const releaseDate =
      detentionType === "secure-detention"
        ? parseDate(row.Release_Date)
        : parseDate(row.ATD_Exit_Date);

    const age = getAgeAtAdmission(
      row.Date_of_Birth,
      detentionType === "secure-detention"
        ? parseDate(row.Admission_Date)
        : parseDate(row.ATD_Entry_Date)
    );
    const raceEth = getRaceEthnicity(row.Race, row.Ethnicity);
    const offenseOverall =
      row["Post-Dispo Stay Reason"] && row["Post-Dispo Stay Reason"].length > 0
        ? row["Post-Dispo Stay Reason"].toLowerCase().includes("other")
          ? "Other"
          : row["Post-Dispo Stay Reason"]
        : offenseMap[row.OffenseCategory] || "Other";

    const enrichedRow = {
      ...row,
      intakeDate,
      releaseDate,
      age,
      raceEth,
      offenseOverall,
    };

    let keys = [];

    if (groupBy === "Gender") keys = [row.Gender];
    else if (groupBy === "Age") keys = [age];
    else if (groupBy === "RaceEthnicity") keys = [raceEth];
    else if (groupBy === "OffenseCategory") keys = [row.OffenseCategory];
    else if (groupBy === "OffenseOverall") keys = [offenseOverall];
    else if (groupBy === "PostDispoStayReason") {
      const reason = row["Post-Dispo Stay Reason"];
      if (reason && reason.trim().length > 0) {
        keys = [reason.trim(), "All Post-Dispo"];
      } else {
        return acc;
      }
    } else {
      keys = ["All"];
    }

    for (const key of keys) {
      if (!acc[key]) acc[key] = [];
      acc[key].push(enrichedRow);
    }

    return acc;
  }, {});

  for (const [key, group] of Object.entries(grouped)) {
    // 🔑 Determine if this is New Offenses or Technicals category (or subcategories)
    const isNewOffense =
      key === "New Offenses" ||
      key.toLowerCase().includes("felony") ||
      key.toLowerCase().includes("misdemeanor") ||
      key.toLowerCase() === "status offense";
    const isTechnical =
      key === "Technicals" ||
      [
        "ATD Program Failure",
        "Court Order",
        "Probation Violation",
        "Warrant",
        "Other Technical Violation",
      ].includes(key);

    // Apply filter only for these
    const filteredGroup =
      isNewOffense || isTechnical
        ? group.filter(
            (d) =>
              !d["Post-Dispo Stay Reason"] ||
              d["Post-Dispo Stay Reason"].trim() === ""
          )
        : group;

    if (calculationType === "countAdmissions") {
      results[key] = filteredGroup.filter(
        (d) =>
          d.intakeDate && d.intakeDate <= endDate && d.intakeDate >= startDate
      ).length;
    } else if (calculationType === "countReleases") {
      results[key] = filteredGroup.filter(
        (d) => d.releaseDate && d.releaseDate.getFullYear() === year
      ).length;
    } else if (
      ["medianLengthOfStay", "averageLengthOfStay", "lengthOfStay"].includes(
        calculationType
      )
    ) {
      const stays = filteredGroup
        .filter(
          (d) =>
            d.intakeDate &&
            d.releaseDate &&
            d.releaseDate.getFullYear() === year
        )
        .map((d) => differenceInCalendarDays(d.releaseDate, d.intakeDate) + 1);

      stays.sort((a, b) => a - b);
      const median = stays.length
        ? Math.round(stays[Math.floor(stays.length / 2)] * 10) / 10
        : null;
      const avg = stays.length
        ? Math.round((stays.reduce((a, b) => a + b, 0) / stays.length) * 10) /
          10
        : null;
      results[key] = { median, average: avg };
    } else if (calculationType === "averageDailyPopulation") {
      const totalOverlapDays = filteredGroup.reduce((sum, d) => {
        if (!d.intakeDate) return sum;

        const rangeStart = d.intakeDate < startDate ? startDate : d.intakeDate;
        const rangeEnd =
          d.releaseDate && !isNaN(d.releaseDate)
            ? d.releaseDate > endDate
              ? endDate
              : d.releaseDate
            : endDate;

        if (rangeStart > endDate || rangeEnd < startDate) return sum;

        const overlapDays =
          Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;

        return sum + overlapDays;
      }, 0);

      results[key] =
        Math.round((totalOverlapDays / daysInYear) * 10000) / 10000;
    }
  }

  return results;
};

export default analyzeData;
