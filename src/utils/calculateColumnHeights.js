export const calculateColumnHeightsStandard = (
  windowHeight,
  columnConstants
) => {
  // Calculate ratios for each column
  const calculateColumnRatios = (columns) => {
    return Object.values(columns).map((column) => {
      const total = column.reduce((sum, value) => sum + value, 0);
      return column.map((value) => value / total);
    });
  };

  // Calculate available height after accounting for fixed elements
  const calculateAvailableHeight = (windowHeight) => {
    const HEADER_HEIGHT = 60;
    const VERTICAL_PADDING = 72; // 24 * 3
    const GAPS = 24; // 12 * 6
    const MARGINS = 8; // Top
    return (
      windowHeight - 40 - HEADER_HEIGHT - VERTICAL_PADDING - GAPS - MARGINS
    );
  };

  const columnRatios = calculateColumnRatios(columnConstants);
  const availableHeight = calculateAvailableHeight(windowHeight);

  // Apply ratios to available height (with special handling for first column)
  return {
    column1: columnRatios[0].map((ratio) => (availableHeight - 52) * ratio),
    column2: columnRatios[1].map((ratio) => availableHeight * ratio),
    column3:
      columnRatios.length > 2
        ? columnRatios[2].map((ratio) => availableHeight * ratio)
        : [],
    column4:
      columnRatios.length > 3
        ? columnRatios[3].map((ratio) => availableHeight * ratio)
        : [],
  };
};
