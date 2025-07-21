// context/TagsContext.js
"use client";

import React, { createContext, useContext, useState } from "react";

const TagsContext = createContext();

export const TagsProvider = ({ children }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <TagsContext.Provider value={{ selectedTags, setSelectedTags }}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTags = () => useContext(TagsContext);
