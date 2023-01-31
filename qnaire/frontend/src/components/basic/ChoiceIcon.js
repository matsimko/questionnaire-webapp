import { Checkbox, Radio } from "@mui/material";
import React from "react";

export function ChoiceIcon(props) {
  return props.checkbox ? (
    <Checkbox checked={false} />
  ) : (
    <Radio checked={false} />
  );
}
