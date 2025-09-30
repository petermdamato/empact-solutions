export const getSimplifiedReferralSource = (source) => {
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

export function getReasonForDetention(row) {
  const status = row["Post_Adjudicated_Status"];
  const label = row.OffenseCategory || "";
  const lower = label.toLowerCase();

  if (status && status.trim().length > 0) {
    return status;
  }

  // Fall back to offense-based grouping
  return label || "Unknown";
}

export function chooseCategory(result, category) {
  const status = result["Post_Adjudicated_Status"];
  const reason = result["Post-Dispo Stay Reason"];
  const label =
    category === "Jurisdiction"
      ? result["Referral_Source"]
      : result["OffenseCategory"];
  let lower = label.toLowerCase();
  let group;

  if (category === "Jurisdiction") {
    group = getSimplifiedReferralSource(label);
  } else if (category === "Reason for Detention") {
    if (status && status.length > 0) {
      if (status.toLowerCase().includes("other")) {
        group = "Other";
      } else {
        group = status;
      }
    } else if (lower.includes("felony")) {
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
      group = "Status Offense";
    } else {
      group = "Technicals";
    }
  }

  return group;
}

export function chooseCategoryAligned(result, category) {
  const status = result["Post_Adjudicated_Status"];
  const reason = result["Post-Dispo Stay Reason"];
  const label =
    category === "Jurisdiction"
      ? result["Referral_Source"]
      : result["OffenseCategory"];

  let lower = label?.toLowerCase() || "";
  let group;

  if (category === "Jurisdiction") {
    group = getSimplifiedReferralSource(label);
  } else if (category === "Reason for Detention") {
    if (reason && reason.length > 0) {
      if (reason.toLowerCase().includes("other")) {
        group = "Other";
      } else {
        group = status;
      }
    } else if (lower.includes("felony")) {
      group = "New Offenses";
    } else if (lower.includes("misdemeanor")) {
      group = "New Offenses";
    } else if (label === "Status Offense") {
      group = "New Offenses";
    } else {
      group = "Technicals";
    }
  } else if (category === "Category") {
    const technicalCategories = [
      "Court Order",
      "Warrant",
      "Probation Violation",
      "ATD Program Failure",
      "Other Technical Violation",
      "Contempt of Court",
    ];

    if (/felony/i.test(label)) {
      group = "Felonies";
    } else if (/misdemeanor/i.test(label)) {
      group = "Misdemeanors";
    } else if (/status offense/i.test(label)) {
      group = "Status Offense";
    } else if (technicalCategories.includes(label)) {
      group = "Technicals";
    } else {
      group = "Unknown";
    }
  }

  return group;
}
