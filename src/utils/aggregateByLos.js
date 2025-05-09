import { dateDiff } from "./dateDiff";

const aggregateByAgeGroup = (
  data,
  intakeStart = "2024-01-01",
  intakeEnd = "2024-12-31"
) => {
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);
  const today = new Date(); // Today's date for age calculation

  // Filter by Intake_Date within the range
  const filtered = data.filter((record) => {
    const intakeDate = new Date(record.Intake_Date);
    return intakeDate >= intakeStartDate && intakeDate <= intakeEndDate;
  });

  // Classify as post-dispo or pre-dispo and calculate age group
  const classified = filtered.map((record) => {
    const releaseDate = new Date(record.Release_Date);
    const dispoStatus =
      releaseDate >= intakeStartDate && releaseDate <= intakeEndDate
        ? "post-dispo"
        : "pre-dispo";

    // // Calculate age
    // const birthDate = new Date(record.Date_of_Birth);
    // let age = today.getFullYear() - birthDate.getFullYear();
    // const monthDiff = today.getMonth() - birthDate.getMonth();
    // if (
    //   monthDiff < 0 ||
    //   (monthDiff === 0 && today.getDate() < birthDate.getDate())
    // ) {
    //   age--;
    // }

    // Calculate age
    const exitDate = record.Release_Date
      ? new Date(record.Release_Date)
      : record.ATD_Exit_Date
      ? new Date(record.ATD_Exit_Date)
      : null;

    const admissionDate = record.Intake_Date
      ? new Date(record.Intake_Date)
      : record.ADT_Entry_Date
      ? new Date(record.ADT_Entry_Date)
      : null;

    let lengthOfStay =
      admissionDate && exitDate
        ? Math.ceil(dateDiff(admissionDate, exitDate, "days"))
        : null;

    return {
      LOS: lengthOfStay,
      Dispo_Status: dispoStatus,
    };
  });

  // Aggregate by Age_Group and Dispo_Status
  const result = {};

  classified.forEach(({ LOS, Dispo_Status }) => {
    if (!result[LOS]) {
      result[LOS] = { post: 0, pre: 0 };
    }

    if (Dispo_Status === "post-dispo") {
      result[LOS].post += 1;
    } else {
      result[LOS].pre += 1;
    }
  });

  // Convert result into an array of objects
  return Object.entries(result).map(([LOS, counts]) => ({
    category: LOS,
    ...counts,
  }));
};

export default aggregateByAgeGroup;
