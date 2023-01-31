import { TextField } from "@mui/material";
import * as React from "react";

//required prop: name
export default function ETextField({ error, ...props }) {
  error = Array.isArray(error) ? error.join('\n') : error;
  return (
    <TextField {...props} error={Boolean(error)} helperText={error} />
  );
}
