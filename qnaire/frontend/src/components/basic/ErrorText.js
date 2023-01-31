import * as React from "react";
import { Typography } from "@mui/material";

export default function ErrorText({ error, ...props }) {
  error = Array.isArray(error) ? error.join('\n') : error;
  return error ? (
    <Typography color="error" textAlign="center" {...props}>
      {error}
    </Typography>
  ) : null;
}
