import { Card } from "@mui/material";
import React from "react";

export function getSelectedStyle(isSelected) {
  const style = isSelected
    ? {
        border: 2,
        borderColor: "primary.light", //secondary.light
      }
    : {};
  return style;
}
