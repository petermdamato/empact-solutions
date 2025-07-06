import React, { useMemo } from "react";
import "./Heatmap.css";
import Button from "@mui/material/Button";

const Heatmap = ({
  data,
  xKey,
  yKey,
  datesRange,
  chartTitle,
  showScores,
  dstValue,
  setDstValue,
  dstScoreValue,
  setDstScoreValue,
  decisionValue,
  setDecisionValue,
  children,
  setRecordsTableObject,
}) => {
  const { xLabels, yLabels, counts, maxCount, min, max } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        xLabels: [],
        yLabels: [],
        counts: {},
        maxCount: 0,
        min: 0,
        maxForBreaks: 0,
      };
    }

    const dates = datesRange.map((date) => new Date(date));
    const filtered = data.filter((entry) => {
      const hasScore = entry[xKey] !== undefined && entry[xKey] !== "";
      const hasDecision = entry[yKey] !== undefined && entry[yKey] !== "";
      return (
        hasScore &&
        hasDecision &&
        new Date(entry.Intake_Date) <= dates[1] &&
        new Date(entry.Intake_Date) >= dates[0]
      );
    });

    const countMap = {};
    const xSet = new Set();
    const ySet = new Set();

    filtered.forEach((item) => {
      let x = item[xKey];
      if (showScores && xKey === "DST_Score") {
        x = parseInt(x, 10);
        if (x >= 100) {
          x = Math.floor(x / 100) * 100;
        }
      }
      const y = item[yKey];
      xSet.add(x);
      ySet.add(y);
      const key = `${x}|${y}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const min = Math.min(...filtered.map((entry) => entry["DST_Score"]));
    const maxForBreaks = Math.max(
      ...filtered.map((entry) => entry["DST_Score"])
    );

    const yOrder = ["Released", "Released with Conditions", "Detained"];
    let yLabels = Array.from(ySet).sort((a, b) => {
      const indexA = yOrder.indexOf(a);
      const indexB = yOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    let xLabels;
    if (showScores === "hide") {
      xLabels = ["Released", "Released with Conditions", "Detained"];
    } else {
      xLabels = Array.from(xSet).sort((a, b) => a - b);
    }

    const max = Math.max(...Object.values(countMap), 0);

    return {
      xLabels,
      yLabels,
      counts: countMap,
      maxCount: max,
      min: min + 2,
      max: maxForBreaks,
    };
  }, [data, xKey, yKey, datesRange, showScores]);

  if (
    !data ||
    data.length === 0 ||
    xLabels.length === 0 ||
    yLabels.length === 0
  ) {
    return null;
  }

  const getColor = (count) => {
    if (!count) return "#fff";
    const intensity = count / maxCount;
    return `rgba(38, 67, 97, ${intensity})`;
  };

  const groupings =
    showScores && xKey === "DST_Score"
      ? [
          { label: "Released", min: -Infinity, max: 6 },
          { label: "Released with Conditions", min: 6, max: 14 },
          { label: "Detained", min: 15, max: Infinity },
        ]
      : [];

  const groupSpans = groupings.map((group) => {
    const columns = xLabels.filter((x) => x >= group.min && x <= group.max);
    return { label: group.label, span: columns.length };
  });

  const superHeaderBorders = xLabels
    .map((x, index) => {
      return x === 6 || x === 14 ? index + 1 : null;
    })
    .filter((i) => i !== null);

  const gridTemplateColumns = `minmax(100px, auto) repeat(${xLabels.length}, 1fr)`;

  return (
    <div>
      <div
        style={{
          borderTop: "1px solid #d3d3d3",
          paddingTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          marginLeft: "8px",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        {chartTitle}
        <Button
          variant="outlined"
          onClick={() => setRecordsTableObject(true)}
          sx={{
            backgroundColor: "#333a43",
            height: "26px",
            marginRight: "8px",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#4a5568",
            },
          }}
        >
          View Table
        </Button>
      </div>
      {showScores === "hide" ? (
        <div style={{ display: "flex", width: "100%", alignItems: "stretch" }}>
          {/* Y-axis label (rotated) */}
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontWeight: 600,
              fontSize: "14px",
              textAlign: "center",
              padding: "4px 0",
              color: "#264361",
              marginRight: "8px",
            }}
          >
            {yKey}
          </div>
          <div style={{ flex: 1 }}>
            {/* Y-axis label (rotated) */}
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                textAlign: "center",
                padding: "4px 0",
                color: "#264361",
              }}
            ></div>

            {/* X-axis label */}
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                textAlign: "center",
                color: "#264361",
                marginBottom: "8px",
              }}
            >
              {xKey.replace("_", " ")}
            </div>
            {groupSpans.length > 0 && (
              <div
                className="heatmap-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: gridTemplateColumns,
                  gridTemplateRows: "auto",
                  alignItems: "stretch",
                }}
              >
                {groupSpans.map((group, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDstScoreValue(null);
                      group.label === ""
                        ? null
                        : dstValue === group.label
                        ? setDstValue(null)
                        : setDstValue(group.label);
                    }}
                    style={{
                      gridColumn: `span ${group.span}`,
                      textAlign: "center",
                      fontWeight: 500,
                      borderBottom: "1px solid #ccc",
                      borderRight:
                        idx < groupSpans.length - 1 ? "2px solid #ccc" : "none",
                      padding: "6px 0",
                      cursor: group.label === "" ? "auto" : "pointer",
                      backgroundColor:
                        dstValue === group.label ? "#bfe9fd" : "inherit",
                    }}
                  >
                    {group.label}
                  </div>
                ))}
              </div>
            )}

            {/* Outer grid for axis labels and heatmap */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gridTemplateRows: "auto 1fr",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {/* Heatmap grid */}
              <div
                className="heatmap-grid"
                style={{
                  gridColumn: "2 / span 1",
                  gridRow: "2 / span 1",
                  gridTemplateColumns: gridTemplateColumns,
                  gridTemplateRows: `auto repeat(${yLabels.length}, 1fr)`,
                }}
              >
                {children}
                {/* <div className="heatmap-corner" /> */}

                {xLabels.map((x, index) => (
                  <div
                    key={`x-${x}`}
                    onClick={() => {
                      if (showScores === "hide") {
                        setDstScoreValue(null);
                        x === dstValue ? setDstValue(null) : setDstValue(x);
                      }
                    }}
                    className="heatmap-label x-label"
                    style={{
                      borderRight: superHeaderBorders.includes(index + 1)
                        ? "2px solid #ccc"
                        : undefined,
                      cursor: showScores ? "pointer" : "auto",
                      backgroundColor:
                        showScores === "hide" && dstValue === x
                          ? "#bfe9fd"
                          : dstScoreValue === x
                          ? "#bfe9fd"
                          : "inherit",
                    }}
                  >
                    {x}
                  </div>
                ))}

                {yLabels.map((y) => (
                  <React.Fragment key={`row-${y}`}>
                    <div
                      className="heatmap-label y-label"
                      onClick={() =>
                        y === decisionValue
                          ? setDecisionValue(null)
                          : setDecisionValue(y)
                      }
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          decisionValue === y ? "#bfe9fd" : "inherit",
                      }}
                    >
                      {y}
                    </div>
                    {xLabels.map((x, index) => {
                      const count = counts[`${x}|${y}`] || 0;
                      const isSelected = x === dstValue && y === decisionValue;

                      const fadeOut =
                        (dstValue && x !== dstValue) ||
                        (decisionValue && y !== decisionValue);

                      return (
                        <div
                          key={`${x}|${y}`}
                          className="heatmap-cell"
                          onClick={() => {
                            setDstValue(null);
                            if (showScores === "hide") {
                              if (x === dstValue && y === decisionValue) {
                                setDstValue(null);
                                setDecisionValue(null);
                              } else {
                                setDstValue(x);
                                setDecisionValue(y);
                              }
                            } else if (showScores === "show") {
                              if (x === dstScoreValue && y === decisionValue) {
                                setDstScoreValue(null);
                                setDecisionValue(null);
                                setDstValue(null);
                              } else {
                                setDstValue(null);
                                setDstScoreValue(x);
                                setDecisionValue(y);
                              }
                            }
                          }}
                          style={{
                            backgroundColor: getColor(count),
                            color: count / maxCount > 0.5 ? "white" : "black",
                            borderRight: superHeaderBorders.includes(index + 1)
                              ? "2px solid #ccc"
                              : undefined,
                            cursor: "pointer",
                            outline: isSelected ? "2px solid #333" : undefined,
                            opacity: fadeOut ? 0.3 : 1,
                          }}
                        >
                          {count > 0 ? count.toLocaleString() : ""}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              textAlign: "center",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            DST Recommendation
          </div>
          <div
            style={{ display: "flex", width: "100%", alignItems: "stretch" }}
          >
            {/* Y-axis label (rotated) */}
            <div
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontWeight: 600,
                fontSize: "14px",
                textAlign: "center",
                padding: "4px 0",
                color: "#264361",
                marginRight: "8px",
              }}
            >
              {yKey}
            </div>
            <div style={{ flex: 1 }}>
              {/* Y-axis label (rotated) */}
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "4px 0",
                  color: "#264361",
                }}
              ></div>

              {/* Outer grid for axis labels and heatmap */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gridTemplateRows: "auto 1fr",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <div
                  className="heatmap-grid"
                  style={{
                    gridColumn: "2 / span 1",
                    gridRow: "2 / span 1",
                    display: "grid",
                    gridTemplateColumns: gridTemplateColumns,
                    gridTemplateRows: `auto auto repeat(${yLabels.length}, 1fr)`,
                  }}
                >
                  {/* Super header row */}
                  {children} {/* top-left corner cell */}
                  {(() => {
                    const groups = [
                      { label: "Released", min: -3, max: 6 },
                      { label: "Released with Conditions", min: 7, max: 14 },
                      { label: "Detained", min: 15, max: Infinity },
                    ];

                    return groups.map((group, idx) => {
                      const columns = xLabels.filter(
                        (x) => x >= group.min && x <= group.max
                      );
                      if (columns.length === 0) return null;

                      return (
                        <div
                          key={`super-${group.label}`}
                          style={{
                            gridColumn: `span ${columns.length}`,
                            textAlign: "center",
                            fontWeight: "400",
                            padding: "6px 0",
                            backgroundColor: "#f4f4f4",
                            borderBottom: "1px solid #ccc",
                            borderRight:
                              idx < groups.length - 1
                                ? "2px solid #ccc"
                                : "none",
                            fontSize: "14px",
                            cursor: group.label === "" ? "auto" : "pointer",
                            backgroundColor:
                              dstValue === group.label ? "#bfe9fd" : "inherit",
                          }}
                          onClick={() => {
                            setDstScoreValue(null);
                            group.label === ""
                              ? null
                              : dstValue === group.label
                              ? setDstValue(null)
                              : setDstValue(group.label);
                          }}
                        >
                          {group.label}
                        </div>
                      );
                    });
                  })()}
                  {/* X labels row */}
                  <div></div> {/* left-side empty for y-labels */}
                  {xLabels.map((x, index) => (
                    <div
                      key={`x-${x}`}
                      onClick={() => {
                        if (showScores === "hide") {
                          setDstScoreValue(null);
                          x === dstValue ? setDstValue(null) : setDstValue(x);
                        }
                      }}
                      className="heatmap-label x-label"
                      style={{
                        borderRight: superHeaderBorders.includes(index + 1)
                          ? "2px solid #ccc"
                          : undefined,
                        cursor: showScores === "hide" ? "pointer" : "auto",
                        backgroundColor:
                          showScores === "hide" && dstValue === x
                            ? "#bfe9fd"
                            : dstScoreValue === x
                            ? "#bfe9fd"
                            : "inherit",
                        fontSize: "12px",
                        padding: "6px 4px",
                        textAlign: "center",
                      }}
                    >
                      {x}
                    </div>
                  ))}
                  {yLabels.map((y) => (
                    <React.Fragment key={`row-${y}`}>
                      <div
                        className="heatmap-label y-label"
                        onClick={() =>
                          y === decisionValue
                            ? setDecisionValue(null)
                            : setDecisionValue(y)
                        }
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            decisionValue === y ? "#bfe9fd" : "inherit",
                        }}
                      >
                        {y}
                      </div>
                      {xLabels.map((x, index) => {
                        const count = counts[`${x}|${y}`] || 0;
                        const isSelected =
                          (showScores === "hide" &&
                            x === dstValue &&
                            y === decisionValue) ||
                          (showScores === "show" &&
                            x === dstScoreValue &&
                            y === decisionValue);

                        const fadeOut =
                          (dstScoreValue && x !== dstScoreValue) ||
                          (showScores === "show" &&
                            dstValue &&
                            !groupings.some(
                              (group) =>
                                x >= group.min &&
                                x <= group.max &&
                                group.label === dstValue
                            )) ||
                          (showScores === "show" &&
                            decisionValue &&
                            y !== decisionValue);

                        return (
                          <div
                            key={`${x}|${y}`}
                            className="heatmap-cell"
                            onClick={() => {
                              setDstValue(null);
                              if (showScores === "hide") {
                                if (x === dstValue && y === decisionValue) {
                                  setDstValue(null);
                                  setDecisionValue(null);
                                } else {
                                  setDstValue(x);
                                  setDecisionValue(y);
                                }
                              } else if (showScores === "show") {
                                if (
                                  x === dstScoreValue &&
                                  y === decisionValue
                                ) {
                                  setDstScoreValue(null);
                                  setDecisionValue(null);
                                  setDstValue(null);
                                } else {
                                  setDstValue(null);
                                  setDstScoreValue(x);
                                  setDecisionValue(y);
                                }
                              }
                            }}
                            style={{
                              backgroundColor: getColor(count),
                              color: count / maxCount > 0.5 ? "white" : "black",
                              borderRight: superHeaderBorders.includes(
                                index + 1
                              )
                                ? "2px solid #ccc"
                                : undefined,
                              cursor: "pointer",
                              outline: isSelected
                                ? "2px solid #333"
                                : undefined,
                              opacity: fadeOut ? 0.3 : 1,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            {count > 0 ? count.toLocaleString() : ""}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Heatmap;
