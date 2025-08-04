"use client";

import { useState } from "react";
import Header from "@/components/Header/Header";
import "./styles.css";
import { useLinkOut } from "@/context/LinkOutContext";
import { useTags } from "@/context/TagsContext";
import { Autocomplete, TextField } from "@mui/material";

function arraysEqualUnordered(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export default function Overview() {
  const { linkOut, setLinkOut } = useLinkOut();
  const { selectedTags, setSelectedTags } = useTags();

  const [inputValue, setInputValue] = useState("");
  const [localTags, setLocalTags] = useState(selectedTags || []);

  const options = [
    "age",
    "category",
    "disruption type",
    "exit to",
    "facility",
    "gender",
    "jurisdiction",
    "program type",
    "race/ethnicity",
    "reason for detention",
  ];

  const handleSaveLinkOut = () => {
    setLinkOut(inputValue);
  };

  const handleSaveTags = () => {
    setSelectedTags(localTags);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="Settings"
            subtitle=""
            caption="Update admin settings for linkout below"
            year=""
          />
          <div
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              maxWidth: "500px",
            }}
          >
            <label htmlFor="linkInput">
              Enter the prefix URL for linking to your CMS:
            </label>
            <input
              id="linkInput"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste your link here"
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
                border: "1px solid #ccc",
                backgroundColor: "white",
                color: "black",
                borderRadius: "4px",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={handleSaveLinkOut}
                disabled={linkOut === inputValue}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#333a43",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: linkOut === inputValue ? "#999" : "#333a43",
                  cursor: linkOut === inputValue ? "not-allowed" : "pointer",
                }}
              >
                Save
              </button>
              {linkOut && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    marginLeft: "16px",
                    color: "#555",
                  }}
                >
                  Saved link: <strong>{linkOut}</strong>
                </p>
              )}
            </div>

            {/* Multi-select tagging component */}
            <div style={{ marginTop: "2rem" }}>
              <label
                htmlFor="tagSelect"
                style={{ display: "block", marginBottom: "0.5rem" }}
              >
                Sort topics below by value (other topics sorted alphabetically):
              </label>
              <Autocomplete
                multiple
                id="tagSelect"
                options={options}
                value={localTags}
                onChange={(event, newValue) => setLocalTags(newValue)}
                getOptionLabel={(option) => option.replaceAll("_", " ")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Select tags"
                  />
                )}
                renderValue={(selected) => (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {selected.map((option, index) => (
                      <span
                        key={index}
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          margin: "2px",
                          backgroundColor: "#333a43",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {option.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
                style={{ width: "100%" }}
              />

              <button
                onClick={handleSaveTags}
                disabled={arraysEqualUnordered(localTags, selectedTags)}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: arraysEqualUnordered(localTags, selectedTags)
                    ? "#999"
                    : "#333a43",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: arraysEqualUnordered(localTags, selectedTags)
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Save Sorted
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
