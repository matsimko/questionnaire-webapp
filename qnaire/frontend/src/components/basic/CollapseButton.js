import { IconButton, Tooltip } from "@mui/material";
import * as React from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

export default function CollapseButton({
  collapsed,
  onClick,
  tooltipCollapse,
  tooltipShow,
}) {
  return (
    <Tooltip title={collapsed ? tooltipShow : tooltipCollapse}>
      <IconButton onClick={onClick}>
        {collapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
      </IconButton>
    </Tooltip>
  );
}

CollapseButton.defaultProps = {
  tooltipCollapse: "Schovat",
  tooltipShow: "Rozevřít",
};
