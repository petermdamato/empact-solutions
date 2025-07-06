// utils/analyzeOverridesByReasonByYear.js

export function analyzeOverridesByReasonByYear(data) {
  const yearlyBuckets = {};

  data.forEach((record) => {
    if (!record.Admission_Date || record.Admission_Date === null) return;

    const year = new Date(record.Admission_Date).getFullYear();

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
