import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import ETextField from "../fields/ETextField";

export function EditableText(props) {
  return !props.editable ? (
    <Typography {...props.typographyProps} sx={{ whiteSpace: "pre-wrap" }}>
      {props.value}
    </Typography>
  ) : (
    <ETextField
      error={props.error}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      {...props.textFieldProps}
      onFocus={(e) => {
        if (props.selectOnFocus) {
          e.target.select();
        }
      }}
      fullWidth
    />
  );
}

EditableText.defaultProps = {
  value: "",
  editable: false,
  textFieldProps: {},
};
