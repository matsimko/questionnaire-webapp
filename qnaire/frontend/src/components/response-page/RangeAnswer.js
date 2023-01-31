import * as React from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import useRangeAnswerController from "../../controllers/useRangeAnswerController";
import ETextField from "../fields/ETextField";
import Answer from "./Answer";
import InputSlider from "../basic/InputSlider";
import ErrorText from "../basic/ErrorText";
import StarRatingInput from "../basic/StarRating";
import SmileyRatingInput from "../basic/SmileyRating";
import { QuestionSource } from "../../data/QuestionSource";

function Field({ answer, question, setAnswer, error }) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        Zadejte číslo v rozmezí {question.min} až {question.max}.
      </Typography>
      <ETextField
        value={answer !== null ? answer : ""}
        error={error}
        onChange={(e) =>
          setAnswer(e.target.value ? parseFloat(e.target.value) : null)
        }
        type="number"
        inputProps={{
          min: question.min,
          max: question.max,
          step: question.step ? question.step : "any",
        }}
        sx={{ width: { xs: "100%", sm: "50%", md: "25%" } }}
      />
    </Stack>
  );
}

function Enumerate({ answer, question: { min, max, step }, setAnswer, error }) {
  const radioButtons = [];
  for (let i = min; i <= max; i += step) {
    const value = i.toString();
    const radio = (
      <FormControlLabel
        key={value}
        value={value}
        control={<Radio />}
        label={value}
      />
    );
    radioButtons.push(radio);
  }

  const handleChange = (e) => {
    setAnswer(parseInt(e.target.value));
  };

  return (
    <React.Fragment>
      <FormControl>
        <RadioGroup
          value={answer !== null ? answer.toString() : ""}
          onChange={handleChange}
        >
          {radioButtons}
        </RadioGroup>
      </FormControl>
      <ErrorText error={error} sx={{ mt: 1 }} />
    </React.Fragment>
  );
}

function Slider({ answer, question: { min, max, step }, setAnswer, error }) {
  return (
    <React.Fragment>
      <InputSlider
        value={answer}
        min={min}
        max={max}
        step={step}
        onChange={setAnswer}
      />
      <ErrorText error={error} />
    </React.Fragment>
  );
}

function StarRating({
  answer,
  question: { min, max, step },
  setAnswer,
  error,
}) {
  return (
    <React.Fragment>
      <StarRatingInput onChange={setAnswer} value={answer} max={max} />
      <ErrorText error={error} />
    </React.Fragment>
  );
}

function SmileyRating({ answer, question: { max }, setAnswer, error }) {
  return (
    <React.Fragment>
      <SmileyRatingInput onChange={setAnswer} value={answer} max={max} />
      <ErrorText error={error} />
    </React.Fragment>
  );
}

const AnswerDisplayTypeMap = {
  1: Enumerate,
  2: Slider,
  3: Field,
  4: StarRating,
  5: SmileyRating,
};

function RangeAnswer(props) {
  const { answer, setAnswer, question, error } =
    useRangeAnswerController(props);
  const Component = AnswerDisplayTypeMap[question.type];
  return (
    <Answer question={question} shouldScroll={props.shouldScroll}>
      <Component
        answer={answer}
        question={question}
        setAnswer={setAnswer}
        error={error}
      />
    </Answer>
  );
}

//the issue with memo on Answers is that if the user gets a validation error and then goes Next/Submit again
//and gets the same validation error,
//then the answer won't be rerendered and so the scroll to the first errorful answer won't happen.
//To avoid this, either don't use memo or wrap the error string in an object
export default React.memo(RangeAnswer);
