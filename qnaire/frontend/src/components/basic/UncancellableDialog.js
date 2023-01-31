import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import * as React from "react";

export default function UncancellableDialog({ title, text }) {
  return (
    <Dialog open={true}>
      <DialogTitle>{title}</DialogTitle>
      {text && (
        <DialogContent>
          <DialogContentText>{text}</DialogContentText>
        </DialogContent>
      )}
    </Dialog>
  );
}
