const aggregateMedianByStatus = (
  data,
  selectedYear,
  detentionType,
  statusColumn = "Post_Adjudicated_Status"
) => {
  const yearStart = new Date(`${selectedYear}-01-01`);
  const yearEnd = new Date(`${selectedYear}-12-31`);
  const prevStartDate = new Date(`${selectedYear - 1}-01-01`);
  const prevEndDate = new Date(`${selectedYear - 1}-12-31`);

  const getIntakeDate = (record) =>
    detentionType === "secure-detention"
      ? record.Intake_Date
        ? new Date(record.Intake_Date)
        : null
      : record.ADT_Entry_Date
      ? new Date(record.ADT_Entry_Date)
      : null;

  const getReleaseDate = (record) =>
    detentionType === "secure-detention"
      ? record.Release_Date
        ? new Date(record.Release_Date)
        : null
      : record.ADT_Exit_Date
      ? new Date(record.ADT_Exit_Date)
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

  // Collect stay lengths
  const preStayLengths = [];
  const postStayLengths = [];
  const statusPrePostStayLengths = {};
  const statusAllStayLengths = [];

  releasedThisYear.forEach((record) => {
    const stayLength = getStayLength(record);
    if (stayLength == null || isNaN(stayLength)) return;

    const dispoStatus = record["Pre/post-dispo filter"]?.toLowerCase();
    const category = record[statusColumn];

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
        median: calculateMedian(pre),
        count: pre.length,
      },
      post: {
        median: calculateMedian(post),
        count: post.length,
      },
      all: {
        median: calculateMedian(all),
        count: all.length,
      },
    })
  );

  return {
    overall: {
      pre: {
        median: calculateMedian(preStayLengths),
        count: preStayLengths.length,
      },
      post: {
        median: calculateMedian(postStayLengths),
        count: postStayLengths.length,
      },
      all: {
        median: calculateMedian(statusAllStayLengths),
        count: statusAllStayLengths.length,
      },
    },
    previousPeriod: {
      median: prevPeriodMedian,
      count: prevPeriodStayLengths.length,
    },
    byStatus: statusResults,
  };
};

export default aggregateMedianByStatus;
