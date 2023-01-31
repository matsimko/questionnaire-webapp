import React, { useEffect, useState, useCallback } from "react";
import qnaireSource from "../data/QnaireSource";
import { useGenericController } from "./useGenericController";
import * as yup from "yup";

const baseValidationSchema = yup.object({
  text: yup.string().required("Text otázky musí být neprázdný"),
});

export function useQuestionController(id, validationSchema = null) {
  const questionSource = qnaireSource.questionSource;
  validationSchema = validationSchema
    ? baseValidationSchema.concat(validationSchema)
    : baseValidationSchema;

  const {
    data,
    update: baseUpdate,
    destroy,
    cancelUpdate,
  } = useGenericController(questionSource, id, validationSchema);
  const update = (updatedData, shouldSourceUpdate = true) => {
    if ("resourcetype" in updatedData) {
      cancelUpdate();
      questionSource.updateType(id, updatedData.resourcetype);
    } else {
      baseUpdate(
        { ...updatedData, resourcetype: data.resourcetype },
        shouldSourceUpdate
      );
    }
  };

  return { ...data, update, destroy };
}
