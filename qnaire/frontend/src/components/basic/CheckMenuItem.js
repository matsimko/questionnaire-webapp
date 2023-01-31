import Check from "@mui/icons-material/Check";
import { ListItemIcon, MenuItem, ListItemText } from "@mui/material";
import * as React from "react";

export default function CheckMenuItem({ checked, onChange, text }) {
  return (
    <MenuItem onClick={() => onChange(!checked)}>
      <ListItemIcon>{checked && <Check />}</ListItemIcon>
      <ListItemText>{text}</ListItemText>
    </MenuItem>
  );
}
