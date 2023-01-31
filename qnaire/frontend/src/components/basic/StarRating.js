import * as React from "react";
import Rating from "@mui/material/Rating";

const getIconSize = (totalIcons) => {
  return Math.min(60, 300 / totalIcons);
};

export default function StarRating({ onChange, max, ...props }) {
  return (
    <Rating
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      {...props}
      max={max}
      sx={{ fontSize: getIconSize(max) }}
    />
  );
}
