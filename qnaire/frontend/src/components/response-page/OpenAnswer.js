import { Box, TextField } from "@mui/material";
import * as React from "react";
import useOpenAnswerController from "../../controllers/useOpenAnswerController";
import ETextField from "../fields/ETextField";
import Answer from "./Answer";

function OpenAnswer(props) {
  const { answer, setAnswer, question, error } = useOpenAnswerController(props);
  const minRows =
    question.min_length && question.min_length >= 200 ? 3 : undefined;

  return (
    <Answer question={question} shouldScroll={props.shouldScroll}>
      <ETextField
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        error={error}
        multiline
        minRows={minRows}
        fullWidth
      />
    </Answer>
  );
}

export default React.memo(OpenAnswer);
