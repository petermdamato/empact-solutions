const aggregateCalculationByStatus = (
  data,
  selectedYear,
  detentionType,
  statusColumn = "OffenseCategory", // Changed default to OffenseCategory
  calculation = "average"
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

  // Filter records where the release date occurred in the selected year
  const releasedThisYear = data.filter((record) => {
    const releaseDate = getReleaseDate(record);
    return releaseDate && releaseDate >= yearStart && releaseDate <= yearEnd;
  });

  // Filter previous year releases for comparison
  const releasedPrevYear = data.filter((record) => {
    const releaseDate = getReleaseDate(record);
    return (
      releaseDate && releaseDate >= prevStartDate && releaseDate <= prevEndDate
    );
  });

  const { prevTotal, prevCount } = releasedPrevYear.reduce(
    (acc, record) => {
      const intakeDate = getIntakeDate(record);
      const releaseDate = getReleaseDate(record);

      const stayLengthDays =
        releaseDate && intakeDate
          ? (releaseDate - intakeDate) / (1000 * 60 * 60 * 24) + 1
          : null;

      if (stayLengthDays) {
        acc.prevTotal += stayLengthDays;
        acc.prevCount += 1;
      }

      return acc;
    },
    { prevTotal: 0, prevCount: 0 }
  );

  const releasedCalculatedPrevYear = prevTotal / prevCount;

  const categorizeOffense = (record) => {
    const postStatus = record.Post_Adjudicated_Status;
    const postReason = record["Post-Dispo Stay Reason"];
    const offenseCategory = record.OffenseCategory?.toLowerCase() || "";

    // First check Post_Adjudicated_Status
    if (postReason) {
      const lowerStatus = postReason.toLowerCase();
      if (lowerStatus.includes("awaiting")) {
        return "Awaiting Placement";
      } else if (lowerStatus.includes("confinement")) {
        return "Confinement to Secure Detention";
      } else if (lowerStatus.includes("other")) {
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

  // Classify and calculate average stay
  const result = {};

  releasedThisYear.forEach((record) => {
    const intakeDate = getIntakeDate(record);
    const releaseDate = getReleaseDate(record);
    const stayLengthDays =
      releaseDate && intakeDate
        ? (releaseDate - intakeDate) / (1000 * 60 * 60 * 24) + 1
        : null;

    const category = categorizeOffense(record);

    const dispoStatus =
      record["Post-Dispo Stay Reason"] === null ||
      record["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    if (!isNaN(stayLengthDays) && !result[category]) {
      result[category] = {
        post: 0,
        pre: 0,
        daysPost: 0,
        daysPre: 0,
      };
    }

    if (!isNaN(stayLengthDays) && dispoStatus.toLowerCase() === "pre-dispo") {
      result[category].pre += 1;
      result[category].daysPre += stayLengthDays;
    } else if (
      !isNaN(stayLengthDays) &&
      dispoStatus.toLowerCase() === "post-dispo"
    ) {
      result[category].post += 1;
      result[category].daysPost += stayLengthDays;
    }
  });

  return {
    previousPeriodCount: releasedCalculatedPrevYear,
    results: Object.entries(result).map(([category, stats]) => ({
      category,
      post: stats.post,
      pre: stats.pre,
      daysPost: stats.daysPost,
      daysPre: stats.daysPre,
    })),
  };
};

export default aggregateCalculationByStatus;
