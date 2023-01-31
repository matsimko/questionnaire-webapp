import { Slider, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EditableText } from "../basic/EditableText";
import { InputSlider } from "../basic/InputSlider";
import { SmileyRating } from "../basic/SmileyRating";
import { QnaireProvider } from "../../providers/QnaireProvider";
import { Questionnaire } from "./Questionnaire";
import { QnaireErrorDialog } from "../dialogs/QnaireErrorDialog";

export function CreationPage({ auth }) {
  let { id } = useParams();

  return (
    <QnaireProvider>
      <Questionnaire id={id} />
      <QnaireErrorDialog />
    </QnaireProvider>
  );
}
