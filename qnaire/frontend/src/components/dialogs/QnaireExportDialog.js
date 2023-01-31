import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

export default function QnaireExportDialog({ exportResult, buttonProps }) {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        Exportovat odpovědi
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Vyberte formát, do kterého chcete exportovat odpovědi
        </DialogTitle>
        <DialogContent>
          {/* <DialogContentText   
          > */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={() => exportResult("csv")}>
              CSV
            </Button>
            <Button variant="contained" onClick={() => exportResult("json")}>
              JSON
            </Button>
          </Stack>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hotovo</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
