const Selector = ({
  values,
  variable,
  selectedValue,
  setValue,
  labelMap,
  secondarySetValue = null,
}) => {
  const handleChange = (e) => {
    if (secondarySetValue) {
      secondarySetValue([]);
    }
    const value = e.target.value;
    setValue(value);
  };

  if (!values || values.length === 0) return null;

  return (
    <div className="flex flex-col" style={{ marginLeft: "8px" }}>
      <label
        className="mb-1 dropdown-select-label"
        style={{ fontSize: "14px" }}
      >
        {variable === "calc" ? "" : variable}
      </label>
      <div className="relative w-48">
        <select
          className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 w-full text-gray-700 cursor-pointer focus:outline-none focus:border-blue-500"
          value={selectedValue}
          style={{
            backgroundColor: "white",
            color: "black",
            padding: "4px 4px",
          }}
          onChange={handleChange}
        >
          {values.map((value) => (
            <option key={value} value={value}>
              {labelMap && labelMap[value] ? labelMap[value] : value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Selector;
