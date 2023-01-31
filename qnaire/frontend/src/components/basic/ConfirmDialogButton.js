import { Button } from "@mui/material";
import * as React from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function ConfirmDialogButton({
  buttonText,
  buttonProps,
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button {...buttonProps} onClick={handleClickOpen}>
        {buttonText}
      </Button>
      <ConfirmDialog onClose={handleClose} open={open} {...props} />
    </React.Fragment>
  );
}
