function getColorByOption(optionName, filterDimension = null) {
  const colorMap = {
    Disruptions: { 1: "#006890", 0: "#ff7b00" },

    "Race/Ethnicity": {
      Hispanic: "#fcb953",
      White: "#ff7b00",
      "African American or Black": "#006890",
      Asian: "#73c5e1",
      "American Indian or Alaska Native": "#9b4dca",
      "Native Hawaiian or Pacific Islander": "#5b8a72",
      "Two or more races": "#c02828",
      Unknown: "#ccc",
    },

    "Age at entry": {
      "10 and younger": "#ff7b00",
      "11-13": "#fcb953",
      "14-17": "#006890",
      "18+": "#c02828",
      Unknown: "#ccc",
    },

    Gender: {
      Male: "#006890",
      Female: "#ff7b00",
      Unknown: "#ccc",
    },

    "YOC/white": {
      White: "#ff7b00",
      YOC: "#006890",
    },

    "Offense category (pre-dispo)": {
      Felony: "#c02828",
      Misdemeanor: "#fcb953",
      "Status Offense": "#ff7b00",
      Technical: "#006890",
      Felonies: "#c02828",
      Misdemeanors: "#fcb953",
      "Status Offenses": "#ff7b00",
      Technicals: "#006890",
      Other: "#ccc",
    },

    "Pre/post-dispo": {
      "Pre-dispo": "#006890",
      "Post-dispo": "#ff7b00",
    },
  };

  const defaultColor = "#006890";

  if (filterDimension) {
    return colorMap[filterDimension]?.[optionName] ?? defaultColor;
  }

  // If filterDimension is not provided, search all mappings
  for (const map of Object.values(colorMap)) {
    if (optionName in map) {
      return map[optionName];
    }
  }

  return defaultColor;
}

export default getColorByOption;
