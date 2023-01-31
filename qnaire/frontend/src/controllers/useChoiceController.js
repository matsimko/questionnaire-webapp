import React, { useCallback, useEffect, useState } from "react";
import qnaireSource from "../data/QnaireSource";
import { useGenericController } from "./useGenericController";
import * as yup from "yup";
import { requiredString } from "../validation";

const validationSchema = yup.object({
  text: requiredString,
});

export function useChoiceController(id) {
  const choiceSource = qnaireSource.choiceSource;
  const sectionSource = qnaireSource.sectionSource;
  const { data, update, destroy } = useGenericController(
    choiceSource,
    id,
    validationSchema
  );
  const [sections, setSections] = useState(() =>
    sectionSource.getSortedSections()
  );
  const handleSectionsChange = () => {
    setSections(sectionSource.getSortedSections());
  };

  useEffect(() => {
    sectionSource.subscribeUpdate(handleSectionsChange);
    sectionSource.subscribeMove(handleSectionsChange);
    sectionSource.subscribeCreate(handleSectionsChange);
    sectionSource.subscribeDelete(handleSectionsChange);

    return () => {
      sectionSource.unsubscribeUpdate(handleSectionsChange);
      sectionSource.unsubscribeMove(handleSectionsChange);
      sectionSource.unsubscribeCreate(handleSectionsChange);
      sectionSource.unsubscribeDelete(handleSectionsChange);
    };
  }, [id]);

  return { ...data, sections, update, destroy };
}
