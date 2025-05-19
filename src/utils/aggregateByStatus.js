import offenseMapFunction from "./offenseMapFunction";

const aggregateByStatus = (
  data,
  selectedYear,
  detentionType,
  statusColumn = "Post_Adjudicated_Status"
) => {
  const intakeStart = `${selectedYear}-01-01`;
  const intakeEnd = `${selectedYear}-12-31`;
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);

  // Previous year range
  const prevStartDate = new Date(intakeStart);
  prevStartDate.setFullYear(intakeStartDate.getFullYear() - 1);

  const prevEndDate = new Date(intakeEnd);
  prevEndDate.setFullYear(intakeEndDate.getFullYear() - 1);

  // Filter by Admission_Date within the range
  const filtered = data.filter((record) => {
    const intakeDate = new Date(
      detentionType === "secure-detention"
        ? record.Admission_Date
        : record.ATD_Entry_Date
    );
    return intakeDate >= intakeStartDate && intakeDate <= intakeEndDate;
  });

  // Filter by Admission_Date within the range
  const filteredPrevious = data.filter((record) => {
    const intakeDate = new Date(
      detentionType === "secure-detention"
        ? record.Admission_Date
        : record.ATD_Entry_Date
    );
    return intakeDate >= prevStartDate && intakeDate <= prevEndDate;
  });

  // Classify as post-dispo or pre-dispo
  const classified = filtered.map((record) => {
    const releaseDate = new Date(record.Release_Date);
    // const dispoStatus = record["Pre/post-dispo filter"];
    const dispoStatus =
      record["Post-Dispo Stay Reason"] === null ||
      record["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    return {
      Column: offenseMapFunction(record[statusColumn]),
      Dispo_Status: dispoStatus,
    };
  });

  // Aggregate by Status and Dispo_Status
  const result = {};

  classified.forEach(({ Column, Dispo_Status }) => {
    if (!result[Column]) {
      result[Column] = { post: 0, pre: 0 };
    }

    if (Dispo_Status.toLowerCase() === "post-dispo") {
      result[Column].post += 1;
    } else {
      result[Column].pre += 1;
    }
  });

  // Convert result into an array of objects
  return {
    previousPeriodCount: filteredPrevious.length,
    results: Object.entries(result).map(([category, counts]) => ({
      category: category,
      ...counts,
    })),
  };
};

export default aggregateByStatus;
