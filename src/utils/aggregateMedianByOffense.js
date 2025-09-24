import offenseMapFunction from "./offenseMapFunction";

const aggregateMedianByStatus = (
  data,
  selectedYear,
  detentionType,
  statusColumn = "OffenseCategory", // Default to OffenseCategory now
  fileName = "" // Added fileName parameter
) => {
  // Extract date range from fileName if provided
  let dateRange = null;
  if (fileName && fileName.length > 0) {
    const match = fileName.match(/(\d{8}).*?(\d{8})/);
    if (match) {
      dateRange = [match[1], match[2]];
    }
  }

  // Extract years from dateRange if they exist
  const startYear =
    dateRange && dateRange[0] ? parseInt(dateRange[0].slice(0, 4)) : null;
  const endYear =
    dateRange && dateRange[1] ? parseInt(dateRange[1].slice(0, 4)) : null;

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

  // Filter data based on date range from fileName
  const filteredData = data.filter((record) => {
    const intakeDate = getIntakeDate(record);
    if (!intakeDate) return false;

    const intakeYear = intakeDate.getFullYear();

    // Check if intakeYear falls within the date range
    const meetsStartCondition = !startYear || intakeYear >= startYear;
    const meetsEndCondition = !endYear || intakeYear <= endYear;

    return meetsStartCondition && meetsEndCondition;
  });

  const yearStart = new Date(`${selectedYear}-01-01`);
  const yearEnd = new Date(`${selectedYear}-12-31`);
  const prevStartDate = new Date(`${selectedYear - 1}-01-01`);
  const prevEndDate = new Date(`${selectedYear - 1}-12-31`);

  const releasedThisYear = filteredData.filter((record) => {
    const releaseDate = getReleaseDate(record);
    return releaseDate && releaseDate >= yearStart && releaseDate <= yearEnd;
  });

  const releasedPrevYear = filteredData.filter((record) => {
    const releaseDate = getReleaseDate(record);
    return (
      releaseDate && releaseDate >= prevStartDate && releaseDate <= prevEndDate
    );
  });

  const getStayLength = (record) => {
    const intakeDate = getIntakeDate(record);
    const releaseDate = getReleaseDate(record);
    return intakeDate && releaseDate
      ? (releaseDate - intakeDate) / (1000 * 60 * 60 * 24) + 1
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

  const categorizeOffense = (record) => {
    const postReason = record["Post-Dispo Stay Reason"];
    const offenseCategory = record.OffenseCategory?.toLowerCase() || "";

    // First check Post-Dispo Stay Reason
    if (postReason) {
      const lowerStatus = postReason.toLowerCase();
      if (lowerStatus.includes("awaiting")) {
        return "Awaiting Placement";
      } else if (lowerStatus.includes("confinement")) {
        return "Confinement to Secure Detention";
      } else if (lowerStatus.includes("other")) {
        return "Other";
      }
    }

    // Then check OffenseCategory
    if (
      offenseCategory.includes("felony") ||
      offenseCategory.includes("misdemeanor") ||
      offenseCategory === "status offense"
    ) {
      return "New Offense";
    }

    // Default to Technical
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

    const category = categorizeOffense(record);

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
