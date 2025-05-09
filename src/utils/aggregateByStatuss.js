const aggregateByStatuss = (
  data,
  statusColumn = "Post_Adjudicated_Status",
  intakeStart = "2024-01-01",
  intakeEnd = "2024-12-31"
) => {
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);

  // Previous year range
  const prevStartDate = new Date(intakeStart);
  prevStartDate.setFullYear(intakeStartDate.getFullYear() - 1);

  const prevEndDate = new Date(intakeEnd);
  prevEndDate.setFullYear(intakeEndDate.getFullYear() - 1);

  // Function to filter and classify data by date range
  const processData = (startDate, endDate) => {
    const filtered = data.filter((record) => {
      const intakeDate = new Date(record.Intake_Date);
      return intakeDate >= startDate && intakeDate <= endDate;
    });

    const classified = filtered.map((record) => {
      const releaseDate = new Date(record.Release_Date);
      const dispoStatus =
        releaseDate >= startDate && releaseDate <= endDate
          ? "post-dispo"
          : "pre-dispo";

      return {
        Column: record[statusColumn],
        Dispo_Status: dispoStatus,
      };
    });

    const result = {};

    classified.forEach(({ Column, Dispo_Status }) => {
      if (!result[Column]) {
        result[Column] = { Post_Dispo_Count: 0, Pre_Dispo_Count: 0 };
      }

      if (Dispo_Status === "post-dispo") {
        result[Column].Post_Dispo_Count += 1;
      } else {
        result[Column].Pre_Dispo_Count += 1;
      }
    });

    return result;
  };

  // Aggregate for both current and previous year
  const currentYearResult = processData(intakeStartDate, intakeEndDate);
  const previousYearResult = processData(prevStartDate, prevEndDate);

  // Merge results into a combined output
  const allCategories = new Set([
    ...Object.keys(currentYearResult),
    ...Object.keys(previousYearResult),
  ]);
  console.log(allCategories);
  const finalResult = Array.from(allCategories).map((category) => ({
    category: category,
    Current_Year_Post_Dispo: currentYearResult[category]?.Post_Dispo_Count || 0,
    Current_Year_Pre_Dispo: currentYearResult[category]?.Pre_Dispo_Count || 0,
    Previous_Year_Post_Dispo:
      previousYearResult[category]?.Post_Dispo_Count || 0,
    Previous_Year_Pre_Dispo: previousYearResult[category]?.Pre_Dispo_Count || 0,
  }));

  return finalResult;
};

export default aggregateByStatuss;
