const Selector = ({ values, variable, selectedValue, setValue }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    setValue(value);
  };

  if (!values || values.length === 0) return;

  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-lg font-normal">
        {variable !== "Show Labels" && variable !== "Explore" && "Select"}{" "}
        {variable}
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
          {values.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Selector;
