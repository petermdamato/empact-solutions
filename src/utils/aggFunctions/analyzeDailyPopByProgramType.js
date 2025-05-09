import {
  parse,
  eachDayOfInterval,
  isBefore,
  isAfter,
  isEqual,
  startOfYear,
  endOfYear,
} from "date-fns";
import { mean } from "d3-array";

function analyzeDailyPopByProgramType(data, selectedYear) {
  const format = "MM/dd/yy";

  // Get all days in the year
  const allDays = eachDayOfInterval({
    start: new Date(selectedYear, 0, 1),
    end: new Date(selectedYear, 11, 31),
  });

  // Group data by ATD_Program_Name
  const programGroups = {};
  data.forEach((row) => {
    const program = row.ATD_Program_Name || "Unknown";
    const entry = row.ATD_Entry_Date
      ? parse(row.ATD_Entry_Date, format, new Date())
      : null;
    const exit = row.ATD_Exit_Date
      ? parse(row.ATD_Exit_Date, format, new Date())
      : null;

    if (!programGroups[program]) programGroups[program] = [];

    programGroups[program].push({ entry, exit });
  });

  const results = {};

  // Calculate daily counts and ADP per program
  for (const [program, records] of Object.entries(programGroups)) {
    const dailyCounts = allDays.map((day) => {
      return records.reduce((count, { entry, exit }) => {
        if (!entry) return count;
        const started = isBefore(entry, day) || isEqual(entry, day);
        const notExited = !exit || isAfter(exit, day) || isEqual(exit, day);
        return started && notExited ? count + 1 : count;
      }, 0);
    });

    results[program] = mean(dailyCounts);
  }

  return results;
}

export default analyzeDailyPopByProgramType;
