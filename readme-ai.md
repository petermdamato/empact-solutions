# EMPACT-SOLUTIONS

![Languages](Next, React, D3)
![Major Libraries](Firebase, mapbox, maplibre, jspdf, xlsx, dom-to-image)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Development Quick Start](#development-quick-start)
  - [Components](#components)
- [Build](#build-for-the-web)

## Overview

The Empulse dashboard takes CSV and XLS/XLSX uploads and converts them into data arrays. The data is analyzed and then displayed on pages with specific visualizations tied to each. The data is kept in the front end, ensuring that client data never falls under the governance of Empact.

## Project Structure

```
└── empact-solutions/
    ├── README.md
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── public/
    │   ├── background-login.png
    │   ├── data/
    |   ├── magnifying_glass.png
    │   ├── logo.png
    │   ├── screenshot.jpg
    │   └── static/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── constants/
    │   ├── context/
    │   ├── lib/
    │   ├── pages/
    │   └── utils/
    └── yarn.lock
```

## Getting Started

To run the dashboard locally, run `yarn install`, then run `yarn run dev`. This will launch the tool on localhost.

The dashboard requires a CSV or XLS uploaded in order to allow the user to navigate to the visualization pages. The file CSVUploader runs checks to ensure all necessary columns are present and then adds columns Screened/not screened and DST v Actual comparison, and parses dates from Date_of_Birth, ATD_Entry_Date, Admission_Date, Release_Date, Intake_Date, ATD_Exit_Date and DispositionDate. The CSV/XLS data is held in React context and can be extracted in any component/page by using CSVContext.

Navigation is done through SidebarContext, moving through paths on the Sidebar (using Next Link component) prevents the app from exiting the CSVContext that is required to keep the data held in app context.

## Usage

After logging in the user uploads a CSV or XLS or XLSX file to the tool, using the dropzone in the upload functionality. If columns are missing, misnamed or contain the wrong data type, an error message will show on the upload modal and the upload will fail. The errors are contained in the file dataTypes.js.

The user can also set a custom url in the settings function that will allow them to link out their detention screening table and distribution charts to their local detention lookup tool. If this is not saved, the link will bring up the modal for settings. They can also set which variables are sorted alphabetically and which are sorted by value.

## Development Quick Start

The text in Glossary can be updated by editing static/terms and static/additionalNotes. User Guide must be updated by directly editing the user-guide/page.js file.

Apart from these files, all pages run analysis scripts that process the data, typically by a calculation type, such as average length of stay.

Calculations:

Admissions/Entries (Count of Admission_Date or ATD_Entry_Date falling within year, depending on detention type)
Exits (Count of ATD_Exit_Date falling within year, depending on detention type)
Length of Stay (Average or median of number of days for youth to stay in detention, depending on detention type)
Average Daily Population (Calculated by Total Detention Days Within the Selected Date Range / Days in Date Range)
In practice, the ADP formula runs by assigning a number to each youth record based on the year selected.
If no Admission_Date/ATD_Entry_Date, the number is 0. If Admission_Date/ATD_Entry_Date is after the end of the year, or Release_Date/ATD_Exit_Date are before the start of the year, the number is 0.

    If Admission_Date/ATD_Entry_Date is before the start of the year, clamp the start date to the first day of the year.
    If Release_Date/ATD_Exit_Date is blank or after the year, clamp the end date to the end of the year.
    Then take the end date and take the number of days from the start date, plus 1.

    Sum all the youth numbers for that year up, then divide by 365 (or 366 on a leap year).

Any filters applied to the data are done by filtering against the csv data array (at the highest level of data processing in each page) and then calling the data analysis scripts again to make calculations.

Each page will import the visualization type to be displayed, with the exception of charts fed into the PillContainer and TileContainer components.

The types of charts that can be displayed in a PillContainer are as follows:

    ColumnChart and StackedColumnChart
    Tables (Basic and calculation type)
    StackedBarChart (Basic, median and average)
    ChangeStatistics (Which displays YoY change)
    DistributionChart

TileContainer is used to display the following side-by-side in a container:

    DistributionChartV2 (For the skinny rects)
    DistributionChartStacked (Bucketed values broken down by chosen category)

The grid style pages (Admissions, Entries, Exits, Length of Stay, Average Daily Population) use a dictionary of starting height ratios to calculate how much space each container should take up in a responsive design.

```
E.g.: const columnConstants = {
   column1: [0, 286, 286],
   column2: [270, 180, 200],
   column3: [160, 260, 230],
 };
```

There is a state called columnHeights that will give you the output values for heights.

If new categories/charts are added, a new category analysis formula will need to be introduced and the filter variables useEffect will also need to be adjusted to incorporate the new filter.

On load, these pages calculate what is the widest left-hand margin to left-align the bars to one another. Each chart component must be passed setMaxLabelWidth and maxLabelWidth to utilize this feature.

## Components

Navigation goes through the Sidebar component, with the order and navigation controlled through the menuItems array.

const menuItems = [
{
label: "Secure Detention",
subItems: ["Detention Overview", "Table", ...],
access: "Inactive" // Requires CSV data
},
// ...other menu items
];

Sign-out button triggers Firebase auth signout, which redirects to /api/auth/signin

There must be corresponding folders with page.js files in them to route from the label attribute. The component converts labels to URL-safe paths (e.g., "Length of Stay (LOS)" becomes length-of-stay-los).

Tracks active menu item with context.

The most common data visualization component is the _StackedBarChartGeneric_, a bar chart that can have stacked components but currently does not.

    <StackedBarChartGeneric
        data={Array of categories with values}
        breakdowns={Use ["total"] as array, unless other values are in the breakdowns}
        height={Use the relevant value from columnHeights (e.g. columnHeights.column2[0] for the first chart in the second column)}
        margin={{ top: 0, right: 60, bottom: 30, left: 20 } or preferred value}
        chartTitle={Chart title}
        colorMapOverride={can assign values to override default colors, by mapping {category:'color'}}
        groupByKey={Category name}
        showChart={show tooltip, also requires innerData or postDispoData array}
    />

Passing the maxLabelWidth and setMaxLabelWidth allows for the chart to fit the left-align rule.

Passing toggleFilter and filterVariables allow for the filter by category value to function.

The chart resizes on change in height.

The _PieChartV2_ component displays proportional data as slices of a pie, with interactive features like tooltips and filtering.

    <PieChart
    records={Array of objects with category, value, and percentage properties}
    size={Use the relevant value from columnHeights (e.g. columnHeights.column1[0] for the first chart in the first column)}
    chartTitle={Chart title}
    groupByKey={Category name for filtering}
    detentionType={"secure-detention" or "alternative-to-detention"}
    offset={Vertical offset adjustment}
    />

Passing toggleFilter and filterVariables allow for the filter by category value to function.

The chart resizes on change in height.

Example usage:

    <PieChart
        records={[
        { category: "Felonies", value: 45, percentage: 0.45 },
        { category: "Misdemeanors", value: 35, percentage: 0.35 },
        { category: "Technicals", value: 20, percentage: 0.20 }
        ]}
        size={columnHeights.column1[0]}
        chartTitle="Offenses by Type"
        groupByKey="OffenseCategory"
        toggleFilter={handleFilterToggle}
        filterVariable={currentFilter}
        detentionType="secure-detention"
    />

The component includes a tooltip that appears on hover, showing the category name, absolute value, and percentage. Clicking a slice will filter the data by that category (or clear the filter if clicked again).

The _ColumnChartGeneric_ displays categorical data as vertical bars with value labels, interactive filtering, and tooltips.

    <ColumnChartGeneric
    data={Array of objects with category and value properties}
    height={Use the relevant value from columnHeights (e.g. columnHeights.column2[0] for the first chart in the second column)}
    margin={{ top: 60, right: 20, bottom: 30, left: 40 } or custom margins}
    chartTitle={Chart title}
    groupByKey={Category name for filtering}
    calculationType={Type of calculation, "median" or "average"}
    />

Passing toggleFilter and filterVariables allow for the filter by category value to function.

The chart resizes on change in height.

Example Usage:

    <ColumnChartGeneric
    data={[
    { category: "Screened", value: 45, count: 45 },
    { category: "Not Screened", value: 30, count: 30 },
    { category: "Auto Hold", value: 60, count: 60 }
    ]}
    height={columnHeights.column1[0]}
    chartTitle="LOS by Screened/not screened"
    groupByKey="Screened/not screened"
    calculationType="average"
    />

The component includes an EnhancedTooltip that appears on hover. Clicking a bar will filter the data by that category (or clear the filter if clicked again). The chart automatically adjusts its width to fit its container while maintaining the specified height.

The _Heatmap_ visualizes the relationship between two categorical variables using a color-coded matrix with interactive filtering capabilities.

    <Heatmap
    data={Array of record objects, these records can be filtered}
    dataSkeleton={Array for first load - creates the shape of the chart}
    xKey={Column header key}
    yKey={Row header key}
    datesRange={[startDate, endDate]}
    chartTitle={Overall chart title}
    showScores={"show" or "hide"}
    >
    {children}
    </Heatmap>

The values for actual decision are in decisionValue state and the values for the DST score are in dstScoreValue state. dstValue holds the bucket the DST score falls in. These states must be passed in to the Heatmap as well.

Styling:
Default color: rgba(38, 67, 97, opacity) (dark blue)
Selected elements highlighted in #bfe9fd (light blue)

Behavior:
Automatically buckets scores ≥100 into 100-point groups

Groups DST scores into standard ranges:

Released: ≤6
Released w/Conditions: 7-14
Detained: ≥15

Fades non-selected items when filters active

Example Usage:

    <Heatmap
    data={detentionRecords}
    dataSkeleton={allPossibleCombinations}
    xKey="DST_Score"
    yKey="Final_Decision"
    datesRange={[new Date("2023-01-01"), new Date("2023-12-31")]}
    chartTitle="Decisions by DST Score"
    showScores="show"
    dstValue={selectedGroup}
    setDstValue={setSelectedGroup}
    dstScoreValue={selectedScore}
    setDstScoreValue={setSelectedScore}
    decisionValue={selectedDecision}
    setDecisionValue={setSelectedDecision}
    setRecordsTableObject={setShowRecordsTable}
    >
        <Selector
            values={["show", "hide"]}
            variable="calc"
            selectedValue={showScores}
            setValue={setShowScores}
            labelMap={{ show: "Show", hide: "Hide" }}
        />
    </Heatmap>

The component includes three filter levels (group, score, and decision) that can be combined. Clicking the "View Records" button will display the underlying records table. The heatmap automatically adjusts its appearance based on the showScores prop, with different layouts for full score display versus simplified views.

The _ZipMap_ displays geographic distribution of juvenile detention data by ZIP code using an interactive map with color-coded intensity and statistical overlays.

    <ZipMap
    csvData={Array of raw CSV records}
    selectedYear={Year for data}
    persistMap={true/false}
    metric={Name of the metric such as averageDailyPopulation or admissions}
    detentionType={"secure-detention" or "alternative-to-detention"}
    />

Passing persistMap and setPersistMap allows the map to remain open when not being interacted with.

The csvData array is a raw array of records, but is passed to mapAggregate by the ZipMap component to analyze per-zip-code into count, median and average.

The map has dynamic ZIP code loading if the county and state are listed in this format (e.g. Marion County, IN). The component automatically takes the bounding box — the shape that contains all of the geographic boundaries that have related data — and zooms to that bounding box. Color intensity scales based on metric values. The user can zoom in and out of the map when open is persisted.

Color scale: [#fee5d9, #fcae91, #fb6a4a, #cb181d]

Data Requirements:

CSV records must include: ZIP (5-digit ZIP code)
CountyName ("County, STATE" format)
Intake_Date/Release_Date or equivalent for ATD
LengthOfStay field when using duration metrics

Example Usage:

    <ZipMap
    csvData={detentionRecords}
    selectedYear={2023}
    persistMap={mapVisible}
    setPersistMap={setMapVisible}
    setShowMap={setShowMap}
    metric="averageLengthOfStay"
    detentionType="secure-detention"
    />

## Build for the Web

The application is contained on a GitHub repository with a corresponding [Vercel deployment](https://empact-solutions.vercel.app/detention-overview).

If you want a build to deploy on a static website, run `npm run build` in the project directory on your local machine. This will generate the files that can be hosted in a directory on your site.

Note: The signin page (located in the directory as api/auth/signin) relies on server-side routing via Next Auth and will need to be replaced with a client-side process using something like Firebase Auth, Supabase Auth or Auth0.
