import React, { useCallback, useEffect, useReducer, useState } from "react";
import qnaireSource from "../data/QnaireSource";
import privateQnaireIdSource from "../data/PrivateQnaireIdSource";
import { useQnaireContext } from "../providers/QnaireProvider";
import { DEFAULT_TIMEOUT, useGenericController } from "./useGenericController";
import * as yup from "yup";
import { requiredString } from "../validation";
import { downloadTextFile } from "../utils";

const validationSchema = yup.object({
  name: requiredString,
  desc: yup.string(),
});

export function useBaseQnaireController(id, timeout = DEFAULT_TIMEOUT) {
  const { data, update, destroy, updateData } = useGenericController(
    qnaireSource,
    id,
    validationSchema,
    timeout
  );

  const publish = ({ isPrivate, isAnonymous }) => {
    return update({
      private: isPrivate,
      anonymous: isAnonymous,
      published: true,
    });
  };

  const exportResult = (format = "json") => {
    qnaireSource.retrieveResult(id, format).then((data) => {
      const text =
        format === "json" ? JSON.stringify(data, undefined, 2) : data;
      downloadTextFile(text, `odpovědi.${format}`); //pretty printing the json
    });
  };

  const previewLink = `/questionnaires/${id}/response?preview`;

  const getLink = () => {
    const baseUrl = `${location.host}/questionnaires/${id}/response/`;
    if (data.private) {
      return privateQnaireIdSource.create({ qnaire: id }).then((data) => {
        return `${baseUrl}${data.id}/`;
      });
    }
    return Promise.resolve(baseUrl);
  };

  const getStats = () => {
    return qnaireSource.retrieveStats(id);
  };

  return {
    data,
    update,
    destroy,
    publish,
    previewLink,
    exportResult,
    getLink,
    getStats,
    updateData,
  };
}
