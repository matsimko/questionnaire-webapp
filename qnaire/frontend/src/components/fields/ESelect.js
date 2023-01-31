import * as React from "react";
import {
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  FormHelperText,
} from "@mui/material";

//required prop: name
export default function ESelect({
  required,
  label,
  error,
  children,
  ...props
}) {
  error = Array.isArray(error) ? error.join("\n") : error;
  return (
    <FormControl fullWidth required={required}>
      <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
      <Select
        label={label}
        id={`${label}-select`}
        labelId={`${label}-select-label`}
        {...props}
      >
        {children}
      </Select>
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </FormControl>
  );
}
