import { offenseMap } from "../categorizationUtils";

export const groupReasons = (data) => {
  const result = {
    "New Offense": {},
    Technical: {},
  };

  for (const [label, counts] of Object.entries(data)) {
    let group;
    group = offenseMap[label]
      ? offenseMap[label]
      : label.toLowerCase().includes("misdemeanor") ||
        label.toLowerCase().includes("felony")
      ? "New Offense"
      : label.toLowerCase().includes("other")
      ? "Other"
      : label;

    if (!result[group]) result[group] = {};

    // Sum counts into group-level counts
    for (const [dispo, count] of Object.entries(counts)) {
      result[group][dispo] = (result[group][dispo] || 0) + count;
    }
  }

  return result;
};
