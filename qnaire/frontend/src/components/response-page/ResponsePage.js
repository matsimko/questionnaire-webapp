import {
  Button,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  QuestionAnswerMap,
  SubmissionState,
  useQnaireResponseController,
} from "../../controllers/useQnaireResponseController";
import { useAppContext } from "../../providers/AppContextProvider";
import ErrorList from "../basic/ErrorList";
import ETextField from "../fields/ETextField";
import LoadingButton from "../basic/LoadingButton";
import UncancellableDialog from "../basic/UncancellableDialog";
import QnaireIntro from "./QnaireIntro";

const SectionInfo = React.memo(({ name, desc }) => (
  <Box>
    <Typography variant="h3" component="h2">
      {name}
    </Typography>
    <Typography>{desc}</Typography>
  </Box>
));

export function ResponsePage() {
  const { id, privateId } = useParams();
  //check if privateId undefined and handle accordingly (based on whether qnaire is aunonymous)

  const [searchParams, setSearchParams] = useSearchParams();
  const isPreview = Boolean(searchParams.has("preview"));

  const {
    isLoaded,
    qnaire,
    currentSection,
    questions,
    errors,
    answers,
    totalSections,
    isIntro,
    isLastSection,
    setAnswer,
    goToNextSection,
    goToPreviousSection,
    submitResponse,
    setSkipToSectionId,
    respondent,
    setRespondent,
    globalError,
    submissionState,
  } = useQnaireResponseController(id, privateId, isPreview);

  const { setPageActions, setDrawerDisabled } = useAppContext();

  useEffect(() => {
    setPageActions([]);
    setDrawerDisabled(true);

    return () => setDrawerDisabled(false);
  }, []);

  let scrolledToAnswer = false;

  if (!isLoaded) {
    return null;
  }

  if (globalError) {
    return <UncancellableDialog title={globalError} />;
  }

  if (submissionState.state === SubmissionState.SUCCESS) {
    return (
      <Typography textAlign="center" fontSize="h6.fontSize">
        Vaše odpověď byla úspěšně odeslána.
      </Typography>
    );
  }

  if (isIntro) {
    return (
      <QnaireIntro
        {...qnaire}
        goToNextSection={goToNextSection}
        respondent={respondent}
        setRespondent={setRespondent}
      />
    );
  }

  return (
    <Stack spacing={4}>
      <SectionInfo {...currentSection} />
      {questions.map((q) => {
        const Answer = QuestionAnswerMap[q.resourcetype].component;
        const error = errors[q.id];
        const shouldScroll = Boolean(!scrolledToAnswer && error);
        if (shouldScroll) {
          scrolledToAnswer = true;
        }

        return (
          <Answer
            key={q.id}
            question={q}
            answer={answers[q.id]}
            shouldScroll={shouldScroll}
            error={error}
            setAnswer={setAnswer}
            setSkipToSectionId={setSkipToSectionId}
          />
        );
      })}

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Button variant="outlined" onClick={goToPreviousSection}>
          Zpět
        </Button>
        <LinearProgress
          variant="determinate"
          value={((currentSection.order_num + 1) / totalSections) * 100}
          sx={{ flexGrow: 1 }}
        />
        {!isLastSection ? (
          <Button variant="outlined" onClick={goToNextSection}>
            Pokračovat
          </Button>
        ) : (
          <LoadingButton
            loading={submissionState.state === SubmissionState.WAITING}
            variant="contained"
            onClick={submitResponse}
          >
            Odeslat
          </LoadingButton>
        )}
      </Stack>
      <ErrorList error={errors} />
      <ErrorList error={submissionState.error} />
    </Stack>
  );
}
