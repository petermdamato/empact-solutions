"use client";
import React, { useState, useEffect } from "react";
import "./styles.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";

export default function Glossary() {
  const [terms, setTerms] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const termsResponse = await fetch("/static/terms.json");
        const notesResponse = await fetch("/static/additionalNotes.json");

        const termsData = await termsResponse.json();
        const notesData = await notesResponse.json();

        setTerms(termsData);
        setAdditionalNotes(notesData);
      } catch (error) {
        console.error("Error loading JSON data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          {/* Updated Header */}
          <Header
            title="Data Glossary"
            subtitle=""
            year=""
            caption="The glossary provides information about key terms used throughout this workbook"
          />
          <div className="terms-content">
            <div className="terms-section">
              {terms.map((item, index) => (
                <p key={index}>
                  <span className="bold-term">{item.term}:</span>
                  {item.definition}
                </p>
              ))}

              {/* Additional Notes */}
              <div className="notes-box">
                <h2>*Additional Notes:</h2>
                {additionalNotes.map((item, index) => (
                  <p key={index}>
                    {item.term !== "" && (
                      <span className="bold-term">{item.term}:</span>
                    )}
                    <span
                      className={
                        index === additionalNotes.length - 1
                          ? "italic-term"
                          : ""
                      }
                    >
                      {item.definition}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
