import { dateDiff } from "./dateDiff";

const aggregateByAgeGroup = (
  data,
  intakeStart = "2024-01-01",
  intakeEnd = "2024-12-31"
) => {
  const intakeStartDate = new Date(intakeStart);
  const intakeEndDate = new Date(intakeEnd);
  const today = new Date(); // Today's date for age calculation

  // Filter by Admission_Date within the range
  const filtered = data.filter((record) => {
    const intakeDate = new Date(record.Admission_Date);
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
    const birthDate = new Date(record.Date_of_Birth);
    const admissionDate = record.Admission_Date
      ? new Date(record.Admission_Date)
      : record.ADT_Entry_Date
      ? new Date(record.ADT_Entry_Date)
      : null;

    let ageAtDetention = admissionDate
      ? dateDiff(birthDate, admissionDate, "years")
      : null;

    // Determine age group
    let ageGroup;
    if (ageAtDetention) {
      if (ageAtDetention <= 13) {
        ageGroup = "13 and under";
      } else if (ageAtDetention >= 14 && ageAtDetention <= 15) {
        ageGroup = "14 to 15";
      } else if (ageAtDetention >= 16 && ageAtDetention <= 18) {
        ageGroup = "16 to 18";
      } else {
        ageGroup = "19 and up";
      }
    }

    return {
      Age_Group: ageGroup,
      Dispo_Status: dispoStatus,
    };
  });

  // Aggregate by Age_Group and Dispo_Status
  const result = {};

  classified.forEach(({ Age_Group, Dispo_Status }) => {
    if (!result[Age_Group]) {
      result[Age_Group] = { post: 0, pre: 0 };
    }

    if (Dispo_Status === "post-dispo") {
      result[Age_Group].post += 1;
    } else {
      result[Age_Group].pre += 1;
    }
  });

  // Convert result into an array of objects
  return Object.entries(result).map(([ageGroup, counts]) => ({
    category: ageGroup,
    ...counts,
  }));
};

export default aggregateByAgeGroup;
