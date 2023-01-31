import { useQuestionController } from "./useQuestionController";
import * as yup from "yup";
import { number, requiredNumber } from "../validation";

const validationSchema = yup.object({
  min_length: number.min(1),
  max_length: number
    .min(1)
    .when("min_length", (min_length, schema) =>
      min_length !== null
        ? schema.min(
            min_length,
            "Hodnota musí být větší nebo rovna minimálnímu počtu znaků odpovědi"
          )
        : schema
    ),
});

export function useOpenQuestionController(id) {
  const questionController = useQuestionController(id, validationSchema);
  return { ...questionController };
}
