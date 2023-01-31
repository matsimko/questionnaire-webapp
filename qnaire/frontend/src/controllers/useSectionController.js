import React, { useCallback, useEffect, useState } from "react";
import qnaireSource from "../data/QnaireSource";
import { useGenericController } from "./useGenericController";
import * as yup from "yup";
import { requiredString } from "../validation";

const validationSchema = yup.object({
  name: requiredString,
  desc: yup.string(),
});

export function useSectionController(id) {
  const sectionSource = qnaireSource.sectionSource;
  const questionSource = qnaireSource.questionSource;

  const { data, update, destroy } = useGenericController(
    sectionSource,
    id,
    validationSchema
  );
  const [questions, setQuestions] = useState(() => {
    return questionSource.getQuestionsForSection(id);
  });

  const handleQuestionOrderChange = () => {
    setQuestions(questionSource.getQuestionsForSection(id));
  };

  useEffect(() => {
    //this could be optimized by only updating state when the change concerns this particular section
    //and further optimized by doing the specific change needed instead of getQuestionsForSection
    //e.g. when question is deleted, then setQuestions(questions.filter((q) => q !== deleted.id))
    questionSource.subscribeMove(handleQuestionOrderChange);
    questionSource.subscribeCreate(handleQuestionOrderChange);
    questionSource.subscribeDelete(handleQuestionOrderChange);
    questionSource.subscribeType(handleQuestionOrderChange); //the Section is doing the question component mapping, so it needs to rerender

    return () => {
      questionSource.unsubscribeMove(handleQuestionOrderChange);
      questionSource.unsubscribeCreate(handleQuestionOrderChange);
      questionSource.unsubscribeDelete(handleQuestionOrderChange);
      questionSource.unsubscribeType(handleQuestionOrderChange);
    };
  }, [id]);

  return {
    ...data,
    questions,
    update,
    destroy,
  };
}
