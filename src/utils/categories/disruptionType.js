export function categorizeDisruptionType(record) {
  let group = [];

  if (
    record["ATD_Exit_FTA"] &&
    (record["ATD_Exit_FTA"] === 1 || record["ATD_Exit_FTA"] === "1")
  ) {
    group.push("FTA");
  }
  if (
    record["ATD_Exit_New_Offense"] &&
    (record["ATD_Exit_New_Offense"] === 1 ||
      record["ATD_Exit_New_Offense"] === "1")
  ) {
    group.push("New Offense");
  }
  if (
    record["ATD_Exit_Technical"] &&
    (record["ATD_Exit_Technical"] === 1 || record["ATD_Exit_Technical"] === "1")
  ) {
    group.push("Technical");
  }
  if (
    record["ATD_Exit_Other"] &&
    (record["ATD_Exit_Other"] === 1 || record["ATD_Exit_Other"] === "1")
  ) {
    group.push("Other");
  }
  return group;
}
