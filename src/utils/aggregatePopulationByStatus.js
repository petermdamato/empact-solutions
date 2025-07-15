import { isLeapYear } from "date-fns";
import offenseMapFunction from "./offenseMapFunction";

const aggregatePopulationByStatus = (
  data,
  selectedYear,
  detentionType,
  statusColumn = "Post_Adjudicated_Status"
) => {
  const yearStart = new Date(`${selectedYear}-01-01`);
  const yearEnd = new Date(`${selectedYear}-12-31`);
  const daysInYear = isLeapYear(yearEnd) ? 366 : 365;

  // Previous year range
  const prevStartDate = new Date(`${selectedYear - 1}-01-01`);
  const prevEndDate = new Date(`${selectedYear - 1}-12-31`);
  const prevDaysInYear = isLeapYear(prevEndDate) ? 366 : 365;

  const getIntakeDate = (record) =>
    detentionType === "secure-detention"
      ? record.Admission_Date
        ? new Date(record.Admission_Date)
        : null
      : record.ATD_Entry_Date
      ? new Date(record.ATD_Entry_Date)
      : null;

  const getReleaseDate = (record) =>
    detentionType === "secure-detention"
      ? record.Release_Date
        ? new Date(record.Release_Date)
        : null
      : record.ATD_Exit_Date
      ? new Date(record.ATD_Exit_Date)
      : null;

  const result = {};

  // Process current year population by overlap days
  data.forEach((record) => {
    const intake = getIntakeDate(record);
    const release = getReleaseDate(record);

    if (!intake) return;

    let category;
    if (statusColumn === "OffenseCategory") {
      category = offenseMapFunction(record[statusColumn]);
    } else {
      category = record[statusColumn];
    }

    const dispoStatus =
      record["Post-Dispo Stay Reason"] === null ||
      record["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    const rangeStart = intake < yearStart ? yearStart : intake;
    const rangeEnd =
      release && !isNaN(release)
        ? release > yearEnd
          ? yearEnd
          : release
        : yearEnd;

    if (rangeStart > yearEnd || rangeEnd < yearStart) return;

    const overlapDays =
      Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;

    const avgPopulation = overlapDays / daysInYear;

    if (!result[category]) {
      result[category] = { post: 0, pre: 0 };
    }

    if (dispoStatus.toLowerCase().includes("pre")) {
      result[category].pre += avgPopulation;
    } else if (dispoStatus.toLowerCase().includes("post")) {
      result[category].post += avgPopulation;
    }
  });

  // Process previous year population
  let prevYearTotalDays = 0;
  data.forEach((record) => {
    const intake = getIntakeDate(record);
    const release = getReleaseDate(record);

    if (!intake) return;

    const rangeStart = intake < prevStartDate ? prevStartDate : intake;
    const rangeEnd =
      release && !isNaN(release)
        ? release > prevEndDate
          ? prevEndDate
          : release
        : prevEndDate;

    if (rangeStart > prevEndDate || rangeEnd < prevStartDate) return;

    const overlapDays =
      Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;

    prevYearTotalDays += overlapDays;
  });

  return {
    previousPeriodCount: prevYearTotalDays / prevDaysInYear,
    results: Object.entries(result).map(([category, counts]) => ({
      category,
      ...counts,
    })),
  };
};

export default aggregatePopulationByStatus;
