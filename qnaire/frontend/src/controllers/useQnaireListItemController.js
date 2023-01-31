import React from "react";
import { useBaseQnaireController } from "./useBaseQnaireController";

export function useQnaireListItemController(id) {
  const { data, ...baseQnaireController } = useBaseQnaireController(id, 0);
  return {
    ...data,
    ...baseQnaireController,
  };
}
