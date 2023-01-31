import { TextField } from "@mui/material";
import { useField } from "formik";
import * as React from "react";

//required prop: name
export default function FTextField(props) {
  const [field, meta] = useField(props);
  return (
    <TextField
      {...props}
      {...field}
      fullWidth
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
    />
  );
}
