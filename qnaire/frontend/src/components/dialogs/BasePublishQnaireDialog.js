import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControlLabel, FormGroup, Stack, Switch } from "@mui/material";
import { Form, Formik, useFormik } from "formik";
import FSwitch from "../formik/FSwitch";
import HelpTooltip from "../basic/HelpTooltip";

export default function BasePublishQnaireDialog({
  isAnonymous,
  isPrivate,
  onSubmit,
  title,
  buttonText,
  buttonProps,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const initialValues = { isPrivate, isAnonymous };
  const submit = (values) => {
    onSubmit(values);
  };

  return (
    <React.Fragment>
      <Button {...buttonProps} onClick={handleClickOpen}>
        {buttonText}
      </Button>
      <Dialog fullWidth open={open} onClose={handleClose}>
        <Formik initialValues={initialValues} onSubmit={submit}>
          <Form>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              {/* <DialogContentText>
          
        </DialogContentText> */}
              <Stack direction="row" alignItems="center">
                <FSwitch name="isPrivate" label="Soukromý" />
                <HelpTooltip title="Pro soukromý dotazník bude každý vygenerovaný odkaz platný pouze pro jedno úspěšné vyplnění." />
              </Stack>

              <Stack direction="row" alignItems="center">
                <FSwitch name="isAnonymous" label="Anonymní" />
                <HelpTooltip title="Anonymní dotazník může vyplnit kdokoliv. Neanonymní dotazník mohou vyplnit pouze respondenti s validním identifikátorem respondenta." />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Zrušit</Button>
              <Button type="submit">{buttonText}</Button>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
    </React.Fragment>
  );
}
