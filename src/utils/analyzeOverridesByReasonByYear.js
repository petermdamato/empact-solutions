// utils/analyzeOverridesByReasonByYear.js
import moment from "moment";
export function analyzeOverridesByReasonByYear(data) {
  const yearlyBuckets = {};

  data.forEach((record) => {
    if (!record.Intake_Date || record.Intake_Date === null) return;

    const year = moment(record.Intake_Date).year();
    const reason = record.Override_Reason?.trim();

    if (!reason) return;

    const normalizedReason = reason.toLowerCase().includes("other")
      ? "Other"
      : reason;

    if (!yearlyBuckets[year]) {
      yearlyBuckets[year] = {};
    }

    if (!yearlyBuckets[year][normalizedReason]) {
      yearlyBuckets[year][normalizedReason] = 0;
    }

    yearlyBuckets[year][normalizedReason]++;
  });

  return yearlyBuckets;
}
