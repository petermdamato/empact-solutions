"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import Selector from "@/components/Selector/Selector";
import { useEffect, useState } from "react";
import "./styles.css";

import { dataAnalysis } from "@/utils/aggFunctions";

export default function Overview() {
  const { csvData } = useCSV();
  const [loading, setLoading] = useState(true);
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [detentionType] = useState("alternative-to-detention");
  const [programTypeArray, setProgramTypeArray] = useState([]);
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([]);

  const onSelectChange = (e) => {
    setSelectedYear(e.target.value);
  };

  useEffect(() => {
    const uniqueYears = [
      ...new Set(
        csvData.map((row) => {
          const date = new Date(row.ATD_Entry_Date);
          return date.getFullYear();
        })
      ),
    ]
      .sort()
      .filter((year) => !isNaN(year));

    setYearsArray(uniqueYears);
    let programTypeArrayInt = [...new Set(csvData.map((obj) => obj.Facility))]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [csvData]);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const updatedDataArray1 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",

              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];
      const updatedDataArray2 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];
      const updatedDataArray3 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];
      const updatedDataArray4 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData.filter(
                (entry) =>
                  programType === "All Program Types" ||
                  entry.Facility === programType
              ),
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];
      setDataArray1(updatedDataArray1);
      setDataArray2(updatedDataArray2);
      setDataArray3(updatedDataArray3);
      setDataArray4(updatedDataArray4);
      setLoading(false);
    }, 0);
  }, [csvData, selectedYear, programType]);
  // useEffect(() => {
  //   setDataArray1([
  //     [
  //       {
  //         category: "Gender",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",

  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "Gender"
  //         ),
  //       },
  //       {
  //         category: "Age at admission",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "Age"
  //         ),
  //       },
  //       {
  //         category: "Race/ethnicity",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "RaceEthnicity"
  //         ),
  //       },
  //       {
  //         category: "New offenses (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Technicals (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Post-disposition",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countAdmissions",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //     ],
  //   ]);
  //   setDataArray2([
  //     [
  //       {
  //         category: "Gender",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "Gender"
  //         ),
  //       },
  //       {
  //         category: "Age at admission",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "Age"
  //         ),
  //       },
  //       {
  //         category: "Race/ethnicity",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "RaceEthnicity"
  //         ),
  //       },
  //       {
  //         category: "New offenses (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Technicals (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Post-disposition",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "countReleases",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //     ],
  //   ]);
  //   setDataArray3([
  //     [
  //       {
  //         category: "Gender",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "Gender"
  //         ),
  //       },
  //       {
  //         category: "Age at admission",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "Age"
  //         ),
  //       },
  //       {
  //         category: "Race/ethnicity",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "RaceEthnicity"
  //         ),
  //       },
  //       {
  //         category: "New offenses (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Technicals (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Post-disposition",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "lengthOfStay",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //     ],
  //   ]);
  //   setDataArray4([
  //     [
  //       {
  //         category: "Gender",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "Gender"
  //         ),
  //       },
  //       {
  //         category: "Age at admission",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "Age"
  //         ),
  //       },
  //       {
  //         category: "Race/ethnicity",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "RaceEthnicity"
  //         ),
  //       },
  //       {
  //         category: "New offenses (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Technicals (pre-dispo)",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //       {
  //         category: "Post-disposition",
  //         header: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "OffenseOverall"
  //         ),
  //         body: dataAnalysis(
  //           csvData.filter(
  //             (entry) =>
  //               programType === "All Program Types" ||
  //               entry.Facility === programType
  //           ),
  //           "averageDailyPopulation",
  //           selectedYear,
  //           detentionType,
  //           "OffenseCategory"
  //         ),
  //       },
  //     ],
  //   ]);
  // }, [csvData, selectedYear, programType]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="ATD Utilization"
            subtitle="Table"
            selectedYear={selectedYear}
            onSelectChange={onSelectChange}
            dropdownOptions={yearsArray}
            useDropdown
          >
            <Selector
              values={programTypeArray}
              variable={"Program Type"}
              selectedValue={programType}
              setValue={setProgramType}
            />
          </Header>
          {loading ? (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          ) : (
            <PillContainer
              data={[
                {
                  title: "Entries",
                  data: dataArray1,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
                {
                  title: "Exits",
                  data: dataArray2,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
                {
                  title: "LOS",
                  data: dataArray3,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
                {
                  title: "ADP",
                  data: dataArray4,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
