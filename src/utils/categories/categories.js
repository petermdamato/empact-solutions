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

  if (s.includes("school")) {
    return "School";
  }

  return "Other";
};

export function chooseCategory(result, category) {
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
      group = "New Offense";
    } else if (lower.includes("misdemeanor")) {
      group = "New Offense";
    } else if (label === "Status Offense") {
      group = "New Offense";
    } else {
      group = "Technical";
    }
  } else if (category === "Category") {
    if (lower.includes("felony")) {
      group = "Felony";
    } else if (lower.includes("misdemeanor")) {
      group = "Misdemeanor";
    } else if (label === "Status Offense") {
      group = "Status Offense";
    } else {
      group = "Technical";
    }
  }

  return group;
}
