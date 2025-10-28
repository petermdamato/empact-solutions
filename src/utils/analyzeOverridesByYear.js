import moment from "moment";

export function analyzeOverridesByYear(data) {
  if (!Array.isArray(data)) return {};

  const groupedByYear = {};

  data.forEach((record) => {
    const dateStr = record["Intake_Date"];
    const score = record["DST_Score"];
    const override = record["Override_Reason"];

    if (!dateStr || score === null || score === "") return;

    const year = moment(dateStr).year();

    if (!groupedByYear[year]) {
      groupedByYear[year] = {
        totalWithScore: 0,
        totalWithOverride: 0,
      };
    }

    groupedByYear[year].totalWithScore += 1;

    if (
      override !== null &&
      override !== undefined &&
      String(override).trim() !== ""
    ) {
      groupedByYear[year].totalWithOverride += 1;
    }
  });

  const result = {};

  for (const year in groupedByYear) {
    const { totalWithScore, totalWithOverride } = groupedByYear[year];
    result[year] = {
      totalWithScore,
      totalWithOverride,
      percentWithOverride: totalWithScore
        ? ((totalWithOverride / totalWithScore) * 100).toFixed(1)
        : "0.0",
    };
  }

  return result;
}
