import { mean, median } from "d3-array";
import { differenceInCalendarDays, parse, getYear } from "date-fns";

const analyzeLengthByScreenedStatus = (filteredData, selectedYear) => {
  // First, create a map of status -> list of lengths of stay and releases count
  const scrGroups = {};

  filteredData.forEach((row) => {
    const intake = row.Admission_Date
      ? parse(row.Admission_Date, "yyyy-MM-dd", new Date())
      : null;
    const release = row.Release_Date
      ? parse(row.Release_Date, "yyyy-MM-dd", new Date())
      : null;

    // Only include records where release date is in the selected year
    if (intake && release && +getYear(release) === +selectedYear) {
      const scrStatus = row["Screened/not screened"] || "Unknown";
      const los = differenceInCalendarDays(release, intake) + 1;

      if (!scrGroups[scrStatus]) {
        scrGroups[scrStatus] = {
          lengths: [],
          releases: 0,
        };
      }

      scrGroups[scrStatus].lengths.push(los);
      scrGroups[scrStatus].releases++;
    }
  });

  // Compute average, median LOS, and number of releases by status
  const stayByStatus = Object.entries(scrGroups).map(
    ([category, { lengths, releases }]) => ({
      category,
      numberOfReleases: releases,
      averageLengthOfStay: mean(lengths),
      medianLengthOfStay: median(lengths),
    })
  );

  return stayByStatus;
};

export default analyzeLengthByScreenedStatus;
