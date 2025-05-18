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

  // Previous year range
  const prevStartDate = new Date(`${selectedYear - 1}-01-01`);
  const prevEndDate = new Date(`${selectedYear - 1}-12-31`);

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

  // Loop over each day of the year
  const currentDate = new Date(yearStart);
  while (currentDate <= yearEnd) {
    const dateKey = currentDate.toISOString().slice(0, 10);

    data.forEach((record) => {
      const intake = getIntakeDate(record);
      const release = getReleaseDate(record);
      let category;

      if (statusColumn === "OffenseCategory") {
        category = offenseMapFunction(record[statusColumn]);
      } else {
        category = record[statusColumn];
      }
      const dispoStatus = record["Pre/post-dispo filter"];

      if (!intake || !dispoStatus) return;

      if (intake <= currentDate && (!release || release >= currentDate)) {
        if (!result[category]) {
          result[category] = { post: 0, pre: 0 };
        }

        if (dispoStatus.toLowerCase().includes("pre")) {
          result[category].pre += 1;
        } else if (dispoStatus.toLowerCase().includes("post")) {
          result[category].post += 1;
        }
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  let prevYearCount = 0;
  const prevYearDate = prevStartDate;
  while (prevYearDate <= prevEndDate) {
    const dateKey = prevYearDate.toISOString().slice(0, 10);

    data.forEach((record) => {
      const intake = getIntakeDate(record);
      const release = getReleaseDate(record);

      if (!intake) return;

      if (intake <= prevYearDate && (!release || release >= prevYearDate)) {
        prevYearCount += 1;
      }
    });

    prevYearDate.setDate(prevYearDate.getDate() + 1);
  }
  return {
    previousPeriodCount:
      prevYearCount / (isLeapYear(selectedYear - 1) ? 366 : 365),
    results: Object.entries(result).map(([category, counts]) => ({
      category,
      ...counts,
    })),
  };
};

export default aggregatePopulationByStatus;
