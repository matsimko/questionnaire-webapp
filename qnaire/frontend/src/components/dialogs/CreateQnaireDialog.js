import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import * as yup from "yup";
import { ErrorMessage, Field, Form, Formik, useFormik } from "formik";
import ErrorList from "../basic/ErrorList";
import FSwitch from "../formik/FSwitch";
import FTextField from "../formik/FTextField";
import ErrorText from "../basic/ErrorText";

const initialValues = { name: "" };

const validationSchema = yup.object({
  name: yup.string("Zadejte jméno").required("Jméno nesmí být prázdné"),
});

export default function CreateQnaireDialog({
  buttonProps,
  open,
  onSubmit,
  onClose,
}) {
  const [error, setError] = React.useState(null);

  const submit = (values) => {
    onSubmit(values)
      .then(() => setError(null))
      .catch((error) => setError(error));
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        onSubmit={submit}
        validationSchema={validationSchema}
      >
        <Form>
          <DialogTitle>Vytvořit dotazník</DialogTitle>
          <DialogContent>
            {/* <DialogContentText></DialogContentText> */}
            <FTextField margin="dense" autoFocus name="name" label={"Jméno"} />
            {error && <ErrorText error={error.name} />}
            {error && <ErrorList error={error} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Zrušit</Button>
            <Button type="submit">Vytvořit</Button>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
}
