const offenseMapFunction = (offense, target = "analysis") => {
  if (target === "analysis") {
    let offenseCat;
    const offenseCategories = {
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

    offenseCat = offenseCategories[offense]
      ? offenseCategories[offense]
      : "Other";
    return offenseCat;
  } else {
    let offenseCat;
    const offenseCategories = {
      "Felony Person": "New offenses (pre-dispo)",
      "Felony Property": "New offenses (pre-dispo)",
      "Felony Weapons": "New offenses (pre-dispo)",
      "Felony Drugs": "New offenses (pre-dispo)",
      "Other Felony": "New offenses (pre-dispo)",
      "Misdemeanor Person": "New offenses (pre-dispo)",
      "Misdemeanor Property": "New offenses (pre-dispo)",
      "Misdemeanor Weapons": "New offenses (pre-dispo)",
      "Other Misdemeanor": "New offenses (pre-dispo)",
      "Status Offense": "New offenses (pre-dispo)",
      "ATD Program Failure": "Technicals (pre-dispo)",
      "Court Order": "Technicals (pre-dispo)",
      "Probation Violation": "Technicals (pre-dispo)",
      Warrant: "Technicals (pre-dispo)",
      "Other Technical Violation": "Technicals (pre-dispo)",
    };

    offenseCat = offenseCategories[offense]
      ? offenseCategories[offense]
      : "Post-disposition	";
    return offenseCat;
  }
};

export default offenseMapFunction;
