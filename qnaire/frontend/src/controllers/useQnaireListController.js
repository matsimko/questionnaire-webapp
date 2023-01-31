import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import qnaireSource from "../data/QnaireSource";

export function useQnaireListController() {
  const [qnaires, setQnaires] = useState(null);
  const navigate = useNavigate();

  const create = (data) => {
    return qnaireSource.create(data).then((data) => {
      navigate(`/questionnaires/${data.id}`);
    });
  };

  const handleUpdate = (data) => {
    setQnaires((qnaires) => {
      const newQnaireList = Array.from(qnaires);
      //put the updated qnaire to the beginning
      const index = newQnaireList.findIndex((qnaire) => qnaire.id === data.id);
      newQnaireList.splice(index, 1);
      newQnaireList.splice(0, 0, data); //I could use the old data as well, because I'm only concerned with the id
      return newQnaireList;
    });
  };

  useEffect(() => {
    qnaireSource.retrieveAll().then((qnaireMap) => {
      setQnaires(
        Object.values(qnaireMap).sort(
          (a, b) => new Date(b.last_modified) - new Date(a.last_modified)
        )
      );
      qnaireSource.subscribeUpdate(handleUpdate);
    });

    return () => {
      qnaireSource.unsubscribeUpdate(handleUpdate);
    };
  }, []);

  return {
    qnaires,
    isLoaded: Boolean(qnaires),
    create,
  };
}
