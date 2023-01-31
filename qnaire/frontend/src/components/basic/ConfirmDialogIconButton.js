import { IconButton, Tooltip } from "@mui/material";
import * as React from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function ConfirmDialogIconButton({
  icon: Icon,
  size,
  tooltip,
  title,
  text,
  onConfirm,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title={tooltip}>
        <span> 
          <IconButton size={size} onClick={handleClickOpen} disabled={disabled}>
            <Icon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <ConfirmDialog
        onClose={handleClose}
        open={open}
        onConfirm={onConfirm}
        text={text}
        title={title}
      />
    </div>
  );
}
