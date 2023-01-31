import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

const COPY_TOOLTIP = "Zkopírovat odkaz";
const COPY_DONE_TOOLTIP = "Zkopírováno"

export default function QnaireLinkDialog({ getLink, buttonProps }) {
  const [open, setOpen] = React.useState(false);
  const [link, setLink] = React.useState(null);
  const [tooltipTitle, setTooltipTitle] = React.useState(COPY_TOOLTIP);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        {...buttonProps}
        onClick={() =>
          getLink().then((link) => {
            setLink(link);
            setOpen(true);
          })
        }
      >
        Získat odkaz
      </Button>
      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <DialogContentText
            
          > */}
          <Card
            variant="outlined"
            sx={{ overflowX: "auto", whiteSpace: "nowrap", flexGrow: 1 }}
          >
            <Tooltip title={tooltipTitle} arrow>
              <CardActionArea
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  setTooltipTitle(COPY_DONE_TOOLTIP)
                }}
                onMouseLeave={() => {
                  setTooltipTitle(COPY_TOOLTIP)
                }}
                sx={{ p: 1 }}
              >
                <Typography>{link}</Typography>
              </CardActionArea>
            </Tooltip>
          </Card>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hotovo</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
