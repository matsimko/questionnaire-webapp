import React, { useCallback, useEffect, useState } from "react";
import qnaireSource from "../data/QnaireSource";
import { useQuestionController } from "./useQuestionController";
import * as yup from "yup";
import { number } from "../validation";

const validationSchema = yup.object({
  min_answers: number.min(1),
  max_answers: number
    .min(1)
    .when("min_answers", (min_answers, schema) =>
      min_answers !== null
        ? schema.min(
            min_answers,
            "Hodnota musí být větší než nebo rovna minimálnímu počtu odpovědí"
          )
        : schema
    ),
});

export function useMultipleChoiceQuestionController(id) {
  const { update: baseUpdate, ...questionController } = useQuestionController(
    id,
    validationSchema
  );

  const choiceSource = qnaireSource.choiceSource;
  const [choices, setChoices] = useState(() =>
    choiceSource.getChoicesForQuestion(id)
  );

  const update = (updatedData) => {
    if ("resourcetype" in updatedData) {
      Object.values(choices).forEach((choice) => {
        choiceSource.deleteFromCache(choice.id);
      });
    }
    baseUpdate(updatedData);
  };

  const createChoice = () => {
    const order_num = choices.length;
    const text = `Možnost ${order_num + 1}`;
    choiceSource.create({ question: id, order_num, text }).catch((error) => {
      console.log(JSON.stringify(error));
    });
  };

  const handleChoiceOrderChange = () => {
    setChoices(choiceSource.getChoicesForQuestion(id));
  };

  useEffect(() => {
    //this could be optimized by allowing to sub the question by id so that its notified only when change related to it happens
    choiceSource.subscribeMove(handleChoiceOrderChange);
    choiceSource.subscribeCreate(handleChoiceOrderChange);
    choiceSource.subscribeDelete(handleChoiceOrderChange);

    return () => {
      choiceSource.unsubscribeMove(handleChoiceOrderChange);
      choiceSource.unsubscribeCreate(handleChoiceOrderChange);
      choiceSource.unsubscribeDelete(handleChoiceOrderChange);
    };
  }, []);

  useEffect(() => {
    let totalChoices = choices.length;
    if (questionController.other_choice) {
      totalChoices++;
    }
    if (questionController.max_answers > Math.max(totalChoices, 1)) {
      //the server already updated the question during the deletion of the choice,
      // but I will do shouldSourceUpdate to true so that I keep the local DataSource in a consistent state
      // (thought it's not strictly necessary right now)
      const max_answers = Math.max(totalChoices, 1);
      update({
        max_answers,
        min_answers: Math.min(max_answers, questionController.min_answers),
      });
    }
  }, [choices.length, questionController.other_choice]);

  return { ...questionController, update, choices, createChoice };
}
