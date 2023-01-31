import React, { useState } from "react";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  typographyClasses,
} from "@mui/material";
import { OptionMenu } from "../basic/OptionMenu";
import {
  DisplayTypesDescription,
  DisplayTypes,
  useRangeQuestionController,
} from "../../controllers/useRangeQuestionController";
import Question from "./Question";
import ETextField from "../fields/ETextField";
import ESelect from "../fields/ESelect";

export function Options({ min, max, step, type, update, isSelected, error }) {
  return isSelected ? (
    <Grid container spacing={2}>
      <Grid item xs={6} sm>
        <ETextField
          value={min !== null ? min : ""}
          error={error.min}
          disabled={
            type === DisplayTypes.SMILEY_RATING ||
            type === DisplayTypes.STAR_RATING
          }
          onChange={(e) =>
            update({
              min: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          required
          label="Min"
          id="range-min"
          type="number"
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid item xs={6} sm>
        <ETextField
          value={max !== null ? max : ""}
          error={error.max}
          onChange={(e) =>
            update({
              max: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          required
          label="Max"
          id="range-max"
          type="number"
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid item xs={6} sm>
        <ETextField
          value={step !== null ? step : ""}
          error={error.step}
          disabled={
            type === DisplayTypes.SMILEY_RATING ||
            type === DisplayTypes.STAR_RATING
          }
          onChange={(e) =>
            update({
              step: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          label="Skok"
          id="range-step"
          type="number"
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid item xs={6} sm={4}>
        <ESelect
          value={type.toString()}
          error={type.error}
          onChange={(e) => update({ type: parseInt(e.target.value) })}
          label="Způsob zobrazení"
          required
        >
          {Object.keys(DisplayTypesDescription).map((type) => (
            <MenuItem value={type} key={type}>
              {DisplayTypesDescription[type]}
            </MenuItem>
          ))}
        </ESelect>
      </Grid>
    </Grid>
  ) : null;
}

export function Menu(props) {
  return <OptionMenu></OptionMenu>;
}

function RangeQuestion({ id, ...props }) {
  const questionController = useRangeQuestionController(id);

  return (
    <Question
      {...props}
      options={Options}
      menu={Menu}
      {...questionController}
    ></Question>
  );
}

export default React.memo(RangeQuestion);
