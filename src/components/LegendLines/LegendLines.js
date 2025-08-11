"use client";

import { useEffect, useCallback } from "react";
import getColorByOption from "@/utils/categories/getColorByOption";

const LegendLines = ({
  options,
  selectedOptions,
  setSelectedOptions,
  setSelectedLegendDetails,
  containerHeight,
}) => {
  // Memoize the option details calculation
  const getOptionDetails = useCallback(() => {
    if (!options?.length) return [];

    return options.map((option, index) => ({
      label:
        option === "0" ? "Disrupted" : option === "1" ? "Undisrupted" : option,
      color: getColorByOption(option),
    }));
  }, [options]);

  // Only update legend details when options change
  useEffect(() => {
    if (options?.length) {
      setSelectedLegendDetails(getOptionDetails());
    }
  }, [options, getOptionDetails, setSelectedLegendDetails]);

  const toggleOption = useCallback(
    (option) => {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option]
      );
    },
    [setSelectedOptions]
  );

  if (!options?.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "12px",
      }}
    >
      {options.map((option, i) => {
        const isSelected = selectedOptions.includes(option);
        return (
          <div
            key={i}
            onClick={() => toggleOption(option)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "4px",
              background: "#f0f0f0",
              fontSize: "14px",
              cursor: "pointer",
              opacity: selectedOptions.length === 0 || isSelected ? 1 : 0.4,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                backgroundColor: getColorByOption(option),
                borderRadius: "50%",
              }}
            />
            <span>
              {option === "0"
                ? "Disrupted"
                : option === "1"
                ? "Undisrupted"
                : option}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LegendLines;
