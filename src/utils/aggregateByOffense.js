const aggregateByStatus = (data, selectedYear, detentionType) => {
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

  // Filter previous year data
  const filteredPrevious = data.filter((record) => {
    const intakeDate = new Date(
      detentionType === "secure-detention"
        ? record.Admission_Date
        : record.ATD_Entry_Date
    );
    return intakeDate >= prevStartDate && intakeDate <= prevEndDate;
  });

  const determineCategory = (record) => {
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
      offenseCategory.includes("misdemeanor") ||
      offenseCategory === "status offense"
    ) {
      return "New Offense";
    }

    // Default to Technical
    return "Technical";
  };

  // Classify records
  const classified = filtered.map((record) => {
    const dispoStatus =
      record["Post-Dispo Stay Reason"] === null ||
      record["Post-Dispo Stay Reason"] === ""
        ? "Pre-dispo"
        : "Post-dispo";

    return {
      Category: determineCategory(record),
      Dispo_Status: dispoStatus,
      Dispo_Reason: record["Post-Dispo Stay Reason"],
    };
  });

  // Initialize result categories
  const result = {
    "Awaiting Placement": { post: 0, pre: 0 },
    Other: { post: 0, pre: 0 },
    "Confinement to Secure Detention": { post: 0, pre: 0 },
    "New Offense": { post: 0, pre: 0 },
    Technical: { post: 0, pre: 0 },
  };

  // Aggregate counts
  classified.forEach(({ Category, Dispo_Reason }) => {
    if (Dispo_Reason === null || Dispo_Reason === "") {
      result[Category].pre += 1;
    } else if (Dispo_Reason.toLowerCase().includes("other")) {
      result["Other"].post += 1;
    } else {
      result[Category].post += 1;
    }
  });

  // Convert result into an array of objects
  return {
    previousPeriodCount: filteredPrevious.length,
    results: Object.entries(result).map(([category, counts]) => ({
      category,
      ...counts,
    })),
  };
};

export default aggregateByStatus;
