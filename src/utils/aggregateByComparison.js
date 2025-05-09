const aggregateByDSTvActual = (
  data,
  intakeStart = "2024-01-01",
  intakeEnd = "2024-12-31"
) => {
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);

  // Filter records within intake range and exclude Unknown categories
  const filtered = data.filter((record) => {
    const intakeDate = new Date(record.Intake_Date);
    const category = record["DST v Actual comparison"] || "Unknown";
    return (
      intakeDate >= intakeStartDate &&
      intakeDate <= intakeEndDate &&
      category &&
      category !== "Unknown"
    );
  });

  const classified = filtered.map((record) => {
    return {
      category: record["DST v Actual comparison"],
    };
  });

  // Aggregate counts by category
  const result = {};
  classified.forEach(({ category }) => {
    if (!result[category]) {
      result[category] = 0;
    }
    result[category] += 1;
  });

  // Convert to array with label and value properties
  return Object.entries(result).map(([category, count]) => ({
    label: category,
    value: count,
  }));
};

export default aggregateByDSTvActual;
