import { FormControlLabel, Switch } from "@mui/material";
import { useField } from "formik";
import * as React from "react";

export default function FSwitch({ label, ...props }) {
  const [field, meta] = useField({ ...props, type: "checkbox" });

  return (
    <FormControlLabel
      control={<Switch {...field} {...props} />}
      label={label}
    />
  );
}
