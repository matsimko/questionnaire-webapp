import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Input from "@mui/material/Input";
import { ensurePrecision } from "../../utils";

export default function InputSlider({
  min,
  max,
  step,
  value,
  onChange,
  ...props
}) {
  const isStep = Boolean(step);
  // make slider use 2 decimal places when step isn't defined (but the step isn't enforced in the Input)
  step = isStep ? step : 0.01;

  const handleSliderChange = (event, newValue) => {
    onChange(newValue);
  };

  const handleInputChange = (event) => {
    onChange(event.target.value === "" ? null : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value !== null) {
      if (value < min) {
        onChange(min);
      } else if (value > max) {
        onChange(max);
      } else if (isStep) {
        //if step is decimal this will ensure the value will have the same numbe of decimal places as the step
        //but it doesn't solve the equation: (value - min) % step === 0
        onChange(ensurePrecision(value, step));
      }
    }
  };

  const marks = [
    {
      value: min,
      label: min.toString(),
    },
  ];
  if (isStep) {
    let mark_value = min + step;
    while (mark_value < max) {
      marks.push({
        value: mark_value,
      });
      mark_value += step;
    }
  }
  marks.push({
    value: max,
    label: max.toString(),
  });

  return (
    <Grid container spacing={4} alignItems="top" sx={{px: 2}}>
      <Grid item xs>
        <Slider
          value={typeof value === "number" ? value : min}
          onChange={handleSliderChange}
          step={step}
          marks={marks}
          min={min}
          max={max}
        />
      </Grid>
      <Grid item>
        <Input
          value={typeof value === "number" ? value : ""}
          size="small"
          onChange={handleInputChange}
          onBlur={handleBlur}
          inputProps={{
            step: step,
            min: min,
            max: max,
            type: "number",
          }}
        />
      </Grid>
    </Grid>
  );
}
