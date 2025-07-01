const getAge = (dob, intake) => {
  if (dob === undefined || intake === undefined) return null;

  return (new Date(intake) - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000);
};

export function categorizeAge(record, incarcerationType) {
  let group;
  const intake =
    incarcerationType === "secure-detention"
      ? record["Admission_Date"]
      : record["ATD_Entry_Date"];
  const dob = record["Date_of_Birth"];
  const age = Math.floor(getAge(dob, intake));

  if (dob === undefined || intake === undefined) {
    group = "Unknown";
  } else if (age < 11) {
    group = "10 and younger";
  } else if (age <= 13) {
    group = "11-13";
  } else if (age <= 17) {
    group = "14-17";
  } else {
    group = "18+";
  }

  return group;
}
