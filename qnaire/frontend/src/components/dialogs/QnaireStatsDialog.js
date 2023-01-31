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

export default function QnaireStatsDialog({ getStats, buttonProps }) {
  const [open, setOpen] = React.useState(false);
  const stats = React.useRef(null);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        {...buttonProps}
        onClick={() =>
          getStats().then((received_stats) => {
            stats.current = received_stats;
            setOpen(true);
          })
        }
      >
        Základní statistiky
      </Button>
      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Základní statistiky</DialogTitle>
        <DialogContent>
          {/* <DialogContentText   
          > */}
          {stats.current && (
            <Stack>
              <Typography>
                Počet odpovědí: {stats.current.total_responses}
              </Typography>
              <Typography>
                Datum a čas poslední odpovědi:{" "}
                {stats.current.last_response_timestamp !== null
                  ? new Date(stats.current.last_response_timestamp).toLocaleString("cs-cz")
                  : "\u2014"}
              </Typography>
            </Stack>
          )}

          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hotovo</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
