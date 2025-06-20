// Age Bracket Categorization
export const getAgeBracket = (age) => {
  if (!age) return "Unknown";
  if (age <= 13 && age >= 11) return "11-13";
  if (age <= 10) return "10 and younger";
  if (age <= 17) return "14-17";
  return "18+";
};

// Simplified Offense Category
export const getSimplifiedOffenseCategory = (offenseCategory) => {
  if (!offenseCategory) return "Other";

  const category = offenseCategory.toString();

  // Check for Felony categories
  if (/felony/i.test(category)) {
    return "Felonies";
  }

  // Check for Misdemeanor categories
  if (/misdemeanor/i.test(category)) {
    return "Misdemeanors";
  }

  // Check for Technical violations
  const technicalCategories = [
    "Court Order",
    "Warrant",
    "Status Offense",
    "Probation Violation",
    "ATD Program Failure",
    "Other Technical Violation",
    "Contempt of Court",
  ];

  if (technicalCategories.includes(category)) {
    return "Technicals";
  }

  // Return Other for unknown categories
  if (category === "Unknown") {
    return "Other";
  }

  return "Other";
};

// Offense Category Mapping
export const offenseMap = {
  "Felony Person": "New Offenses",
  "Felony Property": "New Offenses",
  "Felony Weapons": "New Offenses",
  "Felony Drugs": "New Offenses",
  "Other Felony": "New Offenses",
  "Misdemeanor Person": "New Offenses",
  "Misdemeanor Property": "New Offenses",
  "Misdemeanor Weapons": "New Offenses",
  "Other Misdemeanor": "New Offenses",
  "Status Offense": "New Offenses",
  "ATD Program Failure": "Technicals",
  "Court Order": "Technicals",
  "Probation Violation": "Technicals",
  Warrant: "Technicals",
  "Other Technical Violation": "Technicals",
};
