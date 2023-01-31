import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddIcon from "@mui/icons-material/Add";
import { useAppContext } from "./AppContextProvider";
import { PageAction } from "../PageAction";
import qnaireSource from "../data/QnaireSource";
import { Resources } from "../data/Resources";

const QnaireContext = React.createContext();

export function QnaireProvider({ children }) {
  const [selected, setSelected] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState({});

  const copiedQuestionId = useRef(null);

  const select = useCallback((resource, id) => {
    setSelected({ resource, id });
  }, []);

  function createSection() {
    if (qnaireSource.getQnaire().published) {
      setError({
        detail: "Nelze vytvořit sekci, protože dotazník je publikovaný",
      });
      return;
    }

    const sections = qnaireSource.sectionSource.getAll();
    let order_num = null;
    if (selected) {
      switch (selected.resource) {
        case Resources.QNAIRES:
          break;
        case Resources.SECTIONS:
          order_num = sections[selected.id].order_num + 1;
          break;
        case Resources.QUESTIONS:
          const question = qnaireSource.questionSource.get(selected.id);
          order_num = sections[question.section].order_num + 1;
          break;
      }
    }

    if (order_num == null) {
      order_num = Object.keys(sections).length;
    }

    const name = `Sekce ${order_num + 1}`;
    const data = { name, order_num, qnaire: qnaireSource.id };

    return qnaireSource.sectionSource
      .create(data)
      .then((data) => {
        select(Resources.SECTIONS, data.id);
        return data;
      })
      .catch((error) => {
        setError(error);
      });
  }

  function createQuestion() {
    if (qnaireSource.getQnaire().published) {
      setError({
        detail: "Nelze vytvořit otázku, protože dotazník je publikovaný",
      });
      return;
    }

    const questionSource = qnaireSource.questionSource;
    const sections = qnaireSource.sectionSource.getAll();
    if (Object.keys(sections).length == 0) {
      // setError(
      //   "Každá otázka musí patřit do nějaké sekce, a v tomto dotazníku žádná není."
      // );
      createSection().then((data) => {
        createQuestion();
      });
      return;
    }
    let order_num = null;
    let sectionId = null;
    let resourcetype = "MultipleChoiceQuestion";
    if (selected) {
      switch (selected.resource) {
        case Resources.QNAIRES:
          break;
        case Resources.SECTIONS:
          sectionId = selected.id;
          break;
        case Resources.QUESTIONS:
          const questions = questionSource.getAll();
          const question = questions[selected.id];
          sectionId = question.section;
          order_num = question.order_num + 1;
          resourcetype = question.resourcetype; //use the same type as the currently selected question
          break;
      }
    }
    if (sectionId == null) {
      // take the last one
      const sortedSections = qnaireSource.sectionSource.getSortedSections();
      sectionId = sortedSections[sortedSections.length - 1].id;
    }

    if (order_num == null) {
      order_num = questionSource.getQuestionsForSection(sectionId).length;
    }

    const text = `Otázka ${order_num + 1}`;
    const data = { text, order_num, section: sectionId, resourcetype };
    return questionSource
      .create(data)
      .then((data) => {
        select(Resources.QUESTIONS, data.id);
      })
      .catch((error) => {
        setError(error);
      });
  }

  function copy() {
    copiedQuestionId.current = selected.id;
  }

  function paste() {
    if (copiedQuestionId.current == null) {
      return;
    }

    const questionSource = qnaireSource.questionSource;
    const questions = questionSource.getAll();
    let sectionId = null;
    let order_num = null;
    switch (selected.resource) {
      // case Resources.QNAIRES: // qnaire won't have the paste action
      case Resources.SECTIONS:
        sectionId = selected.id;
        order_num = questionSource.getQuestionsForSection(sectionId).length;
        break;
      case Resources.QUESTIONS:
        const question = questions[selected.id];
        sectionId = question.section;
        order_num = question.order_num + 1;
        break;
    }

    const copiedQuestion = questionSource.get(copiedQuestionId.current);
    let data = { ...copiedQuestion, section: sectionId, order_num };
    questionSource
      .create(data)
      .then((data) => {
        select(Resources.QUESTIONS, data.id);
      })
      .catch((error) => {
        setError(error);
      });
  }

  const { setPageActions } = useAppContext();

  useEffect(() => {
    const handleLoad = (data) => {
      setIsLoaded(true);
    };
    qnaireSource.subscribeLoad(handleLoad);

    return () => {
      qnaireSource.unsubscribeLoad(handleLoad);
    };
  }, []);

  const handleDelete = () => {
    let source = qnaireSource.getSource(selected.resource);
    if (source.get(selected.id) === null) {
      setSelected(null);
    }

    if (copiedQuestionId.current) {
      const copiedQuestion = qnaireSource.questionSource.get(
        copiedQuestionId.current
      );
      if (copiedQuestion === null) {
        copiedQuestionId.current = null;
      }
    }
  };

  useEffect(() => {
    qnaireSource.questionSource.subscribeDelete(handleDelete);
    qnaireSource.sectionSource.subscribeDelete(handleDelete);

    return () => {
      qnaireSource.questionSource.unsubscribeDelete(handleDelete);
      qnaireSource.sectionSource.unsubscribeDelete(handleDelete);
    };
  }, [selected]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const pageActions = [
      new PageAction("Přidat sekci", <AddBoxIcon />, createSection),
      new PageAction("Přidat otázku", <AddIcon />, createQuestion),
    ];
    setPageActions(pageActions);
    return () => setPageActions([]);
  }, [isLoaded, selected]); //alternatively, useCallback on createSection and createQuestion and put them in the deps here

  const value = {
    select,
    selected,
    error,
    setError,
    copy,
    paste,
  };

  return (
    <QnaireContext.Provider value={value}>{children}</QnaireContext.Provider>
  );
}

export function useQnaireContext() {
  const context = useContext(QnaireContext);
  if (context === undefined) {
    throw new Error(
      "useQnaireContext must be used inside QnaireContextProvider"
    );
  }
  return context;
}

function useSelect(resource, id) {
  const { selected, select } = useQnaireContext();
  const isSelected = Boolean(
    selected && selected.id == id && selected.resource === resource
  );

  return useMemo(() => {
    return {
      isSelected,
      select: () => {
        if (!isSelected) {
          select(resource, id);
        }
      },
    };
  }, [select, selected]);
}

export function useQnaireSelect(id) {
  return useSelect(Resources.QNAIRES, id);
}

export function useSectionSelect(id) {
  return useSelect(Resources.SECTIONS, id);
}

export function useQuestionSelect(id) {
  return useSelect(Resources.QUESTIONS, id);
}
