import * as React from "react";

export default function useOpenAnswerController({
  question,
  setAnswer: setAnswerByQuestion,
  answer,
  ...props
}) {
  const setAnswer = (text) => {
    setAnswerByQuestion(question, { text });
  };

  return { answer: answer.text, setAnswer, question, ...props };
}
