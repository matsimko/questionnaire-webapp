import {
  Checkbox,
  FormControl,
  FormControlLabel,
  RadioGroup,
  TextField,
  Radio,
  Stack,
  FormGroup,
  Box,
  Typography,
} from "@mui/material";
import * as React from "react";
import useMultipleChoiceAnswerController from "../../controllers/useMultipleChoiceAnswerController";
import ErrorText from "../basic/ErrorText";
import Answer from "./Answer";

function Checkboxes({
  answer,
  choices,
  question,
  addChoice,
  removeChoice,
  addOtherChoice,
  removeOtherChoice,
}) {
  const [otherChoiceSelected, setOtherChoiceSelected] = React.useState(
    Boolean(answer.other_choice_text)
  );

  const handleChange = (e, choice) => {
    if (e.target.checked) {
      addChoice(choice.id);
    } else {
      removeChoice(choice.id);
    }
  };

  const handleOtherChoiceChange = (e) => {
    const checked = e.target.checked;
    if (!checked) {
      removeOtherChoice();
    }
    setOtherChoiceSelected(checked);
  };

  const handleOtherChoiceInputChange = (e) => {
    addOtherChoice(e.target.value);
  };

  return (
    <Stack>
      <Typography variant="body2" color="text.secondary">
        {question.mandatory ? "Vyberte" : "Můžete vybrat"}{" "}
        {question.min_answers} až {question.max_answers} možností.
      </Typography>
      {choices.map((choice) => (
        <Box key={choice.id}>
          <FormControlLabel
            control={
              <Checkbox
                checked={answer.choices.includes(choice.id)}
                onChange={(e) => handleChange(e, choice)}
              />
            }
            label={choice.text}
          />
        </Box>
      ))}
      {question.other_choice && (
        <Stack direction="row" alignItems="center">
          <FormControlLabel
            key="other_choice"
            control={
              <Checkbox
                checked={otherChoiceSelected}
                onChange={handleOtherChoiceChange}
              />
            }
            label="Jiná odpověď:"
          />
          <TextField
            value={answer.other_choice_text}
            onChange={handleOtherChoiceInputChange}
            disabled={!otherChoiceSelected}
            variant="standard"
            sx={{ flexGrow: 1 }}
          />
        </Stack>
      )}
    </Stack>
  );
}

function RadioButtons({
  choices,
  setChoice,
  setSkipToSectionId,
  answer,
  question,
}) {
  const [otherChoiceSelected, setOtherChoiceSelected] = React.useState(
    Boolean(answer.other_choice_text)
  );
  let value = "";
  if (answer.choices.length > 0) {
    value = answer.choices[0];
  } else if (otherChoiceSelected) {
    value = "other_choice";
  }

  const handleChange = (e) => {
    const value = e.target.value;
    if (value !== "other_choice") {
      const choiceId = parseInt(value);
      const choice = choices.find((choice) => choice.id === choiceId);
      setChoice(choice.id, false);
      setSkipToSectionId(question, choice.skip_to_section);
      setOtherChoiceSelected(false);
    } else {
      setOtherChoiceSelected(true);
      setChoice("", true); //alternatively call "removeChoice" on current answer if any
      setSkipToSectionId(question, null);
    }
  };

  const handleOtherChoiceInputChange = (e) => {
    setChoice(e.target.value, true);
  };

  return (
    <FormControl sx={{ display: "block" }}>
      <RadioGroup value={value} onChange={handleChange}>
        {choices.map((choice) => (
          <Box key={choice.id}>
            <FormControlLabel
              value={choice.id.toString()}
              control={<Radio />}
              label={choice.text}
            />
          </Box>
        ))}
        {question.other_choice && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              key="other_choice"
              value="other_choice"
              control={<Radio />}
              label={"Jiná odpověď:"}
            />
            <TextField
              value={answer.other_choice_text}
              onChange={handleOtherChoiceInputChange}
              disabled={!otherChoiceSelected}
              variant="standard"
              sx={{ flexGrow: 1 }}
            />
          </Box>
        )}
      </RadioGroup>
    </FormControl>
  );
}

function MultipleChoiceAnswer(props) {
  const {
    question,
    choices,
    addChoice,
    addOtherChoice,
    removeChoice,
    removeOtherChoice,
    setChoice,
    answer,
    error,
    setSkipToSectionId,
  } = useMultipleChoiceAnswerController(props);

  const Component = question.max_answers === 1 ? RadioButtons : Checkboxes;

  return (
    <Answer question={question} shouldScroll={props.shouldScroll}>
      <Component
        question={question}
        choices={choices}
        addChoice={addChoice}
        addOtherChoice={addOtherChoice}
        removeChoice={removeChoice}
        removeOtherChoice={removeOtherChoice}
        setChoice={setChoice}
        answer={answer}
        setSkipToSectionId={setSkipToSectionId}
      />
      <ErrorText error={error} sx={{ mt: 1 }} />
    </Answer>
  );
}

export default React.memo(MultipleChoiceAnswer);
