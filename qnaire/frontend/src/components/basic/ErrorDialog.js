import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Typography } from "@mui/material";

export default function ErrorDialog({ open, onClose, title, error }) {
  return (
    <Dialog open={open} onClose={onClose}>
      {title && <DialogTitle id="error-dialog-title">{title}</DialogTitle>}
      <DialogContent>
        {Object.keys(error).map((key) => (
          <Typography color="error" key={key}>
            {error[key]}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
