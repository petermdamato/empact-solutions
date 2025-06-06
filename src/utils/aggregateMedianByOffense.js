import offenseMapFunction from "./offenseMapFunction";

const aggregateMedianByStatus = (
  data,
  selectedYear,
  detentionType,
  statusColumn = "OffenseCategory" // Default to OffenseCategory now
) => {
  const yearStart = new Date(`${selectedYear}-01-01`);
  const yearEnd = new Date(`${selectedYear}-12-31`);
  const prevStartDate = new Date(`${selectedYear - 1}-01-01`);
  const prevEndDate = new Date(`${selectedYear - 1}-12-31`);

  const getIntakeDate = (record) =>
    detentionType === "secure-detention"
      ? record.Admission_Date
        ? new Date(record.Admission_Date)
        : null
      : record.ATD_Entry_Date
      ? new Date(record.ATD_Entry_Date)
      : null;

  const getReleaseDate = (record) =>
    detentionType === "secure-detention"
      ? record.Release_Date
        ? new Date(record.Release_Date)
        : null
      : record.ATD_Exit_Date
      ? new Date(record.ATD_Exit_Date)
      : null;

  const releasedThisYear = data.filter((record) => {
    const releaseDate = getReleaseDate(record);
    return releaseDate && releaseDate >= yearStart && releaseDate <= yearEnd;
  });

  const releasedPrevYear = data.filter((record) => {
    const releaseDate = getReleaseDate(record);
    return (
      releaseDate && releaseDate >= prevStartDate && releaseDate <= prevEndDate
    );
  });

  const getStayLength = (record) => {
    const intakeDate = getIntakeDate(record);
    const releaseDate = getReleaseDate(record);
    return intakeDate && releaseDate
      ? (releaseDate - intakeDate) / (1000 * 60 * 60 * 24)
      : null;
  };

  const calculateMedian = (values) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  // Function to categorize offenses
  const categorizeOffense = (offense, postStatus) => {
    if (postStatus && postStatus.toLowerCase().includes("other")) {
      return "Other";
    } else if (postStatus && postStatus.toLowerCase().includes("awaiting")) {
      return "Awaiting Placement";
    } else if (
      offense &&
      (offense.toLowerCase().includes("felony") ||
        offense.toLowerCase().includes("misdemeanor"))
    ) {
      return "New Offense";
    }
    return "Technical";
  };

  // Collect stay lengths
  const preStayLengths = [];
  const postStayLengths = [];
  const statusPrePostStayLengths = {};
  const statusAllStayLengths = [];

  releasedThisYear.forEach((record) => {
    const stayLength = getStayLength(record);
    if (stayLength == null || isNaN(stayLength)) return;

    const dispoStatus =
      record["Post-Dispo Stay Reason"] === null ||
      record["Post-Dispo Stay Reason"] === ""
        ? "pre-dispo"
        : "post-dispo";

    // Get the category based on OffenseCategory
    const offenseCategory = record[statusColumn];
    const postStatus = record["Post_Adjudicated_Status"]
      ? record["Post_Adjudicated_Status"]
      : null;
    const category = categorizeOffense(offenseCategory, postStatus);

    if (dispoStatus === "pre-dispo") {
      preStayLengths.push(stayLength);
    } else if (dispoStatus === "post-dispo") {
      postStayLengths.push(stayLength);
    }

    if (!statusPrePostStayLengths[category]) {
      statusPrePostStayLengths[category] = {
        pre: [],
        post: [],
        all: [],
      };
    }

    if (dispoStatus === "pre-dispo") {
      statusPrePostStayLengths[category].pre.push(stayLength);
    } else if (dispoStatus === "post-dispo") {
      statusPrePostStayLengths[category].post.push(stayLength);
    }

    statusPrePostStayLengths[category].all.push(stayLength);
    statusAllStayLengths.push(stayLength);
  });

  // Previous period median for all
  const prevPeriodStayLengths = releasedPrevYear
    .map(getStayLength)
    .filter((x) => x != null && !isNaN(x));
  const prevPeriodMedian = calculateMedian(prevPeriodStayLengths);

  const statusResults = Object.entries(statusPrePostStayLengths).map(
    ([category, { pre, post, all }]) => ({
      category,
      pre: {
        median: Math.round(calculateMedian(pre) * 10) / 10,
        count: pre.length,
      },
      post: {
        median: Math.round(calculateMedian(post) * 10) / 10,
        count: post.length,
      },
      all: {
        median: Math.round(calculateMedian(all) * 10) / 10,
        count: all.length,
      },
    })
  );

  return {
    overall: {
      pre: {
        median: Math.round(calculateMedian(preStayLengths) * 10) / 10,
        count: preStayLengths.length,
      },
      post: {
        median: Math.round(calculateMedian(postStayLengths) * 10) / 10,
        count: postStayLengths.length,
      },
      all: {
        median: Math.round(calculateMedian(statusAllStayLengths) * 10) / 10,
        count: statusAllStayLengths.length,
      },
    },
    previousPeriod: {
      median: Math.round(prevPeriodMedian * 10) / 10,
      count: prevPeriodStayLengths.length,
    },
    byStatus: statusResults,
  };
};

export default aggregateMedianByStatus;
