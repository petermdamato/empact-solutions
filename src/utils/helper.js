const getSimplifiedOffenseCategory = (offenseCategory) => {
  if (!offenseCategory) return "Other";

  const category = offenseCategory.toString();

  if (/felony/i.test(category)) return "Felonies";
  if (/misdemeanor/i.test(category)) return "Misdemeanors";

  const technicalCategories = [
    "Court Order",
    "Warrant",
    "Status Offense",
    "Probation Violation",
    "ATD Program Failure",
    "Other Technical Violation",
    "Contempt of Court",
  ];

  if (technicalCategories.includes(category)) return "Technicals";

  if (category === "Unknown") return "Other";

  return "Other";
};

export default getSimplifiedOffenseCategory;
