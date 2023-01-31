import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import qnaireSource from "../data/QnaireSource";
import respondentSource from "../data/RespondentSource";
import { useBaseQnaireController } from "./useBaseQnaireController";
import * as yup from "yup";
import { number, yupErrorToTopLevelFieldErrors } from "../validation";
import OpenAnswer from "../components/response-page/OpenAnswer";
import RangeAnswer from "../components/response-page/RangeAnswer";
import MultipleChoiceAnswer from "../components/response-page/MultipleChoiceAnswer";
import privateQnaireIdSource from "../data/PrivateQnaireIdSource";

const INVALID_PRIVATE_ID_ERROR = "Byl zadán neplatný odkaz na dotazník.";
const NOT_PUBLISHED_ERROR =
  "Tento dotazník aktuálně není dostupný pro vyplňování";

export const SubmissionState = {
  NOT_SENT: 0,
  WAITING: 1,
  ERROR: 2,
  SUCCESS: 3,
};

const requiredIfMandatory = (q, schema) =>
  q.mandatory ? schema.required("Odpověd na tuto otázku je povinná") : schema;

const createOpenAnswerSchema = (q) => {
  let schema = yup.string().default("");
  schema = requiredIfMandatory(q, schema);
  //it seems to work correctly even if I pass null to the method, but I didn't see any mention of it in docs
  if (q.min_length !== null) {
    schema = schema.test(
      "min_length_allow_empty",
      `Text musí být dlouhý alespoň ${q.min_length} znaků`,
      (value) => (value.trim().length > 0 ? value.length >= q.min_length : true)
    );
  }
  if (q.max_length !== null) {
    schema = schema.max(q.max_length);
  }
  return yup.object({
    text: schema,
    question: yup.number().default(q.id),
    resourcetype: yup.string().default("OpenAnswer"),
  });
};

const createRangeAnswerSchema = (q) => {
  let schema = number.default(null).min(q.min).max(q.max);
  schema = requiredIfMandatory(q, schema);
  if (q.step !== null) {
    schema = schema.test(
      "step-of",
      `Hodnota musí být rovno ${q.min} + k * ${q.step}, kde k je přirozené číslo`,
      (value, context) => value === null || (value - q.min) % q.step === 0
    );
  }
  return yup.object({
    num: schema,
    question: yup.number().default(q.id),
    resourcetype: yup.string().default("RangeAnswer"),
  });
};

const createMultipleChoiceAnswerSchema = (q) => {
  let choicesSchema = yup.array().ensure();
  choicesSchema = choicesSchema.test(
    "min-max-if-required-or-not-empty",
    `Musí být vybráno alespoň ${q.min_answers} odpovědí  a nanejvýš ${q.max_answers} odpovědí`,
    (value, context) => {
      const { other_choice_text } = context.parent;
      let totalSelectedChoices = value.length;
      if (other_choice_text) {
        totalSelectedChoices++;
      }
      return q.required || totalSelectedChoices > 0
        ? totalSelectedChoices >= q.min_answers &&
            totalSelectedChoices <= q.max_answers
        : true;
    }
  );
  let otherChoiceSchema = yup.string().default("");
  let schema = yup.object({
    choices: choicesSchema,
    other_choice_text: otherChoiceSchema,
    question: yup.number().default(q.id),
    resourcetype: yup.string().default("MultipleChoiceAnswer"),
  });

  return schema;
};

export const QuestionAnswerMap = {
  OpenQuestion: {
    component: OpenAnswer,
    createSchema: createOpenAnswerSchema,
  },
  RangeQuestion: {
    component: RangeAnswer,
    createSchema: createRangeAnswerSchema,
  },
  MultipleChoiceQuestion: {
    component: MultipleChoiceAnswer,
    createSchema: createMultipleChoiceAnswerSchema,
  },
};

export function useQnaireResponseController(id, privateId, isPreview) {
  const { data, update, updateData, ...baseQnaireController } =
    useBaseQnaireController(id);
  const [globalError, setGlobalError] = useState(null);
  const [respondent, setRespondent] = useState({
    id: null,
    loading: false,
    error: "",
  });
  const [sections, setSections] = useState(null);
  const [pageMap, setPageMap] = useState(null); //contains all needed data for each section (other than the section)
  const [sectionIdxStack, setSectionIdxStack] = useState([]);
  const [submissionState, setSubmissionState] = useState(
    SubmissionState.NOT_SENT
  );
  const skipToSectionListMap = useRef(null);

  useEffect(() => {
    qnaireSource.setShouldAuth(false);
    qnaireSource.retrieve(id).then((data) => {
      updateData(data);
      const sectionSource = qnaireSource.sectionSource;
      const sections = sectionSource.getSortedSections();

      skipToSectionListMap.current = {};
      const pageMap = sections.reduce((pageMap, section) => {
        const questions = qnaireSource.questionSource.getQuestionsForSection(
          section.id
        );
        let answers = {};
        const schemaObj = {};
        const errors = {};
        questions.forEach((q) => {
          schemaObj[q.id] = QuestionAnswerMap[q.resourcetype].createSchema(q);
        });
        const validationSchema = yup.object(schemaObj);
        answers = validationSchema.cast(answers);

        skipToSectionListMap.current[section.id] = [];

        pageMap[section.id] = { questions, answers, validationSchema, errors };
        return pageMap;
      }, {});

      setSections(sections);
      setPageMap(pageMap);

      if (isPreview) {
        return;
      }

      if (!data.published) {
        setGlobalError(NOT_PUBLISHED_ERROR);
      } else if (data.private) {
        if (!privateId) {
          setGlobalError(INVALID_PRIVATE_ID_ERROR);
        } else {
          privateQnaireIdSource
            .retrieve(privateId)
            .then((privateQnaireId) => {
              if (data.id !== privateQnaireId.qnaire) {
                setGlobalError(INVALID_PRIVATE_ID_ERROR);
              }
            })
            .catch(() => setGlobalError(INVALID_PRIVATE_ID_ERROR));
        }
      }
    });

    return () => {
      //setting it back to true on unmount here instead of having to set it to true on every other page
      qnaireSource.setShouldAuth(true);
    };
  }, [id]);

  let currentSectionIdx = null;
  let currentSection = null;
  let isIntro = true;
  let isLastSection = false;
  let totalSections = null;
  let currentPage = null;
  let currentSkipToSectionList = null;
  // let isFirstSection = false;
  if (sections && pageMap && sectionIdxStack.length > 0) {
    currentSectionIdx = sectionIdxStack[sectionIdxStack.length - 1];
    currentSection = sections[currentSectionIdx];
    totalSections = sections.length;
    isIntro = false;
    isLastSection = currentSectionIdx === sections.length - 1;
    // isFirstSection = currentSectionIdx === 0;
    currentPage = pageMap[currentSection.id];
    currentSkipToSectionList = skipToSectionListMap.current[currentSection.id];
  }

  const setAnswer = useCallback((question, value) => {
    setPageMap((pageMap) => {
      return {
        ...pageMap,
        [question.section]: {
          ...pageMap[question.section],
          answers: {
            ...pageMap[question.section].answers,
            [question.id]: {
              ...pageMap[question.section].answers[question.id],
              ...value,
            },
          },
        },
      };
    });
  }, []);

  const setError = useCallback(
    (errors) => {
      setPageMap((pageMap) => {
        return {
          ...pageMap,
          [currentSection.id]: {
            ...pageMap[currentSection.id],
            errors,
          },
        };
      });
    },
    [currentSection]
  );

  const setSkipToSectionId = useCallback(
    (question, id) => {
      const prevIdx = currentSkipToSectionList.findIndex(
        (obj) => obj.question === question
      );
      if (prevIdx !== -1) {
        currentSkipToSectionList.splice(prevIdx, 1);
      }
      if (id !== null) {
        currentSkipToSectionList.push({ id, question });
      }
    },
    [currentSkipToSectionList]
  );

  const getSkipToSectionId = () => {
    const best = currentSkipToSectionList.reduce((best, curr) => {
      if (best === null || curr.question.order_num > best.question.order_num) {
        return curr;
      }
      return best;
    }, null);
    return best !== null ? best.id : null;
  };

  const validate = () => {
    try {
      currentPage.validationSchema.validateSync(currentPage.answers, {
        abortEarly: false,
      });
      setError({});
      return true;
    } catch (error) {
      console.log(error.inner);
      setError(yupErrorToTopLevelFieldErrors(error));
      return false;
    }
  };

  const submitResponse = () => {
    if (!validate()) {
      return;
    }

    if (isPreview) {
      setSubmissionState({ state: SubmissionState.SUCCESS, error: null });
      return;
    }

    const answers = Object.values(pageMap).reduce((answers, page) => {
      return answers.concat(Object.values(page.answers));
    }, []);
    const response = {
      answers,
      private_qnaire_id: privateId,
      respondent: respondent.id,
    };
    console.log(response);
    setSubmissionState((submissionState) => {
      return { ...submissionState, state: SubmissionState.WAITING };
    });
    qnaireSource
      .createResponse(id, response)
      .then(() => {
        setSubmissionState({ state: SubmissionState.SUCCESS, error: null });
      })
      .catch((error) => {
        setSubmissionState({ state: SubmissionState.ERROR, error });
      });
  };

  const goToNextSection = () => {
    if (isIntro) {
      if (data.anonymous || isPreview) {
        setSectionIdxStack([0]); //go to first section
        return;
      }
      setRespondent((respondent) => {
        return { ...respondent, loading: true };
      });
      respondentSource
        .retrieve(respondent.id)
        .then(() => {
          setSectionIdxStack([0]); //go to first section
          setRespondent((respondent) => {
            return { ...respondent, loading: false, error: "" };
          });
        })
        .catch((error) => {
          setRespondent((respondent) => {
            return {
              ...respondent,
              error: "Zadaný identifikátor není platný",
              loading: false,
            };
          });
        });
      return;
    } else if (!validate()) {
      return;
    }

    const skipToSectionId = getSkipToSectionId();
    if (skipToSectionId === null) {
      setSectionIdxStack((sectionIdxStack) => {
        if (sectionIdxStack.length > 0) {
          const nextSectionIdx =
            sectionIdxStack[sectionIdxStack.length - 1] + 1;
          return [...sectionIdxStack, nextSectionIdx];
        } else {
          return [0];
        }
      });
    } else {
      setSectionIdxStack((sectionIdxStack) => [
        ...sectionIdxStack,
        sections.findIndex((section) => section.id === skipToSectionId),
      ]);
    }
  };

  const goToPreviousSection = () => {
    setSectionIdxStack((sectionIdxStack) => {
      const newSectionIdxStack = Array.from(sectionIdxStack);
      newSectionIdxStack.pop();
      return newSectionIdxStack;
    });
  };

  return {
    ...baseQnaireController,
    isLoaded: Boolean(data.id) && Boolean(sections),
    qnaire: data,
    currentSection,
    ...currentPage,
    totalSections,
    isLastSection,
    // isFirstSection,
    isIntro,
    goToNextSection,
    goToPreviousSection,
    submitResponse,
    setSkipToSectionId,
    setAnswer,
    respondent,
    setRespondent,
    globalError,
    submissionState,
  };
}
