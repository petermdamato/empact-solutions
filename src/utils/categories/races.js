export function categorizeRaceEthnicity(race, ethnicity) {
  if (ethnicity?.toLowerCase() === "hispanic") return "Hispanic";
  if (/black|african/i.test(race)) return "African American or Black";
  if (/asian/i.test(race)) return "Asian";
  if (/white/i.test(race)) return "White";
  return "Other";
}
