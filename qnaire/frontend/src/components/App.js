import React, { useState } from "react";
import { render } from "react-dom";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Grid, Box, Container, CssBaseline } from "@mui/material";

import { QnairesPage } from "./qnaires-page/QnairesPage";
import { ResponsePage } from "./response-page/ResponsePage";
import { CreationPage } from "./creation-page/CreationPage";
import { LoginPage } from "./user-pages/LoginPage";
import { RegisterPage } from "./user-pages/RegisterPage";
import { AppStructure } from "./AppStructure";
import { useAuth } from "../auth";
import { AuthOnlyOutlet } from "./AuthOnlyOutlet";
import { AppContextProvider } from "../providers/AppContextProvider";
import { CustomThemeProvider } from "../providers/CustomThemeProvider";

function App() {
  const auth = useAuth();

  return (
    <div>
      <BrowserRouter>
        <CustomThemeProvider>
          <AppContextProvider>
            <CssBaseline />
            <AppStructure auth={auth}>
              <Container maxWidth="md" sx={{ p: { xs: 1, sm: 2 } }}>
                {/* <Grid container mt={2}>
                <Grid item xs={12} md={10} lg={8} m="auto">*/}
                <Routes>
                  <Route path="login" element={<LoginPage auth={auth} />} />
                  <Route
                    path="register"
                    element={<RegisterPage auth={auth} />}
                  />
                  <Route
                    path="questionnaires/:id/response"
                    element={<ResponsePage />}
                  />
                  <Route
                    path="questionnaires/:id/response/:privateId"
                    element={<ResponsePage />}
                  />
                  <Route path="/" element={<AuthOnlyOutlet auth={auth} />}>
                    <Route path="" element={<QnairesPage />} />
                    <Route path="questionnaires" element={<QnairesPage />} />
                    <Route
                      path="questionnaires/:id"
                      element={<CreationPage />}
                    />
                  </Route>
                </Routes>
              </Container>
            </AppStructure>
          </AppContextProvider>
        </CustomThemeProvider>
      </BrowserRouter>
    </div>
  );
}

render(<App />, document.getElementById("root"));
