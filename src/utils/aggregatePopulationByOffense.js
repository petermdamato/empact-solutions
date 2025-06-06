import { isLeapYear } from "date-fns";

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

  const result = {
    "Awaiting Placement": { post: 0, pre: 0 },
    Other: { post: 0, pre: 0 },
    "New Offense": { post: 0, pre: 0 },
    Technical: { post: 0, pre: 0 },
  };

  // Function to determine category
  const determineCategory = (record) => {
    const postStatus = record.Post_Adjudicated_Status;
    const offenseCategory = record.OffenseCategory?.toLowerCase() || "";

    // First check Post_Adjudicated_Status
    if (postStatus) {
      const lowerStatus = postStatus.toLowerCase();
      if (lowerStatus.includes("awaiting")) {
        return "Awaiting Placement";
      }
      if (lowerStatus.includes("other")) {
        return "Other";
      }
    }

    // Then check OffenseCategory
    if (
      offenseCategory.includes("felony") ||
      offenseCategory.includes("misdemeanor")
    ) {
      return "New Offense";
    }

    // Default to Technical
    return "Technical";
  };

  // Loop over each day of the year
  const currentDate = new Date(yearStart);
  while (currentDate <= yearEnd) {
    data.forEach((record) => {
      const intake = getIntakeDate(record);
      const release = getReleaseDate(record);
      const category = determineCategory(record);

      const dispoStatus =
        record["Post-Dispo Stay Reason"] === null ||
        record["Post-Dispo Stay Reason"] === ""
          ? "Pre-dispo"
          : "Post-dispo";

      if (!intake || !dispoStatus) return;

      if (intake <= currentDate && (!release || release >= currentDate)) {
        if (dispoStatus.toLowerCase().includes("pre")) {
          result[category].pre += 1;
        } else if (dispoStatus.toLowerCase().includes("post")) {
          result[category].post += 1;
        }
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate previous year count
  let prevYearCount = 0;
  const prevYearDate = new Date(prevStartDate);
  while (prevYearDate <= prevEndDate) {
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
