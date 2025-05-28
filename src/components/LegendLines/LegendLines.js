// Simple hash-color generator based on index
const getColor = (label, index) => {
  const palette = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ];
  return palette[index % palette.length];
};

const LegendLines = ({ options, selectedOptions, setSelectedOptions }) => {
  if (!options?.length) return null;

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "16px",
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
                backgroundColor: getColor(option, i),
                borderRadius: "50%",
              }}
            />
            <span>
              {option === "0"
                ? "Unsuccessful"
                : option === "1"
                ? "Successful"
                : option}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LegendLines;
