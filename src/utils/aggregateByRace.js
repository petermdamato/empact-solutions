const aggregateByRace = (data, selectedYear, detentionType) => {
  const intakeStart = `${selectedYear}-01-01`;
  const intakeEnd = `${selectedYear}-12-31`;
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);

  // Filter by Admission_Date within the range
  const filtered = data.filter((record) => {
    const intakeDate = new Date(
      detentionType === "secure-detention"
        ? record.Admission_Date
        : record.ATD_Entry_Date
    );
    return intakeDate >= intakeStartDate && intakeDate <= intakeEndDate;
  });

  // Classify as post-dispo or pre-dispo
  const classified = filtered.map((record) => {
    const releaseDate =
      detentionType === "secure-detention"
        ? new Date(record.Release_Date)
        : new Date(record.ATD_Exit_Date);
    const dispoStatus =
      releaseDate >= intakeStartDate && releaseDate <= intakeEndDate
        ? "post-dispo"
        : "pre-dispo";

    return {
      Race: record.Race,
      Ethnicity: record.Ethnicity,
      Dispo_Status: dispoStatus,
    };
  });

  // Aggregate by Gender and Dispo_Status
  const result = {};

  classified.forEach(({ Race, Ethnicity, Dispo_Status }) => {
    const RaceEthnicity = Ethnicity === "Hispanic" ? "Hispanic" : Race;

    if (!result[RaceEthnicity]) {
      result[RaceEthnicity] = { post: 0, pre: 0 };
    }

    if (Dispo_Status === "post-dispo") {
      result[RaceEthnicity].post += 1;
    } else {
      result[RaceEthnicity].pre += 1;
    }
  });

  // Convert result into an array of objects
  return Object.entries(result).map(([raceEthnicity, counts]) => ({
    category: raceEthnicity,
    ...counts,
  }));
};

export default aggregateByRace;
