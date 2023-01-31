import * as React from "react";

export default function useRangeAnswerController({
  question,
  setAnswer: setAnswerByQuestion,
  answer,
  ...props
}) {
  const setAnswer = (num) => {
    setAnswerByQuestion(question, { num });
  };

  return { answer: answer.num, setAnswer, question, ...props };
}
