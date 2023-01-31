import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import qnaireSource from "../data/QnaireSource";
import { useQnaireContext } from "../providers/QnaireProvider";
import { useBaseQnaireController } from "./useBaseQnaireController";

export function useQnaireController(id) {
  const {
    data,
    update,
    updateData,
    destroy: baseDestroy,
    ...baseQnaireController
  } = useBaseQnaireController(id);
  const { setError } = useQnaireContext();
  const navigate = useNavigate();

  //technically, just the ids are needed, but there is no reason to not keep object references
  const [sections, setSections] = useState(null);

  const destroy = () => {
    baseDestroy().then(() => {
      navigate("/questionnaires");
    });
  };

  const handleSectionOrderChange = () => {
    setSections(qnaireSource.sectionSource.getSortedSections());
  };

  function handleDragEnd(result) {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    //const newSections = Array.from(sections);
    //It's not really possible to do an optimistic update,
    //because I don't have access to the section's state
    //(and the whole reason why I'm using listeners is that when I lifted state up the performance was horrendous)

    const dataSource = qnaireSource.getSource(type);
    dataSource
      .move(
        parseInt(draggableId),
        destination.index,
        parseInt(destination.droppableId) //ignored in sectionSource and choiceSource
      )
      .catch((error) => {
        setError(error);
      });
  }

  useEffect(() => {
    const sectionSource = qnaireSource.sectionSource;
    qnaireSource.retrieve(id).then((data) => {
      setSections(sectionSource.getSortedSections());
      updateData(data);
      sectionSource.subscribeMove(handleSectionOrderChange);
      sectionSource.subscribeCreate(handleSectionOrderChange);
      sectionSource.subscribeDelete(handleSectionOrderChange);
    });

    return () => {
      sectionSource.unsubscribeMove(handleSectionOrderChange);
      sectionSource.unsubscribeCreate(handleSectionOrderChange);
      sectionSource.unsubscribeDelete(handleSectionOrderChange);
    };
  }, [id]);

  return {
    ...baseQnaireController,
    ...data,
    update,
    sections,
    isLoaded: Boolean(data.id) && Boolean(sections),
    handleDragEnd,
    destroy,
  };
}
