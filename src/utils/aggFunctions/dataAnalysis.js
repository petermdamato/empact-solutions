import {
  parse,
  differenceInCalendarDays,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";

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

// Helper for race/ethnicity
const getRaceEthnicity = (race, ethnicity) => {
  if (ethnicity?.toLowerCase() === "hispanic") return "Hispanic";
  if (/black|african/i.test(race)) return "Black";
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

  const grouped = csvData.reduce((acc, row) => {
    const intakeDate =
      detentionType === "secure-detention"
        ? parseDate(row.Admission_Date)
        : parseDate(row.ATD_Entry_Date);
    const releaseDate =
      detentionType === "secure-detention"
        ? parseDate(row.Release_Date)
        : parseDate(row.ATD_Exit_Date);
    const dob = parseDate(row.Date_of_Birth);

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

    const key =
      groupBy === "Gender"
        ? row.Gender
        : groupBy === "Age"
        ? age
        : groupBy === "RaceEthnicity"
        ? raceEth
        : groupBy === "OffenseCategory"
        ? row.OffenseCategory
        : groupBy === "OffenseOverall"
        ? offenseOverall
        : "All";

    if (!acc[key]) acc[key] = [];
    acc[key].push({
      ...row,
      intakeDate,
      releaseDate,
      age,
      raceEth,
      offenseOverall,
    });
    return acc;
  }, {});

  for (const [key, group] of Object.entries(grouped)) {
    if (calculationType === "countAdmissions") {
      results[key] = group.filter((d) => {
        return (
          d.intakeDate && d.intakeDate <= endDate && d.intakeDate >= startDate
        );
      }).length;
    } else if (calculationType === "countReleases") {
      results[key] = group.filter(
        (d) => d.releaseDate && d.releaseDate.getFullYear() === year
      ).length;
    } else if (
      ["medianLengthOfStay", "averageLengthOfStay", "lengthOfStay"].includes(
        calculationType
      )
    ) {
      //Count only stays within that year
      const stays = group
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
      results[key] = { median: median, average: avg };
    } else if (calculationType === "averageDailyPopulation") {
      const dayCounts = eachDayOfInterval({
        start: startDate,
        end: endDate,
      }).map(
        (day) =>
          group.filter(
            (d) =>
              d.intakeDate &&
              d.intakeDate <= day &&
              (!d.releaseDate || d.releaseDate >= day)
          ).length
      );
      const average = dayCounts.reduce((a, b) => a + b, 0) / dayCounts.length;
      results[key] = average;
    }
  }

  return results;
};

export default analyzeData;
