const getSimplifiedReferralSource = (source) => {
  if (!source) return "Other";
  const s = source.toLowerCase();

  if (
    s.includes("police") ||
    s.includes("sheriff") ||
    s.includes("law enforcement") ||
    s.includes("officer") ||
    s.includes("deputy")
  ) {
    return "Law Enforcement";
  }

  if (
    s.includes("court") ||
    s.includes("judge") ||
    s.includes("probation") ||
    s.includes("magistrate")
  ) {
    return "Court";
  }

  return "Other";
};

export function chooseCategoryV2(result, category) {
  const label =
    category === "Jurisdiction"
      ? result["Referral_Source"]
      : result["OffenseCategory"];
  let lower = label.toLowerCase();
  let group;

  if (category === "Jurisdiction") {
    group = getSimplifiedReferralSource(label);
  } else if (category === "Reason for Detention") {
    if (lower.includes("felony")) {
      group = "New Offenses";
    } else if (lower.includes("misdemeanor")) {
      group = "New Offenses";
    } else if (label === "Status Offense") {
      group = "New Offenses";
    } else {
      group = "Technicals";
    }
  } else if (category === "Category") {
    if (lower.includes("felony")) {
      group = "Felonies";
    } else if (lower.includes("misdemeanor")) {
      group = "Misdemeanors";
    } else if (label === "Status Offense") {
      group = "Other";
    } else {
      group = "Technicals";
    }
  }

  return group;
}
