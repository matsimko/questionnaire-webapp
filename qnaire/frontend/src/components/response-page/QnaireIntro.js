import { Box, Stack, Typography } from "@mui/material";
import * as React from "react";
import LoadingButton from "../basic/LoadingButton";
import ETextField from "../fields/ETextField";

export default function QnaireIntro({
  name,
  desc,
  goToNextSection,
  anonymous,
  respondent,
  setRespondent,
}) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h1">{name}</Typography>
        <Typography>{desc}</Typography>
      </Box>
      {!anonymous && (
        <Stack spacing={1}>
          <Typography>
            Tento dotazník není anonymní. Zadejte identifikátor, který Vám byl
            přidělen.
          </Typography>
          <ETextField
            value={respondent.id !== null ? respondent.id : ""}
            onChange={(e) =>
              setRespondent((respondent) => {
                return { ...respondent, id: e.target.value };
              })
            }
            error={respondent.error}
            label="Identifikátor"
            fullWidth
          />
        </Stack>
      )}
      <Stack direction="row" justifyContent="flex-end">
        <LoadingButton
          loading={respondent.loading}
          size="large"
          variant="contained"
          onClick={goToNextSection}
        >
          Pustit se do vyplňování
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
