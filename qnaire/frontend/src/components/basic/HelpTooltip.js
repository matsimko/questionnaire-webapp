import * as React from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Tooltip } from "@mui/material";

export default function HelpTooltip(props) {
  return (
    <Tooltip {...props}>
      <HelpOutlineIcon fontSize="large" color="disabled" />
    </Tooltip>
  );
}
