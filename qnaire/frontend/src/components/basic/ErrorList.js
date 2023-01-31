import * as React from "react";
import { List, Stack, Typography } from "@mui/material";
import styled from "@emotion/styled";

const ErrorListItem = styled("li")(({ theme }) => ({
  color: theme.palette.error.main,
}));

export default function ErrorList({ error, all }) {
  if (all) {
    return error ? (
      <Stack>
        {Object.keys(error).map((key) => {
          let errorElement = null;
          if (Array.isArray(error[key])) {
            errorElement = error[key].map((value) => (
              <ErrorListItem key={value}>
                <Typography color="error">{value}</Typography>
              </ErrorListItem>
            ));
          } else {
            errorElement = (
              <ErrorListItem>
                <Typography color="error">{error[key]}</Typography>
              </ErrorListItem>
            );
          }
          return (
            <React.Fragment key={key}>
              <Typography color="error">{key}:</Typography>
              <ul style={{margin: 0}}>{errorElement}</ul>
            </React.Fragment>
          );
        })}
      </Stack>
    ) : null;
  }

  return error ? (
    <React.Fragment>
      {error.non_field_errors && (
        <Typography color="error" textAlign="center">
          {error.non_field_errors}
        </Typography>
      )}
      {error.detail && (
        <Typography color="error" textAlign="center">
          {error.detail}
        </Typography>
      )}
    </React.Fragment>
  ) : null;
}
