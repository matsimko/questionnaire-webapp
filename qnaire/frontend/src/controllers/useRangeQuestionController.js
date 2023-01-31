import { useQuestionController } from "./useQuestionController";
import * as yup from "yup";
import { requiredNumber, number } from "../validation";

export const DisplayTypes = {
  ENUMERATE: 1,
  SLIDER: 2,
  FIELD: 3,
  STAR_RATING: 4,
  SMILEY_RATING: 5,
};

export const DisplayTypesDescription = {
  [DisplayTypes.ENUMERATE]: "Výběr z možností",
  [DisplayTypes.SLIDER]: "Posuvník",
  [DisplayTypes.FIELD]: "Vstupní pole",
  [DisplayTypes.STAR_RATING]: "Hvězdičkové hodnocení",
  [DisplayTypes.SMILEY_RATING]: "Smajlíkové hodnocení",
};

const MAX_SMILEYS = 5;
const MAX_CHOICES_FOR_ENUMERATE = 100;

yup.addMethod(yup.number, "integerIfStep", function (args) {
  // const { path } = this;
  return this.when("step", (step, schema) =>
    step !== null
      ? schema.integer(`Hodnota musí být celé číslo, když je definován skok`)
      : schema
  );
});

// yup.addMethod(yup.number, "equalTo1WhenSmiley", function (args) {
//   // const { path } = this;
//   return this.when("type", (type, schema) =>
//     type === DisplayTypes.SMILEY_RATING
//       ? schema
//           .min(
//             1,
//             `Hodnota musí být rovna 1, když je typ zobrazení ${DisplayTypesDescription[type]}`
//           )
//           .max(
//             1,
//             `Hodnota musí být rovna 1, když je typ zobrazení ${DisplayTypesDescription[type]}`
//           )
//       : schema
//   );
// });

// yup.addMethod(yup.number, "equalTo1WhenStarOrSmiley", function (args) {
//   // const { path } = this;
//   return this.when("type", (type, schema) =>
//     type === DisplayTypes.SMILEY_RATING || type === DisplayTypes.STAR_RATING
//       ? schema
//           .min(
//             1,
//             `Hodnota musí být rovna 1, když je typ zobrazení ${DisplayTypesDescription[type]}`
//           )
//           .max(
//             1,
//             `Hodnota musí být rovna 1, když je typ zobrazení ${DisplayTypesDescription[type]}`
//           )
//       : schema
//   );
// });

const validationSchema = yup.object({
  min: requiredNumber.integerIfStep(),
  max: requiredNumber
    .integerIfStep()
    .when("min", (min, schema) =>
      min !== null ? schema.moreThan(min, "Hodnota musí být větší než min") : schema
    )
    .when("type", (type, schema) =>
      type === DisplayTypes.SMILEY_RATING
        ? schema.max(
            MAX_SMILEYS,
            `Hodnota musí být menší nebo rovna ${MAX_SMILEYS}, když je typ zobrazení ${DisplayTypesDescription[type]}`
          )
        : schema
    ),
  step: number
    .integer()
    .positive()
    .when("type", (type, schema) => {
      switch (type) {
        case DisplayTypes.ENUMERATE:
          return schema.required(
            `Hodnota musí být definována, když je typ zobrazení ${DisplayTypesDescription[type]}`
          );
        default:
          return schema;
      }
    })
    .test(
      "step-leq-max-minus-min",
      "Hodnota musí být menší nebo rovna max - min",
      (value, context) => {
        const { min, max, type } = context.parent;
        if (
          value !== null &&
          min !== null &&
          max !== null &&
          //don't apply this test on star_rating because the user is not even allowed to change step (but this error can be shown instead of the "correct" one, like when max is zero, )
          type !== DisplayTypes.STAR_RATING && 
          type !== DisplayTypes.SMILEY_RATING
        ) {
          return value <= max - min;
        }
        return true;
      }
    ),
});

export function useRangeQuestionController(id) {
  const {
    update: baseUpdate,
    max,
    step,
    ...questionController
  } = useQuestionController(id, validationSchema);

  const update = (updatedData) => {
    if ("type" in updatedData) {
      const type = updatedData.type;
      if (type === DisplayTypes.SMILEY_RATING) {
        updatedData = {
          ...updatedData,
          min: 1,
          step: 1,
          max: Math.min(max, MAX_SMILEYS),
        };
      } else if (type === DisplayTypes.STAR_RATING) {
        updatedData = {
          ...updatedData,
          min: 1,
          step: 1,
          max: Math.min(max, MAX_CHOICES_FOR_ENUMERATE),
        };
      } else if (type === DisplayTypes.ENUMERATE) {
        updatedData = {
          ...updatedData,
          step: step !== null ? step : 1,
        };
      }
    }
    baseUpdate(updatedData);
  };

  return { ...questionController, max, step, update };
}
