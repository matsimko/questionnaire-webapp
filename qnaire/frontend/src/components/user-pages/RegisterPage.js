import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Form, Formik, useFormik } from "formik";
import * as yup from "yup";
import { Button, Stack, Container, Typography, Link } from "@mui/material";
import { POST } from "../../request";
import FTextField from "../formik/FTextField";
import { useAppContext } from "../../providers/AppContextProvider";
import userSource from "../../data/UserSource";
import ErrorList from "../basic/ErrorList";

const initialValues = {
  username: "",
  password: "",
  email: "",
};

const validationSchema = yup.object({
  username: yup.string().required("Uživatelské jméno nesmí být prázdné"),
  password: yup
    .string()
    .required("Heslo nesmí být prázdné")
    .min(8, "Heslo musí mít délku alespoň 8 znaků"),
  email: yup.string().email("Zadejte platnou emailovou adresu"),
});

export function RegisterPage({ auth }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setPageActions, setDrawerDisabled } = useAppContext();

  useEffect(() => {
    userSource.setShouldAuth(false);
    setPageActions([]);
    setDrawerDisabled(true);

    return () => {
      userSource.setShouldAuth(true);
      setDrawerDisabled(false);
    };
  }, []);

  function register(values) {
    userSource
      .create(values)
      .then((data) => {
        //log in after registering
        const { username, password } = values;
        POST("auth", { username, password }, false).then((data) => {
          auth.authenticate(data);
        });
      })
      .catch((error) => {
        setError(error);
      });
  }

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/questionnaires/");
    }
  }, [auth.isAuthenticated]);

  return (
    <Formik
      onSubmit={register}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      <Form>
        <Container maxWidth="xs">
          <Stack spacing={2}>
            <FTextField required name="username" label="Uživatelské jméno" />
            <FTextField
              required
              name="password"
              label="Heslo"
              type="password"
            />
            <FTextField name="email" label="Emailová adresa" type="email" />
            <Button color="primary" variant="contained" fullWidth type="submit">
              Registrovat
            </Button>
            <Link component={RouterLink} to="/login" variant="body2">
              Již máte účet? Přihlašte se.
            </Link>
            <ErrorList all error={error} />
          </Stack>
        </Container>
      </Form>
    </Formik>
  );
}
