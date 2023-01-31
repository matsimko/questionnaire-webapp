import * as yup from "yup";

export function yupErrorToFieldErrors(yupError) {
  let errors = {};
  if (yupError.inner) {
    if (yupError.inner.length === 0) {
      errors[yupError.path] = yupError.message;
    } else {
      //set the first error for each path in the array of errors
      for (let err of yupError.inner) {
        if (err.path in errors === false) {
          errors[err.path] = err.message;
        }
      }
    }
  }
  return errors;
}

//in the case of object schema nested in another object schema, the path is "parentkey.childkey", so return object of errors
//where keys will will be just "parentkey"
export function yupErrorToTopLevelFieldErrors(yupError) {
  let errors = {};
  if (yupError.inner) {
    if (yupError.inner.length === 0) {
      errors[yupError.path.split(".")[0]] = yupError.message;
    } else {
      //set the first error for each path in the array of errors
      for (let err of yupError.inner) {
        const path = err.path.split(".")[0];
        if (path in errors === false) {
          errors[path] = err.message;
        }
      }
    }
  }
  return errors;
}

yup.setLocale({
  mixed: {
    default: "Neplatný vstup",
    required: "Pole musí být vyplněno",
  },
  number: {
    typeError: "Hodnota musí být číslo",
    integer: "Hodnota musí být celé číslo",
    positive: "Hodnota musí být kladná",
    min: "Hodnota musí být větší nebo rovno ${min}",
    max: "Hodnota musí být menší nebo rovno ${max}",
    moreThan: "Hodnota musí být větší než ${moreThan}",
    lessThan: "Hodnota musí být menší než ${lessThan}",
  },
  string: {
    min: "Text musí mít alespoň ${min} znaků",
    max: "Text musí mít nanejvýš ${max} znaků",
  },
});

export const requiredString = yup.string().required();

export const number = yup.number().nullable();
export const requiredNumber = number.required();
